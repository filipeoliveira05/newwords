import React from "react";
import { View, StyleSheet } from "react-native";
import { usePracticeStore } from "@/stores/usePracticeStore";
import AppText from "../AppText";
import { theme } from "../../theme";

export default function ProgressBar() {
  const wordsPracticedInSession = usePracticeStore(
    (state) => state.wordsPracticedInSession
  );
  const fullSessionWordPool = usePracticeStore(
    (state) => state.fullSessionWordPool
  );
  const sessionType = usePracticeStore((state) => state.sessionType);

  const totalWordsInPool = fullSessionWordPool.length;
  const wordsPracticedCount = wordsPracticedInSession.size;

  if (totalWordsInPool === 0) {
    return null;
  }

  const progressPercentage = (wordsPracticedCount / totalWordsInPool) * 100;
  const progressTitle =
    sessionType === "urgent" ? "Progresso da Revisão" : "Progresso da Prática";

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <AppText variant="medium" style={styles.progressTitle}>
          {progressTitle}
        </AppText>
        <AppText variant="medium" style={styles.progressText}>
          {wordsPracticedCount} / {totalWordsInPool}
        </AppText>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progressPercentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 400,
    marginBottom: 40,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  progressText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
  },
  barBackground: {
    width: "100%",
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
});
