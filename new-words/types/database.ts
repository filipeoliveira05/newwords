export interface Deck {
  id: string; // Changed from number to string for UUID
  title: string;
  author: string;
  createdAt: string;
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
}
