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
  words: Word[];
  loading: boolean;
  currentDeckId: number | null;
  fetchWords: (deckId: number) => Promise<void>;
  addWord: (deckId: number, name: string, meaning: string) => Promise<void>;
  updateWord: (id: number, name: string, meaning: string) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  clearWords: () => void;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  loading: true,
  currentDeckId: null,

  fetchWords: async (deckId) => {
    set({ loading: true, currentDeckId: deckId });
    try {
      const data = await dbGetWordsOfDeck(deckId);
      set({ words: data, loading: false });
    } catch (error) {
      console.error("Erro ao obter palavras no store", error);
      set({ words: [], loading: false });
    }
  },

  addWord: async (deckId, name, meaning) => {
    const currentDeck = get().currentDeckId;
    if (deckId !== currentDeck) {
      console.error("ID do deck inconsistente ao adicionar palavra");
      return;
    }
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
      set((state) => ({ words: [...state.words, newWord] }));

      useDeckStore.getState().incrementWordCount(deckId);
    } catch (error) {
      console.error("Erro ao adicionar palavra no store", error);
      throw error;
    }
  },

  updateWord: async (id, name, meaning) => {
    const deckId = get().currentDeckId;
    if (!deckId) return;
    try {
      await dbUpdateWord(id, name, meaning);
      set((state) => ({
        words: state.words.map((word) =>
          word.id === id ? { ...word, name, meaning } : word
        ),
      }));
    } catch (error) {
      console.error("Erro ao atualizar palavra no store", error);
      throw error;
    }
  },

  deleteWord: async (id) => {
    const deckId = get().currentDeckId;
    if (!deckId) {
      throw new Error("Não é possível apagar uma palavra sem um deck ativo.");
    }
    try {
      await dbDeleteWord(id);
      set((state) => ({
        words: state.words.filter((word) => word.id !== id),
      }));
      useDeckStore.getState().decrementWordCount(deckId);
    } catch (error) {
      console.error("Erro ao apagar palavra no store", error);
      throw error;
    }
  },

  clearWords: () => {
    set({ words: [], currentDeckId: null, loading: true });
  },
}));
