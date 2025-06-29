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
  onAddWord?: () => void;
  onDelete?: () => void;
};

export default function DeckOverview({
  title,
  author,
  totalWords,
  onPress,
  onEdit,
  onAddWord,
  onDelete,
}: DeckOverviewProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Abrir o conjunto ${title}, do autor ${author}`}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="albums-outline" size={28} color="#4F8EF7" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.author}>por {author}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.words}>{totalWords} palavras</Text>
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
            <MenuOption onSelect={onAddWord}>
              <View style={styles.menuItem}>
                <Ionicons name="add" size={20} color="#222" />
                <Text style={styles.menuText}>Adicionar palavra</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={onEdit}>
              <View style={styles.menuItem}>
                <Ionicons name="pencil" size={18} color="#222" />
                <Text style={styles.menuText}>Editar detalhes</Text>
              </View>
            </MenuOption>

            <View style={styles.separator} />

            <MenuOption onSelect={onDelete}>
              <View style={styles.menuItem}>
                <Ionicons name="trash" size={18} color="#d11a2a" />
                <Text style={[styles.menuText, { color: "#d11a2a" }]}>
                  Apagar
                </Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#22223b",
  },
  author: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingTop: 16,
  },
  words: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
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
  },
});
