import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
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
      title: isEdit ? "Editar conjunto" : "Novo conjunto",
      headerStyle: {
        backgroundColor: "#f8fafc",
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: { fontWeight: "bold", fontSize: 22, color: "#22223b" },
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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={isEdit ? "create-outline" : "add-circle-outline"}
            size={38}
            color="#4F8EF7"
          />
        </View>
        <Text style={styles.subheading}>
          {isEdit
            ? "Altere os campos para editar o conjunto."
            : "Preencha os campos para criar um novo conjunto."}
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Nome do conjunto"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Autor</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Nome do autor"
            placeholderTextColor="#aaa"
          />
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
              {isEdit ? "Guardar alterações" : "Criar conjunto"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "android" ? 24 : 0,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    marginTop: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#e8f0fe",
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 0,
    shadowColor: "#4F8EF7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  subheading: {
    fontSize: 15,
    color: "#4F4F4F",
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
