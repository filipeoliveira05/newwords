import { create } from "zustand";
import {
  getWordsOfDeck as dbGetWordsOfDeck,
  getAllWords as dbGetAllWords,
  getWordsForPractice as dbGetWordsForPractice,
  getLeastPracticedWords as dbGetLeastPracticedWords,
  countWordsForPractice as dbCountWordsForPractice,
  getTotalWordCount as dbGetTotalWordCount,
  getRandomWords as dbGetRandomWords,
  getWrongWords as dbGetWrongWords,
  countWrongWords as dbCountWrongWords,
  getFavoriteWords as dbGetFavoriteWords,
  countFavoriteWords as dbCountFavoriteWords,
  addWord as dbAddWord,
  updateWord as dbUpdateWord,
  deleteWord as dbDeleteWord,
  updateWordStatsWithQuality as dbUpdateWordStatsWithQuality,
  updateWordDetails as dbUpdateWordDetails,
  toggleWordFavoriteStatus as dbToggleWordFavoriteStatus,
} from "../services/storage";
import { eventStore } from "./eventStore";
import type { Word } from "../types/database";

interface WordState {
  words: {
    byId: { [wordId: string]: Word };
    byDeckId: { [deckId: string]: string[] };
  };
  loading: boolean;
  fetchWordsOfDeck: (deckId: string) => Promise<void>;
  fetchAllWords: () => Promise<void>;
  wrongWordsCount: number;
  fetchWrongWordsCount: () => Promise<void>;
  favoriteWordsCount: number;
  fetchFavoriteWordsCount: () => Promise<void>;
  urgentWordsCount: number;
  fetchUrgentWordCount: () => Promise<void>;
  fetchWordsForPractice: (deckId?: string, limit?: number) => Promise<Word[]>;
  fetchLeastPracticedWords: (
    deckId?: string,
    limit?: number,
    excludeIds?: string[]
  ) => Promise<Word[]>;
  fetchDistractorWords: (
    correctWordId: string,
    sessionDeckId?: string
  ) => Promise<Word[]>;
  fetchWrongWords: (deckId?: string) => Promise<Word[]>;
  fetchFavoriteWords: () => Promise<Word[]>;
  fetchAllLeastPracticedWords: (deckId?: string) => Promise<Word[]>;
  countWordsForPractice: (deckId?: string) => Promise<number>;
  getTotalWordCount: () => Promise<number>;
  addWord: (
    deckId: string,
    name: string,
    meaning: string,
    category: string | null
  ) => Promise<void>;
  updateWord: (
    id: string,
    name: string,
    meaning: string,
    category: string | null
  ) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  updateWordDetails: (
    id: string,
    category: string | null,
    synonyms: string[],
    antonyms: string[],
    sentences: string[]
  ) => Promise<void>;
  toggleFavoriteStatus: (id: string) => Promise<Word | null>;
  clearWordsForDeck: (deckId: string) => void;
  clearWords: () => void;
  updateStatsAfterAnswer: (wordId: string, quality: number) => Promise<void>;
  reset: () => void;
}

const initialState: Omit<
  WordState,
  | "fetchWordsOfDeck"
  | "fetchAllWords"
  | "fetchWrongWordsCount"
  | "fetchFavoriteWordsCount"
  | "fetchUrgentWordCount"
  | "fetchWordsForPractice"
  | "fetchLeastPracticedWords"
  | "fetchDistractorWords"
  | "fetchWrongWords"
  | "fetchFavoriteWords"
  | "fetchAllLeastPracticedWords"
  | "countWordsForPractice"
  | "getTotalWordCount"
  | "addWord"
  | "updateWord"
  | "deleteWord"
  | "updateWordDetails"
  | "toggleFavoriteStatus"
  | "clearWordsForDeck"
  | "clearWords"
  | "updateStatsAfterAnswer"
  | "reset"
> = {
  words: { byId: {}, byDeckId: {} },
  wrongWordsCount: 0,
  favoriteWordsCount: 0,
  urgentWordsCount: 0,
  loading: false,
};

export const useWordStore = create<WordState>((set, get) => ({
  ...initialState,
  fetchWordsOfDeck: async (deckId) => {
    set({ loading: true });
    try {
      const data = await dbGetWordsOfDeck(deckId);
      const newWordsById: { [wordId: string]: Word } = {};
      const wordIdsForDeck: string[] = [];

      data.forEach((word) => {
        newWordsById[word.id] = word;
        wordIdsForDeck.push(word.id);
      });

      set((state) => ({
        words: {
          byId: { ...state.words.byId, ...newWordsById },
          byDeckId: {
            ...state.words.byDeckId,
            [deckId]: wordIdsForDeck,
          },
        },
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao obter palavras do deck no store", error);
      set({ loading: false });
    }
  },

  fetchAllWords: async () => {
    set({ loading: true });
    try {
      const allWords = await dbGetAllWords();

      const wordsById: { [wordId: string]: Word } = {};
      const wordsByDeckId: { [deckId: string]: string[] } = {};

      allWords.forEach((word) => {
        wordsById[word.id] = word;
        if (!wordsByDeckId[word.deckId]) {
          wordsByDeckId[word.deckId] = [];
        }
        wordsByDeckId[word.deckId].push(word.id);
      });

      set({
        words: { byId: wordsById, byDeckId: wordsByDeckId },
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao obter todas as palavras no store", error);
      set({ loading: false });
    }
  },

  fetchWrongWordsCount: async () => {
    // Não precisa de setar loading aqui para não piscar a tela inteira
    try {
      const count = await dbCountWrongWords();
      set({ wrongWordsCount: count });
    } catch (error) {
      console.error("Erro ao contar palavras erradas no store", error);
      set({ wrongWordsCount: 0 });
    }
  },

  fetchFavoriteWordsCount: async () => {
    // Não precisa de setar loading aqui para não piscar a tela inteira
    try {
      const count = await dbCountFavoriteWords();
      set({ favoriteWordsCount: count });
    } catch (error) {
      console.error("Erro ao contar palavras favoritas no store", error);
      set({ favoriteWordsCount: 0 });
    }
  },

  fetchUrgentWordCount: async () => {
    set({ loading: true });
    try {
      const count = await dbCountWordsForPractice();
      set({ urgentWordsCount: count, loading: false });
    } catch (error) {
      console.error("Erro ao contar palavras urgentes no store", error);
      set({ loading: false });
    }
  },

  fetchWordsForPractice: async (deckId?: string, limit?: number) => {
    set({ loading: true });
    try {
      const practiceWords = await dbGetWordsForPractice(deckId, limit);
      set({ loading: false });
      return practiceWords;
    } catch (error) {
      console.error("Erro ao obter palavras para praticar no store", error);
      set({ loading: false });
      return [];
    }
  },

  countWordsForPractice: async (deckId?: string) => {
    try {
      const count = await dbCountWordsForPractice(deckId);
      return count;
    } catch (error) {
      console.error("Erro ao contar palavras para praticar no store", error);
      return 0;
    }
  },

  fetchLeastPracticedWords: async (
    deckId?: string,
    limit?: number,
    excludeIds?: string[]
  ) => {
    try {
      const fallbackWords = await dbGetLeastPracticedWords(
        deckId,
        limit,
        excludeIds
      );
      return fallbackWords;
    } catch (error) {
      console.error("Erro ao obter palavras de fallback no store", error);
      set({ loading: false });
      return [];
    }
  },

  fetchDistractorWords: async (correctWordId, sessionDeckId) => {
    const numDistractors = 3;
    let distractors: Word[] = [];

    try {
      // 1. Tenta obter distratores do deck da sessão, se houver um.
      if (sessionDeckId) {
        distractors = await dbGetRandomWords(numDistractors, sessionDeckId, [
          correctWordId,
        ]);
      }

      // 2. Se não for suficiente, preenche com palavras aleatórias de toda a BD.
      const needed = numDistractors - distractors.length;
      if (needed > 0) {
        const excludeIds = [correctWordId, ...distractors.map((d) => d.id)];
        const globalDistractors = await dbGetRandomWords(
          needed,
          undefined, // Sem deckId, procura em todas as palavras
          excludeIds
        );
        distractors.push(...globalDistractors);
      }
      return distractors;
    } catch (error) {
      console.error("Erro ao obter palavras distratoras no store", error);
      return [];
    }
  },

  fetchWrongWords: async (deckId?: string) => {
    try {
      // No futuro, podemos filtrar por deckId se necessário
      const words = await dbGetWrongWords();
      return words;
    } catch (error) {
      console.error("Erro ao obter palavras erradas no store", error);
      return [];
    }
  },

  fetchFavoriteWords: async () => {
    try {
      // No futuro, podemos filtrar por deckId se necessário
      const words = await dbGetFavoriteWords();
      return words;
    } catch (error) {
      console.error("Erro ao obter palavras favoritas no store", error);
      return [];
    }
  },

  fetchAllLeastPracticedWords: async (deckId?: string) => {
    try {
      // Chama a função da DB sem limite para obter todas as palavras, ordenadas.
      const allWords = await dbGetLeastPracticedWords(deckId, undefined, []);
      return allWords;
    } catch (error) {
      console.error(
        "Erro ao obter todas as palavras menos praticadas no store",
        error
      );
      return [];
    }
  },

  getTotalWordCount: async () => {
    try {
      const count = await dbGetTotalWordCount();
      return count;
    } catch (error) {
      console.error("Erro ao obter contagem total de palavras no store", error);
      return 0;
    }
  },

  addWord: async (deckId, name, meaning, category) => {
    try {
      const newWord = await dbAddWord(deckId, name, meaning, category);

      set((state) => {
        const currentIds = state.words.byDeckId[deckId] || [];
        return {
          words: {
            byId: { ...state.words.byId, [newWord.id]: newWord },
            byDeckId: {
              ...state.words.byDeckId,
              [deckId]: [...currentIds, newWord.id],
            },
          },
        };
      });

      // Publica um evento para que o deckStore possa atualizar a contagem.
      eventStore.getState().publish("wordAdded", { deckId });
    } catch (error) {
      console.error("Erro ao adicionar palavra no store", error);
      throw error;
    }
  },

  updateWord: async (id, name, meaning, category) => {
    try {
      await dbUpdateWord(id, name, meaning, category);

      set((state) => {
        if (!state.words.byId[id]) {
          return state;
        }
        const updatedWord = {
          ...state.words.byId[id],
          name,
          meaning,
          category,
        };
        return {
          words: {
            ...state.words, // Mantém byDeckId inalterado
            byId: { ...state.words.byId, [id]: updatedWord },
          },
        };
      });
      eventStore.getState().publish("wordUpdated", { wordId: id });
    } catch (error) {
      console.error("Erro ao atualizar palavra no store", error);
      throw error;
    }
  },

  updateWordDetails: async (id, category, synonyms, antonyms, sentences) => {
    try {
      await dbUpdateWordDetails(id, category, synonyms, antonyms, sentences);

      set((state) => {
        if (!state.words.byId[id]) {
          return state;
        }
        const updatedWord = {
          ...state.words.byId[id],
          category,
          synonyms: JSON.stringify(synonyms),
          antonyms: JSON.stringify(antonyms),
          sentences: JSON.stringify(sentences),
        };
        return {
          words: {
            ...state.words, // Mantém byDeckId inalterado
            byId: { ...state.words.byId, [id]: updatedWord },
          },
        };
      });
      eventStore.getState().publish("wordUpdated", { wordId: id });
    } catch (error) {
      console.error("Erro ao atualizar detalhes da palavra no store", error);
      throw error;
    }
  },

  deleteWord: async (id) => {
    try {
      const wordToDelete = get().words.byId[id];

      if (!wordToDelete) {
        throw new Error("Palavra não encontrada na store para apagar.");
      }

      const { deckId } = wordToDelete;
      await dbDeleteWord(id);

      set((state) => {
        const newById = { ...state.words.byId };
        delete newById[id];
        const newByDeckId = { ...state.words.byDeckId };
        if (newByDeckId[deckId]) {
          newByDeckId[deckId] = newByDeckId[deckId].filter(
            (wordId) => wordId !== id
          );
        }
        return {
          words: { byId: newById, byDeckId: newByDeckId },
        };
      });
      // Publica um evento para que o deckStore possa atualizar a contagem.
      eventStore.getState().publish("wordDeleted", { deckId });
    } catch (error) {
      console.error("Erro ao apagar palavra no store", error);
      throw error;
    }
  },

  toggleFavoriteStatus: async (id) => {
    try {
      const updatedWord = await dbToggleWordFavoriteStatus(id);
      if (updatedWord) {
        set((state) => {
          if (!state.words.byId[updatedWord.id]) {
            return state;
          }
          return {
            words: {
              ...state.words,
              byId: { ...state.words.byId, [updatedWord.id]: updatedWord },
            },
          };
        });
        eventStore.getState().publish("wordUpdated", { wordId: id });
      }
      return updatedWord;
    } catch (error) {
      console.error(
        "Erro ao alternar estado de favorito da palavra no store",
        error
      );
      throw error;
    }
  },

  clearWordsForDeck: (deckId) => {
    set((state) => {
      const newById = { ...state.words.byId };
      const newByDeckId = { ...state.words.byDeckId };
      const idsToDelete = newByDeckId[deckId] || [];

      idsToDelete.forEach((id) => delete newById[id]);
      delete newByDeckId[deckId];

      return { words: { byId: newById, byDeckId: newByDeckId } };
    });
  },

  clearWords: () => {
    set({ words: { byId: {}, byDeckId: {} }, loading: false });
  },

  updateStatsAfterAnswer: async (wordId, quality) => {
    try {
      const oldWord = get().words.byId[wordId]; // Get state before update
      const updatedWord = await dbUpdateWordStatsWithQuality(wordId, quality);

      if (!updatedWord) return;
      // Atualiza diretamente a palavra no estado normalizado.
      set((state) => {
        if (!state.words.byId[wordId]) return state;
        return {
          words: {
            ...state.words,
            byId: { ...state.words.byId, [wordId]: updatedWord },
          },
        };
      });

      // If mastery level changed, publish a specific event for the deckStore
      if (oldWord && oldWord.masteryLevel !== updatedWord.masteryLevel) {
        eventStore.getState().publish("masteryLevelChanged", {
          deckId: updatedWord.deckId,
          isNowMastered: updatedWord.masteryLevel === "mastered",
          wasMastered: oldWord.masteryLevel === "mastered",
        });
      }

      // Publish the generic wordUpdated event for other listeners
      eventStore.getState().publish("wordUpdated", { wordId });
    } catch (error) {
      console.error(
        "Erro ao atualizar estatísticas da palavra com SM-2 no store",
        error
      );
      throw error;
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// --- Subscrições de Eventos ---
// O wordStore "ouve" eventos de outros stores para se manter atualizado.
// Como o store é um singleton global, a subscrição deve durar por toda a vida da app,
// então não precisamos de guardar a função de `unsubscribe`.
// Adicionamos o tipo explícito para maior segurança.
eventStore
  .getState()
  .subscribe<{ deckId: string }>("deckDeleted", ({ deckId }) => {
    useWordStore.getState().clearWordsForDeck(deckId);
  });

// Ouve o evento de logout para se resetar.
eventStore.getState().subscribe("userLoggedOut", () => {
  useWordStore.getState().reset();
});
