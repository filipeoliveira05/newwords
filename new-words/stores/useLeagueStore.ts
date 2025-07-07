import { create } from "zustand";
import { startOfWeek, isBefore, formatISO } from "date-fns";
import Toast from "react-native-toast-message";
import {
  getLeagueData,
  updateLeagueData,
  addWeeklyXP as dbAddWeeklyXP,
} from "../services/storage";
import {
  LEAGUES,
  League,
  getLeagueByName,
  getLeagueIndex,
} from "../config/leagues";
import { eventStore } from "./eventStore";

const FAKE_NAMES = [
  "Alex",
  "Bruno",
  "Carla",
  "Daniel",
  "Elisa",
  "Fábio",
  "Gabi",
  "Hugo",
  "Inês",
  "João",
  "Lara",
  "Marco",
  "Nuno",
  "Olívia",
  "Pedro",
  "Quintino",
  "Rita",
  "Sérgio",
  "Tânia",
  "Ulisses",
  "Vera",
  "Xavier",
  "Yasmin",
  "Zeca",
  "Ana",
  "Bia",
  "Caio",
  "Duda",
  "Eva",
];

export interface LeaderboardUser {
  isCurrentUser: boolean;
  rank: number;
  name: string;
  xp: number;
}

interface LeagueState {
  isLoading: boolean;
  currentLeague: League | null;
  leaderboard: LeaderboardUser[];
  userRank: number;
  weeklyXP: number;
  checkAndInitializeLeagues: () => Promise<void>;
  addXP: (xp: number) => Promise<void>;
}

const generateSimulatedLeaderboard = (
  currentUserXP: number,
  league: League
): LeaderboardUser[] => {
  const list: { name: string; xp: number }[] = [];
  // Usa o XP base e a variação da liga para uma simulação mais realista
  const { baseXP, xpRange } = league;

  for (let i = 0; i < league.groupSize - 1; i++) {
    // Gera uma pontuação aleatória dentro da faixa definida para a liga
    const randomXP = baseXP + (Math.random() * 2 - 1) * xpRange;
    const xp = Math.max(0, Math.floor(randomXP));
    list.push({ name: FAKE_NAMES[i % FAKE_NAMES.length], xp });
  }

  list.push({ name: "Você", xp: currentUserXP });

  return list
    .sort((a, b) => b.xp - a.xp)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: user.name === "Você",
    }));
};

export const useLeagueStore = create<LeagueState>((set, get) => ({
  isLoading: true,
  currentLeague: null,
  leaderboard: [],
  userRank: 0,
  weeklyXP: 0,

  checkAndInitializeLeagues: async () => {
    set({ isLoading: true });
    let {
      currentLeague: leagueName,
      weeklyXP,
      leagueStartDate,
    } = await getLeagueData();

    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday

    if (
      !leagueStartDate ||
      isBefore(new Date(leagueStartDate), startOfThisWeek)
    ) {
      // Week has ended, or it's the first time.
      const oldLeagueConfig = getLeagueByName(leagueName);
      if (oldLeagueConfig && leagueStartDate) {
        // Only do promotion if it's not the first time
        const finalLeaderboard = generateSimulatedLeaderboard(
          weeklyXP,
          oldLeagueConfig
        );
        const finalRank =
          finalLeaderboard.find((u) => u.isCurrentUser)?.rank ?? 0;

        const leagueIndex = getLeagueIndex(leagueName);
        if (finalRank > 0 && finalRank <= oldLeagueConfig.promotionZone) {
          if (leagueIndex < LEAGUES.length - 1) {
            leagueName = LEAGUES[leagueIndex + 1].name;
            Toast.show({
              type: "success",
              text1: "Promovido!",
              text2: `Bem-vindo à Liga ${leagueName}!`,
            });
          }
        } else if (
          finalRank > 0 &&
          finalRank > oldLeagueConfig.groupSize - oldLeagueConfig.demotionZone
        ) {
          if (leagueIndex > 0) {
            leagueName = LEAGUES[leagueIndex - 1].name;
            Toast.show({
              type: "error",
              text1: "Despromovido",
              text2: `Você voltou para a Liga ${leagueName}.`,
            });
          }
        }
      }

      // Reset for the new week
      weeklyXP = 0;
      await updateLeagueData({
        currentLeague: leagueName,
        weeklyXP: 0,
        leagueStartDate: formatISO(startOfThisWeek),
      });
    }

    const leagueConfig = getLeagueByName(leagueName);
    if (leagueConfig) {
      const leaderboard = generateSimulatedLeaderboard(weeklyXP, leagueConfig);
      const userRank = leaderboard.find((u) => u.isCurrentUser)?.rank ?? 0;
      set({
        currentLeague: leagueConfig,
        leaderboard,
        userRank,
        weeklyXP,
        isLoading: false,
      });
    }
  },

  addXP: async (xpToAdd) => {
    await dbAddWeeklyXP(xpToAdd);
    set((state) => {
      if (!state.currentLeague) return state;

      const newWeeklyXP = state.weeklyXP + xpToAdd;
      const newLeaderboard = generateSimulatedLeaderboard(
        newWeeklyXP,
        state.currentLeague
      );
      const newUserRank =
        newLeaderboard.find((u) => u.isCurrentUser)?.rank ?? 0;

      return {
        weeklyXP: newWeeklyXP,
        leaderboard: newLeaderboard,
        userRank: newUserRank,
      };
    });
  },
}));

// --- Event Subscription ---
// The league store listens for XP updates to update the weekly total.
// This decouples it from the userStore.
eventStore.getState().subscribe<{ xp: number }>("xpUpdated", ({ xp }) => {
  // Avoid calling checkAndInitializeLeagues if not needed, just add XP
  useLeagueStore.getState().addXP(xp);
});
