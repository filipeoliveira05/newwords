import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

import { ProfileStackParamList } from "../../../types/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import { useNotificationStore } from "../../../stores/useNotificationStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import Icon from "../../components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditAccount">;

const EditAccountScreen = ({ navigation }: Props) => {
  const { user, updateUserDetails, updateProfilePicture } = useUserStore();
  const { showAlert } = useAlertStore.getState();
  const { addNotification } = useNotificationStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      addNotification({
        id: `save-success-${Date.now()}`,
        type: "generic",
        icon: "checkmarkCircle",
        title: "Guardado!",
        subtitle: "Os seus detalhes foram atualizados.",
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

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      showAlert({
        title: "Permissão necessária",
        message:
          "É necessário permitir o acesso à galeria para escolher uma foto.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      // A sintaxe `MediaTypeOptions` foi depreciada.
      // A nova sintaxe usa um array de strings para especificar os tipos de media.
      // Ver: https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatype
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (pickerResult.canceled) return;

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      setIsUploading(true);
      try {
        await updateProfilePicture(uri);
        addNotification({
          id: `avatar-success-${Date.now()}`,
          type: "generic",
          icon: "camera",
          title: "Foto de perfil atualizada!",
          subtitle: "A sua nova foto está visível em toda a aplicação.",
        });
      } catch (error) {
        showAlert({
          title: "Erro de Upload",
          message: "Não foi possível enviar a sua foto. Tente novamente.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        console.error("Erro ao mudar a foto de perfil: ", error);
      } finally {
        setIsUploading(false);
      }
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
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleImagePick} disabled={isUploading}>
            <View style={styles.avatarContainer}>
              {user?.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="person" size={50} color={theme.colors.primary} />
                </View>
              )}
              {isUploading ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator
                    color={theme.colors.surface}
                    size="large"
                  />
                </View>
              ) : (
                <View style={styles.editIconContainer}>
                  <Icon name="camera" size={20} color={theme.colors.surface} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
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
              activeOpacity={0.8}
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
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
