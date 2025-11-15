import React, { useState, RefObject, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import AppText from "./AppText";
import { theme } from "../../config/theme";
import Icon from "./Icon";
import * as hapticService from "../../services/hapticService";

type ChipInputProps = {
  label: string;
  items: string[];
  onItemsChange: (newItems: string[]) => void;
  placeholder: string;
  layout?: "wrap" | "stack";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  scrollViewRef?: RefObject<ScrollView | null>;
  currentScrollY?: RefObject<number>;
  keyboardHeight?: number;
};

const ChipInput = ({
  label,
  items,
  onItemsChange,
  placeholder,
  layout = "wrap",
  autoCapitalize = "sentences",
  scrollViewRef,
  currentScrollY,
  keyboardHeight = 0,
}: ChipInputProps) => {
  const [currentValue, setCurrentValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const chipInputRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();

  const handleAddItem = () => {
    if (currentValue.trim()) {
      hapticService.impactAsync(hapticService.ImpactFeedbackStyle.Light);
      onItemsChange([...items, currentValue.trim()]);
      setCurrentValue("");
      // Esconde o campo de input depois de adicionar um item para um fluxo mais limpo.
      setIsAdding(false);
    }
  };

  const getEmptyText = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel === "sinónimos") {
      return "Nenhum sinónimo adicionado.";
    }
    if (lowerLabel === "antónimos") {
      return "Nenhum antónimo adicionado.";
    }
    if (lowerLabel === "frases de exemplo") {
      return "Nenhuma frase de exemplo adicionada.";
    }
    // Fallback genérico para outros casos
    const singular = lowerLabel.endsWith("s")
      ? lowerLabel.slice(0, -1)
      : lowerLabel;
    return `Nenhum ${singular} adicionado.`;
  };

  // Este efeito é acionado sempre que o input se torna visível.
  // É responsável por fazer o scroll para a posição correta.
  useEffect(() => {
    if (isAdding && scrollViewRef?.current && chipInputRef.current) {
      // Usamos um timeout para garantir que o teclado já apareceu e as medições são corretas.
      const timer = setTimeout(() => {
        chipInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
          const componentBottomOnScreen = pageY + height;
          const visibleAreaEnd = windowHeight - keyboardHeight;

          // Apenas faz scroll se o componente estiver tapado pelo teclado.
          if (componentBottomOnScreen > visibleAreaEnd) {
            // Calcula o quanto é preciso deslizar para o componente ficar visível.
            const scrollAmountNeeded =
              componentBottomOnScreen - visibleAreaEnd + 20; // 20px de margem
            const currentOffset = currentScrollY?.current ?? 0;
            const newScrollY = currentOffset + scrollAmountNeeded;
            scrollViewRef.current?.scrollTo({ y: newScrollY, animated: true });
          }
        });
      }, 150);

      return () => clearTimeout(timer); // Limpa o timeout se o componente for desmontado.
    }
  }, [isAdding, windowHeight, keyboardHeight, scrollViewRef, currentScrollY]);

  const toggleInput = () => {
    if (isAdding) {
      setIsAdding(false);
      setCurrentValue("");
    } else {
      // Para garantir que o autoFocus funciona de forma consistente em cliques repetidos,
      // forçamos uma remontagem do TextInput fazendo um toggle rápido do estado.
      setIsAdding(false); // Garante que está desligado
      setCurrentValue("");
      setTimeout(() => setIsAdding(true), 50); // Liga-o novamente após um pequeno delay
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    onItemsChange(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View style={styles.section} ref={chipInputRef}>
      <View style={styles.labelContainer}>
        <AppText variant="bold" style={styles.label}>
          {label}
        </AppText>
        <TouchableOpacity
          onPress={toggleInput}
          activeOpacity={0.8}
          style={styles.toggleButton}
        >
          <Icon
            size={24}
            name={isAdding ? "removeCircle" : "addCircle"}
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
            onBlur={() => {
              // Quando o input perde o foco (teclado é dispensado), esconde o campo de input.
              setIsAdding(false);
            }}
            blurOnSubmit={false}
            autoFocus
            autoCapitalize={autoCapitalize}
            multiline={layout === "stack"}
          />
          {currentValue.trim().length > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={handleAddItem}
            >
              <Icon
                size={28}
                name="checkmarkCircle"
                color={theme.colors.success}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={layout === "wrap" ? styles.chipContainerWrap : {}}>
        {items.length > 0
          ? items.map((item, index) => (
              <View
                key={index}
                style={layout === "wrap" ? styles.chipWrap : styles.chipStack}
              >
                <AppText
                  style={
                    layout === "wrap"
                      ? styles.chipTextWrap
                      : styles.chipTextStack
                  }
                >
                  {item}
                </AppText>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(index)}
                  activeOpacity={0.8}
                >
                  <Icon
                    size={20}
                    name="closeCircle"
                    color={theme.colors.icon}
                  />
                </TouchableOpacity>
              </View>
            ))
          : !isAdding && (
              <View
                style={[
                  styles.emptyContainer,
                  layout === "stack" && { alignItems: "flex-start" },
                ]}
              >
                <AppText style={styles.emptyChipText}>
                  {getEmptyText(label)}
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
    fontSize: theme.fontSizes.md,
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
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
  },
  addButton: { padding: 10 },
  chipContainerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: -4,
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    margin: 4,
  },
  chipStack: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    paddingLeft: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  chipTextWrap: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.dark,
    marginRight: 8,
    fontFamily: theme.fonts.medium,
  },
  chipTextStack: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    lineHeight: 20,
    marginRight: 12,
  },
  removeButton: {
    padding: 2,
  },
  emptyContainer: {
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyChipText: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    fontSize: theme.fontSizes.base,
  },
});

export default ChipInput;
