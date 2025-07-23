import React from "react";
import { StyleSheet, Image, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../..//config/theme";
import images from "../../../../../services/imageService";

const { width: screenWidth } = Dimensions.get("window");

interface IntroSlideProps {
  userName: string;
  weekNumber: number;
}

const IntroSlide = ({ userName, weekNumber }: IntroSlideProps) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      O Seu Resumo Semanal Chegou!
    </AppText>
    <AppText style={styles.subtitle}>
      A semana foi boa, {userName}! Vamos ver o seu progresso da Semana{" "}
      {weekNumber}.
    </AppText>
    <Image source={images.mascotAmazed} style={styles.mascotImage} />
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
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginVertical: 20,
  },
});

export default IntroSlide;
