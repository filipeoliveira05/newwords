import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import Icon from "./Icon";
import { theme } from "../../config/theme";

interface OfflinePlaceholderProps {
  onRetry: () => void;
}

const OfflinePlaceholder = ({ onRetry }: OfflinePlaceholderProps) => {
  return (
    <View style={styles.container}>
      <Icon
        name="cloudOffline"
        size={80}
        color={theme.colors.iconMuted}
        style={styles.icon}
      />
      <AppText variant="bold" style={styles.title}>
        O Mundo da Aprendizagem Espera por Si
      </AppText>
      <AppText style={styles.subtitle}>
        Ligue-se à internet para competir nas Ligas, descobrir conjuntos criados
        por outros utilizadores e desafiar os seus amigos.
      </AppText>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <AppText variant="bold" style={styles.buttonText}>
          Tentar Novamente
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: theme.colors.background,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
  },
});

export default OfflinePlaceholder;
