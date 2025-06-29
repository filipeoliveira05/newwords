import {
  GlobalStats,
  UserPracticeMetrics,
  PracticeHistory,
} from "../services/storage";
import { Ionicons } from "@expo/vector-icons";
import { differenceInDays } from "date-fns";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isMeta?: boolean;
  check: (stats: {
    global: GlobalStats;
    user: UserPracticeMetrics;
    history: PracticeHistory[];
    totalWords: number;
  }) => boolean;
};

export const achievements: Achievement[] = [
  // --- 🏁 Início & Primeiros Passos ---
  {
    id: "first_session",
    title: "Iniciante Dedicado",
    description: "Completou a sua primeira sessão de prática.",
    icon: "school-outline",
    check: ({ history }) => history.length > 0,
  },
  {
    id: "weekend_warrior",
    title: "Guerreiro do Fim de Semana",
    description: "Praticou durante um fim de semana.",
    icon: "barbell-outline",
    check: ({ history }) =>
      history.some((day) => {
        const d = new Date(`${day.date}T00:00:00`);
        return d.getDay() === 0 || d.getDay() === 6; // 0 = Domingo, 6 = Sábado
      }),
  },

  // --- 📚 Colecionador de Palavras ---
  {
    id: "collector_10_words",
    title: "Colecionador Iniciante",
    description: "Adicionou 10 palavras à sua coleção.",
    icon: "add-circle-outline",
    check: ({ totalWords }) => totalWords >= 10,
  },
  {
    id: "collector_50_words",
    title: "Curador de Conhecimento",
    description: "Adicionou 50 palavras à sua coleção.",
    icon: "file-tray-stacked-outline",
    check: ({ totalWords }) => totalWords >= 50,
  },
  {
    id: "collector_100_words",
    title: "Arquivista",
    description: "Adicionou 100 palavras à sua coleção.",
    icon: "archive-outline",
    check: ({ totalWords }) => totalWords >= 100,
  },
  {
    id: "collector_250_words",
    title: "Lexicógrafo",
    description: "Adicionou 250 palavras à sua coleção.",
    icon: "layers-outline",
    check: ({ totalWords }) => totalWords >= 250,
  },
  {
    id: "collector_500_words",
    title: "Sábio",
    description: "Adicionou 500 palavras à sua coleção.",
    icon: "layers-outline",
    check: ({ totalWords }) => totalWords >= 500,
  },

  // --- 📘 Palavras Dominadas / Treinadas ---
  {
    id: "master_10_words",
    title: "Mestre das Palavras",
    description: "Dominou 10 palavras.",
    icon: "star-outline",
    check: ({ global }) => global.wordsMastered >= 10,
  },
  {
    id: "master_50_words",
    title: "Sábio",
    description: "Dominou 50 palavras.",
    icon: "trophy-outline",
    check: ({ global }) => global.wordsMastered >= 50,
  },
  {
    id: "train_100_words",
    title: "Rato de Biblioteca",
    description: "Treinou um total de 100 palavras.",
    icon: "library-outline",
    check: ({ history }) => {
      const totalTrained = history.reduce(
        (sum, day) => sum + day.words_trained,
        0
      );
      return totalTrained >= 100;
    },
  },
  {
    id: "train_500_words",
    title: "Maratonista de Estudos",
    description: "Treinou um total de 500 palavras.",
    icon: "book-outline",
    check: ({ history }) => {
      const totalTrained = history.reduce(
        (sum, day) => sum + day.words_trained,
        0
      );
      return totalTrained >= 500;
    },
  },

  // --- 🔥 Streaks de Acertos ---
  {
    id: "streak_25_words",
    title: "Maratonista",
    description: "Atingiu uma streak de 25 acertos.",
    icon: "flame-outline",
    check: ({ user }) => user.longestStreak >= 25,
  },
  {
    id: "streak_50_words",
    title: "Invencível",
    description: "Atingiu uma streak de 50 acertos seguidos.",
    icon: "shield-checkmark-outline",
    check: ({ user }) => user.longestStreak >= 50,
  },
  {
    id: "perfectionist",
    title: "Perfeccionista",
    description: "Atingiu uma taxa de sucesso global de 98%.",
    icon: "diamond-outline",
    check: ({ global }) => global.successRate >= 98,
  },

  // --- 🗓️ Streaks de Dias ---
  {
    id: "streak_5_days",
    title: "Hábito Criado",
    description: "Praticou por 5 dias seguidos.",
    icon: "calendar-outline",
    check: ({ user }) => user.consecutiveDays >= 5,
  },
  {
    id: "streak_30_days",
    title: "Um Mês de Dedicação",
    description: "Praticou por 30 dias seguidos.",
    icon: "medal-outline",
    check: ({ user }) => user.consecutiveDays >= 30,
  },
  {
    id: "triumphant_return",
    title: "Regresso Triunfal",
    description: "Voltou a praticar após uma ausência de 7+ dias.",
    icon: "walk-outline",
    check: ({ history }) => {
      if (history.length < 2) return false;
      // O histórico vem ordenado da DB, podemos pegar os dois últimos
      const lastPractice = new Date(history[history.length - 1].date);
      const secondToLastPractice = new Date(history[history.length - 2].date);
      return differenceInDays(lastPractice, secondToLastPractice) >= 7;
    },
  },

  // --- 🏆 Meta-Conquistas ---
  {
    id: "achievement_hunter",
    title: "Caçador de Conquistas",
    description: "Desbloqueou 5 outras conquistas.",
    icon: "ribbon-outline",
    isMeta: true,
    check: (stats) => {
      const unlockedCount = achievements.reduce((count, ach) => {
        if (ach.isMeta || !ach.check(stats)) {
          return count;
        }
        return count + 1;
      }, 0);
      return unlockedCount >= 5;
    },
  },
  {
    id: "living_legend",
    title: "Lenda Viva",
    description: "Desbloqueou todas as outras conquistas.",
    icon: "trophy-outline",
    isMeta: true,
    check: (stats) => {
      const nonMetaAchievements = achievements.filter((ach) => !ach.isMeta);
      return nonMetaAchievements.every((ach) => ach.check(stats));
    },
  },
];
