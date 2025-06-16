import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { getWordsOfDeck } from "../../services/storage";
import { Word } from "../types/database";

export default function DeckDetailScreen({ route }: any) {
  const { deckId, title, author } = route.params;
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = getWordsOfDeck(deckId);
      setWords(data);
    } catch (e) {
      console.error("Erro ao obter palavras do deck", e);
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>A carregar palavras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>Autor: {author}</Text>
      <Text style={styles.subtitle}>Palavras:</Text>
      <ScrollView>
        {words.map((word, idx) => (
          <View key={word.id} style={styles.wordContainer}>
            <Text style={styles.word}>{word.name}</Text>
            <Text style={styles.meaning}>{word.meaning}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  author: { fontSize: 16, color: "#555", marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  wordContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
  },
  word: { fontSize: 16, fontWeight: "bold" },
  meaning: { fontSize: 14, color: "#333" },
});
