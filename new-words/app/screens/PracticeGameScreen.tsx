import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
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
  const { mode, deckId, words: wordsFromRoute } = route.params;
  const navigation = useNavigation();

  const hasConfirmedExit = useRef(false);

  const sessionState = usePracticeStore((state) => state.sessionState);
  const { fetchWordsForPractice, fetchLeastPracticedWords } =
    useWordStore.getState();
  const startSession = usePracticeStore((state) => state.startSession);
  const endSession = usePracticeStore((state) => state.endSession);

  const startNewRound = useCallback(() => {
    const loadAndStart = async () => {
      let wordsToPractice: Word[];

      if (wordsFromRoute && wordsFromRoute.length > 0) {
        // Se uma lista de palavras for passada diretamente (ex: palavras difíceis), usa essa lista.
        wordsToPractice = wordsFromRoute;
      } else {
        // 1. Tenta obter palavras com a lógica SRS.
        wordsToPractice = await fetchWordsForPractice(deckId);

        // 2. Se o SRS não retornar nada, busca as palavras menos praticadas como fallback.
        if (wordsToPractice.length === 0) {
          wordsToPractice = await fetchLeastPracticedWords(deckId);
        }
      }

      // 3. Verificação final: se, mesmo após o fallback, não houver palavras,
      //    alerta o utilizador e volta para trás.
      if (wordsToPractice.length === 0) {
        Alert.alert(
          "Tudo em dia!",
          "Não há palavras para praticar neste momento. Adicione novas palavras ou volte mais tarde.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return; // Impede o início da sessão.
      }

      const roundWords = wordsToPractice.slice(0, 10); // Continuamos a usar rondas de 10
      startSession(roundWords, mode);
      hasConfirmedExit.current = false;
    };
    loadAndStart();
  }, [
    deckId,
    mode,
    wordsFromRoute,
    startSession,
    fetchWordsForPractice,
    fetchLeastPracticedWords,
    navigation,
  ]);

  useEffect(() => {
    startNewRound();

    return () => {
      endSession();
    };
  }, [startNewRound, endSession]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (hasConfirmedExit.current || sessionState !== "in-progress") {
          return;
        }

        e.preventDefault();

        Alert.alert(
          "Sair da Prática?",
          "O seu progresso nesta sessão será perdido. Tem a certeza que quer sair?",
          [
            { text: "Ficar", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: () => {
                hasConfirmedExit.current = true;
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }),
    [navigation, sessionState]
  );

  if (sessionState === "finished") {
    return <SessionResults onPlayAgain={startNewRound} />;
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
    <View style={styles.container}>
      <Text>A preparar a sua sessão de prática...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    paddingTop: 100, // Increased padding to create more space for the absolute header
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
