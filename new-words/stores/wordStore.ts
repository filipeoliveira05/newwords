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
  addWord as dbAddWord,
  updateWord as dbUpdateWord,
  deleteWord as dbDeleteWord,
  updateWordStats as dbUpdateWordStats,
} from "../services/storage";
import { eventStore } from "./eventStore";
import type { Word } from "../types/database";

interface WordState {
  words: { [deckId: number]: Word[] };
  loading: boolean;
  fetchWordsOfDeck: (deckId: number) => Promise<void>;
  fetchAllWords: () => Promise<void>;
  wrongWordsCount: number;
  fetchWrongWordsCount: () => Promise<void>;
  urgentWordsCount: number;
  fetchUrgentWordCount: () => Promise<void>;
  fetchWordsForPractice: (deckId?: number) => Promise<Word[]>;
  fetchLeastPracticedWords: (
    deckId?: number,
    limit?: number,
    excludeIds?: number[]
  ) => Promise<Word[]>;
  fetchDistractorWords: (
    correctWordId: number,
    sessionDeckId?: number
  ) => Promise<Word[]>;
  fetchWrongWords: (deckId?: number) => Promise<Word[]>;
  fetchAllLeastPracticedWords: (deckId?: number) => Promise<Word[]>;
  countWordsForPractice: (deckId?: number) => Promise<number>;
  getTotalWordCount: () => Promise<number>;
  addWord: (deckId: number, name: string, meaning: string) => Promise<void>;
  updateWord: (id: number, name: string, meaning: string) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  clearWordsForDeck: (deckId: number) => void;
  clearWords: () => void;
  updateStatsAfterAnswer: (wordId: number, isCorrect: boolean) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: {},
  wrongWordsCount: 0,
  urgentWordsCount: 0,
  loading: false,

  fetchWordsOfDeck: async (deckId) => {
    if (get().words[deckId]) {
      return;
    }

    set({ loading: true });
    try {
      const data = await dbGetWordsOfDeck(deckId);
      set((state) => ({
        words: {
          ...state.words,
          [deckId]: data,
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

      // Agrupa as palavras por deckId
      const wordsByDeck = allWords.reduce((acc, word) => {
        const deckKey = word.deckId;
        if (!acc[deckKey]) {
          acc[deckKey] = [];
        }
        acc[deckKey].push(word);
        return acc;
      }, {} as { [deckId: number]: Word[] });

      set({ words: wordsByDeck, loading: false });
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

  fetchWordsForPractice: async (deckId?: number) => {
    set({ loading: true });
    try {
      const practiceWords = await dbGetWordsForPractice(deckId);
      set({ loading: false });
      return practiceWords;
    } catch (error) {
      console.error("Erro ao obter palavras para praticar no store", error);
      set({ loading: false });
      return [];
    }
  },

  countWordsForPractice: async (deckId?: number) => {
    try {
      const count = await dbCountWordsForPractice(deckId);
      return count;
    } catch (error) {
      console.error("Erro ao contar palavras para praticar no store", error);
      return 0;
    }
  },

  fetchLeastPracticedWords: async (
    deckId?: number,
    limit?: number,
    excludeIds?: number[]
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

  fetchWrongWords: async (deckId?: number) => {
    try {
      // No futuro, podemos filtrar por deckId se necessário
      const words = await dbGetWrongWords();
      return words;
    } catch (error) {
      console.error("Erro ao obter palavras erradas no store", error);
      return [];
    }
  },

  fetchAllLeastPracticedWords: async (deckId?: number) => {
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

  addWord: async (deckId, name, meaning) => {
    try {
      const newWord = await dbAddWord(deckId, name, meaning);
      set((state) => {
        const currentWordsForDeck = state.words[deckId] || [];
        return {
          words: {
            ...state.words,
            [deckId]: [...currentWordsForDeck, newWord],
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

  updateWord: async (id, name, meaning) => {
    try {
      await dbUpdateWord(id, name, meaning);
      set((state) => {
        const wordToUpdate = Object.values(state.words)
          .flat()
          .find((w) => w.id === id);

        if (!wordToUpdate) return state;

        const { deckId } = wordToUpdate;

        const updatedWordsForDeck = state.words[deckId].map((word) =>
          word.id === id ? { ...word, name, meaning } : word
        );

        return {
          words: {
            ...state.words,
            [deckId]: updatedWordsForDeck,
          },
        };
      });
    } catch (error) {
      console.error("Erro ao atualizar palavra no store", error);
      throw error;
    }
  },

  deleteWord: async (id) => {
    try {
      const wordToDelete = Object.values(get().words)
        .flat()
        .find((w) => w.id === id);

      if (!wordToDelete) {
        throw new Error("Palavra não encontrada na store para apagar.");
      }

      const { deckId } = wordToDelete;

      await dbDeleteWord(id);
      set((state) => {
        const filteredWords = state.words[deckId].filter(
          (word) => word.id !== id
        );
        return {
          words: {
            ...state.words,
            [deckId]: filteredWords,
          },
        };
      });
      // Publica um evento para que o deckStore possa atualizar a contagem.
      eventStore.getState().publish("wordDeleted", { deckId });
    } catch (error) {
      console.error("Erro ao apagar palavra no store", error);
      throw error;
    }
  },

  clearWordsForDeck: (deckId) => {
    set((state) => {
      const newWords = { ...state.words };
      // Remove a entrada para o deckId do objeto de palavras.
      delete newWords[deckId];
      return { words: newWords };
    });
  },

  clearWords: () => {
    set({ words: {}, loading: false });
  },

  updateStatsAfterAnswer: async (wordId, isCorrect) => {
    try {
      const updatedWord = await dbUpdateWordStats(wordId, isCorrect);

      if (!updatedWord) return;

      // Also update the local state to keep the UI consistent
      set((state) => {
        const { deckId } = updatedWord;
        if (!state.words[deckId]) {
          return state; // Safety check, should not happen
        }

        const updatedWordsForDeck = state.words[deckId].map((word) =>
          word.id === updatedWord.id ? updatedWord : word
        );

        return {
          words: { ...state.words, [deckId]: updatedWordsForDeck },
        };
      });
    } catch (error) {
      console.error(
        "Erro ao atualizar estatísticas da palavra no store",
        error
      );
      throw error;
    }
  },
}));

// --- Subscrições de Eventos ---
// O wordStore "ouve" eventos de outros stores para se manter atualizado.
eventStore.getState().subscribe("deckDeleted", ({ deckId }) => {
  useWordStore.getState().clearWordsForDeck(deckId);
});
