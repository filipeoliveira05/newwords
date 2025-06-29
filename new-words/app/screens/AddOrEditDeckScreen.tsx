import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDeckStore } from "@/stores/deckStore";

export default function AddOrEditDeckScreen({ navigation, route }: any) {
  const deckId = route?.params?.deckId;
  const isEdit = !!deckId;

  const { addDeck, updateDeck, decks } = useDeckStore();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const authorInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEdit && deckId) {
      const deck = decks.find((d) => d.id === deckId);
      if (deck) {
        setTitle(deck.title);
        setAuthor(deck.author);
      } else {
        Alert.alert(
          "Erro",
          "O conjunto que está a tentar editar não foi encontrado. A voltar para o ecrã anterior.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    }
  }, [deckId, isEdit, decks, navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: "", // O título agora está no corpo do ecrã
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: "#f8fafc",
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: "#22223b",
    });
  }, [navigation, isEdit]);

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Erro", "Preenche o título e o autor.");
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && deckId) {
        await updateDeck(deckId, title.trim(), author.trim());
      } else {
        await addDeck(title.trim(), author.trim());
      }
      navigation.goBack();
    } catch (error) {
      console.error("Falha ao guardar o conjunto:", error);
      Alert.alert(
        "Erro",
        "Não foi possível guardar o conjunto. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Ionicons
            name={isEdit ? "create-outline" : "add-circle-outline"}
            size={48}
            color="#4F8EF7"
          />
          <Text style={styles.headerTitle}>
            {isEdit ? "Editar Conjunto" : "Criar Novo Conjunto"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEdit
              ? "Altere os detalhes do seu conjunto."
              : "Dê um nome e um autor ao seu novo conjunto de palavras."}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TÍTULO DO CONJUNTO</Text>
            <Pressable
              style={styles.inputContainer}
              onPress={() => titleInputRef.current?.focus()}
            >
              <Ionicons
                name="bookmark-outline"
                style={styles.inputIcon}
                size={22}
              />
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Vocabulário de Inglês"
                placeholderTextColor="#999"
              />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>AUTOR</Text>
            <Pressable
              style={styles.inputContainer}
              onPress={() => authorInputRef.current?.focus()}
            >
              <Ionicons
                name="person-outline"
                style={styles.inputIcon}
                size={22}
              />
              <TextInput
                ref={authorInputRef}
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Ex: John Doe"
                placeholderTextColor="#999"
              />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEdit ? "Guardar Alterações" : "Criar Conjunto"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 0,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22223b",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "90%",
  },
  form: {
    flex: 1,
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
    backgroundColor: "#fff",
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
    paddingVertical: 14, // Aumenta a área de toque vertical
  },
  button: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 22,
    width: "100%",
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
