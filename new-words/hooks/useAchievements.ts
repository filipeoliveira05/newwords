import { useState, useEffect } from "react";
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
import { eventStore } from "../stores/eventStore";

// Define o tipo de retorno do hook para clareza
export type ProcessedAchievement = Achievement & {
  unlocked: boolean;
  isNew: boolean;
};

export interface AchievementToastInfo {
  icon: IconName;
  title: string;
  rank?: AchievementRank;
  description: string;
}

export const useAchievements = () => {
  const [loading, setLoading] = useState(true);
  const [processedAchievements, setProcessedAchievements] = useState<
    ProcessedAchievement[]
  >([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    const processAndCheckAchievements = async () => {
      try {
        // Não é necessário um estado de loading global, pois o hook gere o seu próprio.
        const [globalStats, metrics, history, unlockedIds, decks, totalWords] =
          await Promise.all([
            getGlobalStats(),
            getUserPracticeMetrics(),
            getPracticeHistory(),
            getUnlockedAchievementIds(),
            getDecks(),
            getTotalWordCount(),
          ]);

        if (globalStats && metrics && history && totalWords !== undefined) {
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
            // Notifica outros ecrãs que as conquistas mudaram (ex: para atualizar contadores)
            eventStore.getState().publish("achievementUnlocked", {});

            newlyUnlocked.forEach((ach, index) => {
              setTimeout(() => {
                eventStore.getState().publish("achievementToast", {
                  icon: ach.icon,
                  title: ach.title,
                  rank: ach.rank,
                  description: ach.description,
                });
              }, index * 800); // Stagger the toasts slightly
            });
          }

          setProcessedAchievements(checkedAchievements);
          setUnlockedCount(currentUnlockedCount);
        }
      } catch (error) {
        console.error("Failed to process achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    // A lógica de subscrição de eventos é movida para aqui,
    // tornando o hook reativo e independente.
    const subscriptions = [
      eventStore
        .getState()
        .subscribe("practiceSessionCompleted", processAndCheckAchievements),
      eventStore.getState().subscribe("wordAdded", processAndCheckAchievements),
      eventStore
        .getState()
        .subscribe("wordDeleted", processAndCheckAchievements),
      eventStore
        .getState()
        .subscribe("wordUpdated", processAndCheckAchievements),
      eventStore
        .getState()
        .subscribe("deckDeleted", processAndCheckAchievements),
    ];

    processAndCheckAchievements(); // Executa na primeira vez

    return () => subscriptions.forEach((sub) => sub()); // Limpa todas as subscrições
  }, []);

  return { achievements: processedAchievements, unlockedCount, loading };
};
