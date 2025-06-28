import { create } from "zustand";
import {
  getWordsOfDeck as dbGetWordsOfDeck,
  getAllWords as dbGetAllWords,
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
  addWord: (deckId: number, name: string, meaning: string) => Promise<void>;
  updateWord: (id: number, name: string, meaning: string) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  clearWords: () => void;
  updateStatsAfterSession: (
    correctWordIds: number[],
    incorrectWordIds: number[]
  ) => Promise<void>;
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

  updateStatsAfterSession: async (correctWordIds, incorrectWordIds) => {
    try {
      await dbUpdateWordStats(correctWordIds, incorrectWordIds);

      // Also update the local state to keep the UI consistent
      set((state) => {
        const newWordsState = { ...state.words };
        const allIds = [...correctWordIds, ...incorrectWordIds];
        const now = new Date().toISOString();

        for (const deckId in newWordsState) {
          newWordsState[deckId] = newWordsState[deckId].map((word) => {
            if (allIds.includes(word.id)) {
              const isCorrect = correctWordIds.includes(word.id);
              return {
                ...word,
                timesTrained: word.timesTrained + 1,
                timesCorrect: word.timesCorrect + (isCorrect ? 1 : 0),
                timesIncorrect: word.timesIncorrect + (!isCorrect ? 1 : 0),
                lastTrained: now,
              };
            }
            return word;
          });
        }
        return { words: newWordsState };
      });
    } catch (error) {
      console.error("Erro ao atualizar estatísticas no store", error);
      throw error;
    }
  },
}));
