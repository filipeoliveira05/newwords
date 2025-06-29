import { create } from "zustand";
import {
  getWordsOfDeck as dbGetWordsOfDeck,
  getAllWords as dbGetAllWords,
  getWordsForPractice as dbGetWordsForPractice,
  getLeastPracticedWords as dbGetLeastPracticedWords,
  addWord as dbAddWord,
  updateWord as dbUpdateWord,
  deleteWord as dbDeleteWord,
  updateWordStats as dbUpdateWordStats,
} from "../services/storage";
import { useDeckStore } from "./deckStore";
import type { Word } from "../types/database";

interface WordState {
  words: { [deckId: number]: Word[] };
  loading: boolean;
  fetchWordsOfDeck: (deckId: number) => Promise<void>;
  fetchAllWords: () => Promise<void>;
  fetchWordsForPractice: (deckId?: number) => Promise<Word[]>;
  fetchLeastPracticedWords: (deckId?: number) => Promise<Word[]>;
  addWord: (deckId: number, name: string, meaning: string) => Promise<void>;
  updateWord: (id: number, name: string, meaning: string) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  clearWords: () => void;
  updateStatsAfterAnswer: (wordId: number, isCorrect: boolean) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: {},
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

  fetchLeastPracticedWords: async (deckId?: number) => {
    try {
      const fallbackWords = await dbGetLeastPracticedWords(deckId);
      return fallbackWords;
    } catch (error) {
      console.error("Erro ao obter palavras de fallback no store", error);
      set({ loading: false });
      return [];
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

      useDeckStore.getState().incrementWordCount(deckId);
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
      useDeckStore.getState().decrementWordCount(deckId);
    } catch (error) {
      console.error("Erro ao apagar palavra no store", error);
      throw error;
    }
  },

  clearWords: () => {
    set({ words: {}, loading: false });
  },

  updateStatsAfterAnswer: async (wordId, isCorrect) => {
    try {
      await dbUpdateWordStats(wordId, isCorrect);

      // Also update the local state to keep the UI consistent
      set((state) => {
        const newWordsState = { ...state.words };

        for (const deckId in newWordsState) {
          newWordsState[deckId] = newWordsState[deckId].map((word) => {
            if (word.id === wordId) {
              // A lógica exata de masteryLevel e nextReviewDate está na DB,
              // aqui apenas atualizamos os contadores para consistência visual imediata.
              // O estado completo será atualizado na próxima vez que os dados forem buscados.
              return {
                ...word,
                timesTrained: word.timesTrained + 1,
                timesCorrect: word.timesCorrect + (isCorrect ? 1 : 0),
              };
            }
            return word;
          });
        }
        return { words: newWordsState };
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
