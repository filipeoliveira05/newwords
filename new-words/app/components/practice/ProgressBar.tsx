import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePracticeStore } from "@/stores/usePracticeStore";

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
        <Text style={styles.progressTitle}>{progressTitle}</Text>
        <Text style={styles.progressText}>
          {wordsPracticedCount} / {totalWordsInPool}
        </Text>
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
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a4e69",
  },
  barBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#4F8EF7",
    borderRadius: 6,
  },
});
