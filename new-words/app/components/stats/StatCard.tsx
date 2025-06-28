import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
};

const StatCard = ({ icon, value, label, color }: StatCardProps) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22223b",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#6c757d",
    textAlign: "center",
  },
});

export default StatCard;
