import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePracticeStore } from "@/stores/usePracticeStore";

export default function FlashcardView() {
  // Estado interno do componente para controlar a UI
  const [isFlipped, setIsFlipped] = useState(false);

  // Seleciona a palavra atual e as ações da store
  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const { recordAnswer, nextWord } = usePracticeStore.getState();

  // Efeito para virar o cartão de volta sempre que uma nova palavra aparecer
  useEffect(() => {
    setIsFlipped(false);
  }, [currentWord]);

  // Se por alguma razão não houver palavra, não renderiza nada
  if (!currentWord) {
    return null;
  }

  const handleReveal = () => {
    setIsFlipped(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    recordAnswer(currentWord.id, isCorrect);
    nextWord();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={handleReveal}
        disabled={isFlipped} // Desativa o toque depois de virar
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {isFlipped ? "Significado" : "Palavra"}
          </Text>
          <Text style={styles.cardText}>
            {isFlipped ? currentWord.meaning : currentWord.name}
          </Text>
        </View>
        {!isFlipped && <Text style={styles.cardHint}>Toque para virar</Text>}
      </TouchableOpacity>

      {/* Os botões de resposta só aparecem depois de o cartão ser virado */}
      {isFlipped && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.incorrectButton]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.buttonText}>Errei</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.correctButton]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>Acertei!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignItems: "center",
    maxWidth: 400,
  },

  card: {
    width: "100%",
    height: 320,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  cardContent: {
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#adb5bd",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  cardText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
  },

  cardHint: {
    position: "absolute",
    bottom: 20,
    fontSize: 14,
    color: "#ced4da",
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 40,
    width: "100%",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  incorrectButton: {
    backgroundColor: "#ff4d6d",
  },

  correctButton: {
    backgroundColor: "#2a9d8f",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
