import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={toggleInput} style={styles.toggleButton}>
          <Ionicons
            name={isAdding ? "remove-circle-outline" : "add-circle-outline"}
            size={24}
            color="#4F8EF7"
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
            placeholderTextColor="#999"
            onSubmitEditing={handleAddItem}
            blurOnSubmit={false}
            autoFocus
            autoCapitalize={autoCapitalize}
            multiline={layout === "stack"}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Ionicons name="checkmark-circle" size={28} color="#2a9d8f" />
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
              <Text
                style={
                  layout === "wrap" ? styles.chipTextWrap : styles.chipTextStack
                }
              >
                {item}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveItem(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color="#6c757d" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyChipText}>Nenhum item adicionado.</Text>
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#adb5bd",
    textTransform: "uppercase",
  },
  toggleButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingLeft: 16,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 16, color: "#222", paddingVertical: 14 },
  addButton: { padding: 12 },
  chipContainerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chipWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  chipTextWrap: { fontSize: 14, color: "#495057", marginRight: 8 },
  chipTextStack: {
    flex: 1,
    fontSize: 15,
    color: "#495057",
    lineHeight: 22,
    marginRight: 12,
  },
  removeButton: {
    padding: 2,
  },
  emptyContainer: {
    marginTop: 8,
  },
  emptyChipText: { color: "#adb5bd", fontStyle: "italic", fontSize: 14 },
});

export default ChipInput;
