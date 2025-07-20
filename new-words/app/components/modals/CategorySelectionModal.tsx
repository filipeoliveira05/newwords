import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

const CATEGORIES = ["Nome", "Verbo", "Adjetivo", "Advérbio", "Outro"];

const getCategoryColor = (categoryName: string | null): string => {
  if (!categoryName) {
    return theme.colors.border;
  }
  const key = categoryName as keyof typeof theme.colors.category;
  const defaultKey = "Outro" as keyof typeof theme.colors.category;
  return theme.colors.category[key] || theme.colors.category[defaultKey];
};

interface CategorySelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        {/* Este Pressable interior evita que o modal feche ao clicar no conteúdo */}
        <Pressable style={styles.modalContainer}>
          <AppText variant="bold" style={styles.modalTitle}>
            Escolha uma Categoria
          </AppText>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.modalOption}
              activeOpacity={0.8}
              onPress={() => onSelect(cat)}
            >
              <View style={styles.modalOptionRow}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(cat) },
                  ]}
                />
                <View style={styles.modalOptionTextWrapper}>
                  <AppText style={styles.modalOptionText}>{cat}</AppText>
                </View>
                <View style={styles.dotSpacer} />
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCancelButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <AppText variant="medium" style={styles.modalCancelButtonText}>
              Cancelar
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    textAlign: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOption: {},
  modalOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalOptionTextWrapper: { flex: 1, alignItems: "center" },
  modalOptionText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  dotSpacer: { width: 10 + 12 },
  modalCancelButton: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.danger,
  },
});

export default CategorySelectionModal;
