import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useWordStore } from "@/stores/wordStore";
import { useAlertStore } from "@/stores/useAlertStore";
import { Word } from "../../types/database";
import { HomeStackParamList, RootTabParamList } from "../../types/navigation";
import WordOverview from "../components/WordOverview";
import WordEditModal from "../components/WordEditModal";
import AppText from "../components/AppText";
import { theme } from "../../config/theme";

const EMPTY_WORDS_ARRAY: Word[] = [];

type SortCriterion =
  | "createdAt"
  | "isFavorite"
  | "masteryLevel"
  | "timesTrained"
  | "timesCorrect"
  | "timesIncorrect"
  | "lastAnswerCorrect"
  | "lastTrained"
  | "name";

type SortDirection = "asc" | "desc";

interface SortConfig {
  criterion: SortCriterion;
  direction: SortDirection;
}
type Props = NativeStackScreenProps<HomeStackParamList, "DeckDetail">;

export default function DeckDetailScreen({ navigation, route }: Props) {
  const { deckId, title, author, openAddWordModal } = route.params;

  const wordsForCurrentDeck = useWordStore(
    (state) => state.words[deckId] || EMPTY_WORDS_ARRAY
  );
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
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    criterion: "createdAt",
    direction: "desc",
  });

  const displayWords = useMemo(() => {
    // 1. Filter based on search query
    let wordsToDisplay = [...wordsForCurrentDeck];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      wordsToDisplay = wordsToDisplay.filter(
        (word: Word) =>
          word.name.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
      );
    }

    // 2. Sort the filtered list
    const { criterion, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    const masteryMap = { new: 1, learning: 2, mastered: 3 };

    wordsToDisplay.sort((a, b) => {
      switch (criterion) {
        case "isFavorite":
          // This sort is always descending (favorites first)
          return b.isFavorite - a.isFavorite;
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "masteryLevel":
          return (
            (masteryMap[a.masteryLevel] - masteryMap[b.masteryLevel]) * dir
          );
        case "createdAt":
          // Assumes createdAt is never null
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            dir
          );
        case "lastTrained":
          // Treat null as the oldest date (comes first in asc)
          const dateA = a.lastTrained ? new Date(a.lastTrained).getTime() : 0;
          const dateB = b.lastTrained ? new Date(b.lastTrained).getTime() : 0;
          return (dateA - dateB) * dir;
        case "lastAnswerCorrect":
          // Treat null as a third category (-1)
          const answerA = a.lastAnswerCorrect ?? -1;
          const answerB = b.lastAnswerCorrect ?? -1;
          return (answerA - answerB) * dir;
        case "timesTrained":
        case "timesCorrect":
        case "timesIncorrect":
          return (a[criterion] - b[criterion]) * dir;
        default:
          return 0;
      }
    });

    return wordsToDisplay;
  }, [wordsForCurrentDeck, searchQuery, sortConfig]);

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
            <Ionicons
              name="swap-vertical-outline"
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

  const handleSaveWord = async (name: string, meaning: string) => {
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
        await updateWord(editingWord.id, name.trim(), meaning.trim());
      } else {
        await addWord(deckId, name.trim(), meaning.trim());
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
    setPracticeModalVisible(false); // Fecha o modal imediatamente

    // Use getParent() to access the parent Tab Navigator
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate("Practice", {
        screen: "PracticeGame",
        params: {
          mode,
          deckId: deckId,
          sessionType: "free",
          origin: "DeckDetail",
        },
      });
  };

  const getDisplayDataForWord = (
    word: Word,
    criterion: SortCriterion
  ): { value?: string | number; label?: string } => {
    const formatNullableDate = (dateString: string | null) => {
      if (!dateString) return "Nunca";
      try {
        return format(parseISO(dateString), "dd MMM", { locale: pt });
      } catch (e) {
        console.error("Data com formato nulo.", e);
        return "Inválida";
      }
    };

    switch (criterion) {
      case "timesTrained":
        return { value: word.timesTrained, label: "vezes" };
      case "timesCorrect":
        return { value: word.timesCorrect, label: "certas" };
      case "timesIncorrect":
        return { value: word.timesIncorrect, label: "erradas" };
      case "masteryLevel":
        return {};
      case "lastTrained":
        return {
          value: formatNullableDate(word.lastTrained),
          label: "últ. prática",
        };
      case "createdAt":
        return { value: formatNullableDate(word.createdAt), label: "criação" };
      case "lastAnswerCorrect":
        if (word.lastAnswerCorrect === null)
          return { value: "N/A", label: "últ. resp." };
        return {
          value: word.lastAnswerCorrect === 1 ? "Certa" : "Errada",
          label: "últ. resp.",
        };
      default:
        return {};
    }
  };

  const sortOptions: {
    label: string;
    criterion: SortCriterion;
    direction: SortDirection;
  }[] = [
    { label: "Favoritos Primeiro", criterion: "isFavorite", direction: "desc" },
    {
      label: "Data de Criação (Mais Recentes)",
      criterion: "createdAt",
      direction: "desc",
    },
    {
      label: "Data de Criação (Mais Antigas)",
      criterion: "createdAt",
      direction: "asc",
    },
    { label: "Ordem Alfabética (A-Z)", criterion: "name", direction: "asc" },
    { label: "Ordem Alfabética (Z-A)", criterion: "name", direction: "desc" },
    {
      label: "Nível (Ascendente)",
      criterion: "masteryLevel",
      direction: "asc",
    },
    {
      label: "Nível (Descendente)",
      criterion: "masteryLevel",
      direction: "desc",
    },
    {
      label: "Vezes Praticadas (Menos)",
      criterion: "timesTrained",
      direction: "asc",
    },
    {
      label: "Vezes Praticadas (Mais)",
      criterion: "timesTrained",
      direction: "desc",
    },
    {
      label: "Respostas Corretas (Mais)",
      criterion: "timesCorrect",
      direction: "desc",
    },
    {
      label: "Respostas Incorretas (Mais)",
      criterion: "timesIncorrect",
      direction: "desc",
    },
    {
      label: "Última Resposta (Erradas primeiro)",
      criterion: "lastAnswerCorrect",
      direction: "asc",
    },
    {
      label: "Última Resposta (Certas primeiro)",
      criterion: "lastAnswerCorrect",
      direction: "desc",
    },
    {
      label: "Última Prática (Mais Recente)",
      criterion: "lastTrained",
      direction: "desc",
    },
    {
      label: "Última Prática (Mais Antiga)",
      criterion: "lastTrained",
      direction: "asc",
    },
  ];

  const handleSortSelect = (config: SortConfig) => {
    setSortConfig(config);
    setSortModalVisible(false);
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText style={styles.emptyText}>A carregar palavras...</AppText>
        </View>
      );
    }

    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-circle-outline"
            size={60}
            color={theme.colors.iconMuted}
          />
          <AppText variant="bold" style={styles.emptyTitle}>
            Nenhum resultado
          </AppText>
          <AppText style={styles.emptySubtitle}>
            Não encontrámos palavras para `{searchQuery}`.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={60}
          color={theme.colors.iconMuted}
        />
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
          <Ionicons name="add" size={20} color={theme.colors.surface} />
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
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.placeholder}
          />
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
              <Ionicons
                name="close-circle"
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
        data={displayWords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const { value, label } = getDisplayDataForWord(
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
            onPress={() => setPracticeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={28} color={theme.colors.surface} />
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
            <Ionicons name="add" size={32} color={theme.colors.surface} />
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

      {/* Practice Mode Selection Modal */}
      <Modal
        visible={practiceModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => setPracticeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPracticeModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                Escolha um Modo
              </AppText>
              <TouchableOpacity
                onPress={() => setPracticeModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => handleStartPractice("flashcard")}
            >
              <Ionicons
                name="albums-outline"
                size={24}
                style={styles.modeIcon}
              />
              <View>
                <AppText variant="bold" style={styles.modeTitle}>
                  Revisão Clássica
                </AppText>
                <AppText style={styles.modeDescription}>
                  Flashcards simples: veja a palavra, adivinhe o significado.
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => handleStartPractice("multiple-choice")}
            >
              <Ionicons name="list-outline" size={24} style={styles.modeIcon} />
              <View>
                <AppText variant="bold" style={styles.modeTitle}>
                  Escolha Múltipla
                </AppText>
                <AppText style={styles.modeDescription}>
                  Escolha o significado correto entre 4 opções.
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => handleStartPractice("writing")}
            >
              <Ionicons
                name="pencil-outline"
                size={24}
                style={styles.modeIcon}
              />
              <View>
                <AppText variant="bold" style={styles.modeTitle}>
                  Jogo da Escrita
                </AppText>
                <AppText style={styles.modeDescription}>
                  Nós mostramos o significado, você escreve a palavra.
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => handleStartPractice("combine-lists")}
            >
              <Ionicons
                name="git-compare-outline"
                size={24}
                style={styles.modeIcon}
              />
              <View>
                <AppText variant="bold" style={styles.modeTitle}>
                  Combinar Listas
                </AppText>
                <AppText style={styles.modeDescription}>
                  Combine as palavras com os seus significados.
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                <Ionicons name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
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
    fontSize: theme.fontSizes["3xl"],
  },
  deckAuthor: {
    fontSize: theme.fontSizes.base,
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
    fontSize: theme.fontSizes.xs,
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
    fontSize: theme.fontSizes.base,
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
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textMedium,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.base,
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
    fontSize: theme.fontSizes.base,
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
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
  },
  modalTitle: {
    fontSize: theme.fontSizes.xxl,
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
  modeTitle: {
    fontSize: theme.fontSizes.base,
  },
  modeDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sortOptionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sortOptionText: {
    fontSize: theme.fontSizes.base,
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
