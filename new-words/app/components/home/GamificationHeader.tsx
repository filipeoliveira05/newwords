import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "../../../stores/useUserStore";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

// Small component for each stat in the header
const StatItem = ({
  icon,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  color: string;
}) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={24} color={color} />
    <AppText variant="bold" style={[styles.statText, { color }]}>
      {value}
    </AppText>
  </View>
);

// Helper function to format large numbers for display
const formatXp = (num: number): string => {
  if (num >= 10000) {
    // For numbers >= 10k, use 'k' notation with one decimal place
    return `${(num / 1000).toFixed(1)}k`.replace(".0", "");
  }
  // For smaller numbers, show the full value
  return num.toString();
};

// New component for Level and XP progress
const LevelProgress = ({
  level,
  xp,
  xpForNextLevel,
}: {
  level: number;
  xp: number;
  xpForNextLevel: number;
}) => {
  const progress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;

  return (
    <View style={styles.levelContainer}>
      <View style={styles.levelCircle}>
        <AppText variant="bold" style={styles.levelText}>
          {level}
        </AppText>
      </View>
      <View style={styles.xpBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <AppText style={styles.xpText} numberOfLines={1}>
          {formatXp(xp)} / {formatXp(xpForNextLevel)}
        </AppText>
      </View>
    </View>
  );
};

const GamificationHeader = () => {
  const {
    level,
    xp,
    xpForNextLevel,
    consecutiveDays,
    totalWords,
    totalAchievements,
  } = useUserStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <LevelProgress level={level} xp={xp} xpForNextLevel={xpForNextLevel} />
      <View style={styles.separator} />
      <StatItem
        icon="flame-outline"
        value={consecutiveDays}
        color={theme.colors.challenge}
      />
      <View style={styles.separator} />
      <StatItem
        icon="library-outline"
        value={totalWords}
        color={theme.colors.success}
      />
      <View style={styles.separator} />
      <StatItem
        icon="trophy-outline"
        value={totalAchievements}
        color={theme.colors.gold}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed to space-between for better alignment
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingBottom: 12,
    paddingHorizontal: 16, // Increased horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    fontSize: theme.fontSizes.lg,
  },
  separator: {
    width: 1,
    height: "60%",
    backgroundColor: theme.colors.border,
    marginHorizontal: 8, // Add some margin to separators
  },
  // Styles for the new LevelProgress component
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  levelText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
  },
  xpBarContainer: {
    width: 75, // Give the bar a bit more space
    marginTop: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  xpText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
    textAlign: "center", // Ensures the text is centered under the bar
  },
});

export default GamificationHeader;
