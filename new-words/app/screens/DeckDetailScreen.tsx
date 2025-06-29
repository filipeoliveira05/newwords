import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWordStore } from "@/stores/wordStore";
import { Word } from "../../types/database";
import WordOverview from "../components/WordOverview";

const EMPTY_WORDS_ARRAY: Word[] = [];

export default function DeckDetailScreen({ navigation, route }: any) {
  const { deckId, title, author, openAddWordModal } = route.params;

  const wordsForCurrentDeck = useWordStore(
    (state) => state.words[deckId] || EMPTY_WORDS_ARRAY
  );
  const loading = useWordStore((state) => state.loading);
  const { fetchWordsOfDeck, addWord, updateWord, deleteWord } =
    useWordStore.getState();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editingWordId, setEditingWordId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);

  const newWordInputRef = useRef<TextInput>(null);
  const newMeaningInputRef = useRef<TextInput>(null);

  const filteredWords = useMemo(() => {
    if (!searchQuery) {
      return wordsForCurrentDeck;
    }
    const query = searchQuery.toLowerCase();
    return wordsForCurrentDeck.filter(
      (word: Word) =>
        word.name.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query)
    );
  }, [wordsForCurrentDeck, searchQuery]);

  const resetModal = () => {
    setAddModalVisible(false);
    setEditMode(false);
    setEditingWordId(null);
    setNewWord("");
    setNewMeaning("");
  };

  useEffect(() => {
    if (deckId) {
      fetchWordsOfDeck(deckId);
    }

    if (openAddWordModal) {
      setAddModalVisible(true);
    }
  }, [deckId, openAddWordModal]);

  useEffect(() => {
    navigation.setOptions({
      title: "", // Title is now in the custom header
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: "#f8fafc",
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: "#22223b",
    });
  }, [navigation]);

  const handleEditWord = (word: Word) => {
    setEditMode(true);
    setEditingWordId(word.id);
    setNewWord(word.name);
    setNewMeaning(word.meaning);
    setAddModalVisible(true);
  };

  const handleDeleteWord = (wordId: number) => {
    Alert.alert(
      "Apagar palavra",
      "Tens a certeza que queres apagar esta palavra?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWord(wordId);
            } catch (error) {
              console.error("Falha ao apagar a palavra:", error);
              Alert.alert("Erro", "Não foi possível apagar a palavra.");
            }
          },
        },
      ]
    );
  };

  const handleSaveWord = async () => {
    if (!newWord.trim() || !newMeaning.trim()) {
      Alert.alert("Erro", "Preenche a palavra e o significado.");
      return;
    }
    setIsSaving(true);
    try {
      if (editMode && editingWordId !== null) {
        await updateWord(editingWordId, newWord.trim(), newMeaning.trim());
      } else {
        await addWord(deckId, newWord.trim(), newMeaning.trim());
      }
      resetModal();
    } catch (error) {
      console.error("Falha ao guardar a palavra:", error);
      Alert.alert(
        "Erro",
        editMode
          ? "Não foi possível editar a palavra."
          : "Não foi possível adicionar a palavra."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartPractice = (mode: "flashcard" | "multiple-choice") => {
    setPracticeModalVisible(false); // Fecha o modal imediatamente

    const requiredWords = mode === "multiple-choice" ? 4 : 1;
    const friendlyModeName =
      mode === "multiple-choice" ? "de escolha múltipla" : "de revisão";

    if (wordsForCurrentDeck.length < requiredWords) {
      Alert.alert(
        "Poucas Palavras",
        `Precisa de ter pelo menos ${requiredWords} ${
          requiredWords > 1 ? "palavras" : "palavra"
        } neste conjunto para praticar no modo ${friendlyModeName}.`
      );
      return;
    }

    navigation.navigate("Practice", {
      screen: "PracticeGame",
      params: { mode, words: wordsForCurrentDeck },
    });
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={styles.emptyText}>A carregar palavras...</Text>
        </View>
      );
    }

    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-circle-outline" size={60} color="#ced4da" />
          <Text style={styles.emptyTitle}>Nenhum resultado</Text>
          <Text style={styles.emptySubtitle}>
            Não encontrámos palavras para `{searchQuery}`.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#ced4da" />
        <Text style={styles.emptyTitle}>Nenhuma palavra ainda</Text>
        <Text style={styles.emptySubtitle}>
          Este conjunto está vazio. Adicione a sua primeira palavra para começar
          a aprender.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Adicionar Palavra</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.deckTitle}>{title}</Text>
        <Text style={styles.deckAuthor}>por {author}</Text>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color="#9e9e9e" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Procurar por palavra ou significado..."
            placeholderTextColor="#9e9e9e"
          />
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            disabled={!searchQuery}
            style={{ opacity: searchQuery ? 1 : 0 }}
          >
            <Ionicons name="close-circle" size={20} color="#9e9e9e" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WordOverview
            name={item.name}
            meaning={item.meaning}
            onEdit={() => handleEditWord(item)}
            onDelete={() => handleDeleteWord(item.id)}
          />
        )}
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
            <Ionicons name="flash" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.fab, styles.addFab]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={resetModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? "Editar Palavra" : "Nova Palavra"}
              </Text>
              <TouchableOpacity onPress={resetModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PALAVRA</Text>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => newWordInputRef.current?.focus()}
                >
                  <Ionicons
                    name="text-outline"
                    style={styles.inputIcon}
                    size={22}
                  />
                  <TextInput
                    ref={newWordInputRef}
                    style={styles.input}
                    value={newWord}
                    onChangeText={setNewWord}
                    placeholder="Ex: Apple"
                    placeholderTextColor="#999"
                  />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SIGNIFICADO</Text>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => newMeaningInputRef.current?.focus()}
                >
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    style={styles.inputIcon}
                    size={22}
                  />
                  <TextInput
                    ref={newMeaningInputRef}
                    style={styles.input}
                    value={newMeaning}
                    onChangeText={setNewMeaning}
                    placeholder="Ex: Maçã"
                    placeholderTextColor="#999"
                  />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSaveWord}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editMode ? "Guardar Alterações" : "Adicionar Palavra"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Practice Mode Selection Modal */}
      <Modal
        visible={practiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPracticeModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPracticeModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha um Modo</Text>
              <TouchableOpacity
                onPress={() => setPracticeModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
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
                <Text style={styles.modeTitle}>Revisão Clássica</Text>
                <Text style={styles.modeDescription}>
                  Flashcards simples: veja a palavra, adivinhe o significado.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => handleStartPractice("multiple-choice")}
            >
              <Ionicons name="list-outline" size={24} style={styles.modeIcon} />
              <View>
                <Text style={styles.modeTitle}>Escolha Múltipla</Text>
                <Text style={styles.modeDescription}>
                  Escolha o significado correto entre 4 opções.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#f8fafc",
  },
  deckTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
  },
  deckAuthor: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    height: 50,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#495057",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    maxWidth: "80%",
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: "#4F8EF7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 10,
    color: "#6c757d",
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
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  practiceFab: {
    backgroundColor: "#f4a261", // Orange, like in stats
    marginRight: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addFab: {
    backgroundColor: "#4F8EF7",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
  },
  closeButton: {
    padding: 8,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#adb5bd",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  inputIcon: {
    color: "#adb5bd",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 14,
  },
  saveButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#4F8EF7",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#a9c7f5",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  modeIcon: {
    color: "#4F8EF7",
    marginRight: 16,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22223b",
  },
  modeDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
});
