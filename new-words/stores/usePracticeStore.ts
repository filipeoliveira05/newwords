import { create } from "zustand";
import { shuffle } from "../utils/arrayUtils";
import { useWordStore } from "./wordStore";
import { eventStore } from "./eventStore";

interface PracticeWord {
  id: string;
  name: string;
  meaning: string;
  category: string;
}

export type GameMode =
  | "flashcard"
  | "multiple-choice"
  | "writing"
  | "combine-lists";
export type SessionType = "urgent" | "free" | "wrong" | "favorite";

interface PracticeState {
  sessionState: "not-started" | "in-progress" | "finished";
  fullSessionWordPool: PracticeWord[]; // The full set of words for the session
  currentRoundWords: PracticeWord[]; // The words for the current round (max 10)
  currentWordIndex: number; // Index within the current round
  currentPoolIndex: number; // Index within the full session pool
  correctAnswers: string[]; // Correct IDs in the current round
  incorrectAnswers: string[]; // Incorrect IDs in the current round
  gameMode: GameMode | null;
  sessionType: SessionType | null;
  deckId?: string; // The deckId for the current session, if applicable
  wordsPracticedInSession: Set<string>; // Unique IDs practiced in the whole session
  streak: number;
  highestStreakThisRound: number;
  initializeSession: (
    fullWordPool: {
      id: string;
      name: string;
      meaning: string;
      category: string | null;
    }[],
    gameMode: GameMode,
    sessionType: SessionType,
    deckId?: string
  ) => void;
  startNextRound: () => void;
  startMistakesRound: (mistakeWords: PracticeWord[]) => void;
  recordAnswer: (wordId: string, quality: number) => void;
  completeRound: () => void;
  nextWord: () => void;
  endSession: () => void;
  getCurrentWord: () => PracticeWord | null;
  getSessionProgress: () => number;
  reset: () => void;
}

const checkAndPublishPerfectRound = (get: () => PracticeState) => {
  const { incorrectAnswers, currentRoundWords } = get();
  if (incorrectAnswers.length === 0 && currentRoundWords.length > 0) {
    eventStore.getState().publish("perfectRoundCompleted", {});
  }
};

const initialState: Omit<
  PracticeState,
  | "initializeSession"
  | "startNextRound"
  | "startMistakesRound"
  | "recordAnswer"
  | "completeRound"
  | "nextWord"
  | "endSession"
  | "getCurrentWord"
  | "getSessionProgress"
  | "reset"
> = {
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
  streak: 0,
  highestStreakThisRound: 0,
};

export const usePracticeStore = create<PracticeState>((set, get) => ({
  ...initialState,
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

    // Se a palavra já foi combinada corretamente, não faz mais nada.
    // Isto previne, por exemplo, ganhar XP múltiplas vezes pela mesma palavra.
    if (correctAnswers.includes(wordId)) {
      return;
    }

    // --- Lógica de Base de Dados (SM-2) ---
    // A primeira resposta a uma palavra na ronda é a que conta para as estatísticas de aprendizagem.
    // Se o utilizador errar primeiro e depois acertar, a penalidade do erro é mantida.
    const isFirstAnswerInRound =
      !correctAnswers.includes(wordId) && !incorrectAnswers.includes(wordId);

    if (isFirstAnswerInRound) {
      useWordStore.getState().updateStatsAfterAnswer(wordId, quality);
    }

    // --- Lógica de Gamificação e Estado da UI ---
    // Publica sempre o evento de resposta correta para que o XP seja atribuído.
    if (isCorrect) {
      eventStore.getState().publish("answerRecorded", { wordId, quality });
      // Publica a atualização da sequência para que as metas diárias possam
      // ser atualizadas em tempo real.
      const newStreak = get().streak + 1;
      eventStore.getState().publish("streakUpdated", { newStreak });
    }

    set((state) => {
      // Se a resposta for incorreta, adiciona-a à lista de erros da ronda.
      // Esta lista não é limpa mesmo que o utilizador acerte depois.
      const newIncorrectAnswers =
        !isCorrect && !state.incorrectAnswers.includes(wordId)
          ? [...state.incorrectAnswers, wordId]
          : state.incorrectAnswers;

      // Se a resposta for correta, adiciona-a à lista de acertos (para UI e pontuação).
      const newCorrectAnswers = isCorrect
        ? [...state.correctAnswers, wordId]
        : state.correctAnswers;

      // A barra de progresso só avança com uma resposta correta.
      const newWordsPracticedInSession =
        // Para o modo de combinar, só avança no acerto.
        state.gameMode === "combine-lists"
          ? isCorrect
            ? new Set(state.wordsPracticedInSession).add(wordId)
            : state.wordsPracticedInSession
          : // Para os outros modos, avança em qualquer resposta (a palavra foi "vista").
            new Set(state.wordsPracticedInSession).add(wordId);

      return {
        correctAnswers: newCorrectAnswers,
        incorrectAnswers: newIncorrectAnswers,
        wordsPracticedInSession: newWordsPracticedInSession,
        streak: isCorrect ? state.streak + 1 : 0,
        highestStreakThisRound: isCorrect
          ? Math.max(state.highestStreakThisRound, state.streak + 1)
          : state.highestStreakThisRound,
      };
    });
  },

  completeRound: () => {
    checkAndPublishPerfectRound(get);
    set({ sessionState: "finished" });
  },

  nextWord: () => {
    const { currentWordIndex, currentRoundWords } = get();
    const nextIndex = currentWordIndex + 1;

    if (nextIndex < currentRoundWords.length) {
      // Move to the next word in the current round
      set({ currentWordIndex: nextIndex });
    } else {
      checkAndPublishPerfectRound(get);
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

    // Publica um evento com os detalhes da sessão que acabou de terminar.
    // Isto permite que outros stores (como o de metas) reajam.
    eventStore.getState().publish("practiceSessionCompleted", {
      sessionType: get().sessionType,
      gameMode: get().gameMode,
      streak: get().highestStreakThisRound,
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

  reset: () => {
    set(initialState);
  },
}));

// Ouve o evento de logout para se resetar.
eventStore.getState().subscribe("userLoggedOut", () => {
  usePracticeStore.getState().reset();
});
