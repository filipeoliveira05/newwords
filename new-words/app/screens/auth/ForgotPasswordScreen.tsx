import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../types/navigation";
import { useNotificationStore } from "../../../stores/useNotificationStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import Icon from "@/app/components/Icon";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";
import images from "@/services/imageService";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const ForgotPasswordScreen = ({ navigation, route }: Props) => {
  const [email, setEmail] = useState(route.params?.email || "");
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);
  const { addNotification } = useNotificationStore();

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      showAlert({
        title: "Email em falta",
        message: "Por favor, insira o seu endereço de email.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    const { error } = await useAuthStore
      .getState()
      .sendPasswordResetEmail(email);

    setLoading(false);

    if (error) {
      showAlert({
        title: "Erro",
        message: getFriendlyAuthErrorMessage(error),
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } else {
      addNotification({
        id: `reset-link-sent-${Date.now()}`,
        type: "generic",
        icon: "mail",
        title: "Email Enviado!",
        subtitle:
          "Verifique a sua caixa de entrada para o link de recuperação.",
      });
      // Volta ao início da stack de autenticação (LoginScreen)
      navigation.popToTop();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={images.appMascotName} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <AppText variant="bold" style={styles.title}>
          Recuperar Palavra-passe
        </AppText>
        <AppText style={styles.subtitle}>
          Insira o seu email para receber um link de recuperação.
        </AppText>
        <View style={styles.inputContainer}>
          <Icon name="mail" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSendResetLink}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <AppText variant="bold" style={styles.buttonText}>
              Enviar Link
            </AppText>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <AppText variant="bold" style={styles.linkText}>
              Voltar para o Login
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSubtle,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 320,
    resizeMode: "contain",
  },
  formContainer: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSubtle,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
  },
  button: {
    height: 55,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    marginTop: 16,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xxl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSubtle,
  },
  linkText: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
  },
});

export default ForgotPasswordScreen;
