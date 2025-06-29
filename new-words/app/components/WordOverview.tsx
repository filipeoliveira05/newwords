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
      <View style={styles.textContainer}>
        <Text style={styles.word}>{name}</Text>
        <Text style={styles.meaning}>{meaning}</Text>
      </View>
      <Menu>
        <MenuTrigger
          customStyles={{
            TriggerTouchableComponent: TouchableOpacity,
            triggerWrapper: styles.menuTrigger,
          }}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#6c757d" />
        </MenuTrigger>
        <MenuOptions customStyles={{ optionsContainer: styles.menu }}>
          <MenuOption onSelect={onEdit}>
            <View style={styles.menuItem}>
              <Ionicons name="pencil-outline" size={18} color="#222" />
              <Text style={styles.menuText}>Editar</Text>
            </View>
          </MenuOption>
          <View style={styles.separator} />
          <MenuOption onSelect={onDelete}>
            <View style={styles.menuItem}>
              <Ionicons name="trash-outline" size={18} color="#d11a2a" />
              <Text style={[styles.menuText, { color: "#d11a2a" }]}>
                Apagar
              </Text>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  word: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    color: "#6c757d",
  },
  menuTrigger: {
    padding: 8,
  },
  menu: {
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    color: "#222",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
});
