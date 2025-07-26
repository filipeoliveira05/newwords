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
import { AchievementCategory } from "../../../config/achievements";

type AchievementBadgeProps = {
  title: string;
  description: string;
  icon: IconName;
  category: AchievementCategory;
  unlocked: boolean;
  isNew: boolean;
};

const AchievementBadge = ({
  title,
  description,
  icon,
  category,
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

  const iconColor = unlocked ? theme.colors.gold : theme.colors.iconMuted;

  const categoryColor = unlocked
    ? theme.colors.achievementCategory[category] ?? theme.colors.textMuted
    : theme.colors.textMuted;

  const containerStyle = unlocked
    ? styles.container
    : [styles.container, styles.lockedContainer];

  return (
    <Animated.View
      style={[
        containerStyle,
        { borderLeftColor: categoryColor },
        animatedStyle,
      ]}
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
