import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useDeckStore } from "../../../stores/deckStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { DecksStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

type Props = NativeStackScreenProps<DecksStackParamList, "AddOrEditDeck">;

export default function AddOrEditDeckScreen({ navigation, route }: Props) {
  const deckId = route?.params?.deckId;
  const isEdit = !!deckId;

  const { addDeck, updateDeck, decks } = useDeckStore();

  const { showAlert } = useAlertStore.getState();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const authorInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEdit && deckId) {
      const deck = decks.find((d) => d.id === deckId);
      if (deck) {
        setTitle(deck.title);
        setAuthor(deck.author);
      } else {
        showAlert({
          title: "Erro",
          message:
            "O conjunto que está a tentar editar não foi encontrado. A voltar para o ecrã anterior.",
          buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
        });
      }
    }
  }, [deckId, isEdit, decks, navigation, showAlert]);

  useEffect(() => {
    navigation.setOptions({
      title: "", // O título agora está no corpo do ecrã
      headerBackButtonDisplayMode: "minimal",
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerShadowVisible: false,
      headerTintColor: theme.colors.text,
    });
  }, [navigation, isEdit]);

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      showAlert({
        title: "Erro",
        message: "Preenche o título e o autor.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && deckId) {
        await updateDeck(deckId, title.trim(), author.trim());
      } else {
        await addDeck(title.trim(), author.trim());
      }
      navigation.goBack();
    } catch (error) {
      console.error("Falha ao guardar o conjunto:", error);
      showAlert({
        title: "Erro",
        message: "Não foi possível guardar o conjunto. Tente novamente.",
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
        <View style={styles.headerSection}>
          <Ionicons
            name={isEdit ? "create-outline" : "add-circle-outline"}
            size={48}
            color={theme.colors.primary}
          />
          <AppText variant="bold" style={styles.headerTitle}>
            {isEdit ? "Editar Conjunto" : "Criar Novo Conjunto"}
          </AppText>
          <AppText style={styles.headerSubtitle}>
            {isEdit
              ? "Altere os detalhes do seu conjunto."
              : "Dê um nome e um autor ao seu novo conjunto de palavras."}
          </AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>TÍTULO DO CONJUNTO</AppText>
            <Pressable
              style={styles.inputContainer}
              onPress={() => titleInputRef.current?.focus()}
            >
              <Ionicons
                name="bookmark-outline"
                style={styles.inputIcon}
                size={22}
              />
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Vocabulário de Inglês"
                placeholderTextColor={theme.colors.placeholder}
              />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>AUTOR</AppText>
            <Pressable
              style={styles.inputContainer}
              onPress={() => authorInputRef.current?.focus()}
            >
              <Ionicons
                name="person-outline"
                style={styles.inputIcon}
                size={22}
              />
              <TextInput
                ref={authorInputRef}
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Ex: John Doe"
                placeholderTextColor={theme.colors.placeholder}
              />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <AppText variant="bold" style={styles.buttonText}>
              {isEdit ? "Guardar Alterações" : "Criar Conjunto"}
            </AppText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 0,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "90%",
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
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    paddingVertical: 14, // Aumenta a área de toque vertical
    fontFamily: theme.fonts.regular,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 22,
    width: "100%",
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
    fontSize: theme.fontSizes.lg,
    letterSpacing: 0.5,
  },
});
