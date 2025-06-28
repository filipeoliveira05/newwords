import { create } from "zustand";
import {
  getDecks as dbGetDecks,
  addDeck as dbAddDeck,
  updateDeck as dbUpdateDeck,
  deleteDeck as dbDeleteDeck,
  getWordCountByDeck,
} from "../services/storage";
import type { Deck } from "../types/database";

export interface DeckWithCount extends Deck {
  wordCount: number;
}

interface DeckState {
  decks: DeckWithCount[];
  loading: boolean;
  fetchDecks: () => Promise<void>;
  addDeck: (title: string, author: string) => Promise<void>;
  updateDeck: (id: number, title: string, author: string) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  incrementWordCount: (id: number) => void;
  decrementWordCount: (id: number) => void;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  loading: true,

  fetchDecks: async () => {
    set({ loading: true });
    try {
      const decksData = await dbGetDecks();
      const decksWithCounts = await Promise.all(
        decksData.map(async (deck) => ({
          ...deck,
          wordCount: await getWordCountByDeck(deck.id),
        }))
      );
      set({ decks: decksWithCounts, loading: false });
    } catch (error) {
      console.error("Erro ao obter decks no store", error);
      set({ decks: [], loading: false });
    }
  },

  addDeck: async (title, author) => {
    try {
      const newDeckData = await dbAddDeck(title, author);
      const newDeckWithCount: DeckWithCount = {
        ...newDeckData,
        wordCount: 0,
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
      await dbDeleteDeck(id);
      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
      }));
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
}));
