import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

interface OnboardingSlideProps {
  item: {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
  };
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ item }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Ionicons
        name={item.icon}
        size={120}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <AppText variant="bold" style={styles.title}>
        {item.title}
      </AppText>
      <AppText style={styles.description}>{item.description}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  icon: {
    marginBottom: 40,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: theme.fontSizes.xl,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default OnboardingSlide;
