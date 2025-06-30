import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { shuffle } from "../../../utils/arrayUtils";

type QuizOption = {
  id: number;
  meaning: string;
};

export default function MultipleChoiceView() {
  // --- Store State and Actions ---
  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const fullSessionWordPool = usePracticeStore(
    (state) => state.fullSessionWordPool
  );
  const { recordAnswer, nextWord } = usePracticeStore.getState();

  // --- Component State ---
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // --- Logic to generate options ---
  useEffect(() => {
    if (!currentWord) return;

    // Reset state for the new word
    setHasAnswered(false);
    setSelectedOptionId(null);

    // Find 3 incorrect options from the entire session pool.
    const distractors = fullSessionWordPool
      .filter((word) => word.id !== currentWord.id)
      .slice(0, 3);

    // Create the full list of 4 options
    const newOptions = [
      { id: currentWord.id, meaning: currentWord.meaning },
      ...distractors.map((d) => ({ id: d.id, meaning: d.meaning })),
    ];

    // Shuffle and set the options
    setOptions(shuffle(newOptions));
  }, [currentWord, fullSessionWordPool]);

  // --- Handlers ---
  const handleSelectOption = (selectedId: number) => {
    if (hasAnswered || !currentWord) return;

    const isCorrect = selectedId === currentWord.id;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setHasAnswered(true);
    setSelectedOptionId(selectedId);
    recordAnswer(currentWord.id, isCorrect);

    // Wait for a moment to show feedback, then move to the next word
    setTimeout(() => {
      nextWord();
    }, 1200); // 1.2 seconds for feedback
  };

  // --- Render ---
  if (!currentWord) {
    return null;
  }

  const getButtonStyle = (optionId: number) => {
    if (!hasAnswered) {
      return styles.optionButton; // Default style
    }

    const isCorrectAnswer = optionId === currentWord.id;
    const isSelectedAnswer = optionId === selectedOptionId;

    if (isCorrectAnswer) {
      return [styles.optionButton, styles.correctButton]; // Always highlight correct green
    }
    if (isSelectedAnswer && !isCorrectAnswer) {
      return [styles.optionButton, styles.incorrectButton]; // Highlight selected incorrect red
    }

    return [styles.optionButton, styles.disabledButton]; // Other non-selected, incorrect options
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentWord.name}</Text>
        <Text style={styles.questionHint}>Qual o significado correto?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getButtonStyle(option.id)}
            onPress={() => handleSelectOption(option.id)}
            disabled={hasAnswered}
          >
            <Text style={styles.optionText}>{option.meaning}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "90%", alignItems: "center", maxWidth: 400 },
  questionContainer: {
    backgroundColor: "white",
    width: "100%",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
  },
  questionHint: { fontSize: 16, color: "#adb5bd", marginTop: 8 },
  optionsContainer: { width: "100%" },
  optionButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
    textAlign: "center",
  },
  correctButton: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
  incorrectButton: { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
  disabledButton: { opacity: 0.6 },
});
