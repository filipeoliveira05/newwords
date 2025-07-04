import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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
import { theme } from "../../config/theme";

type Props = NativeStackScreenProps<PracticeStackParamList, "PracticeHub">;

export default function PracticeHubScreen({ navigation }: Props) {
  const {
    fetchUrgentWordCount,
    fetchWrongWordsCount,
    fetchWrongWords,
    fetchFavoriteWordsCount,
    fetchFavoriteWords,
  } = useWordStore.getState();
  const urgentWordsCount = useWordStore((state) => state.urgentWordsCount);
  const wrongWordsCount = useWordStore((state) => state.wrongWordsCount);
  const favoriteWordsCount = useWordStore((state) => state.favoriteWordsCount);
  const loading = useWordStore((state) => state.loading);
  const { showAlert } = useAlertStore.getState();

  useFocusEffect(
    useCallback(() => {
      fetchUrgentWordCount();
      fetchWrongWordsCount();
      fetchFavoriteWordsCount();
    }, [fetchUrgentWordCount, fetchWrongWordsCount, fetchFavoriteWordsCount])
  );

  const handleStartGame = useCallback(
    (
      mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists",
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

  const handleStartFavoritePractice = useCallback(async () => {
    const wordsToPractice = await fetchFavoriteWords();
    if (wordsToPractice.length > 0) {
      navigation.navigate("PracticeGame", {
        mode: "flashcard", // Flashcard seems good for favorites
        sessionType: "free",
        words: wordsToPractice,
      });
    } else {
      showAlert({
        title: "Sem favoritos",
        message: "Ainda não marcou nenhuma palavra como favorita.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      // Atualiza a contagem caso tenha sido corrigido noutro local
      fetchFavoriteWordsCount();
    }
  }, [navigation, fetchFavoriteWords, fetchFavoriteWordsCount]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Centro de Prática
        </AppText>
      </View>

      {/* Secção de Revisão Focada */}
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Revisão Focada
        </AppText>

        {urgentWordsCount === 0 &&
          wrongWordsCount === 0 &&
          favoriteWordsCount === 0 && (
            <View style={styles.placeholderContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={28}
                color={theme.colors.success}
              />
              <AppText style={styles.placeholderText}>
                Nenhuma revisão pendente. Bom trabalho!
              </AppText>
            </View>
          )}

        {urgentWordsCount > 0 && (
          <TouchableOpacity
            style={[styles.statusCard, styles.statusCardUrgent]}
            onPress={() => handleStartGame("flashcard", "urgent")}
            activeOpacity={0.8}
          >
            <View style={styles.statusContent}>
              <Ionicons
                name="flame-outline"
                size={32}
                style={[styles.statusIcon, { color: theme.colors.surface }]}
              />
              <View style={styles.statusTextContainer}>
                <AppText variant="bold" style={styles.statusTitle}>
                  Revisão Urgente
                </AppText>
                <AppText style={styles.statusDescription}>
                  {urgentWordsCount}{" "}
                  {urgentWordsCount > 1 ? "palavras" : "palavra"} para rever
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
                  Corrigir Erros
                </AppText>
                <AppText style={styles.statusDescriptionOnColor}>
                  {wrongWordsCount}{" "}
                  {wrongWordsCount > 1 ? "palavras" : "palavra"} que errou
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

        {favoriteWordsCount > 0 && (
          <TouchableOpacity
            style={[styles.statusCard, styles.statusCardFavorite]}
            onPress={handleStartFavoritePractice}
            activeOpacity={0.8}
          >
            <View style={styles.statusContent}>
              <Ionicons
                name="star-outline"
                size={32}
                style={[styles.statusIcon, { color: theme.colors.surface }]}
              />
              <View style={styles.statusTextContainer}>
                <AppText variant="bold" style={styles.statusTitle}>
                  Praticar Favoritos
                </AppText>
                <AppText style={styles.statusDescriptionOnColor}>
                  {favoriteWordsCount}{" "}
                  {favoriteWordsCount > 1 ? "palavras" : "palavra"} marcada
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
      </View>

      {/* Secção de Prática Livre */}
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Prática Livre
        </AppText>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() =>
            handleStartGame(
              "flashcard",
              urgentWordsCount > 0 ? "urgent" : "free"
            )
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

        <TouchableOpacity
          style={styles.modeButton}
          onPress={() =>
            handleStartGame(
              "combine-lists",
              urgentWordsCount > 0 ? "urgent" : "free"
            )
          }
        >
          <Ionicons
            name="git-compare-outline"
            size={28}
            style={styles.modeIcon}
          />
          <View style={styles.modeTextContainer}>
            <AppText variant="bold" style={styles.modeTitle}>
              Combinar Listas
            </AppText>
            <AppText style={styles.modeDescription}>
              Combine as palavras com os seus significados.
            </AppText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    marginBottom: 16,
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
  statusCardFavorite: {
    backgroundColor: theme.colors.gold,
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.surface,
  },
  statusDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.dangerLight,
  },
  statusDescriptionOnColor: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.surface,
    opacity: 0.9,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: 16,
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
  loadingText: {
    marginTop: 20,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  placeholderText: {
    marginLeft: 12,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
    flex: 1,
  },
});
