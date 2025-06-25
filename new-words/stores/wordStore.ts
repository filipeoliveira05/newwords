import { create } from "zustand";
import {
  getWordsOfDeck as dbGetWordsOfDeck,
  addWord as dbAddWord,
  updateWord as dbUpdateWord,
  deleteWord as dbDeleteWord,
} from "../services/storage";
import { useDeckStore } from "./deckStore";
import type { Word } from "../types/database";

interface WordState {
  words: { [deckId: number]: Word[] };
  loading: boolean;
  fetchWords: (deckId: number) => Promise<void>;
  addWord: (deckId: number, name: string, meaning: string) => Promise<void>;
  updateWord: (id: number, name: string, meaning: string) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  clearWords: () => void;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: {},
  loading: false,

  fetchWords: async (deckId) => {
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
      console.error("Erro ao obter palavras no store", error);
      set({ loading: false });
    }
  },

  addWord: async (deckId, name, meaning) => {
    try {
      const newWordId = await dbAddWord(deckId, name, meaning);
      const newWord: Word = {
        id: newWordId,
        deckId,
        name,
        meaning,
        timesTrained: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastTrained: null,
        createdAt: new Date().toISOString(),
      };
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
}));
