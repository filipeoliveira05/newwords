export interface Deck {
  id: string; // Changed from number to string for UUID
  title: string;
  author: string;
  createdAt: string;
  updated_at: string;
  is_deleted: number;
}

export interface Word {
  id: string; // Changed from number to string for UUID
  deckId: string; // Changed from number to string for UUID
  name: string;
  meaning: string;
  timesTrained: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastTrained: string | null;
  lastAnswerCorrect: number | null;
  masteryLevel: "new" | "learning" | "mastered";
  nextReviewDate: string;
  createdAt: string;
  category: string | null;
  synonyms: string | null; // Stored as JSON string
  antonyms: string | null; // Stored as JSON string
  sentences: string | null; // Stored as JSON string
  isFavorite: number;
  masteredAt: string | null;
  // SM-2 Algorithm Fields
  easinessFactor: number; // How easy the word is (default: 2.5)
  interval: number; // The number of days until the next review
  repetitions: number; // Number of consecutive correct recalls
  updated_at: string;
  is_deleted: number;
}

export interface PracticeHistory {
  date: string; // YYYY-MM-DD
  words_trained: number;
  updated_at: string;
}

export interface PracticeLog {
  id: string; // UUID
  word_id: string;
  practice_date: string; // ISO String
  was_correct: number; // 1 for true, 0 for false
  updated_at: string;
  is_deleted: number;
}

export interface LevelUpRecord {
  level: number;
  unlocked_at: string;
  updated_at: string;
  is_deleted: number;
}

export interface DailyActiveGoal {
  date: string; // YYYY-MM-DD
  goal_ids: string; // JSON string
  updated_at: string;
  is_deleted: number;
}
