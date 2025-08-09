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
import Toast from "react-native-toast-message";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { getFriendlyAuthErrorMessage } from "../../../utils/authErrorUtils";

const UpdatePasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const showAlert = useAlertStore((state) => state.showAlert);

  const handleUpdatePassword = async () => {
    if (!password) {
      showAlert({
        title: "Palavra-passe em falta",
        message: "Por favor, insira a sua nova palavra-passe.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }
    if (password !== confirmPassword) {
      showAlert({
        title: "Palavras-passe não coincidem",
        message: "Por favor, verifique se as palavras-passe são iguais.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    const { error } = await useAuthStore
      .getState()
      .updateUserPassword(password);

    setLoading(false);

    if (error) {
      showAlert({
        title: "Erro ao Atualizar",
        message: getFriendlyAuthErrorMessage(error),
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } else {
      // 1. Mostra uma mensagem de sucesso clara.
      Toast.show({
        type: "success",
        text1: "Palavra-passe atualizada!",
        text2: "Pode agora fazer login com as novas credenciais.",
      });
      // 2. Termina a sessão imediatamente. O RootNavigator irá detetar
      //    que a sessão é nula e redirecionar para o ecrã de login.
      await useAuthStore.getState().signOut();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <AppText variant="bold" style={styles.title}>
          Defina uma Nova Palavra-passe
        </AppText>
        <AppText style={styles.subtitle}>
          A sua nova palavra-passe deve ser diferente das anteriores.
        </AppText>

        <TextInput
          style={styles.input}
          placeholder="Nova palavra-passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoFocus
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nova palavra-passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <AppText variant="bold" style={styles.buttonText}>
              Guardar Palavra-passe
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
    justifyContent: "center",
  },
  content: {
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

export default UpdatePasswordScreen;
