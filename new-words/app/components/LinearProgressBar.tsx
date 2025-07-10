import React, { useEffect } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useAnimatedProps,
} from "react-native-reanimated";
import AppText from "./AppText";
import { theme } from "../../config/theme";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface LinearProgressBarProps {
  progress: number; // 0 to 100
  totalWords: number;
  masteredWords: number;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  progress,
  totalWords,
  masteredWords,
}) => {
  const animatedWidth = useSharedValue(0); // Inicia em 0 para animar na montagem
  const animatedMasteredCount = useSharedValue(0); // Inicia em 0 para animar a contagem

  const getProgressColor = () => {
    if (progress >= 100) return theme.colors.successMedium; // Verde (Sucesso total)
    if (progress >= 90) return theme.colors.success; // Verde claro (Quase lá)
    if (progress >= 60) return theme.colors.gold; // Amarelo
    if (progress >= 40) return theme.colors.challenge; // Laranja
    return theme.colors.danger; // Vermelho
  };

  // Anima a barra de progresso quando o componente é montado ou o progresso muda.
  useEffect(() => {
    animatedWidth.value = withTiming(progress, {
      duration: 500, // Duração da animação em milissegundos
      easing: Easing.out(Easing.quad), // Começa rápido e desacelera no final
    });
    animatedMasteredCount.value = withTiming(masteredWords, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
  }, [progress, masteredWords, animatedMasteredCount, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  // Cria props animadas para o componente TextInput.
  // Isto permite-nos animar a propriedade 'text' de forma eficiente.
  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedMasteredCount.value)} / ${totalWords}`,
    } as any; // 'as any' é um workaround para o tipo da prop 'text'
  });

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <AppText variant="medium" style={styles.label}>
          Progresso
        </AppText>
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          value={`${masteredWords} / ${totalWords}`} // Valor inicial antes da animação
          style={[
            styles.progressText,
            { fontFamily: theme.fonts.bold, textAlign: "right" },
          ]}
          animatedProps={animatedTextProps}
        />
      </View>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: getProgressColor() },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  progressText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  barBackground: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default LinearProgressBar;
