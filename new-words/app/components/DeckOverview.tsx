import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Icon from "./Icon";
import AppText from "./AppText";
import { theme } from "../../config/theme";
import LinearProgressBar from "./LinearProgressBar";

type DeckOverviewProps = {
  title: string;
  author: string;
  totalWords: number;
  masteredWords: number;
  onPress?: () => void;
  onEdit?: () => void;
  onAddWord?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
};

const DeckOverview = ({
  title,
  author,
  totalWords,
  masteredWords,
  onPress,
  onEdit,
  onAddWord,
  onDelete,
  onLongPress,
  isSelected,
  isSelectionMode,
}: DeckOverviewProps) => {
  const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      onLongPress={onLongPress}
      accessibilityLabel={`Abrir o conjunto ${title}, do autor ${author}`}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="albums" size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>
          <AppText style={styles.author}>por {author}</AppText>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <LinearProgressBar
            progress={progress}
            totalWords={totalWords}
            masteredWords={masteredWords}
          />
        </View>
        {/* O menu de opções só é renderizado se não estivermos em modo de seleção. */}
        {!isSelectionMode && (
          <Menu>
            <MenuTrigger
              customStyles={{
                TriggerTouchableComponent: TouchableOpacity,
                triggerWrapper: styles.menuTrigger,
              }}
            >
              <Icon name="ellipsis" size={22} color={theme.colors.icon} />
            </MenuTrigger>
            <MenuOptions customStyles={{ optionsContainer: styles.menu }}>
              <MenuOption onSelect={onAddWord}>
                <View style={styles.menuItem}>
                  <Icon name="add" size={20} color={theme.colors.text} />
                  <AppText style={styles.menuText}>Adicionar palavra</AppText>
                </View>
              </MenuOption>
              <MenuOption onSelect={onEdit}>
                <View style={styles.menuItem}>
                  <Icon name="edit" size={18} color={theme.colors.text} />
                  <AppText style={styles.menuText}>Editar detalhes</AppText>
                </View>
              </MenuOption>

              <View style={styles.separator} />

              <MenuOption onSelect={onDelete}>
                <View style={styles.menuItem}>
                  <Icon
                    name="trash"
                    size={18}
                    color={theme.colors.dangerDark}
                  />
                  <AppText
                    style={[
                      styles.menuText,
                      { color: theme.colors.dangerDark },
                    ]}
                  >
                    Apagar
                  </AppText>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
      </View>
      {isSelected && (
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionIconContainer}>
            <Icon name="checkmark" size={20} color={theme.colors.primary} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(DeckOverview);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginVertical: 8,
    padding: 18, // Ajustado para acomodar a borda, que agora é permanente.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2, // A borda está sempre presente para evitar "saltos" no layout.
    borderColor: "transparent", // Por defeito, a borda é invisível.
  },
  containerSelected: {
    // Quando selecionado, apenas a cor da borda é alterada para ser visível.
    borderColor: theme.colors.primary,
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
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  author: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 16,
  },
  progressContainer: {
    flex: 1,
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
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(99, 102, 241, 0.1)", // Cor primária com opacidade
    borderRadius: 14, // Ligeiramente menor que o container para a borda ser visível
    justifyContent: "center",
    alignItems: "center",
  },
  selectionIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
});
