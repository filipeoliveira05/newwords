import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import { theme } from "../../config/theme";

// Definimos as variantes de fonte que queremos usar na aplicação.
// O nome deve corresponder ao que foi definido no `useFonts` no AppNavigator.
type FontVariant = "regular" | "medium" | "bold";

interface AppTextProps extends TextProps {
  variant?: FontVariant;
}

const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  variant = "regular",
  ...props
}) => {
  // Mapeia a `variant` para o nome da `fontFamily` correspondente
  const getFontFamily = (v: FontVariant) => {
    switch (v) {
      case "bold":
        return theme.fonts.bold;
      case "medium":
        return theme.fonts.medium;
      default:
        return theme.fonts.regular;
    }
  };

  const fontStyle = {
    fontFamily: getFontFamily(variant),
  };

  return (
    <Text style={[styles.baseText, fontStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    // Pode definir aqui outros estilos de texto globais, como a cor padrão.
    color: theme.colors.text,
  },
});

export default AppText;
