import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useWordStore } from "@/stores/wordStore";
import { Word } from "@/types/database";
import { PracticeStackParamList } from "../../types/navigation";

import StreakCounter from "../components/practice/StreakCounter";
import ProgressBar from "../components/practice/ProgressBar";
import FlashcardView from "../components/practice/FlashcardView";
import MultipleChoiceView from "../components/practice/MultipleChoiceView";
import WritingView from "../components/practice/WritingView";
import SessionResults from "../components/practice/SessionResults";

type Props = {
  route: RouteProp<PracticeStackParamList, "PracticeGame">;
};

const gameModeTitles = {
  flashcard: "Revisão Clássica",
  "multiple-choice": "Escolha Múltipla",
  writing: "Jogo da Escrita",
};

const GameHeader = ({
  mode,
  onBackPress,
}: {
  mode: "flashcard" | "multiple-choice" | "writing";
  onBackPress: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#4a4e69" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{gameModeTitles[mode]}</Text>
      <View style={styles.headerRight}>
        <StreakCounter />
      </View>
    </View>
  );
};

export default function PracticeGameScreen({ route }: Props) {
  const { mode, deckId, words: wordsFromRoute, sessionType } = route.params;
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const hasConfirmedExit = useRef(false);

  const sessionState = usePracticeStore((state) => state.sessionState);
  const { fetchWordsForPractice, fetchAllLeastPracticedWords } =
    useWordStore.getState();
  const initializeSession = usePracticeStore(
    (state) => state.initializeSession
  );
  const endSession = usePracticeStore((state) => state.endSession);
  const startNextRound = usePracticeStore((state) => state.startNextRound);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setIsLoading(true);
        let fullWordPool: Word[];

        if (wordsFromRoute && wordsFromRoute.length > 0) {
          // Use a lista de palavras passada diretamente (ex: palavras desafiadoras).
          fullWordPool = wordsFromRoute;
        } else if (sessionType === "urgent") {
          // Busca todas as palavras urgentes.
          fullWordPool = await fetchWordsForPractice(deckId);
        } else {
          // Busca TODAS as palavras para uma sessão de prática livre.
          fullWordPool = await fetchAllLeastPracticedWords(deckId);
        }

        if (fullWordPool.length === 0) {
          Alert.alert(
            "Tudo em dia!",
            "Não há palavras para praticar neste momento. Adicione novas palavras ou volte mais tarde.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
          return;
        }

        initializeSession(fullWordPool, mode, sessionType, deckId);
        hasConfirmedExit.current = false;
      } catch (error) {
        console.error("Erro ao carregar a sessão de prática:", error);
        Alert.alert("Erro", "Não foi possível iniciar a sessão.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [deckId, mode, sessionType, wordsFromRoute]); // Dependências para recarregar se os parâmetros mudarem

  useEffect(() => {
    // Efeito de limpeza: garante que a sessão é terminada quando o ecrã é desmontado.
    return () => {
      endSession();
    };
  }, [endSession]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        // Previne o utilizador de sair a meio de uma ronda sem querer.
        if (hasConfirmedExit.current || sessionState !== "in-progress") {
          return;
        }

        e.preventDefault();

        Alert.alert("Sair da Prática?", "Tem a certeza que quer sair?", [
          { text: "Ficar", style: "cancel", onPress: () => {} },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => {
              hasConfirmedExit.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, sessionState]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>A preparar a sua sessão...</Text>
      </View>
    );
  }

  if (sessionState === "finished") {
    return <SessionResults onPlayAgain={startNextRound} deckId={deckId} />;
  }

  if (sessionState === "in-progress") {
    return (
      <View style={styles.container}>
        <GameHeader mode={mode} onBackPress={() => navigation.goBack()} />
        <ProgressBar key={sessionState} />
        {mode === "flashcard" && <FlashcardView />}
        {mode === "multiple-choice" && <MultipleChoiceView />}
        {mode === "writing" && <WritingView />}
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer} /> // Ecrã vazio enquanto a lógica decide o que fazer
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    paddingTop: 100, // Increased padding to create more space for the absolute header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a4e69",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6c757d",
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8, // Larger touch area
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a4e69",
  },
  headerRight: {
    minWidth: 40, // Approx width of back button to keep title centered
    alignItems: "flex-end",
  },
});
