import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useWordStore } from "@/stores/wordStore";
import { Word } from "@/types/database";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PracticeStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<PracticeStackParamList, "PracticeHub">;

export default function PracticeHubScreen({ navigation }: Props) {
  const fetchAllWords = useWordStore((state) => state.fetchAllWords);
  const allWordsCache = useWordStore((state) => state.words);
  const loading = useWordStore((state) => state.loading);

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  const handleStartGame = useCallback(
    (mode: "flashcard" | "multiple-choice") => {
      const allWords: Word[] = Object.values(allWordsCache).flat();

      if (allWords.length < 4) {
        Alert.alert(
          "Poucas Palavras",
          "Precisa de ter pelo menos 4 palavras no total (em todos os baralhos) para jogar. Adicione mais algumas e volte!"
        );
        return;
      }

      navigation.navigate("PracticeGame", {
        mode: mode,
        words: allWords,
      });
    },
    [navigation, allWordsCache]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={{ marginTop: 10 }}>A carregar palavras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Centro de Prática</Text>
      <Text style={styles.subtitle}>
        Escolha um mini-jogo para treinar todas as suas palavras.
      </Text>

      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => handleStartGame("flashcard")}
      >
        <Text style={styles.gameButtonText}>Revisão Clássica</Text>
        <Text style={styles.gameButtonDescription}>
          Flashcards simples: veja a palavra, adivinhe o significado.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => handleStartGame("multiple-choice")}
      >
        <Text style={styles.gameButtonText}>Escolha Múltipla</Text>
        <Text style={styles.gameButtonDescription}>
          Mostramos uma palavra, você escolhe o significado correto entre 4
          opções.
        </Text>
      </TouchableOpacity>

      {/* Placeholder para o futuro */}
      <View style={[styles.gameButton, styles.disabledButton]}>
        <Text style={styles.gameButtonText}>Jogo da Escrita (Em breve)</Text>
        <Text style={styles.gameButtonDescription}>
          Nós mostramos o significado, você escreve a palavra.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    paddingTop: 60,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 40,
  },
  gameButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#e9ecef",
    opacity: 0.6,
  },
  gameButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F8EF7",
    marginBottom: 4,
  },
  gameButtonDescription: {
    fontSize: 14,
    color: "#666",
  },
});
