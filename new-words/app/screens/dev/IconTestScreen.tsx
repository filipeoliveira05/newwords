import React, { useState } from "react";
import { View, Image, StyleSheet, Switch } from "react-native";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import images from "../../../services/imageService";

const ICON_VIEWPORT_SIZE = 256; // Tamanho do container de visualização
const MASK_SIZE = ICON_VIEWPORT_SIZE; // O ícone ocupa todo o espaço
const SAFE_ZONE_DIAMETER = (66 / 108) * MASK_SIZE; // Diâmetro da safe zone (padrão Android: 66dp de 108dp)

const IconPreview = ({
  maskStyle,
  showSafeZone,
}: {
  maskStyle: any;
  showSafeZone: boolean;
}) => (
  <View style={[styles.iconContainer, maskStyle]}>
    <Image source={images.appIcon} style={styles.iconImage} />
    {showSafeZone && <View style={styles.safeZone} />}
  </View>
);

const IconTestScreen = () => {
  const [showSafeZone, setShowSafeZone] = useState(true);

  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>
        Simulador de Ícone
      </AppText>
      <AppText style={styles.subtitle}>
        Ajuste a sua imagem `app_icon.png` para que o conteúdo principal fique
        dentro da área segura (círculo vermelho).
      </AppText>

      <View style={styles.previewsContainer}>
        <View style={styles.previewItem}>
          <AppText style={styles.maskLabel}>Círculo</AppText>
          <IconPreview
            maskStyle={styles.circleMask}
            showSafeZone={showSafeZone}
          />
        </View>
        <View style={styles.previewItem}>
          <AppText style={styles.maskLabel}>Quadrado Arredondado</AppText>
          <IconPreview
            maskStyle={styles.squircleMask}
            showSafeZone={showSafeZone}
          />
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <AppText style={styles.toggleLabel}>Mostrar Área Segura</AppText>
        <Switch
          value={showSafeZone}
          onValueChange={setShowSafeZone}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primaryLight,
          }}
          thumbColor={
            showSafeZone ? theme.colors.primary : theme.colors.surface
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  previewsContainer: {
    justifyContent: "space-around",
    width: "100%",
  },
  previewItem: {
    alignItems: "center",
  },
  maskLabel: {
    marginBottom: 12,
    color: theme.colors.textMedium,
  },
  iconContainer: {
    width: ICON_VIEWPORT_SIZE,
    height: ICON_VIEWPORT_SIZE,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff2da", // Mesma cor do app.config.js
    overflow: "hidden", // Essencial para a máscara funcionar
    position: "relative",
  },
  circleMask: {
    borderRadius: ICON_VIEWPORT_SIZE / 2,
  },
  squircleMask: {
    borderRadius: ICON_VIEWPORT_SIZE / 5, // Valor comum para "squircles"
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  safeZone: {
    position: "absolute",
    width: SAFE_ZONE_DIAMETER,
    height: SAFE_ZONE_DIAMETER,
    borderRadius: SAFE_ZONE_DIAMETER / 2,
    borderWidth: 2,
    borderColor: "red",
    borderStyle: "dashed",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  toggleLabel: {
    marginRight: 10,
    fontSize: theme.fontSizes.lg,
  },
});

export default IconTestScreen;
