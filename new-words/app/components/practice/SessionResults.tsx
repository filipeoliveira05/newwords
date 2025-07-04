import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
// import ConfettiCannon from "react-native-confetti-cannon";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { updateUserPracticeMetrics } from "../../../services/storage";
import { RootTabParamList } from "../../../types/navigation";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

type SessionResultsProps = {
  onPlayAgain: () => void;
  onExit: () => void;
  deckId?: number;
  origin?: "DeckDetail" | "Stats";
};

export default function SessionResults({
  onPlayAgain,
  deckId,
  onExit,
  origin,
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
    onExit(); // Limpa o estado da sessão antes de navegar

    // Se todas as palavras urgentes foram feitas, força a atualização do PracticeHub
    if (isUrgentSessionComplete) {
      navigation.navigate("Practice", { screen: "PracticeHub" });
      return;
    }

    // Navegação inteligente baseada na origem
    if (origin === "DeckDetail") {
      navigation.goBack();
      navigation.navigate("HomeDecks");
    } else if (origin === "Stats") {
      navigation.navigate("Stats");
    } else {
      // Comportamento padrão: voltar para o hub de prática.
      // goBack() é seguro aqui porque o hub é a tela anterior na stack de prática.
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Confetti for perfect rounds! */}
      {/* {isPerfectRound && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )} */}

      <AppText variant="bold" style={styles.title}>
        {isPerfectRound ? "Ronda Perfeita!" : "Resultados da Sessão"}
      </AppText>

      {isUrgentSessionComplete ? (
        <View style={styles.summaryCard}>
          <Ionicons
            name="checkmark-done-circle"
            size={48}
            color={theme.colors.success}
          />
          <AppText variant="bold" style={styles.congratsTitle}>
            Revisão Concluída!
          </AppText>
          <AppText style={styles.congratsSubtitle}>
            Todas as palavras urgentes foram revistas. Pode agora praticar
            livremente.
          </AppText>
        </View>
      ) : (
        <View style={styles.summaryCard}>
          <AppText style={styles.scoreText}>
            Você acertou {numCorrect} de {totalWordsInRound} palavras!
          </AppText>
          <AppText variant="bold" style={styles.percentageText}>
            {scorePercentage}%
          </AppText>
          <View style={styles.progressContainer}>
            <AppText variant="medium" style={styles.progressTitle}>
              {sessionType === "urgent"
                ? "Progresso da Revisão"
                : "Progresso da Prática"}
            </AppText>
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
            <AppText
              style={styles.progressLabel}
            >{`${wordsPracticedInSession.size} / ${fullSessionWordPool.length}`}</AppText>
          </View>
        </View>
      )}

      {/* Only show if user has incorrect words */}
      {wordsToReview.length > 0 && (
        <View style={styles.reviewSection}>
          <AppText variant="bold" style={styles.reviewTitle}>
            Palavras Erradas a Rever:
          </AppText>
          <ScrollView style={styles.scrollView}>
            {wordsToReview.map((word) => (
              <View key={word.id} style={styles.wordItem}>
                <AppText variant="medium" style={styles.wordFront}>
                  {word.name}
                </AppText>
                <AppText style={styles.wordBack}>{word.meaning}</AppText>
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
            <AppText variant="bold" style={styles.secondaryButtonText}>
              Sair
            </AppText>
          </TouchableOpacity>
          {!isSessionComplete && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.halfButton]}
              onPress={onPlayAgain}
            >
              <AppText variant="bold" style={styles.primaryButtonText}>
                Próxima Ronda
              </AppText>
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
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  scoreText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 42,
    color: theme.colors.primary,
  },
  congratsTitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.success,
    marginTop: 16,
  },
  congratsSubtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  reviewSection: {
    width: "100%",
    flex: 1,
  },
  reviewTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 10,
  },
  scrollView: {
    width: "100%",
  },
  wordItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  wordFront: {
    fontSize: theme.fontSizes.base,
  },
  wordBack: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
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
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.base,
  },
  secondaryButton: {
    backgroundColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textMedium,
    fontSize: theme.fontSizes.base,
  },
  progressContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  progressTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
});
