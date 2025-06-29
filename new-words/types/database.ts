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
  masteryLevel: "new" | "learning" | "mastered";
  nextReviewDate: string;
  createdAt: string;
}
