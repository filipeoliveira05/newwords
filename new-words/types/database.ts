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
}
