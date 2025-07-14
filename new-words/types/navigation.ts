import { Word } from "@/types/database";
import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Onboarding: undefined;
  MainApp: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  LeagueDetails: undefined;
};

export type DecksStackParamList = {
  LibraryHub: undefined;
  DecksList: undefined; // Continua a ser a lista de conjuntos
  AllWords: undefined; // O novo ecrã para todas as palavras
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
  PracticeLoading: {
    mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists";
    deckId?: number;
    sessionType: "urgent" | "free" | "wrong" | "favorite";
    words?: Word[];
    origin?: "DeckDetail" | "Stats";
  };
  PracticeGame: {
    origin?: "DeckDetail" | "Stats"; // De onde a prática foi iniciada, para o ecrã de resultados saber para onde voltar.
  };
};

export type CommunityStackParamList = {
  CommunityHub: undefined;
  LeagueDetails: undefined;
  // Futuramente: DuelingScreen, etc.
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Account: undefined;
  EditAccount: undefined;
  Help: undefined;
  Stats: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Decks: NavigatorScreenParams<DecksStackParamList> | undefined;
  Practice: NavigatorScreenParams<PracticeStackParamList> | undefined;
  Community: NavigatorScreenParams<CommunityStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
