import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        color={isCompleted ? "#2a9d8f" : "#495057"}
        style={styles.icon}
      />
      <View style={styles.details}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isCompleted && styles.completedText]}>
            {title}
          </Text>
          <Text
            style={[styles.progressText, isCompleted && styles.completedText]}
          >
            {Math.min(current, target)} / {target}
          </Text>
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
  title: { fontSize: 15, fontWeight: "500", color: "#495057" },
  progressText: { fontSize: 14, color: "#6c757d" },
  completedText: { color: "#2a9d8f", fontWeight: "bold" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2a9d8f",
    borderRadius: 4,
  },
});

export default DailyGoalProgress;
