import { PracticeHistory } from "../services/storage";
import { IconName } from "../app/components/Icon";

export type DailyGoalCategory = "Prática" | "Coleção" | "Perfeição";

export type DailyGoalContext = {
  todaysPractice: PracticeHistory | null;
  wordsAddedToday: number;
  achievementsUnlockedToday: number;
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
    id: "train_25_words",
    title: "Treinar 25 palavras",
    icon: "school",
    category: "Prática",
    target: 25,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice?.words_trained ?? 0,
  },
  {
    id: "train_40_words",
    title: "Sessão de estudo",
    icon: "book",
    category: "Prática",
    target: 40,
    getCurrentProgress: ({ todaysPractice }) =>
      todaysPractice?.words_trained ?? 0,
  },
  {
    id: "complete_1_session",
    title: "Completar 1 sessão",
    icon: "checkmarkDoneCircle",
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
