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
  AddOrEditDeck: { deckId?: number };
};

export type PracticeStackParamList = {
  PracticeHub: undefined;
  PracticeGame: {
    mode: "flashcard" | "multiple-choice" | "writing";
    words: Word[];
  };
};

export type StatsStackParamList = {
  StatsMain: undefined;
};

export type RootTabParamList = {
  HomeDecks: NavigatorScreenParams<HomeStackParamList>;
  Practice: NavigatorScreenParams<PracticeStackParamList>;
  Stats: undefined;
};
