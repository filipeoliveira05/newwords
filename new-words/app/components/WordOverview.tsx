import React from "react";
import { View, Text, StyleSheet } from "react-native";

type WordOverviewProps = {
  name: string;
  meaning: string;
};

export default function WordOverview({ name, meaning }: WordOverviewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.word}>{name}</Text>
      <Text style={styles.meaning}>{meaning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    maxWidth: 400,
    marginHorizontal: 16,
  },
  word: {
    fontSize: 16,
    fontWeight: "bold",
  },
  meaning: {
    fontSize: 14,
    color: "#333",
  },
});
