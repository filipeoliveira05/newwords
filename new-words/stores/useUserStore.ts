import { create } from "zustand";
import {
  getGamificationStats,
  getTodaysActiveGoalIds,
  setTodaysActiveGoalIds,
  getTodaysPracticeStats,
  getChallengingWords,
  getMetaValue,
  getDeckById,
  updateUserXP,
  GamificationStats,
  ChallengingWord,
} from "../services/storage";
import { eventStore } from "./eventStore";
import { DailyGoal, allPossibleDailyGoals } from "@/config/dailyGoals";
import { shuffle } from "@/utils/arrayUtils";
import { Deck } from "@/types/database";

// A DailyGoal with its progress calculated for the current day.
type ProcessedDailyGoal = DailyGoal & {
  current: number;
};

interface UserState extends GamificationStats {
  loading: boolean;
  fetchUserStats: () => Promise<void>;
  addXP: (xp: number) => Promise<void>;
  dailyGoals: ProcessedDailyGoal[];
  challengingWords: ChallengingWord[];
  lastPracticedDeck: Deck | null;
}

const getXPForNextLevel = (level: number) =>
  Math.floor(100 * Math.pow(level, 1.5));

export const useUserStore = create<UserState>((set) => ({
  xp: 0,
  level: 1,
  xpForNextLevel: 100,
  consecutiveDays: 0,
  totalWords: 0,
  loading: true,
  dailyGoals: [],
  challengingWords: [],
  lastPracticedDeck: null,

  fetchUserStats: async () => {
    set({ loading: true });
    try {
      const [
        stats,
        todaysPractice,
        todaysActiveGoalIds,
        challenging,
        lastDeckIdStr,
      ] = await Promise.all([
        getGamificationStats(),
        getTodaysPracticeStats(),
        getTodaysActiveGoalIds(),
        getChallengingWords(),
        getMetaValue("last_practiced_deck_id"),
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
        dailyGoals: finalGoals.map((g) => ({
          ...g,
          current: g.getCurrentProgress(todaysPractice),
        })),
        challengingWords: challenging,
        lastPracticedDeck: lastDeck,
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
        const xpForNext = getXPForNextLevel(newLevel);
        return { xp: newXP, level: newLevel, xpForNextLevel: xpForNext };
      });

      if (didLevelUp) {
        eventStore.getState().publish("leveledUp", { newLevel });
      }
      // Publica um evento geral de atualização de XP
      eventStore.getState().publish("xpUpdated", {});
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);
    }
  },
}));
