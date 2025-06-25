import { create } from "zustand";
import { shuffle } from "../utils/arrayUtils";

interface PracticeWord {
  id: number;
  name: string;
  meaning: string;
}

type SessionMode = "flashcard" | "multiple-choice" | null;

interface PracticeState {
  sessionState: "not-started" | "in-progress" | "finished";
  wordsForSession: PracticeWord[];
  currentWordIndex: number;
  correctAnswers: number[];
  incorrectAnswers: number[];
  sessionMode: SessionMode;
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
    });
  },

  recordAnswer: (wordId, isCorrect) => {
    set((state) => ({
      correctAnswers:
        isCorrect && !state.correctAnswers.includes(wordId)
          ? [...state.correctAnswers, wordId]
          : state.correctAnswers,
      incorrectAnswers:
        !isCorrect && !state.incorrectAnswers.includes(wordId)
          ? [...state.incorrectAnswers, wordId]
          : state.incorrectAnswers,
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
