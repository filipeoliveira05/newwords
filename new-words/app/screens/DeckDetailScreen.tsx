import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getWordsOfDeck,
  addWord,
  deleteWord,
  updateWord,
} from "../../services/storage";
import { Word } from "../../types/database";
import WordOverview from "../components/WordOverview";

export default function DeckDetailScreen({ navigation, route }: any) {
  const { deckId, title, author } = route.params;
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editingWordId, setEditingWordId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredWords = words.filter(
    (word) =>
      word.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const data = await getWordsOfDeck(deckId);
      setWords(data);
    } catch (e) {
      console.error("Erro ao obter palavras do deck", e);
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

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
            await deleteWord(wordId);
            await fetchWords();
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
    let success = false;
    if (editMode && editingWordId !== null) {
      try {
        await updateWord(editingWordId, newWord, newMeaning);
        success = true;
      } catch {
        success = false;
      }
    } else {
      try {
        const id = await addWord(deckId, newWord, newMeaning);
        success = !!id;
      } catch {
        success = false;
      }
    }
    if (success) {
      setNewWord("");
      setNewMeaning("");
      setAddModalVisible(false);
      setEditMode(false);
      setEditingWordId(null);
      await fetchWords();
    } else {
      Alert.alert(
        "Erro",
        editMode
          ? "Não foi possível editar a palavra."
          : "Não foi possível adicionar a palavra."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.deckInfo}>
        <Text style={styles.deckTitle}>{title}</Text>
        <Text style={styles.deckAuthor}>Autor: {author}</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#aaa"
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Procurar palavra..."
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subtitle}>Palavras:</Text>
      {loading ? (
        <Text style={{ marginTop: 16 }}>A carregar palavras...</Text>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {filteredWords.map((word) => (
            <WordOverview
              key={word.id}
              name={word.name}
              meaning={word.meaning}
              onEdit={() => handleEditWord(word)}
              onDelete={() => handleDeleteWord(word.id)}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar nova palavra</Text>
      </TouchableOpacity>

      {/* Modal/área expandida para adicionar palavra */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editMode ? "Editar palavra" : "Nova palavra"}
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Palavra</Text>
              <TextInput
                style={styles.input}
                value={newWord}
                onChangeText={setNewWord}
                placeholder="Nova palavra"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Significado</Text>
              <TextInput
                style={styles.input}
                value={newMeaning}
                onChangeText={setNewMeaning}
                placeholder="Significado"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAddModalVisible(false);
                  setEditMode(false);
                  setEditingWordId(null);
                  setNewWord("");
                  setNewMeaning("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveWord}
              >
                <Text style={styles.saveButtonText}>
                  {editMode ? "Guardar" : "Concluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 0,
  },
  deckInfo: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 2,
  },
  deckAuthor: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
    color: "#4F8EF7",
    paddingHorizontal: 16,
  },
  wordContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    maxWidth: 400,
    marginHorizontal: 16,
  },
  word: { fontSize: 16, fontWeight: "bold" },
  meaning: { fontSize: 14, color: "#333" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 18,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#4F8EF7",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 18,
    textAlign: "center",
  },
  formGroup: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#4F8EF7",
    fontSize: 15,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f3f6fa",
    color: "#222",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: "#4F8EF7",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 36,
    minWidth: 180,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
});
