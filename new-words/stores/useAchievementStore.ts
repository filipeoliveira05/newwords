import { create } from "zustand";
import {
  getGlobalStats,
  getUserPracticeMetrics,
  getPracticeHistory,
  getUnlockedAchievementIds,
  getDecks,
  getTotalWordCount,
  unlockAchievements,
} from "../services/storage";
import {
  achievements,
  Achievement,
  AchievementRank,
} from "../config/achievements";
import { IconName } from "../app/components/Icon";
import { eventStore } from "./eventStore";
import { useNotificationStore } from "./useNotificationStore";

export interface AchievementToastInfo {
  icon: IconName;
  title: string;
  rank?: AchievementRank;
  description: string;
}

export type ProcessedAchievement = Achievement & {
  unlocked: boolean;
  isNew: boolean; // To differentiate between already unlocked and newly unlocked in one check
};

interface AchievementState {
  achievements: ProcessedAchievement[];
  unlockedCount: number;
  loading: boolean;
  isInitialized: boolean;
  initialize: () => void;
  checkAndProcessAchievements: () => Promise<void>;
  reset: () => void;
}

const initialState: Omit<
  AchievementState,
  "initialize" | "checkAndProcessAchievements" | "reset"
> = {
  achievements: [],
  unlockedCount: 0,
  loading: true,
  isInitialized: false,
};

export const useAchievementStore = create<AchievementState>((set, get) => ({
  ...initialState,
  initialize: () => {
    if (get().isInitialized) return;

    // Faz a verificação inicial e subscreve a eventos futuros.
    const check = get().checkAndProcessAchievements;
    check();

    // Marca como inicializado DEPOIS de a primeira verificação ter sido iniciada.
    set({ isInitialized: true });

    eventStore.getState().subscribe("practiceSessionCompleted", check);
    eventStore.getState().subscribe("wordAdded", check);
    eventStore.getState().subscribe("deckAdded", check);
    eventStore.getState().subscribe("wordDeleted", check);
    eventStore.getState().subscribe("deckDeleted", check);
  },

  checkAndProcessAchievements: async () => {
    // Previne verificações múltiplas se um evento for disparado enquanto outra verificação está a decorrer.
    if (get().loading && get().isInitialized) return;
    set({ loading: true });

    try {
      const [globalStats, metrics, history, unlockedIds, decks, totalWords] =
        await Promise.all([
          getGlobalStats(),
          getUserPracticeMetrics(),
          getPracticeHistory(),
          getUnlockedAchievementIds(),
          getDecks(),
          getTotalWordCount(),
        ]);

      const unlockedIdsSet = new Set(unlockedIds);
      const newlyUnlocked: Achievement[] = [];
      let currentUnlockedCount = 0;

      const checkedAchievements = achievements.map((ach) => {
        const isAlreadyUnlocked = unlockedIdsSet.has(ach.id);
        if (isAlreadyUnlocked) {
          currentUnlockedCount++;
          return { ...ach, unlocked: true, isNew: false };
        }

        const isNowUnlocked = ach.check({
          global: globalStats,
          user: metrics,
          history: history,
          totalWords: totalWords,
          totalDecks: decks.length,
        });

        if (isNowUnlocked) {
          newlyUnlocked.push(ach);
          currentUnlockedCount++;
        }

        return { ...ach, unlocked: isNowUnlocked, isNew: isNowUnlocked };
      });

      if (newlyUnlocked.length > 0) {
        const newIds = newlyUnlocked.map((ach) => ach.id);
        await unlockAchievements(newIds);
        eventStore.getState().publish("achievementUnlocked", {});

        // Adiciona cada nova conquista à fila de notificações centralizada.
        // O sistema de fila tratará de as exibir uma a uma, sem sobreposição.
        newlyUnlocked.forEach((ach) => {
          useNotificationStore.getState().addNotification({
            id: ach.id,
            type: "achievement",
            title: ach.title,
            subtitle: ach.description,
            icon: ach.icon,
            rank: ach.rank,
          });
        });
      }

      set({
        achievements: checkedAchievements,
        unlockedCount: currentUnlockedCount,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to process achievements in store:", error);
      set({ loading: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// Ouve o evento de logout para se resetar.
eventStore.getState().subscribe("userLoggedOut", () => {
  useAchievementStore.getState().reset();
});
