import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { theme } from "../theme";

type ChipInputProps = {
  label: string;
  items: string[];
  onItemsChange: (newItems: string[]) => void;
  placeholder: string;
  layout?: "wrap" | "stack";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

const ChipInput = ({
  label,
  items,
  onItemsChange,
  placeholder,
  layout = "wrap",
  autoCapitalize = "sentences",
}: ChipInputProps) => {
  const [currentValue, setCurrentValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = () => {
    if (currentValue.trim()) {
      onItemsChange([...items, currentValue.trim()]);
      setCurrentValue("");
    }
  };

  const toggleInput = () => {
    setIsAdding(!isAdding);
    setCurrentValue(""); // Reset input when toggling
  };

  const handleRemoveItem = (indexToRemove: number) => {
    onItemsChange(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <AppText variant="bold" style={styles.label}>
          {label}
        </AppText>
        <TouchableOpacity onPress={toggleInput} style={styles.toggleButton}>
          <Ionicons
            name={isAdding ? "remove-circle-outline" : "add-circle-outline"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      {isAdding && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={currentValue}
            onChangeText={setCurrentValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.placeholder}
            onSubmitEditing={handleAddItem}
            blurOnSubmit={false}
            autoFocus
            autoCapitalize={autoCapitalize}
            multiline={layout === "stack"}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={theme.colors.success}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={layout === "wrap" ? styles.chipContainerWrap : {}}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <View
              key={index}
              style={layout === "wrap" ? styles.chipWrap : styles.chipStack}
            >
              <AppText
                style={
                  layout === "wrap" ? styles.chipTextWrap : styles.chipTextStack
                }
              >
                {item}
              </AppText>
              <TouchableOpacity
                onPress={() => handleRemoveItem(index)}
                style={styles.removeButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.icon}
                />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyChipText}>
              Nenhum item adicionado.
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  toggleButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
  },
  addButton: { padding: 12 },
  chipContainerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chipWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipStack: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipTextWrap: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
    marginRight: 8,
  },
  chipTextStack: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMedium,
    lineHeight: 22,
    marginRight: 12,
  },
  removeButton: {
    padding: 2,
  },
  emptyContainer: {
    marginTop: 8,
  },
  emptyChipText: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    fontSize: theme.fontSizes.sm,
  },
});

export default ChipInput;
