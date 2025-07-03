import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useWordStore } from "@/stores/wordStore";
import { shuffle } from "@/utils/arrayUtils";
import { Word } from "@/types/database";
import AppText from "../AppText";
import { theme } from "../../theme";

export default function MultipleChoiceView() {
  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const deckId = usePracticeStore((state) => state.deckId);
  const recordAnswer = usePracticeStore((state) => state.recordAnswer);
  const nextWord = usePracticeStore((state) => state.nextWord);
  const { fetchDistractorWords } = useWordStore.getState();

  const [options, setOptions] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const generateOptions = async () => {
      if (!currentWord) return;

      setIsLoading(true);
      setIsAnswered(false);
      setSelectedOptionId(null);

      try {
        const distractors = await fetchDistractorWords(currentWord.id, deckId);
        const allOptions = shuffle([currentWord, ...distractors]);
        setOptions(allOptions);
      } catch (error) {
        console.error("Failed to generate multiple choice options:", error);
        setOptions([]); // Limpa as opções em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    generateOptions();
  }, [currentWord, deckId, fetchDistractorWords]);

  const handleAnswer = (option: Word) => {
    if (isAnswered || !currentWord) return;

    const isCorrect = option.id === currentWord.id;
    setIsAnswered(true);
    setSelectedOptionId(option.id);
    recordAnswer(currentWord.id, isCorrect);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Wait for a moment to show feedback, then move to the next word
    setTimeout(() => {
      nextWord();
    }, 1200); // 1.2 seconds for feedback
  };

  const getButtonStyle = (optionId: number) => {
    if (!isAnswered) {
      return styles.optionButton; // Default style
    }
    if (optionId === currentWord?.id) {
      return [styles.optionButton, styles.correctOption]; // Correct answer
    }
    if (optionId === selectedOptionId) {
      return [styles.optionButton, styles.incorrectOption]; // User's wrong choice
    }
    return [styles.optionButton, styles.disabledOption]; // Other options
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <AppText>Fim da ronda!</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <AppText style={styles.questionLabel}>Qual o significado de:</AppText>
        <AppText variant="bold" style={styles.wordText}>
          {currentWord.name}
        </AppText>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getButtonStyle(option.id)}
            onPress={() => handleAnswer(option)}
            disabled={isAnswered}
          >
            <AppText style={styles.optionText}>{option.meaning}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start", // Alinha os itens ao topo
    padding: 20,
  },
  questionContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 30,
    width: "100%",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  questionLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  wordText: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginTop: 32, // Reduz a margem para aproximar as opções
  },
  optionButton: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  optionText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
    textAlign: "center",
  },
  correctOption: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  incorrectOption: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  disabledOption: {
    opacity: 0.5,
  },
});
