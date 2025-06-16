import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

type DeckOverviewProps = {
  title: string;
  author: string;
  totalWords: number;
  onPress?: () => void;
};

export default function DeckOverview({
  title,
  author,
  totalWords,
  onPress,
}: DeckOverviewProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>Autor: {author}</Text>
      <Text style={styles.words}>Palavras: {totalWords}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    marginVertical: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  words: {
    fontSize: 14,
    color: "#333",
  },
});
