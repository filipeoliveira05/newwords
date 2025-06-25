import { Word } from "@/types/database";

export type HomeStackParamList = {
  HomeDecksList: undefined;
  DeckDetail: { deckId: number; title: string; author: string };
  AddOrEditDeck: { deckId?: number };
};

export type PracticeStackParamList = {
  PracticeHub: undefined;
  PracticeGame: {
    mode: "flashcard" | "multiple-choice";
    words: Word[];
  };
};

export type StatsStackParamList = {
  StatsMain: undefined;
};

export type RootTabParamList = {
  HomeDecks: undefined;
  Practice: undefined;
  Stats: undefined;
};
