import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import ConfettiCannon from "react-native-confetti-cannon";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { updateUserPracticeMetrics } from "../../../services/storage";
import { RootTabParamList } from "../../../types/navigation";

type SessionResultsProps = {
  onPlayAgain: () => void;
  deckId?: number;
};

export default function SessionResults({
  onPlayAgain,
  deckId,
}: SessionResultsProps) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  // Select state and actions from the store individually to prevent re-renders
  const correctAnswers = usePracticeStore((state) => state.correctAnswers);
  const incorrectAnswers = usePracticeStore((state) => state.incorrectAnswers);
  const currentRoundWords = usePracticeStore(
    (state) => state.currentRoundWords
  );
  const fullSessionWordPool = usePracticeStore(
    (state) => state.fullSessionWordPool
  );
  const currentPoolIndex = usePracticeStore((state) => state.currentPoolIndex);
  const sessionType = usePracticeStore((state) => state.sessionType);
  const wordsPracticedInSession = usePracticeStore(
    (state) => state.wordsPracticedInSession
  );
  const highestStreakThisRound = usePracticeStore(
    (state) => state.highestStreakThisRound
  );

  // Use an effect to save the stats to the database when results are shown
  useEffect(() => {
    const saveStats = async () => {
      const wordsTrainedCount = new Set([
        ...correctAnswers,
        ...incorrectAnswers,
      ]).size;
      try {
        // Only save if there are results to save
        if (wordsTrainedCount > 0) {
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
  }, [correctAnswers, incorrectAnswers, highestStreakThisRound]);

  // Calculate the statistics
  const totalWordsInRound = currentRoundWords.length;
  const numCorrect = correctAnswers.length;
  const scorePercentage =
    totalWordsInRound > 0
      ? Math.round((numCorrect / totalWordsInRound) * 100)
      : 0;

  const sessionProgressPercentage =
    fullSessionWordPool.length > 0
      ? (wordsPracticedInSession.size / fullSessionWordPool.length) * 100
      : 0;

  const isPerfectRound = totalWordsInRound > 0 && incorrectAnswers.length === 0;

  // Find incorrect words
  const incorrectWordIds = new Set(incorrectAnswers);
  const wordsToReview = currentRoundWords.filter((word) =>
    incorrectWordIds.has(word.id)
  );

  const isSessionComplete = currentPoolIndex >= fullSessionWordPool.length;
  const isUrgentSessionComplete = sessionType === "urgent" && isSessionComplete;

  const handleExit = () => {
    // Se todas as palavras urgentes foram feitas, força a atualização do PracticeHub
    if (isUrgentSessionComplete) {
      navigation.navigate("Practice", { screen: "PracticeHub" });
      return;
    }

    // Se um deckId estiver presente, a prática foi para um conjunto específico.
    // Navega de volta para o separador Home, que mostrará o DeckDetailScreen.
    if (deckId) {
      navigation.navigate("HomeDecks");
    } else {
      // Caso contrário, foi uma prática geral, então basta voltar para o PracticeHub.
      navigation.goBack();
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

      {isUrgentSessionComplete ? (
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-done-circle" size={48} color="#2a9d8f" />
          <Text style={styles.congratsTitle}>Revisão Concluída!</Text>
          <Text style={styles.congratsSubtitle}>
            Todas as palavras urgentes foram revistas. Pode agora praticar
            livremente.
          </Text>
        </View>
      ) : (
        <View style={styles.summaryCard}>
          <Text style={styles.scoreText}>
            Você acertou {numCorrect} de {totalWordsInRound} palavras!
          </Text>
          <Text style={styles.percentageText}>{scorePercentage}%</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>
              {sessionType === "urgent"
                ? "Progresso da Revisão"
                : "Progresso da Prática"}
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${sessionProgressPercentage}%`,
                  },
                ]}
              />
            </View>
            <Text
              style={styles.progressLabel}
            >{`${wordsPracticedInSession.size} / ${fullSessionWordPool.length}`}</Text>
          </View>
        </View>
      )}

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
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={handleExit}
          >
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
          {!isSessionComplete && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.halfButton]}
              onPress={onPlayAgain}
            >
              <Text style={styles.primaryButtonText}>Próxima Ronda</Text>
            </TouchableOpacity>
          )}
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
  congratsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2a9d8f",
    marginTop: 16,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
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
  progressContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a4e69",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4F8EF7",
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 6,
  },
});
