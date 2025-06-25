import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { PracticeStackParamList } from "../navigation/types";

import FlashcardView from "../components/practice/FlashcardView";
// import MultipleChoiceView from '../components/practice/MultipleChoiceView';
import SessionResults from "../components/practice/SessionResults";

type Props = {
  route: RouteProp<PracticeStackParamList, "PracticeGame">;
};

export default function PracticeGameScreen({ route }: Props) {
  const { mode, words } = route.params;

  const sessionState = usePracticeStore((state) => state.sessionState);
  const startSession = usePracticeStore((state) => state.startSession);
  const endSession = usePracticeStore((state) => state.endSession);

  useEffect(() => {
    startSession(words, mode);

    return () => {
      endSession();
    };
  }, [words, mode, startSession, endSession]);

  if (sessionState === "finished") {
    return <SessionResults />;
  }

  if (sessionState === "in-progress") {
    return (
      <View style={styles.container}>
        {/* Futuramente: <ProgressBar /> */}
        {mode === "flashcard" && <FlashcardView />}
        {
          mode === "multiple-choice" && (
            <Text>Componente Quiz aqui</Text>
          ) /* <MultipleChoiceView /> */
        }
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
});
