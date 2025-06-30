import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useWordStore } from "@/stores/wordStore";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PracticeStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<PracticeStackParamList, "PracticeHub">;

export default function PracticeHubScreen({ navigation }: Props) {
  const { fetchUrgentWordCount, fetchWrongWordsCount, fetchWrongWords } =
    useWordStore.getState();
  const urgentWordsCount = useWordStore((state) => state.urgentWordsCount);
  const wrongWordsCount = useWordStore((state) => state.wrongWordsCount);
  const loading = useWordStore((state) => state.loading);

  useFocusEffect(
    useCallback(() => {
      fetchUrgentWordCount();
      fetchWrongWordsCount();
    }, [fetchUrgentWordCount, fetchWrongWordsCount])
  );

  const handleStartGame = useCallback(
    (
      mode: "flashcard" | "multiple-choice" | "writing",
      sessionType: "urgent" | "free"
    ) => {
      navigation.navigate("PracticeGame", {
        mode: mode,
        sessionType: sessionType,
        // deckId é undefined, então praticará tudo
      });
    },
    [navigation]
  );

  const handleStartWrongPractice = useCallback(async () => {
    const wordsToPractice = await fetchWrongWords();
    if (wordsToPractice.length > 0) {
      navigation.navigate("PracticeGame", {
        mode: "multiple-choice", // Um bom modo para focar em erros
        sessionType: "free", // Sessões de palavras específicas são 'free'
        words: wordsToPractice,
      });
    } else {
      Alert.alert("Tudo certo!", "Não há palavras erradas para rever.");
      // Atualiza a contagem caso tenha sido corrigido noutro local
      fetchWrongWordsCount();
    }
  }, [navigation, fetchWrongWords, fetchWrongWordsCount]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>A verificar o seu progresso...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Prática</Text>
      </View>

      {/* Cartão de Estado da Prática */}
      <TouchableOpacity
        style={[
          styles.statusCard,
          urgentWordsCount > 0
            ? styles.statusCardUrgent
            : styles.statusCardAllClear,
        ]}
        onPress={() =>
          handleStartGame("flashcard", urgentWordsCount > 0 ? "urgent" : "free")
        }
        activeOpacity={0.8}
      >
        <View style={styles.statusContent}>
          <Ionicons
            name={
              urgentWordsCount > 0
                ? "flame-outline"
                : "checkmark-circle-outline"
            }
            size={32}
            style={[
              styles.statusIcon,
              { color: urgentWordsCount > 0 ? "#fff" : "#2a9d8f" },
            ]}
          />
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                urgentWordsCount === 0 && styles.allClearTitle,
              ]}
            >
              {urgentWordsCount > 0
                ? `Você tem ${urgentWordsCount} ${
                    urgentWordsCount > 1 ? "palavras" : "palavra"
                  } para rever!`
                : "Tudo em dia!"}
            </Text>
            <Text
              style={[
                styles.statusDescription,
                urgentWordsCount === 0 && styles.allClearDescription,
              ]}
            >
              {urgentWordsCount > 0
                ? "Toque aqui para começar a revisão."
                : "Toque para iniciar uma prática livre."}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={urgentWordsCount > 0 ? "#fff" : "#2a9d8f"}
          />
        </View>
      </TouchableOpacity>

      {/* Cartão de Palavras Erradas */}
      {wrongWordsCount > 0 && (
        <TouchableOpacity
          style={[styles.statusCard, styles.statusCardWrong]}
          onPress={handleStartWrongPractice}
          activeOpacity={0.8}
        >
          <View style={styles.statusContent}>
            <Ionicons
              name="bonfire-outline"
              size={32}
              style={[styles.statusIcon, { color: "#fff" }]}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {wrongWordsCount} {wrongWordsCount > 1 ? "palavras" : "palavra"}{" "}
                a rever
              </Text>
              <Text style={styles.statusDescription}>
                Pratique as palavras que errou da última vez.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() =>
          handleStartGame("flashcard", urgentWordsCount > 0 ? "urgent" : "free")
        }
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
        onPress={() =>
          handleStartGame(
            "multiple-choice",
            urgentWordsCount > 0 ? "urgent" : "free"
          )
        }
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
        onPress={() =>
          handleStartGame("writing", urgentWordsCount > 0 ? "urgent" : "free")
        }
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
  },
  statusCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  statusCardUrgent: {
    backgroundColor: "#e76f51",
  },
  statusCardWrong: {
    backgroundColor: "#f4a261", // Cor de "desafio"
  },
  statusCardAllClear: {
    backgroundColor: "#e0f2f1",
    borderWidth: 1,
    borderColor: "#b2dfdb",
  },
  statusIcon: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  allClearTitle: {
    color: "#004d40", // A dark, readable green
  },
  statusDescription: {
    fontSize: 14,
    color: "#ffe8e1",
    marginTop: 4,
  },
  allClearDescription: {
    color: "#00796b", // A medium, readable green
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
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a4e69",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6c757d",
  },
});
