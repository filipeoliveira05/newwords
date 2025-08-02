import {
  useAchievementStore,
  ProcessedAchievement,
} from "../stores/useAchievementStore";

export type { ProcessedAchievement };

export const useAchievements = () => {
  const { achievements, unlockedCount, loading } = useAchievementStore();
  return { achievements, unlockedCount, loading };
};
