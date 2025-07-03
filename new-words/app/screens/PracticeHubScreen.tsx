import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useWordStore } from "@/stores/wordStore";

import { useAlertStore } from "@/stores/useAlertStore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PracticeStackParamList } from "../../types/navigation";

import AppText from "../components/AppText";
import { theme } from "../theme";

type Props = NativeStackScreenProps<PracticeStackParamList, "PracticeHub">;

export default function PracticeHubScreen({ navigation }: Props) {
  const { fetchUrgentWordCount, fetchWrongWordsCount, fetchWrongWords } =
    useWordStore.getState();
  const urgentWordsCount = useWordStore((state) => state.urgentWordsCount);
  const wrongWordsCount = useWordStore((state) => state.wrongWordsCount);
  const loading = useWordStore((state) => state.loading);
  const { showAlert } = useAlertStore.getState();

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
      showAlert({
        title: "Tudo certo!",
        message: "Não há palavras erradas para rever.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      // Atualiza a contagem caso tenha sido corrigido noutro local
      fetchWrongWordsCount();
    }
  }, [navigation, fetchWrongWords, fetchWrongWordsCount]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText variant="bold" style={styles.loadingText}>
          A verificar o seu progresso...
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Centro de Prática
        </AppText>
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
              {
                color:
                  urgentWordsCount > 0
                    ? theme.colors.surface
                    : theme.colors.success,
              },
            ]}
          />
          <View style={styles.statusTextContainer}>
            <AppText
              variant="bold"
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
            </AppText>
            <AppText
              style={[
                styles.statusDescription,
                urgentWordsCount === 0 && styles.allClearDescription,
              ]}
            >
              {urgentWordsCount > 0
                ? "Toque aqui para começar a revisão."
                : "Toque para iniciar uma prática livre."}
            </AppText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              urgentWordsCount > 0 ? theme.colors.surface : theme.colors.success
            }
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
              style={[styles.statusIcon, { color: theme.colors.surface }]}
            />
            <View style={styles.statusTextContainer}>
              <AppText variant="bold" style={styles.statusTitle}>
                {wrongWordsCount} {wrongWordsCount > 1 ? "palavras" : "palavra"}{" "}
                a corrigir
              </AppText>
              <AppText style={styles.statusDescription}>
                Pratique as palavras que errou da última vez.
              </AppText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.surface}
            />
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
          <AppText variant="bold" style={styles.modeTitle}>
            Revisão Clássica
          </AppText>
          <AppText style={styles.modeDescription}>
            Flashcards simples: veja a palavra, adivinhe o significado.
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color={theme.colors.textMuted}
        />
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
          <AppText variant="bold" style={styles.modeTitle}>
            Escolha Múltipla
          </AppText>
          <AppText style={styles.modeDescription}>
            Escolha o significado correto entre 4 opções.
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() =>
          handleStartGame("writing", urgentWordsCount > 0 ? "urgent" : "free")
        }
      >
        <Ionicons name="pencil-outline" size={28} style={styles.modeIcon} />
        <View style={styles.modeTextContainer}>
          <AppText variant="bold" style={styles.modeTitle}>
            Jogo da Escrita
          </AppText>
          <AppText style={styles.modeDescription}>
            Nós mostramos o significado, você escreve a palavra.
          </AppText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={22}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
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
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
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
    backgroundColor: theme.colors.danger,
  },
  statusCardWrong: {
    backgroundColor: theme.colors.challenge,
  },
  statusCardAllClear: {
    backgroundColor: theme.colors.successLight,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
  },
  statusIcon: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.surface,
  },
  allClearTitle: {
    color: theme.colors.successDark,
  },
  statusDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.dangerLight,
    marginTop: 4,
  },
  allClearDescription: {
    color: theme.colors.successMedium,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeIcon: {
    color: theme.colors.primary,
    marginRight: 20,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.border,
  },
  disabledIcon: {
    color: theme.colors.textMuted,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  loadingText: {
    marginTop: 20,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});
