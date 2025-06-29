import { PracticeHistory } from "../../services/storage";
import { Ionicons } from "@expo/vector-icons";

export type DailyGoal = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  target: number;
  getCurrentProgress: (todaysHistory: PracticeHistory | null) => number;
};

export const allPossibleDailyGoals: DailyGoal[] = [
  {
    id: "train_10_words",
    title: "Treinar 10 palavras",
    icon: "barbell-outline",
    target: 10,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "train_25_words",
    title: "Treinar 25 palavras",
    icon: "school-outline",
    target: 25,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "train_40_words",
    title: "Sessão de estudo",
    icon: "book-outline",
    target: 40,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
  {
    id: "complete_1_session",
    title: "Completar 1 sessão",
    icon: "checkmark-done-outline",
    target: 1,
    getCurrentProgress: (todaysHistory) =>
      todaysHistory && todaysHistory.words_trained > 0 ? 1 : 0,
  },
  {
    id: "quick_warmup",
    title: "Aquecimento rápido",
    icon: "flash-outline",
    target: 5,
    getCurrentProgress: (todaysHistory) => todaysHistory?.words_trained ?? 0,
  },
];
