import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePracticeStore } from "@/stores/usePracticeStore";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

export default function WritingView() {
  // --- Store State and Actions ---
  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const { recordAnswer, nextWord } = usePracticeStore.getState();

  // --- Component State ---
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedAnswer, setRevealedAnswer] = useState("");
  const inputRef = useRef<TextInput>(null);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // --- Effects ---
  useEffect(() => {
    if (!currentWord) return;
    // Reset state for the new word
    setAnswer("");
    setFeedback(null);

    // Reset animation
    translateX.value = 0;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });

    // Reset hints
    setHintsUsed(0);
    setRevealedAnswer("_ ".repeat(currentWord.name.length).trim());

    // Focus the input automatically for a smoother experience
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [currentWord, translateX, opacity]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  // --- Handlers ---
  const handleCheckAnswer = () => {
    if (feedback || !currentWord) return; // Already answered

    Keyboard.dismiss();

    const perfectMatch = answer.trim() === currentWord.name;
    const caseInsensitiveMatch =
      !perfectMatch &&
      answer.trim().toLowerCase() === currentWord.name.toLowerCase();

    // Infer quality based on the type of match and hints used
    let quality = 1; // Default to incorrect
    if (perfectMatch || caseInsensitiveMatch) {
      const baseQuality = perfectMatch ? 5 : 4;
      quality = Math.max(3, baseQuality - hintsUsed); // Correct answer quality is at least 3
    }
    const isCorrect = quality >= 3;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setFeedback(isCorrect ? "correct" : "incorrect");

    recordAnswer(currentWord.id, quality);

    // Wait for a moment to show feedback, then move to the next word
    setTimeout(
      () => {
        const slideDirection = -500; // Slide to the left
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
      },
      isCorrect ? 1200 : 2500
    ); // Give more time to see the correct answer if wrong
  };

  const handleHint = () => {
    if (!currentWord || feedback) return;

    const newHintsUsed = hintsUsed + 1;
    if (newHintsUsed > currentWord.name.length) return; // No more hints to give

    setHintsUsed(newHintsUsed);

    // Reveal letters
    const revealed = currentWord.name
      .split("")
      .map((char, index) => (index < newHintsUsed ? char : "_"))
      .join(" "); // Add spaces for better readability

    setRevealedAnswer(revealed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // --- Render ---
  if (!currentWord) {
    return null;
  }

  const getInputBorderColor = () => {
    if (feedback === "correct") return theme.colors.success;
    if (feedback === "incorrect") return theme.colors.danger;
    return theme.colors.border;
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

  const categoryColors = getCategoryColors(currentWord.category);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.questionContainer}>
        <AppText style={styles.questionHint}>Significado:</AppText>
        <AppText variant="bold" style={styles.questionText}>
          {currentWord.meaning}
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

      {hintsUsed > 0 && (
        <View style={styles.hintContainer}>
          <AppText style={styles.hintText}>{revealedAnswer}</AppText>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.hintButton,
          (feedback || hintsUsed >= currentWord.name.length) &&
            styles.disabledButton,
        ]}
        onPress={handleHint}
        disabled={!!feedback || hintsUsed >= currentWord.name.length}
      >
        <Ionicons name="bulb-outline" size={20} color={theme.colors.surface} />
        <AppText variant="bold" style={styles.hintButtonText}>
          Dica
        </AppText>
      </TouchableOpacity>

      <View style={styles.answerContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { borderColor: getInputBorderColor() }]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Escreva a palavra..."
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleCheckAnswer}
          editable={!feedback}
        />
        {feedback === "incorrect" && (
          <AppText variant="bold" style={styles.correctAnswerText}>
            A resposta correta é: {currentWord.name}
          </AppText>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, feedback ? styles.disabledButton : {}]}
        onPress={handleCheckAnswer}
        disabled={!!feedback}
      >
        <AppText variant="bold" style={styles.buttonText}>
          Verificar
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: "90%", alignItems: "center", maxWidth: 400 },
  questionContainer: {
    backgroundColor: theme.colors.surface,
    width: "100%",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
    // A sombra foi removida para evitar artefactos visuais durante a animação de deslize.
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  questionHint: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    marginBottom: 20,
  },
  questionText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 12, // Espaço entre o significado e a categoria
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    textTransform: "uppercase",
  },
  answerContainer: { width: "100%", marginTop: 24, marginBottom: 24 },
  input: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: theme.fontSizes.lg,
    textAlign: "center",
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  correctAnswerText: {
    marginTop: 12,
    fontSize: theme.fontSizes.base,
    color: theme.colors.success,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
  },
  hintContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  hintText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
    letterSpacing: 4, // Spread out the letters and underscores
    textAlign: "center",
    fontFamily: theme.fonts.bold,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.challenge,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  hintButtonText: {
    color: theme.colors.surface,
    marginLeft: 8,
  },
});
