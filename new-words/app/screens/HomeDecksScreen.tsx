import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import DeckOverview from "../components/DeckOverview";
import {
  deleteDeck,
  getDecks,
  getWordCountByDeck,
} from "../../services/storage";
import { Deck } from "../../types/database";

export default function HomeDecksScreen({ navigation }: any) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      try {
        const data = getDecks();
        setDecks(data);
      } catch (e) {
        console.error("Erro ao obter decks", e);
        setDecks([]);
      } finally {
        setLoading(false);
      }
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>A carregar conjuntos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Os meus conjuntos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddOrEditDeck")}
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
            totalWords={getWordCountByDeck(deck.id)}
            onPress={() =>
              navigation.navigate("DeckDetail", {
                deckId: deck.id,
                title: deck.title,
                author: deck.author,
              })
            }
            onEdit={() =>
              navigation.navigate("AddOrEditDeck", { deckId: deck.id })
            }
            onDelete={() => {
              Alert.alert(
                "Apagar conjunto",
                "Tens a certeza que queres apagar este conjunto?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Apagar",
                    style: "destructive",
                    onPress: () => {
                      deleteDeck(deck.id);
                      setDecks(getDecks());
                    },
                  },
                ]
              );
            }}
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
