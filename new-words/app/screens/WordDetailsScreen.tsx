import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import Toast from "react-native-toast-message";

import { getWordById } from "../../services/storage";
import { Word } from "../../types/database";
import { HomeStackParamList } from "../../types/navigation";
import { useWordStore } from "@/stores/wordStore";
import { useAlertStore } from "@/stores/useAlertStore";
import ChipInput from "../components/ChipInput";
import WordEditModal from "../components/WordEditModal";

const CATEGORIES = ["Nome", "Verbo", "Adjetivo", "Advérbio", "Outro"];

const masteryLevelText = {
  new: "Nova",
  learning: "Em Aprendizagem",
  mastered: "Dominada",
};

const formatNullableDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    // Using parseISO to handle the ISO string format correctly
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

type Props = NativeStackScreenProps<HomeStackParamList, "WordDetails">;

const WordDetailsScreen = ({ navigation, route }: Props) => {
  const { wordId } = route.params;
  const { updateWordDetails, deleteWord, updateWord } = useWordStore.getState();
  const { showAlert } = useAlertStore.getState();

  const [wordDetails, setWordDetails] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // State for the new edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingWordDetails, setEditingWordDetails] = useState<{
    name: string;
    meaning: string;
  } | null>(null);

  // State to track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [initialState, setInitialState] = useState({
    category: null as string | null,
    synonyms: [] as string[],
    antonyms: [] as string[],
    sentences: [] as string[],
  });
  // Local state for editable fields
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
  }, [wordId, navigation, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchWord();
    }, [fetchWord])
  );

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
    });
    setIsEditModalVisible(true);
  }, [wordDetails]);

  const handleSaveWordEdit = useCallback(
    async (name: string, meaning: string) => {
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
        await updateWord(wordDetails.id, name.trim(), meaning.trim());

        setWordDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: name.trim(),
            meaning: meaning.trim(),
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
        backgroundColor: "#f8fafc",
      },
      headerShadowVisible: false, // Use this to hide shadow/border
      headerTintColor: "#22223b",
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
                color={wordDetails.isFavorite ? "#FFD700" : "#a9a9a9"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={handleEditWord}
            >
              <Ionicons name="pencil-outline" size={22} color="#495057" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={handleDeleteWord}
            >
              <Ionicons name="trash-outline" size={22} color="#d11a2a" />
            </TouchableOpacity>
          </View>
        ),
    });
  }, [navigation, wordDetails, handleDeleteWord, handleEditWord]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#22223b" />
      </View>
    );
  }

  if (!wordDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color="#ced4da" />
        <Text style={styles.errorText}>Palavra não encontrada.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.wordHeader}>
          <Text style={styles.wordName}>{wordDetails.name}</Text>
          <Text style={styles.sectionContent}>{wordDetails.meaning}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Categoria Gramatical</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Text
              style={
                category ? styles.categoryText : styles.categoryPlaceholder
              }
            >
              {category || "Escolha uma categoria"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <ChipInput
          label="Sinónimos"
          items={synonyms}
          onItemsChange={setSynonyms}
          placeholder="Adicionar sinónimo"
          layout="wrap"
          autoCapitalize="none"
        />

        <ChipInput
          label="Antónimos"
          items={antonyms}
          onItemsChange={setAntonyms}
          placeholder="Adicionar antónimo"
          layout="wrap"
          autoCapitalize="none"
        />

        <ChipInput
          label="Frases de Exemplo"
          items={sentences}
          onItemsChange={setSentences}
          placeholder="Adicionar frase"
          layout="stack"
          autoCapitalize="sentences"
        />

        <View style={styles.section}>
          <Text style={styles.label}>Estatísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Nível</Text>
              <Text style={styles.statValue}>
                {masteryLevelText[wordDetails.masteryLevel]}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vezes Praticada</Text>
              <Text style={styles.statValue}>{wordDetails.timesTrained}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Respostas Corretas</Text>
              <Text style={styles.statValue}>{wordDetails.timesCorrect}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Respostas Incorretas</Text>
              <Text style={styles.statValue}>{wordDetails.timesIncorrect}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Última Resposta</Text>
              <Text style={styles.statValue}>
                {formatLastAnswer(wordDetails.lastAnswerCorrect ?? null)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Última Prática</Text>
              <Text style={styles.statValue}>
                {formatNullableDate(wordDetails.lastTrained)}
              </Text>
            </View>
            <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>Data de Criação</Text>
              <Text style={styles.statValue}>
                {formatNullableDate(wordDetails.createdAt)}
              </Text>
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
            <Text style={styles.modalTitle}>Escolha uma Categoria</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(cat);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelButton]}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBarButtonText}>Guardar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Espaço extra para a barra de guardar não sobrepor o conteúdo
  },
  wordHeader: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  wordName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#495057",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#adb5bd",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    padding: 16,
  },
  categoryText: {
    fontSize: 16,
    color: "#222",
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  errorText: {
    fontSize: 18,
    color: "#6c757d",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    textAlign: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalOption: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 17,
    color: "#4F8EF7",
  },
  modalCancelButton: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginTop: 8,
  },
  modalCancelButtonText: {
    fontSize: 17,
    color: "#e76f51",
    fontWeight: "600",
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  statLabel: {
    fontSize: 15,
    color: "#6c757d",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#22223b",
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
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  saveBarButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBarButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default WordDetailsScreen;
