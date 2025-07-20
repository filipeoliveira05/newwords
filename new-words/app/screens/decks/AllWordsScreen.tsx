import React, { useLayoutEffect, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DecksStackParamList } from "../../../types/navigation";
import { useWordStore } from "../../../stores/wordStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { Word } from "../../../types/database";
import {
  useWordSorting,
  getDisplayDataForWord,
  sortOptions,
  SortConfig,
} from "../../../services/wordSorting";
import AppText from "../../components/AppText";
import Icon from "../../components/Icon";
import { theme } from "../../../config/theme";
import images from "@/services/imageService";
import WordOverview from "../../components/WordOverview";
import LoadingScreen from "../LoadingScreen";

type Props = NativeStackScreenProps<DecksStackParamList, "AllWords">;

const AllWordsScreen = ({ navigation }: Props) => {
  const { fetchAllWords, toggleFavoriteStatus, deleteWord } =
    useWordStore.getState();
  const allWordsById = useWordStore((state) => state.words.byId);
  const loading = useWordStore((state) => state.loading);
  const allWords = useMemo(() => Object.values(allWordsById), [allWordsById]);
  const { showAlert } = useAlertStore.getState();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

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
      return allWords.filter(
        (word: Word) =>
          word.name.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
      );
    }

    return allWords;
  }, [allWords, debouncedQuery]);

  const { sortedWords, sortConfig, setSortConfig } =
    useWordSorting(filteredWords);

  const handleSortSelect = (config: SortConfig) => {
    setSortConfig(config);
    setSortModalVisible(false);
  };

  const handleToggleFavorite = async (wordId: number) => {
    try {
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
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={() => setSortModalVisible(true)}
        >
          <Icon name="swapVertical" size={24} color={theme.colors.textMedium} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, setSortModalVisible]);

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <LoadingScreen
          visible={loading}
          loadingText="A carregar palavras..."
          mascotImage={images.mascotNeutral}
        />
      );
    }

    if (debouncedQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="searchCircle" size={60} color={theme.colors.iconMuted} />
          <AppText variant="bold" style={styles.title}>
            Nenhum resultado
          </AppText>
          <AppText style={styles.subtitle}>
            Não encontrámos palavras para `{debouncedQuery}`.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="libraryOutline" size={80} color={theme.colors.iconMuted} />
        <AppText variant="bold" style={styles.title}>
          A sua biblioteca está vazia
        </AppText>
        <AppText style={styles.subtitle}>
          Adicione palavras aos seus conjuntos para as ver aqui.
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color={theme.colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          autoCapitalize="none"
          onChangeText={setSearchQuery}
          placeholder="Procurar em todo o vocabulário..."
          placeholderTextColor={theme.colors.placeholder}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSearchQuery("")}
          >
            <Icon
              name="closeCircle"
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
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
              {sortOptions.map((option, index) => (
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
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
  listContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginTop: 24,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
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
});

export default AllWordsScreen;
