import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { PracticeStackParamList } from "../../types/navigation";

import StreakCounter from "../components/practice/StreakCounter";
import ProgressBar from "../components/practice/ProgressBar";
import FlashcardView from "../components/practice/FlashcardView";
import MultipleChoiceView from "../components/practice/MultipleChoiceView";
import SessionResults from "../components/practice/SessionResults";

type Props = {
  route: RouteProp<PracticeStackParamList, "PracticeGame">;
};

const gameModeTitles = {
  flashcard: "Revisão Clássica",
  "multiple-choice": "Escolha Múltipla",
};

const GameHeader = ({
  mode,
  onBackPress,
}: {
  mode: "flashcard" | "multiple-choice";
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
  const { mode, words: allWords } = route.params;
  const navigation = useNavigation();

  const hasConfirmedExit = useRef(false);

  const sessionState = usePracticeStore((state) => state.sessionState);
  const startSession = usePracticeStore((state) => state.startSession);
  const endSession = usePracticeStore((state) => state.endSession);

  const startNewRound = useCallback(() => {
    // --- LÓGICA DE SELEÇÃO INTELIGENTE (SRS Nível 1) ---
    const sortedWords = [...allWords].sort((a, b) => {
      // Critério 1: Palavras nunca treinadas vêm primeiro
      if (a.timesTrained === 0 && b.timesTrained > 0) return -1;
      if (b.timesTrained === 0 && a.timesTrained > 0) return 1;

      // Critério 2: Priorizar palavras com maior taxa de erro
      const errorRateA =
        a.timesTrained > 0 ? a.timesIncorrect / a.timesTrained : 0;
      const errorRateB =
        b.timesTrained > 0 ? b.timesIncorrect / b.timesTrained : 0;
      if (errorRateA > errorRateB) return -1;
      if (errorRateB > errorRateA) return 1;

      // Critério 3: Priorizar palavras não treinadas há mais tempo
      const dateA = a.lastTrained ? new Date(a.lastTrained).getTime() : 0;
      const dateB = b.lastTrained ? new Date(b.lastTrained).getTime() : 0;
      if (dateA < dateB) return -1; // Mais antigo primeiro
      if (dateB < dateA) return 1;

      return 0; // Manter a ordem se tudo for igual
    });

    const roundWords = sortedWords.slice(0, 10);
    startSession(roundWords, mode);
    hasConfirmedExit.current = false;
  }, [allWords, mode, startSession]);

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
