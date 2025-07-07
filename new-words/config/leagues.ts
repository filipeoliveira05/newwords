import { theme } from "./theme";

export interface League {
  name: string;
  icon: string; // Emoji
  promotionZone: number; // Top X users get promoted
  demotionZone: number; // Bottom Y users get demoted
  color: string; // A theme color for the league
  groupSize: number; // How many users in a group
}

export const LEAGUES: League[] = [
  {
    name: "Bronze",
    icon: "🥉",
    promotionZone: 10,
    demotionZone: 0,
    color: theme.colors.bronze,
    groupSize: 30,
  },
  {
    name: "Prata",
    icon: "🥈",
    promotionZone: 7,
    demotionZone: 5,
    color: theme.colors.silver,
    groupSize: 30,
  },
  {
    name: "Ouro",
    icon: "🥇",
    promotionZone: 5,
    demotionZone: 5,
    color: theme.colors.gold,
    groupSize: 30,
  },
];

export const getLeagueByName = (name: string): League | undefined => {
  return LEAGUES.find((l) => l.name === name);
};

export const getLeagueIndex = (name: string): number => {
  return LEAGUES.findIndex((l) => l.name === name);
};
