import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { AuthStackParamList } from "../../../types/navigation";
import Icon from "../../../app/components/Icon";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";

// Garante que o browser da app pode ser dispensado para voltar à app.
// É seguro chamar isto no arranque.
WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

  // Hook do expo-auth-session para o fluxo de login com Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    // webClientId é para web e Expo Go. Usa o Client ID do tipo "Web".
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // androidClientId é para a app Android standalone. Usa o Client ID do tipo "Android".
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // iosClientId é para a app iOS standalone.
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ["profile", "email"],
  });

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

  // Efeito que reage à resposta do fluxo de autenticação do Google
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        if (id_token) {
          const { error } = await useAuthStore
            .getState()
            .signInWithIdToken(id_token);
          if (error) {
            showAlert({
              title: "Erro de Login com Google",
              message: getFriendlyAuthErrorMessage(error),
              buttons: [{ text: "OK", onPress: () => {} }],
            });
          }
          // Se o login for bem-sucedido, o onAuthStateChange e o RootNavigator tratam do resto.
        }
      } else if (response?.type === "error") {
        showAlert({
          title: "Erro de Login com Google",
          message:
            response.error?.message ||
            "Ocorreu um erro durante a autenticação.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
      }
      // Independentemente do resultado (success, error, cancel), o fluxo terminou.
      setIsGoogleLoading(false);
    };

    if (response) {
      handleAuthResponse();
    }
  }, [response, showAlert]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    // Inicia o fluxo de autenticação do Google. O useEffect irá lidar com a resposta.
    // Não definimos isGoogleLoading(false) aqui, porque o fluxo pode ser cancelado pelo utilizador.
    // O useEffect que ouve a 'response' é o responsável por parar o loading.
    await promptAsync();
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

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <AppText style={styles.separatorText}>OU</AppText>
        <View style={styles.separatorLine} />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleSignIn}
        disabled={loading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <Icon size={20} name="google" color={theme.colors.text} />
            <AppText variant="bold" style={styles.googleButtonText}>
              Continuar com Google
            </AppText>
          </>
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
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    marginHorizontal: 12,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
  googleButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    justifyContent: "center",
  },
  googleButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    marginLeft: 12,
  },
});

export default LoginScreen;
