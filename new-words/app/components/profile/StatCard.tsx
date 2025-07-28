import React, { useEffect } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
} from "react-native-reanimated";
import AppText from "../AppText";
import { theme } from "../../../config/theme";
import Icon, { IconName } from "../Icon";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type StatCardProps = {
  icon: IconName;
  value: string | number;
  label: string;
  color: string;
};

const StatCard = ({ icon, value, label, color }: StatCardProps) => {
  // Tenta extrair a parte numérica do valor.
  // Ex: "95%" -> 95, 123 -> 123
  const numericValue = parseFloat(String(value));
  const isNumeric = !isNaN(numericValue);

  // Extrai o sufixo, se houver (ex: '%')
  const suffix = isNumeric
    ? String(value).substring(String(numericValue).length)
    : "";

  const animatedNumber = useSharedValue(0);

  useEffect(() => {
    if (isNumeric) {
      animatedNumber.value = withTiming(numericValue, {
        duration: 3500, // Aumenta a duração para uma animação mais lenta
        easing: Easing.out(Easing.cubic), // Desacelera mais no final
      });
    }
    // Se não for numérico, o valor é exibido estaticamente.
  }, [numericValue, isNumeric, animatedNumber]);

  const animatedProps = useAnimatedProps(() => {
    // Arredonda o valor animado para um número inteiro e adiciona o sufixo.
    return {
      text: `${Math.round(animatedNumber.value)}${suffix}`,
    } as any;
  });

  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={34} color={color} />
      {isNumeric ? (
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={String(value)} // Valor inicial antes da animação
          style={styles.statValue}
          animatedProps={animatedProps}
        />
      ) : (
        <AppText variant="bold" style={styles.statValue}>
          {value}
        </AppText>
      )}
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: theme.fontSizes["3xl"],
    fontFamily: theme.fonts.bold, // Adicionado para consistência com AppText variant="bold"
    color: theme.colors.text, // Adicionado porque TextInput não herda cor
    marginVertical: 4,
  },
  statLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default StatCard;
