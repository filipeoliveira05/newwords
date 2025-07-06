import { create } from "zustand";
import { shuffle } from "../utils/arrayUtils";
import { useWordStore } from "./wordStore";

interface PracticeWord {
  id: number;
  name: string;
  meaning: string;
  category: string;
}

type GameMode = "flashcard" | "multiple-choice" | "writing" | "combine-lists";
type SessionType = "urgent" | "free" | "wrong" | "favorite";

interface PracticeState {
  sessionState: "not-started" | "in-progress" | "finished";
  fullSessionWordPool: PracticeWord[]; // The full set of words for the session
  currentRoundWords: PracticeWord[]; // The words for the current round (max 10)
  currentWordIndex: number; // Index within the current round
  currentPoolIndex: number; // Index within the full session pool
  correctAnswers: number[]; // Correct IDs in the current round
  incorrectAnswers: number[]; // Incorrect IDs in the current round
  gameMode: GameMode | null;
  sessionType: SessionType | null;
  deckId?: number; // The deckId for the current session, if applicable
  wordsPracticedInSession: Set<number>; // Unique IDs practiced in the whole session
  streak: number;
  highestStreakThisRound: number;
  initializeSession: (
    fullWordPool: {
      id: number;
      name: string;
      meaning: string;
      category: string | null;
    }[],
    gameMode: GameMode,
    sessionType: SessionType,
    deckId?: number
  ) => void;
  startNextRound: () => void;
  startMistakesRound: (mistakeWords: PracticeWord[]) => void;
  recordAnswer: (wordId: number, quality: number) => void;
  completeRound: () => void;
  nextWord: () => void;
  endSession: () => void;
  getCurrentWord: () => PracticeWord | null;
  getSessionProgress: () => number;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  // --- STATE ---
  sessionState: "not-started", // 'not-started', 'in-progress', 'finished'
  fullSessionWordPool: [],
  currentRoundWords: [],
  currentWordIndex: 0,
  currentPoolIndex: 0,
  correctAnswers: [],
  incorrectAnswers: [],
  gameMode: null,
  sessionType: null,
  deckId: undefined,
  wordsPracticedInSession: new Set(),
  streak: 0,
  highestStreakThisRound: 0,

  // --- ACTIONS ---
  initializeSession: (fullWordPool, gameMode, sessionType, deckId) => {
    if (!fullWordPool || fullWordPool.length === 0) {
      console.warn("Attempted to initialize a session with no words.");
      set({ sessionState: "finished" });
      return;
    }

    // Garante que cada palavra tem uma categoria para exibição.
    const wordsWithDefaultCategory: PracticeWord[] = fullWordPool.map(
      (word) => ({
        ...word,
        category: word.category || "Outro",
      })
    );

    set({
      // Para sessões 'urgent', as palavras já vêm ordenadas por prioridade.
      // Para sessões 'free', baralhar torna a prática menos previsível.
      fullSessionWordPool:
        sessionType === "urgent"
          ? wordsWithDefaultCategory
          : shuffle([...wordsWithDefaultCategory]),
      gameMode: gameMode,
      sessionType: sessionType,
      deckId: deckId,
      currentPoolIndex: 0,
      wordsPracticedInSession: new Set(),
      streak: 0, // Reset streak for a new session
      highestStreakThisRound: 0,
    });
    get().startNextRound(); // Start the first round
  },

  startNextRound: () => {
    const { fullSessionWordPool, currentPoolIndex, gameMode } = get();
    const roundSize = gameMode === "combine-lists" ? 5 : 10;
    const nextWords = fullSessionWordPool.slice(
      currentPoolIndex,
      currentPoolIndex + roundSize
    );

    if (nextWords.length === 0) {
      // This case should be handled by the results screen, but as a fallback:
      set({ sessionState: "finished" });
      return;
    }

    set((state) => ({
      currentRoundWords: nextWords,
      currentWordIndex: 0,
      correctAnswers: [],
      incorrectAnswers: [],
      sessionState: "in-progress",
      currentPoolIndex: state.currentPoolIndex + nextWords.length,
      highestStreakThisRound: state.streak, // Carry over streak to new round's peak
    }));
  },

  startMistakesRound: (mistakeWords) => {
    set((state) => ({
      currentRoundWords: shuffle([...mistakeWords]),
      currentWordIndex: 0,
      correctAnswers: [],
      incorrectAnswers: [],
      sessionState: "in-progress",
      // Don't advance the pool index or reset practiced words for a mistakes round
      highestStreakThisRound: state.streak,
    }));
  },

  recordAnswer: (wordId, quality) => {
    const { correctAnswers, incorrectAnswers } = get();
    const isCorrect = quality >= 3;

    // Prevent re-recording answer in the same round
    if (correctAnswers.includes(wordId) || incorrectAnswers.includes(wordId)) {
      return;
    }

    // Update the database with the new SM-2 logic
    useWordStore.getState().updateStatsAfterAnswer(wordId, quality);

    set((state) => ({
      correctAnswers:
        isCorrect && !state.correctAnswers.includes(wordId)
          ? [...state.correctAnswers, wordId]
          : state.correctAnswers,
      incorrectAnswers:
        !isCorrect && !state.incorrectAnswers.includes(wordId)
          ? [...state.incorrectAnswers, wordId]
          : state.incorrectAnswers,
      wordsPracticedInSession:
        state.gameMode !== "combine-lists" || isCorrect
          ? new Set(state.wordsPracticedInSession).add(wordId)
          : state.wordsPracticedInSession,
      streak: isCorrect ? state.streak + 1 : 0,
      highestStreakThisRound: isCorrect
        ? Math.max(state.highestStreakThisRound, state.streak + 1)
        : state.highestStreakThisRound,
    }));
  },

  completeRound: () => {
    set({ sessionState: "finished" });
  },

  nextWord: () => {
    const { currentWordIndex, currentRoundWords } = get();
    const nextIndex = currentWordIndex + 1;

    if (nextIndex < currentRoundWords.length) {
      // Move to the next word in the current round
      set({ currentWordIndex: nextIndex });
    } else {
      // Round is finished
      set({ sessionState: "finished" });
    }
  },

  endSession: () => {
    set({
      sessionState: "not-started",
      fullSessionWordPool: [],
      currentRoundWords: [],
      currentWordIndex: 0,
      currentPoolIndex: 0,
      correctAnswers: [],
      incorrectAnswers: [],
      gameMode: null,
      sessionType: null,
      deckId: undefined,
      wordsPracticedInSession: new Set(),
      streak: 0, // A streak é totalmente reiniciada ao sair do ecrã de prática
      highestStreakThisRound: 0,
    });
  },

  // --- GETTERS (Derived State) ---
  getCurrentWord: () => {
    const { currentRoundWords, currentWordIndex } = get();
    return currentRoundWords[currentWordIndex] || null;
  },

  getSessionProgress: () => {
    const { fullSessionWordPool, wordsPracticedInSession } = get();
    if (!fullSessionWordPool || fullSessionWordPool.length === 0) return 0;

    // Progress is based on unique words practiced from the total session pool
    return (wordsPracticedInSession.size / fullSessionWordPool.length) * 100;
  },
}));
