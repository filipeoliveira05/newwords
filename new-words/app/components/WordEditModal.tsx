import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import AppText from "./AppText";
import { theme } from "../../config/theme";
import Icon from "./Icon";
import CategorySelectionModal from "./modals/CategorySelectionModal";

interface WordEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    meaning: string,
    category: string | null
  ) => Promise<void>;
  initialData?: {
    name: string;
    meaning: string;
    category: string | null;
  } | null;
  isSaving: boolean;
}

const WordEditModal: React.FC<WordEditModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialData,
  isSaving,
}) => {
  const [name, setName] = useState("");
  const [meaning, setMeaning] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const meaningInputRef = useRef<TextInput>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isVisible) {
      // Preenche os campos quando o modal se torna visível (se for edição)
      setName(initialData?.name || "");
      setMeaning(initialData?.meaning || "");
      setCategory(initialData?.category || null);
    }
  }, [isVisible, initialData]);

  const handleSave = () => {
    onSave(name, meaning, category);
  };

  const getCategoryColor = (categoryName: string | null): string => {
    if (!categoryName) {
      return theme.colors.border; // Cor neutra para quando nada está selecionado
    }
    const key = categoryName as keyof typeof theme.colors.category;
    const defaultKey = "Outro" as keyof typeof theme.colors.category;

    return theme.colors.category[key] || theme.colors.category[defaultKey];
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* O Pressable serve como um backdrop clicável para fechar o modal */}
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {/* O KeyboardAvoidingView envolve apenas o conteúdo do modal para que ele seja empurrado para cima pelo teclado */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                {isEditMode ? "Editar Palavra" : "Nova Palavra"}
              </AppText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>PALAVRA</AppText>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => nameInputRef.current?.focus()}
                >
                  <Icon name="text" style={styles.inputIcon} size={22} />
                  <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Apple"
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="none"
                  />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.label}>SIGNIFICADO</AppText>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => meaningInputRef.current?.focus()}
                >
                  <Icon name="chat" style={styles.inputIcon} size={22} />
                  <TextInput
                    ref={meaningInputRef}
                    style={styles.input}
                    value={meaning}
                    onChangeText={setMeaning}
                    placeholder="Ex: Maçã"
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="none"
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>CATEGORIA</AppText>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <View style={styles.categorySelectorContent}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                  <AppText
                    style={
                      category
                        ? styles.categoryText
                        : styles.categoryPlaceholder
                    }
                  >
                    {category || "Escolha uma categoria"}
                  </AppText>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText variant="bold" style={styles.saveButtonText}>
                  {isEditMode ? "Guardar Alterações" : "Adicionar Palavra"}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <CategorySelectionModal
          isVisible={isCategoryModalVisible}
          onClose={() => setIsCategoryModalVisible(false)}
          onSelect={(selectedCategory) => {
            setCategory(selectedCategory);
            setIsCategoryModalVisible(false);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: theme.fontSizes["2xl"] },
  closeButton: { padding: 8 },
  form: { marginBottom: 0 },
  inputGroup: { marginBottom: 24 },
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
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: { color: theme.colors.textMuted, marginRight: 12 },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: theme.colors.disabled },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
    letterSpacing: 0.5,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  categorySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  categoryPlaceholder: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.placeholder,
  },
});

export default WordEditModal;
