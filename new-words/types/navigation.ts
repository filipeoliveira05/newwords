import { Word } from "@/types/database";
import { NavigatorScreenParams } from "@react-navigation/native";
import { WeeklySummary } from "../services/storage";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: { email?: string };
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainApp: undefined; // Representa o AppNavigator com as tabs
  UpdatePassword: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  LeagueDetails: undefined;
  WeeklyRecap: { summary: WeeklySummary };
};

export type DecksStackParamList = {
  LibraryHub: undefined;
  DecksList: undefined; // Continua a ser a lista de conjuntos
  AllWords: undefined; // O novo ecrã para todas as palavras
  DeckDetail: {
    deckId: string;
    title: string;
    author: string;
    openAddWordModal?: boolean;
  };
  WordDetails: { wordId: string };
  AddOrEditDeck: { deckId?: string };
};

export type PracticeStackParamList = {
  PracticeHub: undefined;
  PracticeLoading: {
    mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists";
    deckId?: string;
    sessionType: "urgent" | "free" | "wrong" | "favorite";
    words?: Word[];
    origin?: "HomeDashboard" | "DeckDetail" | "Stats";
  };
  PracticeGame: {
    // De onde a prática foi iniciada, para o ecrã de resultados saber para onde voltar.
    origin?: "HomeDashboard" | "DeckDetail" | "Stats";
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
  SplashScreenTest: undefined; // temporário
  IconTest: undefined; // temporário
  LevelUpTest: undefined; // temporário
  Stats: undefined;
  Achievements: undefined;
  LevelJourney: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Decks: NavigatorScreenParams<DecksStackParamList> | undefined;
  Practice: NavigatorScreenParams<PracticeStackParamList> | undefined;
  Community: NavigatorScreenParams<CommunityStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
