import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

type DeckOverviewProps = {
  title: string;
  author: string;
  totalWords: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function DeckOverview({
  title,
  author,
  totalWords,
  onPress,
  onEdit,
  onDelete,
}: DeckOverviewProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Abrir o conjunto ${title}, do autor ${author}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.menuButton,
            }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#555" />
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: styles.menu }}>
            <MenuOption onSelect={onEdit}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="pencil"
                  size={18}
                  color="#222"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.menuText}>Editar conjunto</Text>
              </View>
            </MenuOption>

            <View style={styles.separator} />

            <MenuOption onSelect={onDelete}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="trash"
                  size={18}
                  color="#d11a2a"
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.menuText, { color: "#d11a2a" }]}>
                  Apagar conjunto
                </Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    flex: 1,
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
  menu: {
    borderRadius: 8,
    elevation: 4,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: "#222",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
});
