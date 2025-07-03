import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../AppText";
import { theme } from "../../theme";

type DailyGoalProgressProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  current: number;
  target: number;
};

const DailyGoalProgress = ({
  icon,
  title,
  current,
  target,
}: DailyGoalProgressProps) => {
  const progress = Math.min((current / target) * 100, 100);
  const isCompleted = progress >= 100;

  return (
    <View style={styles.container}>
      <Ionicons
        name={isCompleted ? "checkmark-circle" : icon}
        size={24}
        color={isCompleted ? theme.colors.success : theme.colors.textMedium}
        style={styles.icon}
      />
      <View style={styles.details}>
        <View style={styles.titleContainer}>
          <AppText
            variant="medium"
            style={[styles.title, isCompleted && styles.completedText]}
          >
            {title}
          </AppText>
          <AppText
            variant={isCompleted ? "bold" : "regular"}
            style={[styles.progressText, isCompleted && styles.completedText]}
          >
            {Math.min(current, target)} / {target}
          </AppText>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  icon: { marginRight: 12 },
  details: { flex: 1 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: theme.fontSizes.sm, color: theme.colors.textMedium },
  progressText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  completedText: { color: theme.colors.success },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.success,
    borderRadius: 4,
  },
});

export default DailyGoalProgress;
