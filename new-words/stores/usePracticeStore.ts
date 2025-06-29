import { create } from "zustand";
import { shuffle } from "../utils/arrayUtils";
import { useWordStore } from "./wordStore";

interface PracticeWord {
  id: number;
  name: string;
  meaning: string;
}

type SessionMode = "flashcard" | "multiple-choice" | "writing" | null;

interface PracticeState {
  sessionState: "not-started" | "in-progress" | "finished";
  wordsForSession: PracticeWord[];
  currentWordIndex: number;
  correctAnswers: number[];
  incorrectAnswers: number[];
  sessionMode: SessionMode;
  streak: number;
  highestStreakThisRound: number;
  startSession: (words: PracticeWord[], mode: NonNullable<SessionMode>) => void;
  recordAnswer: (wordId: number, isCorrect: boolean) => void;
  nextWord: () => void;
  endSession: () => void;
  getCurrentWord: () => PracticeWord | null;
  getSessionProgress: () => number;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  // --- STATE ---
  sessionState: "not-started", // 'not-started', 'in-progress', 'finished'
  wordsForSession: [],
  currentWordIndex: 0,
  correctAnswers: [],
  incorrectAnswers: [],
  sessionMode: null, // 'flashcard', 'multiple-choice', etc.
  streak: 0,
  highestStreakThisRound: 0,

  // --- ACTIONS ---
  startSession: (words, mode) => {
    if (!words || words.length === 0) {
      console.warn("Attempted to start a session with no words.");
      set({ sessionState: "finished" });
      return;
    }
    set({
      wordsForSession: shuffle([...words]),
      sessionMode: mode,
      currentWordIndex: 0,
      correctAnswers: [],
      incorrectAnswers: [],
      sessionState: "in-progress",
      // A streak não é reiniciada, mas o pico da ronda começa com o valor atual da streak
      highestStreakThisRound: get().streak,
    });
  },

  recordAnswer: (wordId, isCorrect) => {
    // Update the database immediately
    useWordStore.getState().updateStatsAfterAnswer(wordId, isCorrect);

    set((state) => ({
      correctAnswers:
        isCorrect && !state.correctAnswers.includes(wordId)
          ? [...state.correctAnswers, wordId]
          : state.correctAnswers,
      incorrectAnswers:
        !isCorrect && !state.incorrectAnswers.includes(wordId)
          ? [...state.incorrectAnswers, wordId]
          : state.incorrectAnswers,
      streak: isCorrect ? state.streak + 1 : 0, // Reinicia a streak se errar, incrementa se acertar
      // Regista o valor mais alto que a streak atingiu nesta ronda
      highestStreakThisRound: isCorrect
        ? Math.max(state.highestStreakThisRound, state.streak + 1)
        : state.highestStreakThisRound,
    }));
  },

  nextWord: () => {
    set((state) => {
      const nextIndex = state.currentWordIndex + 1;
      if (nextIndex >= state.wordsForSession.length) {
        return { sessionState: "finished" };
      }
      return { currentWordIndex: nextIndex };
    });
  },

  endSession: () => {
    set({
      sessionState: "not-started",
      wordsForSession: [],
      currentWordIndex: 0,
      correctAnswers: [],
      incorrectAnswers: [],
      sessionMode: null,
      streak: 0, // A streak é totalmente reiniciada ao sair do ecrã de prática
      highestStreakThisRound: 0,
    });
  },

  // --- GETTERS (Derived State) ---
  getCurrentWord: () => {
    const { wordsForSession, currentWordIndex } = get();
    return wordsForSession[currentWordIndex] || null;
  },

  getSessionProgress: () => {
    const { wordsForSession, currentWordIndex, sessionState } = get();
    if (sessionState === "finished") return 100;
    if (wordsForSession.length === 0) return 0;
    return (currentWordIndex / wordsForSession.length) * 100;
  },
}));
