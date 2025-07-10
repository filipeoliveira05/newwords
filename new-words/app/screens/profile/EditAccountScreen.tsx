import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import { ProfileStackParamList } from "../../../types/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import Icon from "../../components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditAccount">;

const EditAccountScreen = ({ navigation }: Props) => {
  const { user, updateUserDetails } = useUserStore();
  const { showAlert } = useAlertStore.getState();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Set initial state for comparison
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  // Check for changes to set the dirty state
  useEffect(() => {
    if (!user) return;
    if (
      firstName !== user.firstName ||
      lastName !== user.lastName ||
      email !== user.email
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [firstName, lastName, email, user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Editar Detalhes",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Conta",
    });
  }, [navigation]);

  // Warn user before leaving with unsaved changes
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (!isDirty || isSaving) {
          return;
        }
        e.preventDefault();
        showAlert({
          title: "Sair sem guardar?",
          message: "Tem alterações não guardadas. Tem a certeza que quer sair?",
          buttons: [
            { text: "Ficar", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ],
        });
      }),
    [navigation, isDirty, isSaving, showAlert]
  );

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert({
        title: "Nome Inválido",
        message: "O nome não pode estar em branco.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateUserDetails({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Guardado!",
        text2: "Os seus detalhes foram atualizados.",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao guardar detalhes da conta:", error);
      showAlert({
        title: "Erro",
        message: "Não foi possível guardar as alterações.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>PRIMEIRO NOME</AppText>
            <Pressable style={styles.inputContainer}>
              <Icon name="person" style={styles.inputIcon} size={22} />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="O seu nome"
                placeholderTextColor={theme.colors.placeholder}
                maxLength={25}
              />
            </Pressable>
          </View>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>ÚLTIMO NOME</AppText>
            <Pressable style={styles.inputContainer}>
              <Icon name="person" style={styles.inputIcon} size={22} />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="O seu apelido"
                placeholderTextColor={theme.colors.placeholder}
                maxLength={25}
              />
            </Pressable>
          </View>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>EMAIL</AppText>
            <Pressable style={styles.inputContainer}>
              <Icon name="mail" style={styles.inputIcon} size={22} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="O seu email"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Pressable>
          </View>
        </View>

        {isDirty && (
          <View style={styles.saveBarContainer}>
            <TouchableOpacity
              style={[styles.button, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <AppText variant="bold" style={styles.buttonText}>
                  Guardar Alterações
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    color: theme.colors.textMuted,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
  },
  saveBarContainer: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
});

export default EditAccountScreen;
