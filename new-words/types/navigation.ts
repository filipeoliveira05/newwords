import { Word } from "@/types/database";
import { NavigatorScreenParams } from "@react-navigation/native";

export type DecksStackParamList = {
  DecksList: undefined;
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
    mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists";
    deckId?: number; // For deck-specific free practice
    sessionType: "urgent" | "free" | "wrong" | "favorite";
    // Para casos especiais onde a lista de palavras já é pré-calculada (ex: "palavras desafiadoras" do ecrã de estatísticas)
    words?: Word[];
    origin?: "DeckDetail" | "Stats"; // De onde a prática foi iniciada
  };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Home: undefined; // O novo dashboard de gamificação
  Decks: NavigatorScreenParams<DecksStackParamList> | undefined;
  Practice: NavigatorScreenParams<PracticeStackParamList> | undefined;
  Stats: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
