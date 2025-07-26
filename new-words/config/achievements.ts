import {
  GlobalStats,
  UserPracticeMetrics,
  PracticeHistory,
} from "../services/storage";
import { differenceInDays } from "date-fns";
import { IconName } from "../app/components/Icon";

export type AchievementCategory =
  | "Primeiros Passos"
  | "Colecionador"
  | "Maestria"
  | "Consistência"
  | "Meta-Conquistas";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  category: AchievementCategory;
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
    icon: "school",
    category: "Primeiros Passos",
    check: ({ history }) => history.length > 0,
  },
  {
    id: "weekend_warrior",
    title: "Guerreiro do Fim de Semana",
    description: "Praticou durante um fim de semana.",
    icon: "barbell",
    category: "Consistência",
    check: ({ history }) =>
      history.some((day) => {
        const d = new Date(`${day.date}T00:00:00`);
        return d.getDay() === 0 || d.getDay() === 6; // 0 = Domingo, 6 = Sábado
      }),
  },

  // --- 📚 Colecionador ---
  {
    id: "collector_10_words",
    title: "Colecionador Iniciante",
    description: "Adicionou 10 palavras à sua coleção.",
    icon: "addCircle",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 10,
  },
  {
    id: "collector_50_words",
    title: "Curador de Conhecimento",
    description: "Adicionou 50 palavras à sua coleção.",
    icon: "fileTrayStacked",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 50,
  },
  {
    id: "collector_100_words",
    title: "Arquivista",
    description: "Adicionou 100 palavras à sua coleção.",
    icon: "archive",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 100,
  },
  {
    id: "collector_250_words",
    title: "Lexicógrafo",
    description: "Adicionou 250 palavras à sua coleção.",
    icon: "library",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 250,
  },
  {
    id: "collector_500_words",
    title: "Mestre da Biblioteca",
    description: "Adicionou 500 palavras à sua coleção.",
    icon: "decksOutline",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 500,
  },
  {
    id: "collector_1000_words",
    title: "Sábio",
    description: "Adicionou 1000 palavras à sua coleção.",
    icon: "book",
    category: "Colecionador",
    check: ({ totalWords }) => totalWords >= 1000,
  },

  // --- 🎓 Maestria ---
  {
    id: "master_10_words",
    title: "Mestre das Palavras",
    description: "Dominou 10 palavras.",
    icon: "starOutline",
    category: "Maestria",
    check: ({ global }) => global.wordsMastered >= 10,
  },
  {
    id: "master_50_words",
    title: "Sábio",
    description: "Dominou 50 palavras.",
    icon: "trophy",
    category: "Maestria",
    check: ({ global }) => global.wordsMastered >= 50,
  },
  {
    id: "master_100_words",
    title: "Lenda do Vocabulário",
    description: "Dominou 100 palavras.",
    icon: "trophyFilled",
    category: "Maestria",
    check: ({ global }) => global.wordsMastered >= 100,
  },
  {
    id: "train_100_words",
    title: "Rato de Biblioteca",
    description: "Treinou um total de 100 palavras.",
    icon: "barbell",
    category: "Maestria",
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
    icon: "barbell",
    category: "Maestria",
    check: ({ history }) => {
      const totalTrained = history.reduce(
        (sum, day) => sum + day.words_trained,
        0
      );
      return totalTrained >= 500;
    },
  },
  {
    id: "train_1000_words",
    title: "Atleta Mental",
    description: "Treinou um total de 1000 palavras.",
    icon: "barbell",
    category: "Maestria",
    check: ({ history }) => {
      const totalTrained = history.reduce(
        (sum, day) => sum + day.words_trained,
        0
      );
      return totalTrained >= 1000;
    },
  },
  {
    id: "power_session",
    title: "Sessão Intensa",
    description: "Treinou 50 palavras num único dia.",
    icon: "flash",
    category: "Maestria",
    check: ({ history }) => history.some((day) => day.words_trained >= 50),
  },

  {
    id: "streak_25_words",
    title: "Maratonista",
    description: "Atingiu uma streak de 25 acertos.",
    icon: "flame",
    category: "Maestria",
    check: ({ user }) => user.longestStreak >= 25,
  },
  {
    id: "streak_50_words",
    title: "Invencível",
    description: "Atingiu uma streak de 50 acertos seguidos.",
    icon: "shieldCheckmark",
    category: "Maestria",
    check: ({ user }) => user.longestStreak >= 50,
  },
  {
    id: "perfectionist",
    title: "Perfeccionista",
    description: "Atingiu uma taxa de sucesso global de 98%.",
    icon: "diamond",
    category: "Maestria",
    check: ({ global }) => global.successRate >= 98,
  },

  // --- 🗓️ Consistência ---
  {
    id: "streak_5_days",
    title: "Hábito Criado",
    description: "Praticou por 5 dias seguidos.",
    icon: "calendar",
    category: "Consistência",
    check: ({ user }) => user.consecutiveDays >= 5,
  },
  {
    id: "streak_30_days",
    title: "Um Mês de Dedicação",
    description: "Praticou por 30 dias seguidos.",
    icon: "medal",
    category: "Consistência",
    check: ({ user }) => user.consecutiveDays >= 30,
  },
  {
    id: "streak_100_days",
    title: "Lenda da Consistência",
    description: "Praticou por 100 dias seguidos.",
    icon: "medal",
    category: "Consistência",
    check: ({ user }) => user.consecutiveDays >= 100,
  },
  {
    id: "triumphant_return",
    title: "Regresso Triunfal",
    description: "Voltou a praticar após uma ausência de 7+ dias.",
    icon: "walk",
    category: "Consistência",
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
    icon: "ribbon",
    category: "Meta-Conquistas",
    isMeta: true,
    check: (stats) => {
      const nonMetaAchievements = achievements.filter((a) => !a.isMeta);
      const unlockedCount = nonMetaAchievements.reduce(
        (count, ach) => (ach.check(stats) ? count + 1 : count),
        0
      );
      return unlockedCount >= 5;
    },
  },
  {
    id: "halfway_there",
    title: "A Meio Caminho",
    description: "Desbloqueou metade de todas as conquistas.",
    icon: "ribbon",
    category: "Meta-Conquistas",
    isMeta: true,
    check: (stats) => {
      const nonMetaAchievements = achievements.filter(
        (a) => !a.isMeta && a.id !== "halfway_there"
      );
      const unlockedCount = nonMetaAchievements.reduce(
        (count, ach) => (ach.check(stats) ? count + 1 : count),
        0
      );
      return unlockedCount >= Math.ceil(nonMetaAchievements.length / 2);
    },
  },
  {
    id: "living_legend",
    title: "Lenda Viva",
    description: "Desbloqueou todas as outras conquistas.",
    icon: "trophy",
    category: "Meta-Conquistas",
    isMeta: true,
    check: (stats) => {
      const nonMetaAchievements = achievements.filter((ach) => !ach.isMeta);
      return nonMetaAchievements.every((ach) => ach.check(stats));
    },
  },
];
