import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function DeckDetailScreen({ route }: any) {
  const { title, author, words } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>Autor: {author}</Text>
      <Text style={styles.subtitle}>Palavras:</Text>
      <ScrollView>
        {words.map((word: { name: string; meaning: string }, idx: number) => (
          <View key={idx} style={styles.wordContainer}>
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
