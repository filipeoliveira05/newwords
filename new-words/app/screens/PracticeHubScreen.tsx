import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWordStore } from "@/stores/wordStore";
import { Word } from "@/types/database";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PracticeStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<PracticeStackParamList, "PracticeHub">;

export default function PracticeHubScreen({ navigation }: Props) {
  const fetchAllWords = useWordStore((state) => state.fetchAllWords);
  const allWordsCache = useWordStore((state) => state.words);
  const loading = useWordStore((state) => state.loading);

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  const handleStartGame = useCallback(
    (mode: "flashcard" | "multiple-choice" | "writing") => {
      navigation.navigate("PracticeGame", {
        mode: mode, // deckId é undefined, então praticará tudo
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
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Prática</Text>
        <Text style={styles.subtitle}>
          Escolha um modo de jogo para treinar todas as suas palavras.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => handleStartGame("flashcard")}
      >
        <Ionicons name="albums-outline" size={28} style={styles.modeIcon} />
        <View style={styles.modeTextContainer}>
          <Text style={styles.modeTitle}>Revisão Clássica</Text>
          <Text style={styles.modeDescription}>
            Flashcards simples: veja a palavra, adivinhe o significado.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#adb5bd" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => handleStartGame("multiple-choice")}
      >
        <Ionicons name="list-outline" size={28} style={styles.modeIcon} />
        <View style={styles.modeTextContainer}>
          <Text style={styles.modeTitle}>Escolha Múltipla</Text>
          <Text style={styles.modeDescription}>
            Escolha o significado correto entre 4 opções.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#adb5bd" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => handleStartGame("writing")}
      >
        <Ionicons name="pencil-outline" size={28} style={styles.modeIcon} />
        <View style={styles.modeTextContainer}>
          <Text style={styles.modeTitle}>Jogo da Escrita</Text>
          <Text style={styles.modeDescription}>
            Nós mostramos o significado, você escreve a palavra.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#adb5bd" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  modeIcon: {
    color: "#4F8EF7",
    marginRight: 20,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: "#6c757d",
  },
  disabledButton: {
    backgroundColor: "#e9ecef",
    borderColor: "#dee2e6",
  },
  disabledIcon: {
    color: "#adb5bd",
  },
  disabledText: {
    color: "#adb5bd",
  },
});
