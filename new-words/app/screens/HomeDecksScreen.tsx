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
      <View style={styles.emptyContainer}>
        <Ionicons name="file-tray-stacked-outline" size={80} color="#ced4da" />
        <Text style={styles.emptyTitle}>Nenhum conjunto encontrado</Text>
        <Text style={styles.emptySubtitle}>
          Comece por criar o seu primeiro conjunto de palavras.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("AddOrEditDeck")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Criar Primeiro Conjunto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Conjuntos</Text>
        <Text style={styles.subtitle}>
          Continue a sua jornada de aprendizagem.
        </Text>
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
            onAddWord={() =>
              navigation.navigate("DeckDetail", {
                deckId: deck.id,
                title: deck.title,
                author: deck.author,
                openAddWordModal: true,
              })
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddOrEditDeck")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for the FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#495057",
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4F8EF7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
