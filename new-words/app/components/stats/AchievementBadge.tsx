import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import AppText from "../AppText";
import { theme } from "../../theme";

type AchievementBadgeProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
  isNew: boolean;
};

const AchievementBadge = ({
  title,
  description,
  icon,
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

  const iconColor = unlocked ? theme.colors.warning : theme.colors.iconMuted;
  const containerStyle = unlocked
    ? styles.container
    : [styles.container, styles.lockedContainer];

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color={iconColor} />
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
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
    fontSize: theme.fontSizes.base,
  },
  description: {
    fontSize: theme.fontSizes.sm,
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
