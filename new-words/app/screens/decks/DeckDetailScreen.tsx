import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useWordStore } from "../../../stores/wordStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { Word } from "../../../types/database";
import {
  DecksStackParamList,
  RootTabParamList,
} from "../../../types/navigation";
import WordOverview from "../../components/WordOverview";
import WordEditModal from "../../components/WordEditModal";
import AppText from "../../components/AppText";
import Icon from "../../components/Icon";
import { theme } from "../../../config/theme";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  useWordSorting,
  getDisplayDataForWord,
  sortOptions,
  SortConfig,
} from "../../../services/wordSorting";

// A constant empty array to use as a stable fallback in selectors, preventing infinite loops.
const EMPTY_ARRAY: number[] = [];

type Props = NativeStackScreenProps<DecksStackParamList, "DeckDetail">;

export default function DeckDetailScreen({ navigation, route }: Props) {
  const { deckId, title, author, openAddWordModal } = route.params;

  // Seletores otimizados para a nova estrutura de dados do wordStore.
  // 1. Selecionamos a lista de IDs para o deck atual. Esta lista só muda
  //    quando uma palavra é adicionada ou removida, evitando re-renderizações.
  const wordIdsForDeck = useWordStore(
    (state) => state.words.byDeckId[deckId] || EMPTY_ARRAY
  );
  // 2. Selecionamos o objeto que contém todas as palavras por ID.
  const allWordsById = useWordStore((state) => state.words.byId);

  // 3. Usamos `useMemo` para criar o array final de palavras. Este array só é
  //    recalculado se a lista de IDs ou os dados das palavras mudarem.
  const wordsForCurrentDeck = useMemo(() => {
    return wordIdsForDeck.map((id) => allWordsById[id]).filter(Boolean);
  }, [wordIdsForDeck, allWordsById]);

  const loading = useWordStore((state) => state.loading);
  const {
    fetchWordsOfDeck,
    addWord,
    updateWord,
    deleteWord,
    toggleFavoriteStatus,
  } = useWordStore.getState();
  const { showAlert } = useAlertStore.getState();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const practiceBottomSheetRef = useRef<BottomSheetModal>(null);
  const flatListRef = useRef<FlatList<Word>>(null);
  const sortScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // Atraso de 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredWords = useMemo(() => {
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      return wordsForCurrentDeck.filter(
        (word: Word) =>
          word.name.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
      );
    }
    return wordsForCurrentDeck;
  }, [wordsForCurrentDeck, debouncedQuery]);

  const { sortedWords, sortConfig, setSortConfig } =
    useWordSorting(filteredWords);

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingWord(null); // Garante que o modo de edição é resetado
  };

  useEffect(() => {
    if (deckId) {
      fetchWordsOfDeck(deckId);
    }
    if (openAddWordModal) {
      setEditingWord(null); // Garante que está em modo de adição
      setIsModalVisible(true);
    }
  }, [deckId, openAddWordModal, fetchWordsOfDeck]);

  // Efeito para fazer scroll para o topo quando a ordenação muda.
  // Isto é acionado sempre que o sortConfig é alterado.
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [sortConfig]);

  // Efeito para fazer scroll para a opção de ordenação ativa quando o modal abre.
  useEffect(() => {
    if (sortModalVisible && sortScrollViewRef.current) {
      // Usamos um timeout para garantir que o modal e a lista já foram renderizados
      setTimeout(() => {
        const activeSortIndex = sortOptions.findIndex(
          (option) =>
            option.criterion === sortConfig.criterion &&
            option.direction === sortConfig.direction
        );

        if (activeSortIndex > -1) {
          const ITEM_HEIGHT = 53; // Altura aproximada de cada item da lista
          // Calcula o offset para que a opção selecionada não fique colada ao topo.
          // Mostra o item anterior, se existir.
          const yOffset = Math.max(0, activeSortIndex - 1) * ITEM_HEIGHT;
          // O scroll é feito sem animação para que a posição seja instantânea.
          sortScrollViewRef.current?.scrollTo({ y: yOffset, animated: false });
        }
      }, 100);
    }
  }, [sortModalVisible, sortConfig]);

  useEffect(() => {
    navigation.setOptions({
      title: "", // Title is now in the custom header
      headerBackButtonDisplayMode: "minimal",
      headerStyle: {
        backgroundColor: "#f8fafc",
      },
      headerShadowVisible: false,
      headerTintColor: "#22223b",
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Icon
              name="swapVertical"
              size={24}
              color={theme.colors.textMedium}
            />
          </TouchableOpacity>
          {/* Futuramente, outros ícones (filtrar, editar, etc.) podem ser adicionados aqui */}
        </View>
      ),
    });
  }, [navigation]);

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setIsModalVisible(true);
  };

  const handleDeleteWord = (wordId: number) => {
    showAlert({
      title: "Apagar palavra",
      message: "Tens a certeza que queres apagar esta palavra?",
      buttons: [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWord(wordId);
            } catch (error) {
              console.error("Falha ao apagar a palavra:", error);
              showAlert({
                title: "Erro",
                message: "Não foi possível apagar a palavra.",
                buttons: [{ text: "OK", onPress: () => {} }],
              });
            }
          },
        },
      ],
    });
  };

  const handleToggleFavorite = async (wordId: number) => {
    try {
      // Chama a ação do store, que atualiza a DB e o estado global
      await toggleFavoriteStatus(wordId);
    } catch (error) {
      console.error("Falha ao alterar o estado de favorito:", error);
      showAlert({
        title: "Erro",
        message: "Não foi possível alterar o estado de favorito da palavra.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    }
  };

  const handleSaveWord = async (
    name: string,
    meaning: string,
    category: string | null
  ) => {
    if (!name.trim() || !meaning.trim()) {
      showAlert({
        title: "Erro",
        message: "Preenche a palavra e o significado.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingWord) {
        await updateWord(editingWord.id, name.trim(), meaning.trim(), category);
      } else {
        await addWord(deckId, name.trim(), meaning.trim(), category);
      }
      closeModal();
    } catch (error) {
      console.error("Falha ao guardar a palavra:", error);
      showAlert({
        title: "Erro",
        message: editingWord
          ? "Não foi possível editar a palavra."
          : "Não foi possível adicionar a palavra.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartPractice = (
    mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists"
  ) => {
    practiceBottomSheetRef.current?.dismiss(); // Fecha o BottomSheet

    // Use getParent() to access the parent Tab Navigator
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate("Practice", {
        // Navega para o separador de prática
        screen: "PracticeLoading", // Inicia o ecrã de carregamento
        params: {
          mode,
          deckId: deckId,
          sessionType: "free",
          origin: "DeckDetail",
        },
      });
  };

  const handleSortSelect = (config: SortConfig) => {
    setSortConfig(config);
    setSortModalVisible(false);
  };

  const practiceSnapPoints = useMemo(() => ["60%"], []);

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
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText style={styles.emptyText}>A carregar palavras...</AppText>
        </View>
      );
    }

    if (debouncedQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="searchCircle" size={60} color={theme.colors.iconMuted} />
          <AppText variant="bold" style={styles.emptyTitle}>
            Nenhum resultado
          </AppText>
          <AppText style={styles.emptySubtitle}>
            Não encontrámos palavras para `{debouncedQuery}`.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="documentText" size={60} color={theme.colors.iconMuted} />
        <AppText variant="bold" style={styles.emptyTitle}>
          Nenhuma palavra ainda
        </AppText>
        <AppText style={styles.emptySubtitle}>
          Este conjunto está vazio. Adicione a sua primeira palavra para começar
          a aprender.
        </AppText>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => {
            setEditingWord(null);
            setIsModalVisible(true);
          }}
        >
          <Icon name="add" size={20} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.emptyButtonText}>
            Adicionar Palavra
          </AppText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppText variant="bold" style={styles.deckTitle}>
          {title}
        </AppText>
        <AppText style={styles.deckAuthor}>por {author}</AppText>
        <View style={styles.searchBarContainer}>
          <Icon name="search" size={20} color={theme.colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            autoCapitalize="none"
            onChangeText={setSearchQuery}
            placeholder="Procurar por palavra ou significado..."
            placeholderTextColor={theme.colors.placeholder}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon
                name="closeCircle"
                size={20}
                color={theme.colors.placeholder}
              />
            </TouchableOpacity>
          )}
        </View>
        {wordsForCurrentDeck.length > 0 && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.mastery.new },
                ]}
              />
              <AppText style={styles.legendLabel}>Nova</AppText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.mastery.learning },
                ]}
              />
              <AppText style={styles.legendLabel}>Em Aprendizagem</AppText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.mastery.mastered },
                ]}
              />
              <AppText style={styles.legendLabel}>Dominada</AppText>
            </View>
          </View>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={sortedWords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const { value, label, displayIcon } = getDisplayDataForWord(
            item,
            sortConfig.criterion
          );
          return (
            <WordOverview
              name={item.name}
              meaning={item.meaning}
              masteryLevel={item.masteryLevel}
              onViewDetails={() =>
                navigation.navigate("WordDetails", { wordId: item.id })
              }
              onEdit={() => handleEditWord(item)}
              isFavorite={item.isFavorite}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              onDelete={() => handleDeleteWord(item.id)}
              displayValue={value}
              displayLabel={label}
              displayIcon={displayIcon}
            />
          );
        }}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.fabContainer}>
        {wordsForCurrentDeck.length > 0 && (
          <TouchableOpacity
            style={[styles.fab, styles.practiceFab]}
            onPress={() => practiceBottomSheetRef.current?.present()}
            activeOpacity={0.8}
          >
            <Icon name="flash" size={28} color={theme.colors.surface} />
          </TouchableOpacity>
        )}
        {wordsForCurrentDeck.length > 0 && (
          <TouchableOpacity
            style={[styles.fab, styles.addFab]}
            onPress={() => {
              setEditingWord(null);
              setIsModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Icon name="add" size={32} color={theme.colors.surface} />
          </TouchableOpacity>
        )}
      </View>

      <WordEditModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onSave={handleSaveWord}
        initialData={editingWord}
        isSaving={isSaving}
      />

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
                onPress={() => setSortModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView ref={sortScrollViewRef} style={{ maxHeight: 400 }}>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sortOptionButton}
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

      {/* Bottom Sheet Prática de Deck */}
      <BottomSheetModal
        ref={practiceBottomSheetRef}
        snapPoints={practiceSnapPoints} // Controlado por present() e dismiss()
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.modalHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
        >
          <View style={styles.modalHeader}>
            <AppText variant="bold" style={styles.modalTitle}>
              Escolha um Modo
            </AppText>
            <TouchableOpacity
              onPress={() => practiceBottomSheetRef.current?.dismiss()}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => handleStartPractice("flashcard")}
          >
            <Icon name="albums" size={24} style={styles.modeIcon} />
            <View style={styles.modeTextContainer}>
              <AppText variant="bold" style={styles.modeTitle}>
                Revisão Clássica
              </AppText>
              <AppText style={styles.modeDescription}>
                Flashcards simples: veja a palavra, adivinhe o significado
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => handleStartPractice("multiple-choice")}
          >
            <Icon name="list" size={24} style={styles.modeIcon} />
            <View style={styles.modeTextContainer}>
              <AppText variant="bold" style={styles.modeTitle}>
                Escolha Múltipla
              </AppText>
              <AppText style={styles.modeDescription}>
                Escolha o significado correto entre 4 opções
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => handleStartPractice("writing")}
          >
            <Icon name="pencil" size={24} style={styles.modeIcon} />
            <View style={styles.modeTextContainer}>
              <AppText variant="bold" style={styles.modeTitle}>
                Jogo da Escrita
              </AppText>
              <AppText style={styles.modeDescription}>
                Nós mostramos o significado, você escreve a palavra
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => handleStartPractice("combine-lists")}
          >
            <Icon name="gitCompare" size={24} style={styles.modeIcon} />
            <View style={styles.modeTextContainer}>
              <AppText variant="bold" style={styles.modeTitle}>
                Combinar Listas
              </AppText>
              <AppText style={styles.modeDescription}>
                Combine as palavras com os seus significados
              </AppText>
            </View>
          </TouchableOpacity>
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
  listContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for FAB
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
  },
  deckTitle: {
    fontSize: theme.fontSizes["4xl"],
  },
  deckAuthor: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 12,
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.textMedium,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    maxWidth: "80%",
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  practiceFab: {
    backgroundColor: theme.colors.challenge,
    marginRight: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addFab: {
    backgroundColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end", // Alinha o modal na parte inferior
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.surface,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 24, // Adiciona espaço no final da lista para um scroll mais suave
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
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeIcon: {
    color: "#4F8EF7",
    marginRight: 16,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: theme.fontSizes.lg,
  },
  modeDescription: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
});
