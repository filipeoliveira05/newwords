import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as soundService from "@/services/soundService";
import * as hapticService from "@/services/hapticService";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useWordStore } from "@/stores/wordStore";
import { shuffle } from "@/utils/arrayUtils";
import { Word } from "@/types/database";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

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
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    const generateOptions = async () => {
      if (!currentWord) return;

      setIsLoading(true);
      setIsAnswered(false);
      setSelectedOptionId(null);

      // Reseta as animações para a nova palavra
      translateX.value = 0;
      opacity.value = withTiming(1, { duration: 300 });

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
  }, [currentWord, deckId, fetchDistractorWords, translateX, opacity]);

  const handleAnswer = (option: Word) => {
    if (isAnswered || !currentWord) return;

    const isCorrect = option.id === currentWord.id;
    setIsAnswered(true);
    setSelectedOptionId(option.id);

    // Infer quality: 4 for correct (good), 1 for incorrect.
    const quality = isCorrect ? 4 : 1;
    recordAnswer(currentWord.id, quality);

    if (isCorrect) {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Success
      );
      soundService.playSound(soundService.SoundType.Correct);
    } else {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Error
      );
      soundService.playSound(soundService.SoundType.Incorrect);
    }

    // Adiciona um delay para o utilizador ver o feedback antes de avançar.
    setTimeout(() => {
      // Anima a saída do cartão, sempre para a esquerda
      const slideDirection = -500;
      opacity.value = withTiming(0, { duration: 300 });
      translateX.value = withTiming(
        slideDirection,
        { duration: 400 },
        (finished) => {
          if (finished) {
            runOnJS(nextWord)();
          }
        }
      );
    }, 1200); // 1.2 segundos de delay
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

  const getCategoryColors = (categoryName: string) => {
    const key = categoryName as keyof typeof theme.colors.category;
    const defaultKey = "Outro" as keyof typeof theme.colors.category;

    return {
      background:
        theme.colors.categoryLighter[key] ||
        theme.colors.categoryLighter[defaultKey],
      text:
        theme.colors.categoryDarker[key] ||
        theme.colors.categoryDarker[defaultKey],
    };
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

  const categoryColors = getCategoryColors(currentWord.category);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.questionContainer}>
        <AppText style={styles.questionLabel}>Qual o significado de:</AppText>
        <AppText variant="bold" style={styles.wordText}>
          {currentWord.name}
        </AppText>
        <View
          style={[
            styles.categoryContainer,
            { backgroundColor: categoryColors.background },
          ]}
        >
          <AppText
            style={[styles.categoryText, { color: categoryColors.text }]}
          >
            {currentWord.category}
          </AppText>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getButtonStyle(option.id)}
            activeOpacity={0.8}
            onPress={() => handleAnswer(option)}
            disabled={isAnswered}
          >
            <AppText style={styles.optionText}>{option.meaning}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
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
    // A sombra foi removida para evitar artefactos visuais durante a animação de deslize.
    // Em vez disso, usamos uma borda um pouco mais visível para dar profundidade.
    borderWidth: 2,
    borderColor: theme.colors.border, // Usamos a borda padrão para consistência
  },
  questionLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  wordText: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    marginTop: 16, // Espaço entre o rótulo e a palavra
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    marginTop: 32, // Reduz a margem para aproximar as opções
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 16, // Espaço entre a palavra e a categoria
  },
  categoryText: {
    fontSize: 10, // Tamanho de fonte menor para a categoria
    fontFamily: theme.fonts.bold,
    textTransform: "uppercase",
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
