import { theme } from "./theme";

export interface League {
  name: string;
  icon: string; // Emoji
  promotionZone: number; // Top X users get promoted
  demotionZone: number; // Bottom Y users get demoted
  color: string; // A theme color for the league
  groupSize: number; // How many users in a group
  baseXP: number; // The average XP for this league
  xpRange: number; // The +/- range for random scores
}

export const LEAGUES: League[] = [
  {
    name: "Bronze",
    icon: "🥉",
    promotionZone: 10,
    demotionZone: 0,
    color: theme.colors.bronze,
    groupSize: 30,
    baseXP: 250,
    xpRange: 200,
  },
  {
    name: "Prata",
    icon: "🥈",
    promotionZone: 7,
    demotionZone: 5,
    color: theme.colors.silver,
    groupSize: 30,
    baseXP: 750,
    xpRange: 400,
  },
  {
    name: "Ouro",
    icon: "🥇",
    promotionZone: 5,
    demotionZone: 5,
    color: theme.colors.gold,
    groupSize: 30,
    baseXP: 1500,
    xpRange: 700,
  },
  {
    name: "Platina",
    icon: "💠",
    promotionZone: 3,
    demotionZone: 5,
    color: theme.colors.platinum,
    groupSize: 30,
    baseXP: 2500,
    xpRange: 1000,
  },
  {
    name: "Diamante",
    icon: "💎",
    promotionZone: 3, // Agora promove para Mestre
    demotionZone: 5,
    color: theme.colors.diamond,
    groupSize: 30,
    baseXP: 4000,
    xpRange: 1500,
  },
  {
    name: "Mestre",
    icon: "👑",
    promotionZone: 1, // Apenas o melhor sobe
    demotionZone: 5,
    color: theme.colors.master,
    groupSize: 30,
    baseXP: 6000,
    xpRange: 2000,
  },
  {
    name: "Lendária",
    icon: "🔥",
    promotionZone: 0, // Liga final
    demotionZone: 5,
    color: theme.colors.legendary,
    groupSize: 30,
    baseXP: 10000,
    xpRange: 4000,
  },
];

export const getLeagueByName = (name: string): League | undefined => {
  return LEAGUES.find((l) => l.name === name);
};

export const getLeagueIndex = (name: string): number => {
  return LEAGUES.findIndex((l) => l.name === name);
};
