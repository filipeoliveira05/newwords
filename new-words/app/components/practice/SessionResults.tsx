import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePracticeStore } from "@/stores/usePracticeStore";

import { Word } from "@/types/database";

const EMPTY_WORDS_ARRAY: Word[] = [];

type SessionResultsProps = {
  onPlayAgain: () => void;
};

export default function SessionResults({ onPlayAgain }: SessionResultsProps) {
  const navigation = useNavigation();

  // 1. Selecionamos cada pedaço de estado de forma independente.
  const correctAnswers = usePracticeStore((state) => state.correctAnswers);
  const incorrectAnswers = usePracticeStore((state) => state.incorrectAnswers);
  const wordsForSession = usePracticeStore(
    (state) => state.wordsForSession || EMPTY_WORDS_ARRAY
  );

  // 2. Calculamos as estatísticas (esta lógica não muda)
  const totalWords = wordsForSession.length;
  const numCorrect = correctAnswers.length;
  const scorePercentage =
    totalWords > 0 ? Math.round((numCorrect / totalWords) * 100) : 0;

  // 3. Encontramos os objetos das palavras que foram erradas (esta lógica não muda)
  const incorrectWordIds = new Set(incorrectAnswers);
  const wordsToReview = wordsForSession.filter((word) =>
    incorrectWordIds.has(word.id)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados da Sessão</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.scoreText}>
          Você acertou {numCorrect} de {totalWords} palavras!
        </Text>
        <Text style={styles.percentageText}>{scorePercentage}%</Text>
      </View>

      {/* Só mostramos esta secção se o utilizador tiver errado alguma palavra */}
      {wordsToReview.length > 0 && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Palavras a Rever:</Text>
          <ScrollView style={styles.scrollView}>
            {wordsToReview.map((word) => (
              <View key={word.id} style={styles.wordItem}>
                <Text style={styles.wordFront}>{word.name}</Text>
                <Text style={styles.wordBack}>{word.meaning}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* O botão de ação principal para concluir */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Sair</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onPlayAgain}
        >
          <Text style={styles.primaryButtonText}>Próxima Ronda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  scoreText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#4F8EF7",
  },
  reviewSection: {
    width: "100%",
    flex: 1, // Faz com que ocupe o espaço disponível
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 10,
  },
  scrollView: {
    width: "100%",
  },
  wordItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d6d", // Destaque para indicar que é um erro
  },
  wordFront: {
    fontSize: 16,
    fontWeight: "600",
  },
  wordBack: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: "#4F8EF7",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#e9ecef",
  },
  secondaryButtonText: {
    color: "#495057",
    fontWeight: "bold",
    fontSize: 16,
  },
});
