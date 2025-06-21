import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDeckStore } from "@/stores/deckStore";
import DeckOverview from "../components/DeckOverview";

export default function HomeDecksScreen({ navigation }: any) {
  const { decks, loading, fetchDecks, deleteDeck } = useDeckStore();

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={{ marginTop: 8 }}>A carregar conjuntos...</Text>
      </View>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.title}>Ainda não tem conjuntos.</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddOrEditDeck")}
        >
          <Text style={{ color: "#4F8EF7", marginTop: 16 }}>
            Crie o seu primeiro!
          </Text>
        </TouchableOpacity>
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
        {decks.map((deck) => (
          <DeckOverview
            key={deck.id}
            title={deck.title}
            author={deck.author}
            totalWords={deck.wordCount}
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
                    onPress: async () => {
                      try {
                        await deleteDeck(deck.id);
                      } catch (error) {
                        console.error("Falha ao apagar o conjunto:", error);
                        Alert.alert(
                          "Erro",
                          "Não foi possível apagar o conjunto. Tente novamente."
                        );
                      }
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
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
