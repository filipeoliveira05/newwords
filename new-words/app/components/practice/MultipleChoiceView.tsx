import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useWordStore } from "@/stores/wordStore";
import { shuffle } from "@/utils/arrayUtils";
import { Word } from "@/types/database";

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
      return styles.optionButton;
    }
    if (optionId === currentWord?.id) {
      return [styles.optionButton, styles.correctOption];
    }
    if (optionId === selectedOptionId) {
      return [styles.optionButton, styles.incorrectOption];
    }
    return [styles.optionButton, styles.disabledOption];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text>Fim da ronda!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Qual o significado de:</Text>
        <Text style={styles.wordText}>{currentWord.name}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getButtonStyle(option.id)}
            onPress={() => handleAnswer(option)}
            disabled={isAnswered}
          >
            <Text style={styles.optionText}>{option.meaning}</Text>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  questionLabel: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 8,
  },
  wordText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#22223b",
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginTop: 32, // Reduz a margem para aproximar as opções
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#495057",
    textAlign: "center",
  },
  correctOption: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  incorrectOption: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  disabledOption: {
    opacity: 0.5,
  },
});
