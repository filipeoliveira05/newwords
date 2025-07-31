import {
  GlobalStats,
  UserPracticeMetrics,
  PracticeHistory,
} from "../services/storage";
import { differenceInDays } from "date-fns";
import { IconName } from "../app/components/Icon";
import { theme } from "./theme";

export type AchievementCategory =
  | "Primeiros Passos"
  | "Coleção"
  | "Domínio"
  | "Treino"
  | "Intensidade"
  | "Foco"
  | "Perfeição"
  | "Hábito"
  | "Meta-Conquistas";

export type AchievementRank =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Legendary";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  category: AchievementCategory;
  rank?: AchievementRank;
  isMeta?: boolean;
  check: (stats: {
    global: GlobalStats;
    user: UserPracticeMetrics;
    history: PracticeHistory[];
    totalWords: number;
    totalDecks: number;
  }) => boolean;
};

// --- Funções Utilitárias ---

/**
 * Retorna a cor associada a um determinado rank de conquista.
 * @param rank O rank da conquista.
 * @returns A string da cor correspondente.
 */
export const getAchievementRankColor = (rank?: AchievementRank): string => {
  if (!rank) return theme.colors.gold;
  const rankColorMap: Record<AchievementRank, string> = {
    Bronze: theme.colors.bronze,
    Silver: theme.colors.silver,
    Gold: theme.colors.gold,
    Platinum: theme.colors.platinum,
    Diamond: theme.colors.diamond,
    Master: theme.colors.master,
    Legendary: theme.colors.legendary,
  };
  return rankColorMap[rank] ?? theme.colors.gold;
};

// --- Funções Geradoras de Verificação (Checkers) ---
const createTotalWordsChecker =
  (target: number) =>
  ({ totalWords }: { totalWords: number }) =>
    totalWords >= target;

const createWordsMasteredChecker =
  (target: number) =>
  ({ global }: { global: GlobalStats }) =>
    global.wordsMastered >= target;

const createTotalTrainedChecker =
  (target: number) =>
  ({ history }: { history: PracticeHistory[] }) =>
    history.reduce((sum, day) => sum + day.words_trained, 0) >= target;

const createPowerSessionChecker =
  (target: number) =>
  ({ history }: { history: PracticeHistory[] }) =>
    history.some((d) => d.words_trained >= target);

const createLongestStreakChecker =
  (target: number) =>
  ({ user }: { user: UserPracticeMetrics }) =>
    user.longestStreak >= target;

const createSuccessRateChecker =
  (target: number) =>
  ({ global }: { global: GlobalStats }) =>
    global.successRate >= target;

const createConsecutiveDaysChecker =
  (target: number) =>
  ({ user }: { user: UserPracticeMetrics }) =>
    user.consecutiveDays >= target;

// --- Fábrica de Conquistas Progressivas ---
type AchievementTier = { rank: AchievementRank; title: string; target: number };

const createProgressiveAchievements = (
  config: {
    idPrefix: string;
    icon: IconName;
    category: AchievementCategory;
    descriptionTemplate: (target: string) => string;
    checkCreator: (target: number) => (stats: any) => boolean;
    formatTarget?: (target: number) => string;
  },
  tiers: AchievementTier[]
): Achievement[] => {
  return tiers.map((tier, index) => ({
    id: `${config.idPrefix}_${index + 1}`,
    title: tier.title,
    description: config.descriptionTemplate(
      config.formatTarget
        ? config.formatTarget(tier.target)
        : tier.target.toString()
    ),
    icon: config.icon,
    category: config.category,
    rank: tier.rank,
    check: config.checkCreator(tier.target),
  }));
};

// --- Definições das Tiers de Conquistas ---

const ranks: AchievementRank[] = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Legendary",
];

// Palavras adicionadas
const collectorTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Colecionador Iniciante", target: 10 },
  { rank: ranks[1], title: "Curador de Conhecimento", target: 50 },
  { rank: ranks[2], title: "Arquivista", target: 100 },
  { rank: ranks[3], title: "Lexicógrafo", target: 250 },
  { rank: ranks[4], title: "Mestre da Biblioteca", target: 500 },
  { rank: ranks[5], title: "Sábio", target: 1000 },
  { rank: ranks[6], title: "Guardião do Saber", target: 2500 },
];

// Palavras dominadas
const masteryTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Aprendiz", target: 10 },
  { rank: ranks[1], title: "Estudioso", target: 25 },
  { rank: ranks[2], title: "Sábio do Vocabulário", target: 50 },
  { rank: ranks[3], title: "Erudito", target: 100 },
  { rank: ranks[4], title: "Polímata", target: 250 },
  { rank: ranks[5], title: "Mestre do Saber", target: 500 },
  { rank: ranks[6], title: "Oráculo", target: 1000 },
];

// Palavras treinadas
const trainingTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Rato de Biblioteca", target: 100 },
  { rank: ranks[1], title: "Maratonista de Estudos", target: 500 },
  { rank: ranks[2], title: "Atleta Mental", target: 1000 },
  { rank: ranks[3], title: "Titã do Treino", target: 2500 },
  { rank: ranks[4], title: "Colosso do Conhecimento", target: 5000 },
  { rank: ranks[5], title: "Mente Infinita", target: 10000 },
  { rank: ranks[6], title: "Deus das Palavras", target: 25000 },
];

// Palavras treinadas num único dia
const powerSessionTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Sprint de Estudo", target: 20 },
  { rank: ranks[1], title: "Sessão Intensa", target: 35 },
  { rank: ranks[2], title: "Maratona Mental", target: 50 },
  { rank: ranks[3], title: "Imersão Profunda", target: 75 },
  { rank: ranks[4], title: "Supernova de Estudo", target: 100 },
  { rank: ranks[5], title: "Vórtice de Palavras", target: 150 },
  { rank: ranks[6], title: "Singularidade do Saber", target: 200 },
];

// Sequência de acertos
const streakTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Em Chamas", target: 15 },
  { rank: ranks[1], title: "Foco Absoluto", target: 30 },
  { rank: ranks[2], title: "Invencível", target: 50 },
  { rank: ranks[3], title: "Imparável", target: 75 },
  { rank: ranks[4], title: "Sequência Divina", target: 100 },
  { rank: ranks[5], title: "Mestre da Concentração", target: 150 },
  { rank: ranks[6], title: "Lenda do Foco", target: 200 },
];

// Taxa de sucesso global
const perfectionistTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Preciso", target: 80 },
  { rank: ranks[1], title: "Cirúrgico", target: 85 },
  { rank: ranks[2], title: "Quase Perfeito", target: 90 },
  { rank: ranks[3], title: "Perfeccionista", target: 93 },
  { rank: ranks[4], title: "Impecável", target: 95 },
  { rank: ranks[5], title: "Mestre da Exatidão", target: 98 },
  { rank: ranks[6], title: "Precisão Lendária", target: 100 },
];

// Prática em dias seguidos (Streak)
const consistencyTiers: AchievementTier[] = [
  { rank: ranks[0], title: "Hábito Criado", target: 5 },
  { rank: ranks[1], title: "Semana Fantástica", target: 10 },
  { rank: ranks[2], title: "Força da Natureza", target: 21 },
  { rank: ranks[3], title: "Guardião da Chama", target: 30 },
  { rank: ranks[4], title: "Virtuoso da Rotina", target: 60 },
  { rank: ranks[5], title: "Centurião da Disciplina", target: 100 },
  { rank: ranks[6], title: "Lenda Anual", target: 365 },
];

// --- Geração das Conquistas ---

const collectorAchievements = createProgressiveAchievements(
  {
    idPrefix: "collector",
    icon: "libraryOutline",
    category: "Coleção",
    descriptionTemplate: (target) => `Adicionou ${target} palavras.`,
    checkCreator: createTotalWordsChecker,
  },
  collectorTiers
);

const masteryAchievements = createProgressiveAchievements(
  {
    idPrefix: "mastery",
    icon: "school",
    category: "Domínio",
    descriptionTemplate: (target) => `Dominou ${target} palavras.`,
    checkCreator: createWordsMasteredChecker,
  },
  masteryTiers
);

const trainingAchievements = createProgressiveAchievements(
  {
    idPrefix: "training",
    icon: "barbell",
    category: "Treino",
    descriptionTemplate: (target) => `Treinou um total de ${target} palavras.`,
    checkCreator: createTotalTrainedChecker,
  },
  trainingTiers
);

const powerSessionAchievements = createProgressiveAchievements(
  {
    idPrefix: "power_session",
    icon: "flashOutline",
    category: "Intensidade",
    descriptionTemplate: (target) =>
      `Treinou ${target} palavras num único dia.`,
    checkCreator: createPowerSessionChecker,
  },
  powerSessionTiers
);

const streakAchievements = createProgressiveAchievements(
  {
    idPrefix: "streak",
    icon: "flame",
    category: "Foco",
    descriptionTemplate: (target) =>
      `Atingiu uma sequência de ${target} acertos.`,
    checkCreator: createLongestStreakChecker,
  },
  streakTiers
);

const perfectionistAchievements = createProgressiveAchievements(
  {
    idPrefix: "perfectionist",
    icon: "diamond",
    category: "Perfeição",
    descriptionTemplate: (target) =>
      `Atingiu uma taxa de sucesso global de ${target}.`,
    checkCreator: createSuccessRateChecker,
    formatTarget: (target) => `${target}%`,
  },
  perfectionistTiers
);

const consistencyAchievements = createProgressiveAchievements(
  {
    idPrefix: "consistency",
    icon: "calendar",
    category: "Hábito",
    descriptionTemplate: (target) => `Praticou por ${target} dias seguidos.`,
    checkCreator: createConsecutiveDaysChecker,
  },
  consistencyTiers
);

// --- Conquistas Únicas e Especiais ---
const coreAchievements: Achievement[] = [
  // --- 🏁 Início & Primeiros Passos ---
  {
    id: "first_session",
    title: "Iniciante Dedicado",
    description: "Completou a sua primeira sessão de prática.",
    icon: "star",
    category: "Primeiros Passos",
    check: ({ history }) => history.length > 0,
  },
  {
    id: "first_deck",
    title: "Arquiteto de Conhecimento",
    description: "Criou o seu primeiro conjunto de palavras.",
    icon: "folder",
    category: "Primeiros Passos",
    check: ({ totalDecks }) => totalDecks > 0,
  },
  {
    id: "first_word",
    title: "Pioneiro do Vocabulário",
    description: "Adicionou a sua primeira palavra.",
    icon: "text",
    category: "Primeiros Passos",
    check: ({ totalWords }) => totalWords > 0,
  },
  {
    id: "first_correct_answer",
    title: "Começar com o Pé Direito",
    description: "Acertou na sua primeira resposta numa sessão de prática.",
    icon: "checkmark",
    category: "Primeiros Passos",
    check: ({ global }) => global.successRate > 0,
  },
  {
    id: "first_mistake",
    title: "Aprender com o Erro",
    description: "Errou uma palavra. Faz parte do processo de aprendizagem!",
    icon: "bulb",
    category: "Primeiros Passos",
    check: ({ global, history }) =>
      history.length > 0 && global.successRate < 100,
  },
  {
    id: "first_mastery",
    title: "Domínio Inicial",
    description: "Dominou a sua primeira palavra. Continue assim!",
    icon: "school",
    category: "Primeiros Passos",
    check: ({ global }) => global.wordsMastered > 0,
  },
  {
    id: "weekend_warrior",
    title: "Guerreiro do Fim de Semana",
    description: "Praticou durante um fim de semana.",
    icon: "barbell",
    category: "Hábito",
    check: ({ history }) =>
      history.some((day) => {
        const d = new Date(`${day.date}T00:00:00`);
        return d.getDay() === 0 || d.getDay() === 6; // 0 = Domingo, 6 = Sábado
      }),
  },
  {
    id: "versatile_learner",
    title: "Polivalente",
    description: "Praticou em todos os dias da semana (Seg-Dom).",
    icon: "calendarNumber",
    category: "Hábito",
    check: ({ history }) => {
      const practicedDays = new Set<number>();
      history.forEach((day) => {
        // getDay() retorna 0 para Domingo, 1 para Segunda, etc.
        practicedDays.add(new Date(`${day.date}T00:00:00`).getDay());
      });
      return practicedDays.size === 7;
    },
  },
  {
    id: "perfect_month",
    title: "Mês Perfeito",
    description: "Praticou todos os dias de um mês do calendário.",
    icon: "calendarNumber",
    category: "Hábito",
    check: ({ history }) => {
      const practiceByMonth = new Map<string, Set<number>>();
      history.forEach((day) => {
        const d = new Date(`${day.date}T00:00:00`);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (!practiceByMonth.has(monthKey)) {
          practiceByMonth.set(monthKey, new Set());
        }
        practiceByMonth.get(monthKey)!.add(d.getDate());
      });

      for (const [monthKey, practicedDays] of practiceByMonth.entries()) {
        const [year, month] = monthKey.split("-").map(Number);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (practicedDays.size === daysInMonth) return true;
      }
      return false;
    },
  },
  {
    id: "triumphant_return",
    title: "Regresso Triunfal",
    description: "Voltou a praticar após uma ausência de 7+ dias.",
    icon: "walk",
    category: "Hábito",
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

export const achievements: Achievement[] = [
  ...coreAchievements,
  ...collectorAchievements,
  ...masteryAchievements,
  ...trainingAchievements,
  ...powerSessionAchievements,
  ...streakAchievements,
  ...perfectionistAchievements,
  ...consistencyAchievements,
];
