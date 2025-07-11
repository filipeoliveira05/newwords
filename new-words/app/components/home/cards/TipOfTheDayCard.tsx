import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import Icon from "../../Icon";

type Props = {
  tip: {
    title: string;
    text: string;
  };
};

const TipOfTheDayCard = ({ tip }: Props) => {
  return (
    <View style={styles.card}>
      <Icon name="bulb" size={24} color={theme.colors.favorite} />
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
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
});

export default TipOfTheDayCard;
