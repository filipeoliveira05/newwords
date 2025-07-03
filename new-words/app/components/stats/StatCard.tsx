import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../AppText";
import { theme } from "../../theme";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
};

const StatCard = ({ icon, value, label, color }: StatCardProps) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <AppText variant="bold" style={styles.statValue}>
      {value}
    </AppText>
    <AppText style={styles.statLabel}>{label}</AppText>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: theme.fontSizes["3xl"],
    marginVertical: 8,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default StatCard;
