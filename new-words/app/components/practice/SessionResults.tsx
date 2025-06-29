import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useWordStore } from "@/stores/wordStore";
import { updateUserPracticeMetrics } from "../../../services/storage";

import { Word } from "@/types/database";

const EMPTY_WORDS_ARRAY: Word[] = [];

type SessionResultsProps = {
  onPlayAgain: () => void;
};

export default function SessionResults({ onPlayAgain }: SessionResultsProps) {
  const navigation = useNavigation();

  // Select state and actions from the store individually to prevent re-renders
  const correctAnswers = usePracticeStore((state) => state.correctAnswers);
  const incorrectAnswers = usePracticeStore((state) => state.incorrectAnswers);
  const wordsForSession = usePracticeStore(
    (state) => state.wordsForSession || EMPTY_WORDS_ARRAY
  );
  const highestStreakThisRound = usePracticeStore(
    (state) => state.highestStreakThisRound
  );
  const sessionMode = usePracticeStore((state) => state.sessionMode);
  const startSession = usePracticeStore((state) => state.startSession);

  // Get the action from wordStore to save stats
  const { updateStatsAfterSession } = useWordStore.getState();

  // Use an effect to save the stats to the database when results are shown
  useEffect(() => {
    const saveStats = async () => {
      const wordsTrainedCount = correctAnswers.length + incorrectAnswers.length;
      try {
        // Only save if there are results to save
        if (wordsTrainedCount > 0) {
          await updateStatsAfterSession(correctAnswers, incorrectAnswers);
          // Também atualiza as métricas do utilizador com a maior streak da ronda
          await updateUserPracticeMetrics(
            highestStreakThisRound,
            wordsTrainedCount
          );
        }
      } catch (error) {
        console.error("Falha ao guardar as estatísticas da sessão:", error);
      }
    };
    saveStats();
  }, [
    correctAnswers,
    incorrectAnswers,
    highestStreakThisRound,
    updateStatsAfterSession,
  ]);

  // Calculate the statistics
  const totalWords = wordsForSession.length;
  const numCorrect = correctAnswers.length;
  const scorePercentage =
    totalWords > 0 ? Math.round((numCorrect / totalWords) * 100) : 0;

  const isPerfectRound = totalWords > 0 && incorrectAnswers.length === 0;

  // Find incorrect words
  const incorrectWordIds = new Set(incorrectAnswers);
  const wordsToReview = wordsForSession.filter((word) =>
    incorrectWordIds.has(word.id)
  );

  const handlePracticeMistakes = () => {
    if (wordsToReview.length > 0 && sessionMode) {
      // Inicia uma nova sessão apenas com as palavras erradas,
      // no mesmo modo de jogo.
      startSession(wordsToReview, sessionMode);
    }
  };

  return (
    <View style={styles.container}>
      {/* Confetti for perfect rounds! */}
      {isPerfectRound && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      <Text style={styles.title}>
        {isPerfectRound ? "Ronda Perfeita!" : "Resultados da Sessão"}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.scoreText}>
          Você acertou {numCorrect} de {totalWords} palavras!
        </Text>
        <Text style={styles.percentageText}>{scorePercentage}%</Text>
      </View>

      {/* Only show if user has incorrect words */}
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

      {/* Main button section to conclude or keep going */}
      <View style={styles.actionsContainer}>
        {wordsToReview.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.practiceMistakesButton]}
            onPress={handlePracticeMistakes}
          >
            <Text style={styles.primaryButtonText}>
              Praticar Erros ({wordsToReview.length})
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, styles.halfButton]}
            onPress={onPlayAgain}
          >
            <Text style={styles.primaryButtonText}>Próxima Ronda</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
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
    borderLeftColor: "#ff4d6d",
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
  actionsContainer: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  practiceMistakesButton: {
    backgroundColor: "#f4a261", // Orange color for high visibility
    marginBottom: 16,
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
