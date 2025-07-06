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
    byId: { [wordId: number]: Word };
    byDeckId: { [deckId: number]: number[] };
  };
  loading: boolean;
  fetchWordsOfDeck: (deckId: number) => Promise<void>;
  fetchAllWords: () => Promise<void>;
  wrongWordsCount: number;
  fetchWrongWordsCount: () => Promise<void>;
  favoriteWordsCount: number;
  fetchFavoriteWordsCount: () => Promise<void>;
  urgentWordsCount: number;
  fetchUrgentWordCount: () => Promise<void>;
  fetchWordsForPractice: (deckId?: number, limit?: number) => Promise<Word[]>;
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
  fetchFavoriteWords: () => Promise<Word[]>;
  fetchAllLeastPracticedWords: (deckId?: number) => Promise<Word[]>;
  countWordsForPractice: (deckId?: number) => Promise<number>;
  getTotalWordCount: () => Promise<number>;
  addWord: (
    deckId: number,
    name: string,
    meaning: string,
    category: string | null
  ) => Promise<void>;
  updateWord: (
    id: number,
    name: string,
    meaning: string,
    category: string | null
  ) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  updateWordDetails: (
    id: number,
    category: string | null,
    synonyms: string[],
    antonyms: string[],
    sentences: string[]
  ) => Promise<void>;
  toggleFavoriteStatus: (id: number) => Promise<Word | null>;
  clearWordsForDeck: (deckId: number) => void;
  clearWords: () => void;
  updateStatsAfterAnswer: (wordId: number, quality: number) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: { byId: {}, byDeckId: {} },
  wrongWordsCount: 0,
  favoriteWordsCount: 0,
  urgentWordsCount: 0,
  loading: false,

  fetchWordsOfDeck: async (deckId) => {
    set({ loading: true });
    try {
      const data = await dbGetWordsOfDeck(deckId);
      const newWordsById: { [wordId: number]: Word } = {};
      const wordIdsForDeck: number[] = [];

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

      const wordsById: { [wordId: number]: Word } = {};
      const wordsByDeckId: { [deckId: number]: number[] } = {};

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

  fetchWordsForPractice: async (deckId?: number, limit?: number) => {
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
      eventStore.getState().publish("wordUpdated", { wordId: wordId });
    } catch (error) {
      console.error(
        "Erro ao atualizar estatísticas da palavra com SM-2 no store",
        error
      );
      throw error;
    }
  },
}));

// --- Subscrições de Eventos ---
// O wordStore "ouve" eventos de outros stores para se manter atualizado.
// Como o store é um singleton global, a subscrição deve durar por toda a vida da app,
// então não precisamos de guardar a função de `unsubscribe`.
// Adicionamos o tipo explícito para maior segurança.
eventStore
  .getState()
  .subscribe<{ deckId: number }>("deckDeleted", ({ deckId }) => {
    useWordStore.getState().clearWordsForDeck(deckId);
  });
