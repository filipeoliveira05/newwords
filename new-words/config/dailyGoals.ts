import { PracticeHistory } from "../services/storage";
import { IconName } from "../app/components/Icon";

export type DailyGoal = {
  id: string;
  title: string;
  icon: IconName;
  target: number;
  getCurrentProgress: (todaysHistory: PracticeHistory | null) => number;
};

export const allPossibleDailyGoals: DailyGoal[] = [
  {
    id: "train_10_words",
    title: "Treinar 10 palavras",
    icon: "barbell",
    target: 10,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "train_25_words",
    title: "Treinar 25 palavras",
    icon: "school",
    target: 25,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "train_40_words",
    title: "Sessão de estudo",
    icon: "book",
    target: 40,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "complete_1_session",
    title: "Completar 1 sessão",
    icon: "checkmarkDoneCircle",
    target: 1,
    getCurrentProgress: (todaysHistory) =>
      todaysHistory && todaysHistory.words_trained > 0 ? 1 : 0,
  },
  {
    id: "quick_warmup",
    title: "Aquecimento rápido",
    icon: "flashOutline",
    target: 5,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
];
