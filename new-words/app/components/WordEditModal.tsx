import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WordEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string, meaning: string) => Promise<void>;
  initialData?: { name: string; meaning: string } | null;
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

  const nameInputRef = useRef<TextInput>(null);
  const meaningInputRef = useRef<TextInput>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isVisible) {
      // Preenche os campos quando o modal se torna visível (se for edição)
      setName(initialData?.name || "");
      setMeaning(initialData?.meaning || "");
    }
  }, [isVisible, initialData]);

  const handleSave = () => {
    onSave(name, meaning);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Editar Palavra" : "Nova Palavra"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PALAVRA</Text>
              <Pressable
                style={styles.inputContainer}
                onPress={() => nameInputRef.current?.focus()}
              >
                <Ionicons
                  name="text-outline"
                  style={styles.inputIcon}
                  size={22}
                />
                <TextInput
                  ref={nameInputRef}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Apple"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SIGNIFICADO</Text>
              <Pressable
                style={styles.inputContainer}
                onPress={() => meaningInputRef.current?.focus()}
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  style={styles.inputIcon}
                  size={22}
                />
                <TextInput
                  ref={meaningInputRef}
                  style={styles.input}
                  value={meaning}
                  onChangeText={setMeaning}
                  placeholder="Ex: Maçã"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </Pressable>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditMode ? "Guardar Alterações" : "Adicionar Palavra"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
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
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#22223b" },
  closeButton: { padding: 8 },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#adb5bd",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  inputIcon: { color: "#adb5bd", marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#222", paddingVertical: 14 },
  saveButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#4F8EF7",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: "#a9c7f5" },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default WordEditModal;
