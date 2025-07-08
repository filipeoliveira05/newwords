import React from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { setMetaValue } from "../../../services/storage";

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

type Props = {
  navigation: OnboardingScreenNavigationProp;
};

const OnboardingScreen = ({ navigation }: Props) => {
  const handleStart = async () => {
    await setMetaValue("has_completed_onboarding", "true");
    // Substitui o ecrã de onboarding pelo da app principal para que o utilizador não possa voltar atrás.
    navigation.replace("MainApp");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="book-outline" size={120} color={theme.colors.primary} />
        <AppText variant="bold" style={styles.title}>
          Bem-vindo ao NewWords
        </AppText>
        <AppText style={styles.subtitle}>
          A sua jornada para dominar um novo vocabulário começa agora.
        </AppText>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <AppText variant="bold" style={styles.buttonText}>
          Começar a Aprender
        </AppText>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
  },
});

export default OnboardingScreen;
