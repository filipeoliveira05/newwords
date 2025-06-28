import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePracticeStore } from "@/stores/usePracticeStore";

export default function ProgressBar() {
  const currentWordIndex = usePracticeStore((state) => state.currentWordIndex);
  const wordsForSession = usePracticeStore((state) => state.wordsForSession);

  const totalWords = wordsForSession.length;
  const currentStep = currentWordIndex + 1;

  if (totalWords === 0) {
    return null;
  }

  const progressPercentage = (currentStep / totalWords) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        {currentStep} / {totalWords}
      </Text>
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
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a4e69",
    marginBottom: 8,
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
