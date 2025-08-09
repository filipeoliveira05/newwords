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

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

const SignUpScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await useAuthStore
      .getState()
      .signUpWithEmail(email, password, { firstName, lastName });
    if (error) {
      showAlert({
        title: "Erro de Registo",
        message:
          error.message ||
          "Não foi possível criar a sua conta. Tente novamente.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setLoading(false);
    }
    // Se o registo for bem-sucedido, o RootNavigator trata da mudança de ecrã.
  };

  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>
        Crie a sua conta
      </AppText>
      <AppText style={styles.subtitle}>
        Comece a sua jornada de aprendizagem hoje.
      </AppText>

      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Primeiro Nome"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Último Nome"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
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

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
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
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <AppText variant="bold" style={styles.linkText}>
            Faça login
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Os estilos são idênticos aos do LoginScreen, pode partilhá-los num ficheiro separado se preferir.
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
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameInput: {
    width: "48%",
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
});

export default SignUpScreen;
