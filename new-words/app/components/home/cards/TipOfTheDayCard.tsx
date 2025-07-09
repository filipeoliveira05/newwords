import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  tip: {
    title: string;
    text: string;
  };
};

const TipOfTheDayCard = ({ tip }: Props) => {
  return (
    <View style={styles.card}>
      <Ionicons name="bulb-outline" size={24} color={theme.colors.favorite} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          {tip.title}
        </AppText>
        <AppText style={styles.subtitle}>{tip.text}</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start", // Align to top for longer text
    marginTop: 16,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: { fontSize: theme.fontSizes.base, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
});

export default TipOfTheDayCard;
