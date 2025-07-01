import { Word } from "@/types/database";
import { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  HomeDecksList: undefined;
  DeckDetail: {
    deckId: number;
    title: string;
    author: string;
    openAddWordModal?: boolean;
  };
  WordDetails: { wordId: number };
  AddOrEditDeck: { deckId?: number };
};

export type PracticeStackParamList = {
  PracticeHub: undefined;
  PracticeGame: {
    mode: "flashcard" | "multiple-choice" | "writing";
    deckId?: number;
    sessionType: "urgent" | "free";
    words?: Word[]; // Passamos uma lista específica de palavras para praticar (ex: palavras difíceis)
    origin?: "DeckDetail" | "Stats"; // De onde a prática foi iniciada
  };
};

export type StatsStackParamList = {
  StatsMain: undefined;
};

export type RootTabParamList = {
  HomeDecks: NavigatorScreenParams<HomeStackParamList> | undefined;
  Practice: NavigatorScreenParams<PracticeStackParamList> | undefined;
  Stats: undefined;
};
