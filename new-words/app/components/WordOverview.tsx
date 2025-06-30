import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Swipeable } from "react-native-gesture-handler";

type WordOverviewProps = {
  name: string;
  meaning: string;
  masteryLevel: "new" | "learning" | "mastered";
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function WordOverview({
  name,
  meaning,
  masteryLevel,
  onEdit,
  onDelete,
}: WordOverviewProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleEditPress = () => {
    if (onEdit) {
      onEdit();
    }
    swipeableRef.current?.close();
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEditPress}
        >
          <Ionicons name="pencil-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const masteryColor = {
    new: "#adb5bd", // cinzento para palavras novas
    learning: "#f4a261", // laranja para palavras em aprendizagem
    mastered: "#2a9d8f", // verde para palavras dominadas
  }[masteryLevel];

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View
          style={[styles.masteryIndicator, { backgroundColor: masteryColor }]}
        />
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
            <MenuOption onSelect={() => {}} disabled>
              <View style={styles.menuItem}>
                <Ionicons name="eye-outline" size={18} color="#495057" />
                <Text style={styles.menuText}>Ver Detalhes</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => {}} disabled>
              <View style={styles.menuItem}>
                <Ionicons name="star-outline" size={18} color="#495057" />
                <Text style={styles.menuText}>Favoritar</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={onEdit}>
              <View style={styles.menuItem}>
                <Ionicons name="pencil-outline" size={18} color="#495057" />
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
    </Swipeable>
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
  masteryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
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
  rightActionContainer: {
    flexDirection: "row",
    width: 120, // Largura total para os dois botões
    marginBottom: 12, // Para alinhar com o margin do container principal
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#adb5bd", // Um cinza mais claro e neutro
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  deleteButton: {
    backgroundColor: "#e76f51",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
