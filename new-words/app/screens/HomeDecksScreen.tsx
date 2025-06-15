import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import DeckOverview from "../components/DeckOverview";

export default function HomeDecksScreen({ navigation }: any) {
  const decks = [
    {
      title: "Harry Potter",
      author: "J.K. Rowling",
      totalWords: 42,
      words: [
        { name: "Alohomora", meaning: "Spell to unlock doors" },
        { name: "Expelliarmus", meaning: "Disarming spell" },
      ],
    },
    {
      title: "O Senhor dos Anéis",
      author: "J.R.R. Tolkien",
      totalWords: 58,
      words: [
        { name: "Anel", meaning: "Objeto mágico central da história" },
        { name: "Hobbit", meaning: "Raça fictícia de seres pequenos" },
      ],
    },
    {
      title: "1984",
      author: "George Orwell",
      totalWords: 31,
      words: [
        { name: "Big Brother", meaning: "Figura de autoridade suprema" },
        { name: "Duplipensar", meaning: "Aceitar duas ideias contraditórias" },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Os meus conjuntos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            /* navigation to add deck screen */
          }}
        >
          <Ionicons name="add-circle" size={32} color="#4F8EF7" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {decks.map((deck, idx) => (
          <DeckOverview
            key={idx}
            title={deck.title}
            author={deck.author}
            totalWords={deck.totalWords}
            onPress={() =>
              navigation.navigate("DeckDetail", {
                title: deck.title,
                author: deck.author,
                words: deck.words,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22223b",
  },
  addButton: {
    marginLeft: 12,
  },
  list: {
    paddingBottom: 24,
  },
});
