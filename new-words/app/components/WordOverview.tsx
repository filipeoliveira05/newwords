import React, { useRef, memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Swipeable } from "react-native-gesture-handler";
import AppText from "./AppText";
import { theme } from "../../config/theme";

type WordOverviewProps = {
  name: string;
  meaning: string;
  masteryLevel: "new" | "learning" | "mastered";
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: number; // 1 for favorite, 0 for not favorite
  displayValue?: string | number;
  displayLabel?: string;
  displayIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
  };
};

const WordOverview = ({
  name,
  meaning,
  masteryLevel,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleFavorite,
  isFavorite,
  displayValue,
  displayLabel,
  displayIcon,
}: WordOverviewProps) => {
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
    new: theme.colors.mastery.new,
    learning: theme.colors.mastery.learning,
    mastered: theme.colors.mastery.mastered,
  }[masteryLevel];

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View
          style={[styles.masteryIndicator, { backgroundColor: masteryColor }]}
        />
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.word}>
            {name}
          </AppText>
          <AppText style={styles.meaning}>{meaning}</AppText>
        </View>
        {/* Mostra o valor da ordenação, se existir */}
        {displayIcon ? (
          <View style={styles.displayValueContainer}>
            <Ionicons
              name={displayIcon.name}
              size={24}
              color={displayIcon.color}
            />
            {displayLabel && (
              <AppText style={styles.displayLabel}>{displayLabel}</AppText>
            )}
          </View>
        ) : (
          displayValue !== undefined && (
            <View style={styles.displayValueContainer}>
              <AppText variant="bold" style={styles.displayValue}>
                {displayValue}
              </AppText>
              {displayLabel && (
                <AppText style={styles.displayLabel}>{displayLabel}</AppText>
              )}
            </View>
          )
        )}
        <TouchableOpacity
          onPress={onToggleFavorite}
          style={styles.favoriteIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite === 1 ? "star" : "star-outline"}
            size={18}
            color={
              isFavorite === 1 ? theme.colors.favorite : theme.colors.iconMuted
            }
          />
        </TouchableOpacity>
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.menuTrigger,
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={theme.colors.icon}
            />
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: styles.menu }}>
            <MenuOption onSelect={onViewDetails}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color={theme.colors.textMedium}
                />
                <AppText style={styles.menuText}>Ver Detalhes</AppText>
              </View>
            </MenuOption>
            <MenuOption onSelect={onToggleFavorite}>
              <View style={styles.menuItem}>
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={18}
                  color={
                    isFavorite ? theme.colors.favorite : theme.colors.iconMuted
                  }
                />
                <AppText style={styles.menuText}>
                  {isFavorite ? "Desfavoritar" : "Favoritar"}
                </AppText>
              </View>
            </MenuOption>
            <MenuOption onSelect={onEdit}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="pencil-outline"
                  size={18}
                  color={theme.colors.textMedium}
                />
                <AppText style={styles.menuText}>Editar</AppText>
              </View>
            </MenuOption>
            <View style={styles.separator} />
            <MenuOption onSelect={onDelete}>
              <View style={styles.menuItem}>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.colors.dangerDark}
                />
                <AppText
                  style={[styles.menuText, { color: theme.colors.dangerDark }]}
                >
                  Apagar
                </AppText>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </Swipeable>
  );
};

export default memo(WordOverview);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    marginBottom: 4,
  },
  meaning: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  displayValueContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 12,
    minWidth: 50,
  },
  displayValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
  },
  displayLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  favoriteIcon: {
    marginRight: 8,
    padding: 4, // Adiciona um pequeno padding para o hitSlop funcionar melhor
  },
  menuTrigger: {
    padding: 8,
    marginRight: -12,
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
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
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
    backgroundColor: theme.colors.textMuted,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
