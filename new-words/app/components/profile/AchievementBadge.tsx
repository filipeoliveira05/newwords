import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import AppText from "../AppText";
import Icon, { IconName } from "../Icon";
import { theme } from "../../../config/theme";
import {
  AchievementCategory,
  AchievementRank,
} from "../../../config/achievements";

type AchievementBadgeProps = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  category: AchievementCategory;
  rank?: AchievementRank;
  unlocked: boolean;
  isNew: boolean;
};

const AchievementBadge = ({
  id,
  title,
  description,
  icon,
  category,
  rank,
  unlocked,
  isNew,
}: AchievementBadgeProps) => {
  const scale = useSharedValue(isNew ? 0.5 : 1);
  const opacity = useSharedValue(isNew ? 0 : 1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (isNew) {
      // A animação é acionada com um pequeno atraso para ser mais percetível,
      // especialmente se várias conquistas forem desbloqueadas ao mesmo tempo.
      scale.value = withDelay(
        300,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
      opacity.value = withDelay(300, withSpring(1));
    }
  }, [isNew, scale, opacity]);

  // Mapeia o rank para uma cor específica. Se não houver rank, usa a cor dourada padrão.
  const getRankColor = () => {
    if (!rank) return theme.colors.gold;
    const rankColorMap: Record<AchievementRank, string> = {
      Bronze: theme.colors.bronze,
      Silver: theme.colors.silver,
      Gold: theme.colors.gold,
      Platinum: theme.colors.platinum,
      Diamond: theme.colors.diamond,
      Master: theme.colors.master,
      Legendary: theme.colors.legendary,
    };
    return rankColorMap[rank] ?? theme.colors.gold;
  };

  const iconColor = unlocked ? getRankColor() : theme.colors.iconMuted;

  // Opção 2: A cor da borda é ditada pelo rank, para dar ênfase ao prestígio.
  // Para conquistas bloqueadas, usamos a cor de borda padrão.
  const borderColor = unlocked ? getRankColor() : theme.colors.border;

  const containerStyle = unlocked
    ? styles.container
    : [styles.container, styles.lockedContainer];

  return (
    <Animated.View
      style={[containerStyle, { borderLeftColor: borderColor }, animatedStyle]}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={32} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <AppText
          variant="bold"
          style={[
            styles.title,
            unlocked ? styles.unlockedText : styles.lockedText,
          ]}
        >
          {title}
        </AppText>
        <AppText
          style={[
            styles.description,
            unlocked ? styles.unlockedText : styles.lockedText,
          ]}
        >
          {description}
        </AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Em vez de usar 'borderColor', que se aplica a todos os lados,
    // definimos as bordas individualmente para permitir que 'borderLeftColor' seja dinâmico.
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderRightColor: theme.colors.borderLight,
    borderBottomColor: theme.colors.borderLight,
    borderLeftWidth: 4, // Adiciona uma borda esquerda mais grossa para a cor da categoria
  },
  lockedContainer: {
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.md,
  },
  description: {
    fontSize: theme.fontSizes.base,
    marginTop: 2,
  },
  unlockedText: {
    color: theme.colors.textMedium,
  },
  lockedText: {
    color: theme.colors.textMuted,
  },
});

export default AchievementBadge;
