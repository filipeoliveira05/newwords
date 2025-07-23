import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";

const { width: screenWidth } = Dimensions.get("window");

export interface HighlightData {
  label: string;
  value: string;
  subValue?: string;
}

interface MainHighlightSlideProps {
  data: HighlightData;
}

const MainHighlightSlide = ({ data }: MainHighlightSlideProps) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      O Seu Grande Destaque!
    </AppText>
    <View style={styles.mainHighlightCard}>
      <AppText style={styles.mainHighlightText}>{data.label}</AppText>
      <AppText variant="bold" style={styles.mainHighlightValue}>
        {data.value}
      </AppText>
      {data.subValue && (
        <AppText style={styles.mainHighlightSubValue}>{data.subValue}</AppText>
      )}
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  slideContent: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  mainHighlightCard: {
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  mainHighlightText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.primaryDarker,
    textAlign: "center",
  },
  mainHighlightValue: {
    fontSize: 80,
    color: theme.colors.primary,
    marginVertical: 8,
    textAlign: "center",
  },
  mainHighlightSubValue: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.primaryDarker,
    textAlign: "center",
    marginTop: -8,
  },
});

export default MainHighlightSlide;
