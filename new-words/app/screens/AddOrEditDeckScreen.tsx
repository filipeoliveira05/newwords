import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

import { addDeck, updateDeck, getDeckById } from "../../services/storage";

export default function AddOrEditDeckScreen({ navigation, route }: any) {
  const deckId = route?.params?.deckId;
  const isEdit = !!deckId;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (isEdit) {
      const deck = getDeckById(deckId);
      if (deck) {
        setTitle(deck.title);
        setAuthor(deck.author);
      }
    }
  }, [deckId, isEdit]);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? "Editar conjunto" : "Novo conjunto",
    });
  }, [navigation, isEdit]);

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Erro", "Preenche o título e o autor.");
      return;
    }
    if (isEdit) {
      updateDeck(deckId, title, author);
    } else {
      addDeck(title, author);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Nome do conjunto"
      />
      <Text style={styles.label}>Autor</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Nome do autor"
      />
      <Button
        title={isEdit ? "Guardar alterações" : "Criar conjunto"}
        onPress={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
});
