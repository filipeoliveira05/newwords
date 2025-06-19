import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

type WordOverviewProps = {
  name: string;
  meaning: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function WordOverview({
  name,
  meaning,
  onEdit,
  onDelete,
}: WordOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.word}>{name}</Text>
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.menuButton,
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#555" />
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: styles.menu }}>
            <MenuOption onSelect={onEdit}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="pencil"
                  size={16}
                  color="#222"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.menuText}>Editar palavra</Text>
              </View>
            </MenuOption>
            <View style={styles.separator} />
            <MenuOption onSelect={onDelete}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="trash"
                  size={16}
                  color="#d11a2a"
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.menuText, { color: "#d11a2a" }]}>
                  Apagar palavra
                </Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  word: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  meaning: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  menu: {
    borderRadius: 8,
    elevation: 4,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 15,
    color: "#222",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
});
