import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
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
  const inputRef = useRef<TextInput>(null);

  // --- Effects ---
  useEffect(() => {
    // Reset state for the new word
    setAnswer("");
    setFeedback(null);
    // Focus the input automatically for a smoother experience
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [currentWord]);

  // --- Handlers ---
  const handleCheckAnswer = () => {
    if (feedback || !currentWord) return; // Already answered

    Keyboard.dismiss();

    const isCorrect =
      answer.trim().toLowerCase() === currentWord.name.toLowerCase();

    if (isCorrect) {
      setFeedback("correct");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFeedback("incorrect");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    recordAnswer(currentWord.id, isCorrect);

    // Wait for a moment to show feedback, then move to the next word
    setTimeout(
      () => {
        nextWord();
      },
      isCorrect ? 1200 : 2500
    ); // Give more time to see the correct answer if wrong
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

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <AppText style={styles.questionHint}>Significado:</AppText>
        <AppText variant="bold" style={styles.questionText}>
          {currentWord.meaning}
        </AppText>
      </View>

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
    </View>
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
    marginBottom: 40,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  questionHint: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  questionText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  answerContainer: { width: "100%", marginBottom: 24 },
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
});
