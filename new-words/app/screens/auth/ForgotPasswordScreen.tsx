import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import Icon from "@/app/components/Icon";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";
import Toast from "react-native-toast-message";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const ForgotPasswordScreen = ({ navigation, route }: Props) => {
  const [email, setEmail] = useState(route.params?.email || "");
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

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
      Toast.show({
        type: "success",
        text1: "Email Enviado!",
        text2: "Verifique a sua caixa de entrada para o link de recuperação.",
      });
      // Volta ao início da stack de autenticação (LoginScreen)
      navigation.popToTop();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <AppText variant="bold" style={styles.title}>
          Recuperar Palavra-passe
        </AppText>
        <AppText style={styles.subtitle}>
          Insira o seu email para receber um link de recuperação.
        </AppText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

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
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: theme.fontSizes.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
  },
});

export default ForgotPasswordScreen;
