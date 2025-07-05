export interface Deck {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

export interface Word {
  id: number;
  deckId: number;
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
  // SM-2 Algorithm Fields
  easinessFactor: number; // How easy the word is (default: 2.5)
  interval: number; // The number of days until the next review
  repetitions: number; // Number of consecutive correct recalls
}
