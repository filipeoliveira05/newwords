import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import AppText from "../../components/AppText";
import { useDeckStore } from "../../../stores/deckStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import DeckOverview from "../../components/DeckOverview";
import { seedDatabase } from "../../../services/seeder";
import { theme } from "../../../config/theme";
import {
  useDeckSorting,
  deckSortOptions,
  SortConfig,
} from "../../../services/deckSorting";
import { DecksStackParamList } from "../../../types/navigation";
import Icon from "../../components/Icon";
import images from "../../../services/imageService";
import LoadingScreen from "../LoadingScreen";

type Props = NativeStackScreenProps<DecksStackParamList, "DecksList">;

export default function DecksScreen({ navigation }: Props) {
  const { decks: allDecks, loading, fetchDecks, deleteDeck } = useDeckStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const { sortedDecks, sortConfig, setSortConfig } = useDeckSorting(allDecks);
  const decks = sortedDecks;

  const { showAlert } = useAlertStore.getState();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Biblioteca",
      headerTintColor: theme.colors.text,
      headerRight: () =>
        allDecks.length > 0 ? (
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => setSortModalVisible(true)}
          >
            <Icon
              name="swapVertical"
              size={24}
              color={theme.colors.textMedium}
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, setSortModalVisible, allDecks.length]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

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
      <LoadingScreen visible={loading} loadingText="A carregar conjuntos..." />
    );
  }

  const handleSortSelect = (config: SortConfig) => {
    setSortConfig(config);
    setSortModalVisible(false);
  };

  if (!decks || decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image source={images.mascotSleepBook} style={styles.mascot} />
        <AppText variant="bold" style={styles.emptyTitle}>
          Nenhum conjunto encontrado
        </AppText>
        <AppText style={styles.emptySubtitle}>
          Comece por criar o seu primeiro conjunto de palavras.
        </AppText>
        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddOrEditDeck", {})}
        >
          <Icon name="add" size={20} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.emptyButtonText}>
            Criar Primeiro Conjunto
          </AppText>
        </TouchableOpacity>
        {/* Botão para carregar dados de teste */}
        <TouchableOpacity
          style={styles.seedButtonEmptyState}
          activeOpacity={0.8}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddOrEditDeck", {})}
      >
        <Icon name="add" size={32} color={theme.colors.surface} />
      </TouchableOpacity>

      {/* Sort Options Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSortModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                Ordenar Por
              </AppText>
              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.8}
                onPress={() => setSortModalVisible(false)}
              >
                <Icon name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {deckSortOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sortOptionButton}
                  activeOpacity={0.8}
                  onPress={() => handleSortSelect(option)}
                >
                  <AppText
                    style={[
                      styles.sortOptionText,
                      sortConfig.criterion === option.criterion &&
                        sortConfig.direction === option.direction &&
                        styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 6,
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
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.lg,
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
    fontSize: theme.fontSizes.xl,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: theme.fontSizes["2xl"],
  },
  closeButton: {
    padding: 8,
  },
  sortOptionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sortOptionText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
    textAlign: "center",
  },
  sortOptionTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
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
  mascot: {
    width: "90%", // Largura relativa para se adaptar melhor a diferentes ecrãs
    aspectRatio: 1, // Garante que a imagem mantém a sua proporção (1:1)
    height: undefined, // A altura será calculada com base na largura e na proporção
    resizeMode: "contain", // Garante que a imagem inteira é visível, sem cortes
    marginBottom: -30,
  },
});
