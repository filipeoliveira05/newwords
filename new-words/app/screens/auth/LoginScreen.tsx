import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleLogin = async () => {
    // 1. Adiciona validação no cliente para campos vazios
    if (!email.trim() || !password.trim()) {
      showAlert({
        title: "Campos em falta",
        message: "Por favor, preencha o email e a palavra-passe.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    const { error } = await useAuthStore
      .getState()
      .signInWithEmail(email, password);
    if (error) {
      showAlert({
        title: "Erro de Login",
        message: getFriendlyAuthErrorMessage(error),
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setLoading(false);
    }
    // Se o login for bem-sucedido, o RootNavigator irá desmontar este ecrã
    // e montar o AppNavigator, pelo que não é preciso fazer setLoading(false).
  };

  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>
        Bem-vindo de volta!
      </AppText>
      <AppText style={styles.subtitle}>
        Faça login para aceder ao seu progresso.
      </AppText>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword", { email })}
        >
          <AppText style={styles.forgotPasswordText}>
            Esqueceu-se da palavra-passe?
          </AppText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <AppText variant="bold" style={styles.buttonText}>
            Entrar
          </AppText>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Não tem uma conta? </AppText>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <AppText variant="bold" style={styles.linkText}>
            Registe-se
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
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
  actionsContainer: {
    alignItems: "center",
    marginBottom: 16,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: theme.colors.primary,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
  },
});

export default LoginScreen;
