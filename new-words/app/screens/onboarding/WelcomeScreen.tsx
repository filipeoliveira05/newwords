import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import images from "@/services/imageService";
import * as hapticService from "../../../services/hapticService";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const WelcomeScreen = ({ navigation }: Props) => {
  const handleCreateAccount = () => {
    hapticService.impactAsync();
    navigation.navigate("Onboarding");
  };

  const handleLogin = () => {
    hapticService.impactAsync();
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={images.appMascotName} style={styles.logo} />
        </View>

        <View style={styles.contentContainer}>
          <View>
            <AppText variant="bold" style={styles.title}>
              Domine Qualquer Palavra. Para Sempre.
            </AppText>
            <AppText style={styles.subtitle}>
              A forma mais inteligente e divertida de expandir o seu
              vocabulário.
            </AppText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              activeOpacity={0.8}
              onPress={handleCreateAccount}
            >
              <AppText variant="bold" style={styles.primaryButtonText}>
                Começar a Aprender
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <AppText variant="medium" style={styles.secondaryButtonText}>
                Já tenho uma conta
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSubtle,
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 460,
    height: 460,
    resizeMode: "contain",
    marginBottom: -15,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  buttonContainer: {
    // Este container ajuda a agrupar os botões no fundo
  },
  button: {
    height: 55,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xxl,
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.xl,
  },
});

export default WelcomeScreen;
