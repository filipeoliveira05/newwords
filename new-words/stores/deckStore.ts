import { create } from "zustand";
import {
  getDecks as dbGetDecks,
  addDeck as dbAddDeck,
  updateDeck as dbUpdateDeck,
  deleteDeck as dbDeleteDeck,
  deleteDecks as dbDeleteDecks,
  getWordCountByDeck,
  countMasteredWordsByDeck,
  getWordsOfDeck,
  addOperationToQueue,
} from "../services/storage";
import { eventStore } from "./eventStore";
import type { Deck } from "../types/database";
import { processSyncQueue } from "@/services/syncService";

export interface DeckWithCount extends Deck {
  wordCount: number;
  masteredCount: number;
}

interface DeckState {
  decks: DeckWithCount[];
  loading: boolean;
  isInitialized: boolean;
  fetchDecks: () => Promise<void>;
  addDeck: (title: string, author: string) => Promise<void>;
  updateDeck: (id: string, title: string, author: string) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  deleteDecks: (ids: string[]) => Promise<void>;
  incrementWordCount: (id: string) => void;
  decrementWordCount: (id: string) => void;
  updateMasteredCount: (deckId: string, change: 1 | -1) => void;
  reset: () => void;
}

const initialState: Omit<
  DeckState,
  | "fetchDecks"
  | "addDeck"
  | "updateDeck"
  | "deleteDeck"
  | "deleteDecks"
  | "incrementWordCount"
  | "decrementWordCount"
  | "updateMasteredCount"
  | "reset"
> = {
  decks: [],
  loading: false,
  isInitialized: false,
};

export const useDeckStore = create<DeckState>((set, get) => ({
  ...initialState,
  fetchDecks: async () => {
    // Só faz a busca inicial se os dados ainda não foram carregados.
    // As atualizações (add, update, delete) são reativas e não precisam de um refetch.
    if (get().isInitialized) {
      return;
    }
    set({ loading: true });
    try {
      const decksData = await dbGetDecks();
      const decksWithCounts = await Promise.all(
        decksData.map(async (deck) => ({
          ...deck,
          wordCount: await getWordCountByDeck(deck.id),
          masteredCount: await countMasteredWordsByDeck(deck.id),
        }))
      );
      set({ decks: decksWithCounts, loading: false, isInitialized: true });
    } catch (error) {
      console.error("Erro ao obter decks no store", error);
      set({ decks: [], loading: false, isInitialized: false }); // Permite tentar de novo em caso de erro
    }
  },

  addDeck: async (title, author) => {
    try {
      // 1. Escreve na BD local primeiro
      const newDeckData = await dbAddDeck(title, author);

      // 2. Adiciona a operação à fila de sincronização
      await addOperationToQueue("CREATE_DECK", {
        // Agora enviamos o payload completo, incluindo o ID gerado no cliente.
        id: newDeckData.id,
        title: newDeckData.title,
        author: newDeckData.author,
        created_at: newDeckData.createdAt,
      });

      // 3. Atualiza o estado da UI de forma otimista
      const newDeckWithCount: DeckWithCount = {
        ...newDeckData,
        wordCount: 0,
        masteredCount: 0,
      };
      set((state) => ({ decks: [newDeckWithCount, ...state.decks] }));
      eventStore.getState().publish("deckAdded", { deckId: newDeckData.id });
      processSyncQueue(); // Tenta sincronizar imediatamente
    } catch (error) {
      console.error("Erro ao adicionar deck no store", error);
      throw error;
    }
  },

  updateDeck: async (id, title, author) => {
    try {
      await dbUpdateDeck(id, title, author);
      await addOperationToQueue("UPDATE_DECK", {
        id,
        updates: { title, author },
      });

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === id ? { ...deck, title, author } : deck
        ),
      }));

      eventStore.getState().publish("deckUpdated", { deckId: id });
      processSyncQueue(); // Tenta sincronizar imediatamente
    } catch (error) {
      console.error("Erro ao atualizar deck no store", error);
      throw error;
    }
  },

  deleteDeck: async (id) => {
    try {
      // 1. Obter a contagem de palavras do deck ANTES de o apagar da DB.
      const wordsInDeck = await getWordsOfDeck(id);

      await dbDeleteDeck(id);
      await addOperationToQueue("DELETE_DECK", { id });

      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
      }));
      // Publica um evento para que outros stores (como o wordStore) possam reagir.
      eventStore.getState().publish("deckDeleted", { deckId: id });
      wordsInDeck.forEach(() => {
        eventStore.getState().publish("wordDeleted", { deckId: id });
      });
      processSyncQueue(); // Tenta sincronizar imediatamente
    } catch (error) {
      console.error("Erro ao apagar deck no store", error);
      throw error;
    }
  },

  deleteDecks: async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      // Para manter a consistência do estado, precisamos de saber que palavras
      // serão apagadas para podermos notificar outros stores (como o de estatísticas).
      const wordsInDecks = await Promise.all(
        ids.map((id) => getWordsOfDeck(id))
      );
      const allWordsToDelete = wordsInDecks.flat();

      await dbDeleteDecks(ids); // A nova função que apaga tudo numa só transação.

      // Adiciona cada operação de delete à fila
      for (const id of ids) {
        await addOperationToQueue("DELETE_DECK", { id });
      }

      const idsToDeleteSet = new Set(ids);
      // Atualiza o estado uma única vez, removendo todos os decks selecionados.
      set((state) => ({
        decks: state.decks.filter((deck) => !idsToDeleteSet.has(deck.id)),
      }));

      // Publica os eventos necessários para que outros stores reajam.
      ids.forEach((deckId) => {
        eventStore.getState().publish("deckDeleted", { deckId });
      });
      allWordsToDelete.forEach((word) => {
        eventStore.getState().publish("wordDeleted", { deckId: word.deckId });
      });
      processSyncQueue(); // Tenta sincronizar imediatamente
    } catch (error) {
      console.error("Erro ao apagar múltiplos decks no store", error);
      throw error;
    }
  },

  incrementWordCount: (id) => {
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === id ? { ...d, wordCount: d.wordCount + 1 } : d
      ),
    }));
  },

  decrementWordCount: (id) => {
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === id ? { ...d, wordCount: d.wordCount - 1 } : d
      ),
    }));
  },

  updateMasteredCount: (deckId, change) => {
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === deckId
          ? { ...d, masteredCount: Math.max(0, d.masteredCount + change) } // Ensure count doesn't go below 0
          : d
      ),
    }));
  },

  reset: () => {
    set(initialState);
  },
}));

// --- Subscrições de Eventos ---
// O deckStore "ouve" eventos de outros stores para se manter atualizado.
// Como o store é um singleton global, as subscrições devem durar por toda a vida da app,
// então não precisamos de guardar a função de `unsubscribe`.
// Adicionamos o tipo explícito para maior segurança.

eventStore
  .getState()
  .subscribe<{ deckId: string }>("wordAdded", ({ deckId }) => {
    useDeckStore.getState().incrementWordCount(deckId);
  });

eventStore
  .getState()
  .subscribe<{ deckId: string }>("wordDeleted", ({ deckId }) => {
    useDeckStore.getState().decrementWordCount(deckId);
  });

eventStore.getState().subscribe<{
  deckId: string;
  isNowMastered: boolean;
  wasMastered: boolean;
}>("masteryLevelChanged", ({ deckId, isNowMastered, wasMastered }) => {
  const store = useDeckStore.getState();
  if (isNowMastered && !wasMastered) {
    store.updateMasteredCount(deckId, 1);
  } else if (!isNowMastered && wasMastered) {
    store.updateMasteredCount(deckId, -1);
  }
});

// Ouve o evento de logout para se resetar.
eventStore.getState().subscribe("userLoggedOut", () => {
  useDeckStore.getState().reset();
});
