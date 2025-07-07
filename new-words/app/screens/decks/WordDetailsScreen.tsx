import React, {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import Toast from "react-native-toast-message";
// import * as Speech from "expo-speech"; // Descomentar quando for gerada uma nova build de desenvolvimento
import { eventStore } from "@/stores/eventStore";

import { getWordById } from "../../../services/storage";
import { Word } from "../../../types/database";
import { DecksStackParamList } from "../../../types/navigation";
import { useWordStore } from "@/stores/wordStore";
import { useAlertStore } from "@/stores/useAlertStore";
import ChipInput from "../../components/ChipInput";
import WordEditModal from "../../components/WordEditModal";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

const CATEGORIES = ["Nome", "Verbo", "Adjetivo", "Advérbio", "Outro"];

const masteryLevelText = {
  new: "Nova",
  learning: "Em Aprendizagem",
  mastered: "Dominada",
};

const formatNullableDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    // Usar parseISO para lidar corretamente com o formato de string ISO
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: pt });
  } catch (e) {
    console.error("Failed to parse date:", e);
    return "Data inválida";
  }
};

const formatLastAnswer = (answer: number | null) => {
  if (answer === null) return "N/A";
  return answer === 1 ? "Correta" : "Incorreta";
};

type Props = NativeStackScreenProps<DecksStackParamList, "WordDetails">;

const WordDetailsScreen = ({ navigation, route }: Props) => {
  const { wordId } = route.params;
  const { updateWordDetails, deleteWord, updateWord } = useWordStore.getState();
  const { showAlert } = useAlertStore.getState();

  const [wordDetails, setWordDetails] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const scrollY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  // State for the new edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingWordDetails, setEditingWordDetails] = useState<{
    name: string;
    meaning: string;
    category: string | null;
  } | null>(null);

  // State to track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [initialState, setInitialState] = useState({
    category: null as string | null,
    synonyms: [] as string[],
    antonyms: [] as string[],
    sentences: [] as string[],
  });

  /* --- Funcionalidade Text-to-Speech (Comentada para evitar crash sem nova build) ---
  const handleSpeak = (text: string) => {
    // Opcionalmente, pode-se adicionar a língua para uma pronúncia mais correta.
    // 'en-US' para inglês, 'pt-BR' para português, etc.
    Speech.speak(text, {
      language: "en-US",
    });
  };
  */

  const [category, setCategory] = useState<string | null>(null);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);

  const parseJsonField = (field: string | null): string[] => {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Falha na conversão de JSON para array", e);
      return [];
    }
  };

  const fetchWord = useCallback(async () => {
    try {
      setLoading(true);
      const word = await getWordById(wordId);
      if (word) {
        setWordDetails(word);
        // Initialize local state from DB data
        const dbCategory = word.category;
        const dbSynonyms = parseJsonField(word.synonyms);
        const dbAntonyms = parseJsonField(word.antonyms);
        const dbSentences = parseJsonField(word.sentences);

        setCategory(dbCategory);
        setSynonyms(dbSynonyms);
        setAntonyms(dbAntonyms);
        setSentences(dbSentences);

        // Also set the initial state for comparison
        setInitialState({
          category: dbCategory,
          synonyms: dbSynonyms,
          antonyms: dbAntonyms,
          sentences: dbSentences,
        });
      } else {
        showAlert({
          title: "Erro",
          message: "Palavra não encontrada.",
          buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
        });
      }
    } catch (error) {
      console.error("Erro ao obter detalhes da palavra:", error);
    } finally {
      setLoading(false);
    }
  }, [
    wordId,
    navigation,
    showAlert,
    setWordDetails,
    setCategory,
    setSynonyms,
    setAntonyms,
    setSentences,
    setInitialState,
  ]);

  // Efeito para gerir o espaço do teclado manualmente, evitando o "salto" do KeyboardAvoidingView.
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      // Adiciona um padding no fundo do ScrollView igual à altura do teclado.
      setKeyboardPadding(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      // Remove o padding quando o teclado desaparece.
      setKeyboardPadding(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    fetchWord(); // Fetch on initial mount

    // Subscribe to updates for this specific word. This is more efficient
    // than refetching on every focus, as it only triggers when the data
    // for this word actually changes (e.g., after a practice session or an edit).
    const unsubscribe = eventStore
      .getState()
      .subscribe<{ wordId: number }>(
        "wordUpdated",
        ({ wordId: updatedWordId }) => {
          if (updatedWordId === wordId) {
            fetchWord();
          }
        }
      );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [wordId, fetchWord]); // Rerun if wordId from route params changes

  // Effect to check for changes and set the dirty state
  useEffect(() => {
    if (loading || !wordDetails) return; // Don't check for changes while loading

    const hasCategoryChanged = category !== initialState.category;
    const hasSynonymsChanged =
      JSON.stringify(synonyms) !== JSON.stringify(initialState.synonyms);
    const hasAntonymsChanged =
      JSON.stringify(antonyms) !== JSON.stringify(initialState.antonyms);
    const hasSentencesChanged =
      JSON.stringify(sentences) !== JSON.stringify(initialState.sentences);

    setIsDirty(
      hasCategoryChanged ||
        hasSynonymsChanged ||
        hasAntonymsChanged ||
        hasSentencesChanged
    );
  }, [
    category,
    synonyms,
    antonyms,
    sentences,
    initialState,
    loading,
    wordDetails,
  ]);

  const handleDeleteWord = useCallback(() => {
    if (!wordDetails) return;

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
              await deleteWord(wordDetails.id);
              navigation.goBack();
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
  }, [wordDetails, showAlert, deleteWord, navigation]);

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingWordDetails(null);
  };

  const handleEditWord = useCallback(() => {
    if (!wordDetails) return;
    setEditingWordDetails({
      name: wordDetails.name,
      meaning: wordDetails.meaning,
      category: wordDetails.category,
    });
    setIsEditModalVisible(true);
  }, [wordDetails]);

  const handleSaveWordEdit = useCallback(
    async (name: string, meaning: string, category: string | null) => {
      if (!name.trim() || !meaning.trim()) {
        showAlert({
          title: "Erro",
          message: "Preenche a palavra e o significado.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }
      if (!wordDetails) return;

      setIsSavingEdit(true);
      try {
        await updateWord(wordDetails.id, name.trim(), meaning.trim(), category);

        setWordDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: name.trim(),
            meaning: meaning.trim(),
            category: category,
          };
        });

        Toast.show({
          type: "success",
          text1: "Palavra atualizada!",
        });

        closeEditModal();
      } catch (error) {
        console.error("Falha ao editar a palavra:", error);
        showAlert({
          title: "Erro",
          message: "Não foi possível editar a palavra.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
      } finally {
        setIsSavingEdit(false);
      }
    },
    [wordDetails, updateWord, showAlert]
  );
  const handleSave = useCallback(async () => {
    if (!wordDetails) return;

    setIsSaving(true);
    try {
      await updateWordDetails(
        wordDetails.id,
        category,
        synonyms,
        antonyms,
        sentences
      );

      // After a successful save, update the initial state to match the current state.
      // This will make `isDirty` false and hide the "Save" button.
      setInitialState({
        category,
        synonyms,
        antonyms,
        sentences,
      });

      Toast.show({
        type: "success",
        text1: "Guardado!",
        text2: "Os detalhes da palavra foram atualizados.",
      });
    } catch (error) {
      console.error("Erro ao guardar detalhes da palavra:", error);
      showAlert({
        title: "Erro",
        message: "Não foi possível guardar as alterações.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    wordDetails,
    category,
    synonyms,
    antonyms,
    sentences,
    updateWordDetails,
    showAlert,
  ]);

  const getCategoryColor = (categoryName: string | null): string => {
    if (!categoryName) {
      return theme.colors.border; // Cor neutra para quando nada está selecionado
    }
    const key = categoryName as keyof typeof theme.colors.category;
    const defaultKey = "Outro" as keyof typeof theme.colors.category;

    return theme.colors.category[key] || theme.colors.category[defaultKey];
  };

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (!isDirty || isSaving) {
          // If there are no unsaved changes or we are in the process of saving,
          // let the user leave the screen.
          return;
        }

        // Prevent the back action from happening
        e.preventDefault();

        // Prompt the user to confirm leaving
        showAlert({
          title: "Sair sem guardar?",
          message: "Tem alterações não guardadas. Tem a certeza que quer sair?",
          buttons: [
            {
              text: "Ficar",
              style: "cancel",
              onPress: () => {}, // Does nothing, just closes the alert
            },
            {
              text: "Sair",
              style: "destructive",
              // If the user confirms, dispatch the original action
              onPress: () => navigation.dispatch(e.data.action),
            },
          ],
        });
      }),
    [navigation, isDirty, isSaving, showAlert]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "", // Title is now in the custom header
      headerBackButtonDisplayMode: "minimal",
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerShadowVisible: false, // Use this to hide shadow/border
      headerTintColor: theme.colors.text,
      headerRight: () =>
        wordDetails && (
          <View style={styles.headerIconsContainer}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={async () => {
                if (wordDetails) {
                  try {
                    const updatedWord = await useWordStore
                      .getState()
                      .toggleFavoriteStatus(wordDetails.id);
                    if (updatedWord) setWordDetails(updatedWord);
                  } catch (error) {
                    console.error("Erro ao favoritar:", error);
                  }
                }
              }}
            >
              <Ionicons
                name={wordDetails.isFavorite ? "star" : "star-outline"}
                size={24}
                color={
                  wordDetails.isFavorite
                    ? theme.colors.favorite
                    : theme.colors.iconMuted
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={handleEditWord}
            >
              <Ionicons
                name="pencil-outline"
                size={22}
                color={theme.colors.textMedium}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={handleDeleteWord}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={theme.colors.dangerDark}
              />
            </TouchableOpacity>
          </View>
        ),
    });
  }, [navigation, wordDetails, handleDeleteWord, handleEditWord]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    );
  }

  if (!wordDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={theme.colors.iconMuted}
        />
        <AppText style={styles.errorText}>Palavra não encontrada.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              keyboardPadding || styles.scrollContent.paddingBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.wordHeader}>
          {/* O código abaixo foi temporariamente revertido.
              Quando o Text-to-Speech for reativado, descomente o bloco
              e o estilo 'wordTitleContainer' e 'speakButton'. */}
          <AppText variant="bold" style={styles.wordName}>
            {wordDetails.name}
          </AppText>
          {/* <View style={styles.wordTitleContainer}>
              <AppText variant="bold" style={styles.wordName}>
                {wordDetails.name}
              </AppText>
              <TouchableOpacity
                onPress={() => handleSpeak(wordDetails.name)}
                style={styles.speakButton}
              >
                <Ionicons name="volume-medium-outline" size={28} color={theme.colors.primary} />
              </TouchableOpacity>
            </View> */}
          <AppText style={styles.sectionContent}>{wordDetails.meaning}</AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="bold" style={styles.label}>
            Categoria Gramatical
          </AppText>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <View style={styles.categorySelectorContent}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(category) },
                ]}
              />
              <AppText
                style={
                  category ? styles.categoryText : styles.categoryPlaceholder
                }
              >
                {category || "Escolha uma categoria"}
              </AppText>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.iconMuted}
            />
          </TouchableOpacity>
        </View>

        <ChipInput
          label="Sinónimos"
          items={synonyms}
          onItemsChange={setSynonyms}
          placeholder="Adicionar sinónimo"
          layout="wrap"
          autoCapitalize="none"
          scrollViewRef={scrollViewRef}
          currentScrollY={scrollY}
          keyboardHeight={keyboardPadding}
        />

        <ChipInput
          label="Antónimos"
          items={antonyms}
          onItemsChange={setAntonyms}
          placeholder="Adicionar antónimo"
          layout="wrap"
          autoCapitalize="none"
          scrollViewRef={scrollViewRef}
          currentScrollY={scrollY}
          keyboardHeight={keyboardPadding}
        />

        <ChipInput
          label="Frases de Exemplo"
          items={sentences}
          onItemsChange={setSentences}
          placeholder="Adicionar frase"
          layout="stack"
          autoCapitalize="sentences"
          scrollViewRef={scrollViewRef}
          currentScrollY={scrollY}
          keyboardHeight={keyboardPadding}
        />

        {/* Secção Estatísticas */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.label}>
            Estatísticas
          </AppText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Nível</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {masteryLevelText[wordDetails.masteryLevel]}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Vezes Praticada</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.timesTrained}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Respostas Corretas</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.timesCorrect}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Respostas Incorretas</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.timesIncorrect}
              </AppText>
            </View>
            <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
              <AppText style={styles.statLabel}>Data de Criação</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {formatNullableDate(wordDetails.createdAt)}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Última Prática</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {formatNullableDate(wordDetails.lastTrained)}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Última Resposta</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {formatLastAnswer(wordDetails.lastAnswerCorrect ?? null)}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Próxima Prática</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {formatNullableDate(wordDetails.nextReviewDate)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Secção Repetição Espaçada SRS (SM-2) */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.label}>
            Repetição Espaçada (SM-2)
          </AppText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Fator de Facilidade</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.easinessFactor.toFixed(2)}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Próximo Intervalo</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.interval}{" "}
                {wordDetails.interval === 1 ? "dia" : "dias"}
              </AppText>
            </View>
            <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
              <AppText style={styles.statLabel}>Repetições Corretas</AppText>
              <AppText variant="medium" style={styles.statValue}>
                {wordDetails.repetitions}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <AppText variant="bold" style={styles.modalTitle}>
              Escolha uma Categoria
            </AppText>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(cat);
                  setIsCategoryModalVisible(false);
                }}
              >
                <AppText style={styles.modalOptionText}>{cat}</AppText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelButton]}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <AppText variant="medium" style={styles.modalCancelButtonText}>
                Cancelar
              </AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <WordEditModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        onSave={handleSaveWordEdit}
        initialData={editingWordDetails}
        isSaving={isSavingEdit}
      />
      {/* A barra só aparece se houver alterações não guardadas */}
      {isDirty && (
        <View style={styles.saveBarContainer}>
          <TouchableOpacity
            style={styles.saveBarButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <AppText variant="bold" style={styles.saveBarButtonText}>
                Guardar Alterações
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  wordHeader: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  /*
  wordTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  */
  wordName: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    marginBottom: 10,
    // flex: 1, // Descomentar quando o botão de TTS for reativado
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    fontSize: theme.fontSizes.base,
    lineHeight: 24,
    color: theme.colors.textMedium,
  },
  /*
  speakButton: {
    paddingLeft: 16, // Espaço entre o texto e o botão
  },
  */
  label: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  categorySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  categoryPlaceholder: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.placeholder,
  },
  errorText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    textAlign: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOption: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  modalCancelButton: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
  },
  modalCancelButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.danger,
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 8,
  },
  headerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 12,
    padding: 8,
  },
  favoriteIcon: {
    width: 24,
    height: 24,
  },
  saveBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24, // Extra padding for home bar on iOS
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  saveBarButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBarButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
  },
});

export default WordDetailsScreen;
