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
  perfectRoundsToday: number;
  completedFavoriteSessionToday: boolean;
  completedWrongSessionToday: boolean;
  completedFlashcardSessionToday: boolean;
  completedMultipleChoiceSessionToday: boolean;
  completedWritingSessionToday: boolean;
  completedCombineListsSessionToday: boolean;
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
  {
    id: "perfect_round",
    title: "Completa uma ronda perfeita",
    icon: "star",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ perfectRoundsToday }) => perfectRoundsToday,
  },
  {
    id: "practice_favorites",
    title: "Completa uma sessão de palavras favoritas",
    icon: "starOutline",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedFavoriteSessionToday }) =>
      completedFavoriteSessionToday ? 1 : 0,
  },
  {
    id: "practice_wrong",
    title: "Completa uma sessão de palavras erradas",
    icon: "closeCircle",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedWrongSessionToday }) =>
      completedWrongSessionToday ? 1 : 0,
  },
  {
    id: "practice_flashcard",
    title: "Completa uma sessão de revisão clássica",
    icon: "albums",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedFlashcardSessionToday }) =>
      completedFlashcardSessionToday ? 1 : 0,
  },
  {
    id: "practice_multiple_choice",
    title: "Completa uma sessão de escolha múltipla",
    icon: "list",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedMultipleChoiceSessionToday }) =>
      completedMultipleChoiceSessionToday ? 1 : 0,
  },
  {
    id: "practice_writing",
    title: "Completa uma sessão de escrita",
    icon: "pencil",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedWritingSessionToday }) =>
      completedWritingSessionToday ? 1 : 0,
  },
  {
    id: "practice_combine_lists",
    title: "Completa uma sessão de combinar listas",
    icon: "gitCompare",
    category: "Prática",
    target: 1,
    getCurrentProgress: ({ completedCombineListsSessionToday }) =>
      completedCombineListsSessionToday ? 1 : 0,
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
