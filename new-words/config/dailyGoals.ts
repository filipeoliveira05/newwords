import { PracticeHistory } from "../services/storage";
import { IconName } from "../app/components/Icon";

export type DailyGoalCategory = "Prática" | "Coleção" | "Perfeição";

export type DailyGoalContext = {
  todaysPractice: PracticeHistory | null;
  wordsAddedToday: number;
  achievementsUnlockedToday: number;
  correctAnswersToday: number;
  decksCreatedToday: number;
  wordsMasteredToday: number;
};

export type DailyGoal = {
  id: string;
  title: string;
  icon: IconName;
  category: DailyGoalCategory;
  target: number;
  getCurrentProgress: (context: DailyGoalContext) => number;
};

const practiceGoals: DailyGoal[] = [
  {
    id: "train_10_words",
    title: "Treinar 10 palavras",
    icon: "barbell",
    category: "Prática",
    target: 10,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice?.words_trained ?? 0,
  },
  {
    id: "train_30_words",
    title: "Treinar 30 palavras",
    icon: "barbell",
    category: "Prática",
    target: 30,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice?.words_trained ?? 0,
  },
  {
    id: "train_50_words",
    title: "Treinar 50 palavras",
    icon: "barbell",
    category: "Prática",
    target: 50,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice?.words_trained ?? 0,
  },
  {
    id: "complete_1_session",
    title: "Completar 1 sessão",
    icon: "flashOutline",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice && todaysPractice.words_trained > 0 ? 1 : 0,
  },
];

const collectionGoals: DailyGoal[] = [
  {
    id: "add_3_words",
    title: "Adicionar 3 palavras",
    icon: "addCircle",
    category: "Coleção",
    target: 3,
    getCurrentProgress: ({ wordsAddedToday }) => wordsAddedToday,
  },
  {
    id: "add_5_words",
    title: "Adicionar 5 palavras",
    icon: "addCircle",
    category: "Coleção",
    target: 5,
    getCurrentProgress: ({ wordsAddedToday }) => wordsAddedToday,
  },
  {
    id: "create_1_deck",
    title: "Criar 1 conjunto",
    icon: "folder",
    category: "Coleção",
    target: 1,
    getCurrentProgress: ({ decksCreatedToday }) => decksCreatedToday,
  },
];

const perfectionGoals: DailyGoal[] = [
  {
    id: "unlock_1_achievement",
    title: "Desbloquear 1 conquista",
    icon: "ribbon",
    category: "Perfeição",
    target: 1,
    getCurrentProgress: ({ achievementsUnlockedToday }) =>
      achievementsUnlockedToday,
  },
  {
    id: "get_20_correct",
    title: "Acertar 20 palavras",
    icon: "checkmark",
    category: "Perfeição",
    target: 20,
    getCurrentProgress: ({ correctAnswersToday }) => correctAnswersToday,
  },
  {
    id: "get_40_correct",
    title: "Acertar 40 palavras",
    icon: "checkmark",
    category: "Perfeição",
    target: 40,
    getCurrentProgress: ({ correctAnswersToday }) => correctAnswersToday,
  },
  {
    id: "master_1_word",
    title: "Dominar 1 palavra",
    icon: "school",
    category: "Perfeição",
    target: 1,
    getCurrentProgress: ({ wordsMasteredToday }) => wordsMasteredToday,
  },
  {
    id: "master_3_words",
    title: "Dominar 3 palavras",
    icon: "school",
    category: "Perfeição",
    target: 3,
    getCurrentProgress: ({ wordsMasteredToday }) => wordsMasteredToday,
  },
];

export const allPossibleDailyGoals: DailyGoal[] = [
  ...practiceGoals,
  ...collectionGoals,
  ...perfectionGoals,
];

export const goalCategories: DailyGoalCategory[] = [
  "Prática",
  "Coleção",
  "Perfeição",
];
