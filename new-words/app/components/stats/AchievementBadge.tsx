import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";

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

  const iconColor = unlocked ? "#e9c46a" : "#adb5bd";
  const containerStyle = unlocked
    ? styles.container
    : [styles.container, styles.lockedContainer];
  const textColor = unlocked ? styles.unlockedText : styles.lockedText;

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, textColor]}>{title}</Text>
        <Text style={[styles.description, textColor]}>{description}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  lockedContainer: {
    backgroundColor: "#f8f9fa",
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
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  unlockedText: {
    color: "#495057",
  },
  lockedText: {
    color: "#adb5bd",
  },
});

export default AchievementBadge;
