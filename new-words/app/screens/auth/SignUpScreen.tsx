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
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import Icon from "@/app/components/Icon";
import { useAuthStore } from "../../../stores/useAuthStore";
import images from "@/services/imageService";
import { useAlertStore } from "../../../stores/useAlertStore";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

const SignUpScreen = ({ route, navigation }: Props) => {
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleSignUp = async () => {
    // 1. Adiciona validação no cliente para campos vazios
    if (
      !email.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      showAlert({
        title: "Campos em falta",
        message: "Por favor, preencha todos os campos para criar a sua conta.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    const { error } = await useAuthStore
      .getState()
      .signUpWithEmail(
        email,
        password,
        { firstName, lastName },
        fromOnboarding
      );
    if (error) {
      showAlert({
        title: "Erro ao Criar Conta",
        message: getFriendlyAuthErrorMessage(error),
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setLoading(false);
    }
    // Se o registo for bem-sucedido, o RootNavigator trata da mudança de ecrã.
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={images.appMascotName} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.formContainer}>
          <AppText variant="bold" style={styles.title}>
            Crie a sua conta
          </AppText>

          <View style={styles.inputContainer}>
            <Icon name="person" size={22} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Primeiro Nome"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="person" size={22} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Último Nome"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="mail" size={22} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Palavra-passe"
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
            style={[styles.button, styles.primaryButton]}
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <AppText variant="bold" style={styles.buttonText}>
                Criar Conta
              </AppText>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <AppText style={styles.footerText}>Já tem uma conta? </AppText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                // Volta ao início da stack de autenticação (LoginScreen) em vez de empilhar ecrãs.
                navigation.popToTop();
              }}
            >
              <AppText variant="bold" style={styles.linkText}>
                Faça login
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Os estilos são idênticos aos do LoginScreen, pode partilhá-los num ficheiro separado se preferir.
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
    marginBottom: -15, // Adjusted to bring form closer
  },
  formContainer: {
    paddingHorizontal: 15,
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
  eyeIcon: {
    padding: 5,
  },
  button: {
    height: 55,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    marginTop: 12,
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

export default SignUpScreen;
