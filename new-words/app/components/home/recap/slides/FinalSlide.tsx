import React from "react";
import { StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import images from "../../../../../services/imageService";

const { width: screenWidth } = Dimensions.get("window");

interface FinalSlideProps {
  onFinish: () => void;
}

const FinalSlide = ({ onFinish }: FinalSlideProps) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <Image source={images.mascotNeutral} style={styles.mascotImage} />
    <AppText variant="bold" style={styles.mascotText}>
      Continue o bom trabalho!
    </AppText>
    <AppText style={styles.mascotSubtext}>
      A consistência é o segredo para a maestria.
    </AppText>
    <TouchableOpacity
      style={styles.doneButton}
      activeOpacity={0.8}
      onPress={onFinish}
    >
      <AppText variant="bold" style={styles.doneButtonText}>
        Continuar
      </AppText>
    </TouchableOpacity>
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
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginVertical: 20,
  },
  mascotText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginTop: 16,
  },
  mascotSubtext: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    width: "90%",
    marginTop: 40,
  },
  doneButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
});

export default FinalSlide;
