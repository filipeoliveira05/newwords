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
  countWordsAddedOnDate,
  getAchievementsUnlockedOnDate,
  countCorrectAnswersOnDate,
  countDecksCreatedOnDate,
  countWordsMasteredOnDate,
  WeeklySummary,
  countWordsForPractice,
} from "../services/storage";
import { eventStore } from "./eventStore";
import {
  DailyGoal,
  allPossibleDailyGoals,
  DailyGoalContext,
  goalCategories,
} from "../config/dailyGoals";
import { shuffle } from "../utils/arrayUtils";
import { Word, Deck } from "../types/database";
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
        urgentWordsCount,
        wordsAddedToday,
        unlockedAchievementsToday,
        correctAnswersToday,
        decksCreatedToday,
        wordsMasteredToday,
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
        countWordsForPractice(),
        countWordsAddedOnDate(todayStr),
        getAchievementsUnlockedOnDate(todayStr), // Returns string[]
        countCorrectAnswersOnDate(todayStr), // Returns number
        countDecksCreatedOnDate(todayStr),
        countWordsMasteredOnDate(todayStr),
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
        wordsMasteredToday,
      };

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
        dailyGoals: finalGoals.map((g) => ({
          ...g,
          current: g.getCurrentProgress(goalContext),
        })),
        challengingWords: challenging,
        lastPracticedDeck: lastDeck,
        todaysPractice: todaysPractice,
        weeklySummary,
        onThisDayWord,
        totalAchievements,
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
        eventStore.getState().publish("levelUp", { newLevel });
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

eventStore.getState().subscribe("wordAdded", () => {
  useUserStore.getState().addXP(5);
  // Atualiza o contador de palavras em tempo real para o header.
  useUserStore.setState((state) => ({ totalWords: state.totalWords + 1 }));
});

// Ouve o evento de palavra apagada para manter o contador no header atualizado.
eventStore.getState().subscribe("wordDeleted", () => {
  useUserStore.setState((state) => ({
    // Garante que o contador não fica negativo
    totalWords: Math.max(0, state.totalWords - 1),
  }));
});
