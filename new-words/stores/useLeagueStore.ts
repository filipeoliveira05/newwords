import { create } from "zustand";
import { startOfWeek, isBefore, formatISO } from "date-fns";
import Toast from "react-native-toast-message";
import {
  getLeagueData,
  updateLeagueData,
  addWeeklyXP as dbAddWeeklyXP,
  getMetaValue,
  setMetaValue,
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

const FAKE_LAST_NAMES = [
  "Silva",
  "Santos",
  "Ferreira",
  "Pereira",
  "Oliveira",
  "Costa",
  "Rodrigues",
  "Martins",
  "Jesus",
  "Sousa",
  "Fernandes",
  "Gonçalves",
  "Gomes",
  "Lopes",
  "Marques",
  "Alves",
  "Almeida",
  "Ribeiro",
  "Pinto",
  "Carvalho",
];

export interface LeaderboardUser {
  isCurrentUser: boolean;
  rank: number;
  name: string;
  xp: number;
  profilePictureUrl?: string;
}

interface LeagueState {
  isLoading: boolean;
  currentLeague: League | null;
  leagues: League[];
  leaderboard: LeaderboardUser[];
  userRank: number;
  currentLeagueIndex: number;
  weeklyXP: number;
  leagueStartDate: string | null;
  checkAndInitializeLeagues: () => Promise<void>;
  addXP: (xp: number) => Promise<void>;
}

const generateSimulatedLeaderboard = (
  currentUserXP: number,
  league: League,
  currentUserProfileUrl?: string,
  currentUserName: string = "Você"
): LeaderboardUser[] => {
  const list: { name: string; xp: number; profilePictureUrl?: string }[] = [];
  // Usa o XP base e a variação da liga para uma simulação mais realista
  const { baseXP, xpRange } = league;

  const usedNames = new Set<string>();
  usedNames.add(currentUserName); // Garante que o nome do utilizador não é duplicado

  for (let i = 0; i < league.groupSize - 1; i++) {
    // Gera uma pontuação aleatória dentro da faixa definida para a liga
    const randomXP = baseXP + (Math.random() * 2 - 1) * xpRange;
    const xp = Math.max(0, Math.floor(randomXP));

    // Gera um nome completo único para evitar repetições na lista
    let fullName: string;
    do {
      const firstName =
        FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      const lastName =
        FAKE_LAST_NAMES[Math.floor(Math.random() * FAKE_LAST_NAMES.length)];
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));
    usedNames.add(fullName);

    list.push({ name: fullName, xp });
  }

  list.push({
    name: currentUserName,
    xp: currentUserXP,
    profilePictureUrl: currentUserProfileUrl,
  });

  return list
    .sort((a, b) => b.xp - a.xp)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: user.name === currentUserName,
    }));
};

export const useLeagueStore = create<LeagueState>((set, get) => ({
  isLoading: true,
  currentLeague: null,
  leagues: LEAGUES, // Initialize with all leagues
  leaderboard: [],
  userRank: 0,
  currentLeagueIndex: -1,
  weeklyXP: 0,
  leagueStartDate: null,

  checkAndInitializeLeagues: async () => {
    set({ isLoading: true });
    let {
      currentLeague: leagueName,
      weeklyXP,
      leagueStartDate,
    } = await getLeagueData();

    const [profilePictureUrl, firstName, lastName] = await Promise.all([
      getMetaValue("profile_picture_url"),
      getMetaValue("first_name", "Novo"),
      getMetaValue("last_name", "Utilizador"),
    ]);
    const currentUserFullName = `${firstName ?? "Novo"} ${
      lastName ?? "Utilizador"
    }`;

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
          oldLeagueConfig,
          profilePictureUrl ?? undefined,
          currentUserFullName
        );
        const finalRank =
          finalLeaderboard.find((u) => u.isCurrentUser)?.rank ?? 0;

        let leagueResult: "promoted" | "demoted" | "maintained" = "maintained";
        let newLeagueName = leagueName;
        const leagueIndex = getLeagueIndex(leagueName);

        if (finalRank > 0 && finalRank <= oldLeagueConfig.promotionZone) {
          if (leagueIndex < LEAGUES.length - 1) {
            newLeagueName = LEAGUES[leagueIndex + 1].name;
            leagueResult = "promoted";
            Toast.show({
              type: "success",
              text1: "Promovido!",
              text2: `Bem-vindo à Liga ${newLeagueName}!`,
            });
          }
        } else if (
          finalRank > 0 &&
          finalRank > oldLeagueConfig.groupSize - oldLeagueConfig.demotionZone
        ) {
          if (leagueIndex > 0) {
            newLeagueName = LEAGUES[leagueIndex - 1].name;
            leagueResult = "demoted";
            Toast.show({
              type: "error",
              text1: "Despromovido",
              text2: `Você voltou para a Liga ${newLeagueName}.`,
            });
          }
        }

        // Guarda os resultados da semana que acabou para o ecrã de resumo
        await Promise.all([
          setMetaValue("last_week_final_xp", weeklyXP.toString()),
          setMetaValue("last_week_final_rank", finalRank.toString()),
          setMetaValue("last_week_league_result", leagueResult),
          setMetaValue("last_week_league_name", oldLeagueConfig.name), // Guarda o nome da liga que acabou
        ]);

        leagueName = newLeagueName; // Atualiza o nome da liga para a nova semana
      }

      // Reset for the new week
      weeklyXP = 0;
      const newLeagueStartDate = formatISO(startOfThisWeek);
      await updateLeagueData({
        currentLeague: leagueName,
        weeklyXP: 0,
        leagueStartDate: newLeagueStartDate,
      });
      leagueStartDate = newLeagueStartDate;
    }

    const leagueConfig = getLeagueByName(leagueName);
    if (leagueConfig) {
      const leagueIndex = getLeagueIndex(leagueName);
      const leaderboard = generateSimulatedLeaderboard(
        weeklyXP,
        leagueConfig,
        profilePictureUrl ?? undefined,
        currentUserFullName
      );
      const userRank = leaderboard.find((u) => u.isCurrentUser)?.rank ?? 0;
      set({
        currentLeague: leagueConfig,
        leaderboard,
        currentLeagueIndex: leagueIndex,
        userRank,
        weeklyXP,
        leagueStartDate,
        isLoading: false,
      });
    }
  },

  addXP: async (xpToAdd) => {
    await dbAddWeeklyXP(xpToAdd);
    set((state) => {
      if (!state.currentLeague) return state;

      const newWeeklyXP = state.weeklyXP + xpToAdd;
      const currentUser = state.leaderboard.find((u) => u.isCurrentUser);
      const currentUserProfileUrl = currentUser?.profilePictureUrl;
      const currentUserName = currentUser?.name ?? "Você";

      const newLeaderboard = generateSimulatedLeaderboard(
        newWeeklyXP,
        state.currentLeague,
        currentUserProfileUrl,
        currentUserName
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
