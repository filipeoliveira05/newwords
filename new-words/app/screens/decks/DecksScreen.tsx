import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Image,
} from "react-native";
import Animated, { ZoomOut, LinearTransition } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

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
  const {
    decks: allDecks,
    loading,
    fetchDecks,
    deleteDeck,
    deleteDecks,
  } = useDeckStore();
  // Estado para suprimir o ecrã de loading global durante operações em lote (apagar/adicionar múltiplos),
  // permitindo que as animações da lista sejam visíveis.
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const sortBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(
    new Set()
  );
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const sortScrollViewRef = useRef<ScrollView>(null);

  const { sortedDecks, sortConfig, setSortConfig } = useDeckSorting(allDecks);
  const decks = sortedDecks;

  const isSelectionMode = selectedDeckIds.size > 0;

  const { showAlert } = useAlertStore.getState();

  const handleCancelSelection = useCallback(() => {
    setSelectedDeckIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    showAlert({
      title: `Apagar ${selectedDeckIds.size} ${
        selectedDeckIds.size === 1 ? "conjunto" : "conjuntos"
      }`,
      message: "Esta ação é irreversível. Tem a certeza?",
      buttons: [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            setIsBatchProcessing(true);
            try {
              // Usa a nova função otimizada para apagar em lote.
              await deleteDecks(Array.from(selectedDeckIds));
              handleCancelSelection();
            } catch (error) {
              console.error("Falha ao apagar conjuntos em lote:", error);
            } finally {
              setIsBatchProcessing(false);
            }
          },
        },
      ],
    });
  }, [selectedDeckIds, showAlert, deleteDecks, handleCancelSelection]);

  useLayoutEffect(() => {
    if (isSelectionMode) {
      navigation.setOptions({
        title: `${selectedDeckIds.size} ${
          selectedDeckIds.size === 1 ? "selecionado" : "selecionados"
        }`,
        headerTitleAlign: "center",
        headerLeft: () => (
          // Substituído o texto "Cancelar" por um ícone para um layout mais limpo e simétrico.
          // Isto resolve o problema do título não ficar perfeitamente centrado.
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCancelSelection}
          >
            <Icon name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDeleteSelected}
            disabled={selectedDeckIds.size === 0}
          >
            <Icon
              name="trash"
              size={24}
              color={
                selectedDeckIds.size === 0
                  ? theme.colors.iconMuted
                  : theme.colors.danger
              }
            />
          </TouchableOpacity>
        ),
        headerBackVisible: false,
        headerTitleStyle: {
          fontFamily: theme.fonts.bold,
          fontSize: theme.fontSizes["2xl"],
        },
      });
    } else {
      // Reset to original header
      navigation.setOptions({
        title: "Meus Conjuntos",
        headerLeft: undefined,
        headerBackVisible: true,
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
            <TouchableOpacity // Aplicado o mesmo estilo para consistência
              style={styles.headerButton}
              activeOpacity={0.8}
              onPress={() => sortBottomSheetRef.current?.present()}
            >
              <Icon
                name="swapVertical"
                size={24}
                color={theme.colors.textMedium}
              />
            </TouchableOpacity>
          ) : null,
      });
    }
  }, [
    navigation,
    isSelectionMode,
    selectedDeckIds,
    allDecks.length,
    handleCancelSelection,
    handleDeleteSelected,
  ]);

  // Efeito para intercetar o botão de "voltar" do Android.
  // Se estiver em modo de seleção, o botão deve cancelar a seleção em vez de sair do ecrã.
  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        handleCancelSelection(); // Cancela a seleção
        return true; // Impede a ação padrão (voltar para o ecrã anterior)
      }
      // Se não estiver em modo de seleção, permite a ação padrão.
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Limpa o listener ao desmontar o componente
  }, [isSelectionMode, handleCancelSelection]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleSeedData = async () => {
    setIsBatchProcessing(true);
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
      setIsBatchProcessing(false);
    }
  };

  const handleLongPress = useCallback((deckId: string) => {
    setSelectedDeckIds((prev) => new Set(prev).add(deckId));
  }, []);

  const handlePress = useCallback(
    (deck: (typeof decks)[0]) => {
      // Se não estivermos em modo de seleção, a ação é navegar para os detalhes.
      if (!isSelectionMode) {
        navigation.navigate("DeckDetail", {
          deckId: deck.id,
          title: deck.title,
          author: deck.author,
        });
        return;
      }

      // Se estivermos em modo de seleção, usamos a forma funcional do setState
      // para garantir que operamos sobre o estado mais recente, evitando bugs.
      setSelectedDeckIds((currentIds) => {
        const newIds = new Set(currentIds);
        if (newIds.has(deck.id)) {
          newIds.delete(deck.id);
        } else {
          newIds.add(deck.id);
        }
        return newIds;
      });
    },
    [isSelectionMode, navigation] // Já não dependemos diretamente de `selectedDeckIds`
  );

  const handleSortSheetChange = useCallback((index: number) => {
    setIsSortSheetOpen(index >= 0);
  }, []);

  // Efeito para fazer scroll para a opção de ordenação ativa quando o modal abre.
  useEffect(() => {
    if (isSortSheetOpen && sortScrollViewRef.current) {
      // Usamos um timeout para garantir que o modal e a lista já foram renderizados
      setTimeout(() => {
        const activeSortIndex = deckSortOptions.findIndex(
          (option) =>
            option.criterion === sortConfig.criterion &&
            option.direction === option.direction
        );

        if (activeSortIndex > -1) {
          const ITEM_HEIGHT = 53; // Altura aproximada de cada item da lista (paddingVertical: 16 + fontSize: 18 + border: 1)
          // Calcula o offset para que a opção selecionada não fique colada ao topo.
          // Mostra o item anterior, se existir.
          const yOffset = Math.max(0, activeSortIndex - 1) * ITEM_HEIGHT;
          // O scroll é feito sem animação para que a posição seja instantânea.
          sortScrollViewRef.current?.scrollTo({ y: yOffset, animated: false });
        }
      }, 100);
    }
  }, [isSortSheetOpen, sortConfig]);

  const handleSortSelect = (config: SortConfig) => {
    setSortConfig(config);
    sortBottomSheetRef.current?.dismiss();
  };

  const snapPoints = useMemo(() => ["49%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  // Mostra o ecrã de loading global, a menos que uma operação em lote esteja em andamento.
  // Isto evita que o ecrã de loading cubra as animações de remoção de itens.
  if (loading && !isBatchProcessing) {
    return (
      <LoadingScreen visible={loading} loadingText="A carregar conjuntos..." />
    );
  }

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
          disabled={isBatchProcessing}
        >
          {isBatchProcessing ? (
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
          <Animated.View
            key={deck.id}
            layout={LinearTransition.duration(200)}
            exiting={ZoomOut.duration(150)}
          >
            <DeckOverview
              title={deck.title}
              author={deck.author}
              totalWords={deck.wordCount}
              masteredWords={deck.masteredCount}
              onPress={() => handlePress(deck)}
              onLongPress={() => handleLongPress(deck.id)}
              isSelected={selectedDeckIds.has(deck.id)}
              isSelectionMode={isSelectionMode}
              onAddWord={() =>
                navigation.navigate("DeckDetail", {
                  deckId: deck.id,
                  title: deck.title,
                  author: deck.author,
                  openAddWordModal: true,
                })
              }
              onEdit={() =>
                navigation.navigate("AddOrEditDeck", { deckId: deck.id })
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
          </Animated.View>
        ))}
      </ScrollView>
      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddOrEditDeck", {})}
        >
          <Icon name="add" size={32} color={theme.colors.surface} />
        </TouchableOpacity>
      )}

      {/* Bottom Sheet para Ordenação */}
      <BottomSheetModal
        ref={sortBottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.modalHandle}
        onChange={handleSortSheetChange}
      >
        <BottomSheetScrollView
          ref={sortScrollViewRef}
          contentContainerStyle={styles.bottomSheetContent}
        >
          <View style={styles.modalHeader}>
            <AppText variant="bold" style={styles.modalTitle}>
              Ordenar Por
            </AppText>
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={() => sortBottomSheetRef.current?.dismiss()}
            >
              <Icon name="close" size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          </View>
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
        </BottomSheetScrollView>
      </BottomSheetModal>
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
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: theme.colors.surface,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    // Estilo genérico para botões de ícone no cabeçalho para garantir espaçamento consistente.
    padding: 12,
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
