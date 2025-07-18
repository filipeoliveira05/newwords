import React from "react";
import { View, StyleSheet, useWindowDimensions, Image } from "react-native";
import AppText from "../AppText";
import { theme } from "../../../config/theme";
import images, { ImageName } from "@/services/imageService";

interface OnboardingSlideProps {
  item: {
    id: string;
    image: ImageName;
    title: string;
    description: string;
  };
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ item }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={images[item.image]}
        style={styles.mascot}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          {item.title}
        </AppText>
        <AppText style={styles.description}>{item.description}</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  mascot: {
    flex: 1.2,
    justifyContent: "flex-end",
    width: "100%", // Ajusta a largura da imagem conforme necessário
    alignSelf: "center", // Centraliza a imagem horizontalmente
    transform: [{ scale: 1.8 }],
    marginTop: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: theme.fontSizes["5xl"],
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: theme.fontSizes.xxl,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default OnboardingSlide;
