import { create } from "zustand";
import {
  getGamificationStats,
  checkAndResetDailyStreak,
  getTodaysActiveGoalIds,
  setTodaysActiveGoalIds,
  getTodaysPracticeStats,
  getChallengingWords,
  getMetaValue,
  setMetaValue,
  getDeckById,
  updateUserXP,
  GamificationStats,
  ChallengingWord,
  PracticeHistory,
  getWeeklySummaryStats,
  getWordLearnedOnThisDay,
  getAchievementsCount,
  getAchievementsUnlockedOnDate,
  countCorrectAnswersOnDate,
  countWordsMasteredOnDate,
  getPerfectRoundsToday,
  getSessionCompletedToday,
  getWordsAddedToday,
  getHighestStreakToday,
  updateHighestStreakToday,
  getNotifiedGoalIdsToday,
  addNotifiedGoalIdToday,
  incrementWordsAddedToday,
  getDecksCreatedToday,
  incrementDecksCreatedToday,
  incrementPerfectRoundsToday,
  setSessionCompletedToday,
  WeeklySummary,
  getLevelUpHistory,
  LevelUpRecord,
  countWordsForPractice,
} from "../services/storage";
import { useNotificationStore } from "./useNotificationStore";
import { eventStore } from "./eventStore";
import {
  DailyGoal,
  allPossibleDailyGoals,
  DailyGoalContext,
  goalCategories,
} from "../config/dailyGoals";
import { shuffle } from "../utils/arrayUtils";
import { Word, Deck } from "../types/database";
import { GameMode, SessionType } from "./usePracticeStore";
import { format } from "date-fns";

// A DailyGoal with its progress calculated for the current day.
type ProcessedDailyGoal = DailyGoal & {
  current: number;
};

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string;
}

interface UserState extends GamificationStats {
  user: UserDetails | null;
  loading: boolean;
  fetchUserStats: () => Promise<void>;
  addXP: (xp: number) => Promise<void>;
  // Função mais genérica para atualizar qualquer detalhe do utilizador
  updateUserDetails: (details: Partial<UserDetails>) => Promise<void>;
  dailyGoals: ProcessedDailyGoal[];
  challengingWords: ChallengingWord[];
  lastPracticedDeck: Deck | null;
  pendingLevelUpAnimation: number | null;
  clearPendingLevelUpAnimation: () => void;
  todaysPractice: PracticeHistory | null;
  weeklySummary: WeeklySummary | null;
  onThisDayWord: Word | null;
  totalAchievements: number;
  levelUpHistory: LevelUpRecord[];
  urgentWordsCount: number;
}

const getXPForNextLevel = (level: number) =>
  Math.floor(100 * Math.pow(level, 1.5));

export const useUserStore = create<UserState>((set) => ({
  xp: 0,
  level: 1,
  xpForNextLevel: 100,
  consecutiveDays: 0,
  totalWords: 0,
  wordsMastered: 0,
  lastPracticeDate: null,
  loading: false,
  user: null,
  dailyGoals: [],
  challengingWords: [],
  lastPracticedDeck: null,
  pendingLevelUpAnimation: null,
  todaysPractice: null,
  weeklySummary: null,
  onThisDayWord: null,
  totalAchievements: 0,
  levelUpHistory: [],
  urgentWordsCount: 0,

  fetchUserStats: async () => {
    // Previne múltiplas chamadas em simultâneo, que podem causar o erro "Maximum update depth exceeded".
    // Se já estiver a carregar, ignora a nova chamada.
    if (useUserStore.getState().loading) return;

    set({ loading: true });
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");

      // Primeiro, verifica e reinicia a streak diária se necessário.
      // Isto garante que os dados de gamificação estão corretos ANTES de serem obtidos.
      await checkAndResetDailyStreak();

      const [
        stats,
        todaysPractice,
        todaysActiveGoalIds,
        challenging,
        lastDeckIdStr,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        weeklySummary,
        onThisDayWord,
        totalAchievements,
        levelUpHistory,
        urgentWordsCount,
        wordsAddedToday, // Agora vem da nova função
        unlockedAchievementsToday,
        correctAnswersToday,
        decksCreatedToday, // Agora vem da nova função
        wordsMasteredToday,
        perfectRoundsToday,
        completedFavoriteSessionToday,
        completedWrongSessionToday,
        completedFlashcardSessionToday,
        completedMultipleChoiceSessionToday,
        completedWritingSessionToday,
        completedCombineListsSessionToday,
        notifiedGoalIdsToday,
        highestStreakToday,
      ] = await Promise.all([
        getGamificationStats(),
        getTodaysPracticeStats(),
        getTodaysActiveGoalIds(),
        getChallengingWords(),
        getMetaValue("last_practiced_deck_id"),
        getMetaValue("first_name", "Novo"),
        getMetaValue("last_name", "Utilizador"),
        getMetaValue("email", ""),
        getMetaValue("profile_picture_url", ""),
        getWeeklySummaryStats(),
        getWordLearnedOnThisDay(),
        getAchievementsCount(),
        getLevelUpHistory(),
        countWordsForPractice(),
        getWordsAddedToday(),
        getAchievementsUnlockedOnDate(todayStr), // Returns string[]
        countCorrectAnswersOnDate(todayStr), // Returns number
        getDecksCreatedToday(),
        countWordsMasteredOnDate(todayStr),
        getPerfectRoundsToday(),
        getSessionCompletedToday("favorite"),
        getSessionCompletedToday("wrong"),
        getSessionCompletedToday("flashcard"),
        getSessionCompletedToday("multiple-choice"),
        getSessionCompletedToday("writing"),
        getSessionCompletedToday("combine-lists"),
        getNotifiedGoalIdsToday(),
        getHighestStreakToday(),
      ]);

      let finalGoals: DailyGoal[] = [];
      if (todaysActiveGoalIds) {
        const goalMap = new Map(allPossibleDailyGoals.map((g) => [g.id, g]));
        finalGoals = todaysActiveGoalIds
          .map((id) => goalMap.get(id))
          .filter((g): g is DailyGoal => !!g);
      } else {
        // Nova lógica: escolhe uma meta de cada categoria para garantir variedade.
        const goalsByCategory = new Map<string, DailyGoal[]>();
        allPossibleDailyGoals.forEach((goal) => {
          if (!goalsByCategory.has(goal.category)) {
            goalsByCategory.set(goal.category, []);
          }
          goalsByCategory.get(goal.category)!.push(goal);
        });

        const shuffledCategories = shuffle([...goalCategories]);

        for (const category of shuffledCategories) {
          const categoryGoals = goalsByCategory.get(category);
          if (categoryGoals && categoryGoals.length > 0) {
            const randomGoal = shuffle(categoryGoals)[0];
            finalGoals.push(randomGoal);
          }
          if (finalGoals.length >= 3) break; // Garante que escolhemos apenas 3
        }
        await setTodaysActiveGoalIds(finalGoals.map((g) => g.id));
      }

      const goalContext: DailyGoalContext = {
        todaysPractice,
        wordsAddedToday,
        achievementsUnlockedToday: unlockedAchievementsToday.length,
        correctAnswersToday,
        decksCreatedToday,
        highestStreakToday,
        wordsMasteredToday,
        perfectRoundsToday,
        completedFavoriteSessionToday,
        completedWrongSessionToday,
        completedFlashcardSessionToday,
        completedMultipleChoiceSessionToday,
        completedWritingSessionToday,
        completedCombineListsSessionToday,
      };

      const newProcessedGoals = finalGoals.map((g) => ({
        ...g,
        current: g.getCurrentProgress(goalContext),
      }));

      // Compara as metas antigas com as novas para detetar conclusões
      const oldGoals = useUserStore.getState().dailyGoals;
      const notifiedIdsSet = new Set(notifiedGoalIdsToday);
      const notificationPromises: Promise<void>[] = [];

      newProcessedGoals.forEach((newGoal) => {
        const oldGoal = oldGoals.find((g) => g.id === newGoal.id);
        const wasCompleted = oldGoal
          ? oldGoal.current >= oldGoal.target
          : false;
        const isNowCompleted = newGoal.current >= newGoal.target;
        const wasAlreadyNotified = notifiedIdsSet.has(newGoal.id);

        if (isNowCompleted && !wasCompleted && !wasAlreadyNotified) {
          useNotificationStore.getState().addNotification({
            id: newGoal.id,
            type: "dailyGoal",
            title: newGoal.title,
            icon: newGoal.icon,
          });
          // Persiste que a notificação para esta meta foi enviada hoje.
          // Adiciona a promessa ao array para ser aguardada.
          notificationPromises.push(addNotifiedGoalIdToday(newGoal.id));
          notifiedIdsSet.add(newGoal.id);
        }
      });

      // Garante que todas as operações de escrita na DB terminam antes de continuar.
      await Promise.all(notificationPromises);

      const lastDeckId = lastDeckIdStr ? parseInt(lastDeckIdStr, 10) : null;
      const lastDeck = lastDeckId ? await getDeckById(lastDeckId) : null;

      set({
        ...stats,
        user: {
          firstName: firstName ?? "Novo",
          lastName: lastName ?? "Utilizador",
          email: email ?? "",
          profilePictureUrl: profilePictureUrl ?? "",
        },
        dailyGoals: newProcessedGoals,
        challengingWords: challenging,
        lastPracticedDeck: lastDeck,
        todaysPractice: todaysPractice,
        weeklySummary,
        onThisDayWord,
        totalAchievements,
        levelUpHistory,
        urgentWordsCount,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do utilizador:", error);
      set({ loading: false });
    }
  },

  addXP: async (xpToAdd) => {
    try {
      const { newXP, newLevel, didLevelUp } = await updateUserXP(xpToAdd);

      // Atualiza o estado de forma otimista
      set((state) => {
        const newState: Partial<UserState> = {
          xp: newXP,
          level: newLevel,
          xpForNextLevel: getXPForNextLevel(newLevel),
        };

        // Apenas atualiza o estado de animação pendente se houver um level up.
        // Isto previne que um ganho de XP subsequente limpe uma animação pendente.
        if (didLevelUp) {
          newState.pendingLevelUpAnimation = newLevel;
        }
        return newState;
      });

      if (didLevelUp) {
        // Publica um evento para que a notificação toast possa aparecer.
        useNotificationStore.getState().addNotification({
          id: `levelup-${newLevel}`,
          type: "levelUp",
          title: `Nível ${newLevel}`,
          newLevel,
          icon: "swapVertical",
        });
      }

      // Publica um evento geral de atualização de XP
      eventStore.getState().publish("xpUpdated", { xp: xpToAdd });
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);
    }
  },

  updateUserDetails: async (details) => {
    try {
      const updatePromises: Promise<void>[] = [];

      if (details.firstName !== undefined)
        updatePromises.push(setMetaValue("first_name", details.firstName));
      if (details.lastName !== undefined)
        updatePromises.push(setMetaValue("last_name", details.lastName));
      if (details.email !== undefined)
        updatePromises.push(setMetaValue("email", details.email));
      if (details.profilePictureUrl !== undefined)
        updatePromises.push(
          setMetaValue("profile_picture_url", details.profilePictureUrl)
        );

      await Promise.all(updatePromises);

      // Atualiza o estado localmente
      set((state) => ({ user: { ...state.user!, ...details } }));
    } catch (error) {
      console.error("Erro ao atualizar os detalhes do utilizador:", error);
    }
  },

  clearPendingLevelUpAnimation: () => {
    set({ pendingLevelUpAnimation: null });
  },
}));

// --- Event Subscriptions for Gamification ---
// The user store listens for events from other stores to award XP.
// This centralizes the gamification logic.

eventStore
  .getState()
  .subscribe<{ wordId: number; quality: number }>(
    "answerRecorded",
    ({ quality }) => {
      if (quality >= 3) {
        // Correct answer
        useUserStore.getState().addXP(10);
      }
    }
  );

eventStore.getState().subscribe("wordAdded", async () => {
  await incrementWordsAddedToday();
  useUserStore.getState().addXP(5); // Atribui XP
  useUserStore.getState().fetchUserStats(); // Recalcula tudo, incluindo metas
});

eventStore.getState().subscribe("deckAdded", async () => {
  await incrementDecksCreatedToday();
  useUserStore.getState().fetchUserStats(); // Recalcula tudo, incluindo metas
});

// Ouve o evento de palavra apagada para manter o contador no header atualizado.
eventStore.getState().subscribe("wordDeleted", () => {
  useUserStore.setState((state) => ({
    totalWords: Math.max(0, state.totalWords - 1),
  }));
});

eventStore.getState().subscribe<object>("perfectRoundCompleted", async () => {
  await incrementPerfectRoundsToday();
  // Recalcula as metas para refletir o progresso
  useUserStore.getState().fetchUserStats();
});

eventStore
  .getState()
  .subscribe<{ newStreak: number }>("streakUpdated", async ({ newStreak }) => {
    // Atualiza a maior sequência do dia na base de dados.
    await updateHighestStreakToday(newStreak);
    // Recalcula as metas para que o progresso seja refletido em tempo real.
    // Esta chamada é otimizada para não correr em duplicado se já estiver em progresso.
    useUserStore.getState().fetchUserStats();
  });

eventStore
  .getState()
  .subscribe<{ sessionType: SessionType | null; gameMode: GameMode | null }>(
    "practiceSessionCompleted",
    async ({ sessionType, gameMode }) => {
      let needsUpdate = false;
      if (sessionType === "favorite") {
        await setSessionCompletedToday("favorite");
        needsUpdate = true;
      }
      if (sessionType === "wrong") {
        await setSessionCompletedToday("wrong");
        needsUpdate = true;
      }
      if (gameMode === "flashcard") {
        await setSessionCompletedToday("flashcard");
        needsUpdate = true;
      }
      if (gameMode === "multiple-choice") {
        await setSessionCompletedToday("multiple-choice");
        needsUpdate = true;
      }
      if (gameMode === "writing") {
        await setSessionCompletedToday("writing");
        needsUpdate = true;
      }
      if (gameMode === "combine-lists") {
        await setSessionCompletedToday("combine-lists");
        needsUpdate = true;
      }
      if (needsUpdate) {
        useUserStore.getState().fetchUserStats();
      }
    }
  );
