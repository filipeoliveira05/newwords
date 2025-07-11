import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import AppText from "../../components/AppText";
import { useDeckStore } from "../../../stores/deckStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import DeckOverview from "../../components/DeckOverview";
import { seedDatabase } from "../../../services/seeder";
import { theme } from "../../../config/theme";
import { DecksStackParamList } from "../../../types/navigation";
import Icon from "../../components/Icon";

type Props = NativeStackScreenProps<DecksStackParamList, "DecksList">;

export default function DecksScreen({ navigation }: Props) {
  const { decks, loading, fetchDecks, deleteDeck } = useDeckStore();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);
  const { showAlert } = useAlertStore.getState();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      Toast.show({
        type: "success",
        text1: "Dados de teste carregados!",
      });
    } catch (error) {
      console.error("Falha ao carregar os dados de teste.", error);
      showAlert({
        title: "Erro",
        message: "Não foi possível carregar os dados de teste.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText style={{ marginTop: 8 }}>A carregar conjuntos...</AppText>
      </View>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="fileTrayStacked" size={80} color={theme.colors.iconMuted} />
        <AppText variant="bold" style={styles.emptyTitle}>
          Nenhum conjunto encontrado
        </AppText>
        <AppText style={styles.emptySubtitle}>
          Comece por criar o seu primeiro conjunto de palavras.
        </AppText>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("AddOrEditDeck", {})}
        >
          <Icon name="add" size={20} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.emptyButtonText}>
            Criar Primeiro Conjunto
          </AppText>
        </TouchableOpacity>
        {/* Botão para carregar dados de teste, apenas em modo de desenvolvimento */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.seedButtonEmptyState}
            onPress={handleSeedData}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Icon name="leaf" size={18} color={theme.colors.primary} />
                <AppText style={styles.seedButtonText}>
                  Carregar dados de teste
                </AppText>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Meus Conjuntos
        </AppText>
        <AppText style={styles.subtitle}>
          Continue a sua jornada de aprendizagem.
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {decks.map((deck) => (
          <DeckOverview
            key={deck.id}
            title={deck.title}
            author={deck.author}
            totalWords={deck.wordCount}
            masteredWords={deck.masteredCount}
            onPress={() =>
              navigation.navigate("DeckDetail", {
                deckId: deck.id,
                title: deck.title,
                author: deck.author,
              })
            }
            onEdit={() =>
              navigation.navigate("AddOrEditDeck", { deckId: deck.id })
            }
            onAddWord={() =>
              navigation.navigate("DeckDetail", {
                deckId: deck.id,
                title: deck.title,
                author: deck.author,
                openAddWordModal: true,
              })
            }
            onDelete={() => {
              showAlert({
                title: "Apagar conjunto",
                message: "Tens a certeza que queres apagar este conjunto?",
                buttons: [
                  { text: "Cancelar", style: "cancel", onPress: () => {} },
                  {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteDeck(deck.id);
                      } catch (error) {
                        console.error("Falha ao apagar o conjunto:", error);
                        showAlert({
                          title: "Erro",
                          message:
                            "Não foi possível apagar o conjunto. Tente novamente.",
                          buttons: [{ text: "OK", onPress: () => {} }],
                        });
                      }
                    },
                  },
                ],
              });
            }}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddOrEditDeck", {})}
      >
        <Icon name="add" size={32} color={theme.colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for the FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.base,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  seedButtonEmptyState: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 8,
  },
  seedButtonText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.medium,
  },
});
