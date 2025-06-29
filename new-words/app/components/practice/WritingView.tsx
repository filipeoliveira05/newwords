import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import { usePracticeStore } from "@/stores/usePracticeStore";

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
    if (feedback === "correct") return "#10b981";
    if (feedback === "incorrect") return "#ef4444";
    return "#ced4da";
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionHint}>Significado:</Text>
        <Text style={styles.questionText}>{currentWord.meaning}</Text>
      </View>

      <View style={styles.answerContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { borderColor: getInputBorderColor() }]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Escreva a palavra..."
          placeholderTextColor="#adb5bd"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleCheckAnswer}
          editable={!feedback}
        />
        {feedback === "incorrect" && (
          <Text style={styles.correctAnswerText}>
            A resposta correta é: {currentWord.name}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, feedback ? styles.disabledButton : {}]}
        onPress={handleCheckAnswer}
        disabled={!!feedback}
      >
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>
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
  questionHint: { fontSize: 16, color: "#adb5bd", marginBottom: 8 },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
  },
  answerContainer: { width: "100%", marginBottom: 24 },
  input: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 18,
    textAlign: "center",
    color: "#212529",
  },
  correctAnswerText: {
    marginTop: 12,
    fontSize: 16,
    color: "#10b981",
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#adb5bd" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
