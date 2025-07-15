import { create } from "zustand";
import {
  getDecks as dbGetDecks,
  addDeck as dbAddDeck,
  updateDeck as dbUpdateDeck,
  deleteDeck as dbDeleteDeck,
  getWordCountByDeck,
  countMasteredWordsByDeck,
  getWordsOfDeck,
} from "../services/storage";
import { eventStore } from "./eventStore";
import type { Deck } from "../types/database";

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
  updateDeck: (id: number, title: string, author: string) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  incrementWordCount: (id: number) => void;
  decrementWordCount: (id: number) => void;
  updateMasteredCount: (deckId: number, change: 1 | -1) => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  loading: false,
  isInitialized: false,

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
      const newDeckData = await dbAddDeck(title, author);
      const newDeckWithCount: DeckWithCount = {
        ...newDeckData,
        wordCount: 0,
        masteredCount: 0,
      };
      set((state) => ({ decks: [newDeckWithCount, ...state.decks] }));
    } catch (error) {
      console.error("Erro ao adicionar deck no store", error);
      throw error;
    }
  },

  updateDeck: async (id, title, author) => {
    try {
      await dbUpdateDeck(id, title, author);
      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === id ? { ...deck, title, author } : deck
        ),
      }));
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
      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
      }));
      // Publica um evento para que outros stores (como o wordStore) possam reagir.
      eventStore.getState().publish("deckDeleted", { deckId: id });
      wordsInDeck.forEach(() => {
        eventStore.getState().publish("wordDeleted", { deckId: id });
      });
    } catch (error) {
      console.error("Erro ao apagar deck no store", error);
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
}));

// --- Subscrições de Eventos ---
// O deckStore "ouve" eventos de outros stores para se manter atualizado.
// Como o store é um singleton global, as subscrições devem durar por toda a vida da app,
// então não precisamos de guardar a função de `unsubscribe`.
// Adicionamos o tipo explícito para maior segurança.

eventStore
  .getState()
  .subscribe<{ deckId: number }>("wordAdded", ({ deckId }) => {
    useDeckStore.getState().incrementWordCount(deckId);
  });

eventStore
  .getState()
  .subscribe<{ deckId: number }>("wordDeleted", ({ deckId }) => {
    useDeckStore.getState().decrementWordCount(deckId);
  });

eventStore.getState().subscribe<{
  deckId: number;
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
