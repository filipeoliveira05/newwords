import { create } from "zustand";
import {
  getGamificationStats,
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
} from "../services/storage";
import { eventStore } from "./eventStore";
import { DailyGoal, allPossibleDailyGoals } from "../config/dailyGoals";
import { shuffle } from "../utils/arrayUtils";
import { Deck } from "../types/database";

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
  loading: true,
  user: null,
  dailyGoals: [],
  challengingWords: [],
  lastPracticedDeck: null,
  pendingLevelUpAnimation: null,
  todaysPractice: null,

  fetchUserStats: async () => {
    set({ loading: true });
    try {
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
      ]);

      let finalGoals: DailyGoal[] = [];
      if (todaysActiveGoalIds) {
        const goalMap = new Map(allPossibleDailyGoals.map((g) => [g.id, g]));
        finalGoals = todaysActiveGoalIds
          .map((id) => goalMap.get(id))
          .filter((g): g is DailyGoal => !!g);
      } else {
        finalGoals = shuffle([...allPossibleDailyGoals]).slice(0, 3);
        await setTodaysActiveGoalIds(finalGoals.map((g) => g.id));
      }

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
          current: g.getCurrentProgress(todaysPractice),
        })),
        challengingWords: challenging,
        lastPracticedDeck: lastDeck,
        todaysPractice: todaysPractice,
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
      set(() => {
        return {
          xp: newXP,
          level: newLevel,
          xpForNextLevel: getXPForNextLevel(newLevel),
          // Se houve level up, guarda o novo nível para a animação ser mostrada mais tarde.
          pendingLevelUpAnimation: didLevelUp ? newLevel : null,
        };
      });

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
});
