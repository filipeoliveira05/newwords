import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { AuthStackParamList } from "../../../types/navigation";
import Icon from "../../../app/components/Icon";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import images from "@/services/imageService";
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleForgotPassword = () => {
    // Navega para o ecrã de recuperação, passando o email que já foi digitado.
    navigation.navigate("ForgotPassword", {
      email: email,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={images.appMascotName} style={styles.logo} />
      </View>

      <View style={styles.formContainer}>
        <AppText variant="bold" style={styles.title}>
          O que vamos aprender hoje?
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

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Palavra-passe"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            activeOpacity={0.8}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? "eyeOff" : "eye"}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          activeOpacity={0.8}
          onPress={handleForgotPassword}
        >
          <AppText style={styles.forgotPasswordText}>
            Esqueceu-se da palavra-passe?
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={loading || isGoogleLoading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <AppText variant="bold" style={styles.buttonText}>
              Entrar
            </AppText>
          )}
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <AppText variant="bold" style={styles.separatorText}>
            OU
          </AppText>
          <View style={styles.separatorLine} />
        </View>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          activeOpacity={0.8}
          onPress={handleGoogleSignIn}
          disabled={loading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#E85D5D" />
          ) : (
            <>
              <Icon size={20} name="google" color={theme.colors.black} />
              <AppText variant="medium" style={styles.googleButtonText}>
                Continuar com Google
              </AppText>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>Não tem uma conta? </AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("SignUp")}
          >
            <AppText variant="bold" style={styles.linkText}>
              Registe-se
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
    marginBottom: -15,
  },
  formContainer: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSubtle,
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: 10, // Espaçamento reduzido
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
  eyeIcon: {
    padding: 5,
  },
  button: {
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    marginTop: 12, // Espaçamento reduzido
  },
  forgotPasswordButton: {
    alignSelf: "center",
    paddingVertical: 8,
    marginBottom: 12, // Espaçamento reduzido
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
  forgotPasswordText: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.base,
    marginBottom: -10,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  separatorText: {
    marginHorizontal: 12,
    color: theme.colors.textSubtle,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    textTransform: "uppercase",
  },
  googleButton: {
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
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
  googleButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.xl,
    marginLeft: 12,
  },
});

export default LoginScreen;
