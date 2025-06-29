import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AchievementBadgeProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
};

const AchievementBadge = ({
  title,
  description,
  icon,
  unlocked,
}: AchievementBadgeProps) => {
  const iconColor = unlocked ? "#e9c46a" : "#adb5bd";
  const containerStyle = unlocked
    ? styles.container
    : [styles.container, styles.lockedContainer];
  const textColor = unlocked ? styles.unlockedText : styles.lockedText;

  return (
    <View style={containerStyle}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, textColor]}>{title}</Text>
        <Text style={[styles.description, textColor]}>{description}</Text>
      </View>
    </View>
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
