import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { theme } from "../../../config/theme";
import images from "../../../services/imageService";

// Este ecrã simula exatamente as configurações do splash screen definidas no app.config.js
const SplashScreenTestScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={images.splashScreen} // Usando o imageService para consistência
        style={styles.image}
        resizeMode="contain" // A mesma resizeMode do app.config.js
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSubtle, // A mesma cor de fundo do app.config.js
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreenTestScreen;
