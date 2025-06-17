import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

import { addDeck } from "../../services/storage";

export default function AddDeckScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleAddDeck = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Erro", "Preenche o título e o autor.");
      return;
    }
    const id = addDeck(title, author);
    if (id) {
      navigation.goBack();
    } else {
      Alert.alert("Erro", "Não foi possível criar o conjunto.");
    }
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
      <Button title="Criar conjunto" onPress={handleAddDeck} />
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
