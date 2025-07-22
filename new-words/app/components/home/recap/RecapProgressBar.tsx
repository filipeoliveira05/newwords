import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  runOnJS,
  Easing,
  withSequence,
} from "react-native-reanimated";
import { theme } from "@/config/theme";

interface RecapProgressBarProps {
  isActive: boolean;
  isCompleted: boolean;
  onFinish: () => void;
  isPaused: boolean;
  duration?: number;
}

const RecapProgressBar: React.FC<RecapProgressBarProps> = ({
  isActive,
  isCompleted,
  onFinish,
  isPaused,
  duration = 8000, // 8 segundos por defeito
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Garante que a animação é reiniciada se o utilizador navegar para trás e para a frente.
    cancelAnimation(progress);
    if (isCompleted) {
      progress.value = 1;
      return;
    }

    if (!isActive) {
      progress.value = 0;
      return;
    }
    // A partir daqui, o slide está ativo (isActive === true)

    if (isPaused) {
      // A animação já foi cancelada no início do useEffect. O valor é preservado.
      return;
    }

    // Se o progresso for >= 1, significa que estamos a voltar a um slide que já
    // foi concluído. Usamos withSequence para o reiniciar para 0 e só depois
    // começar a animar. Isto resolve o problema de navegação para trás.
    if (progress.value >= 1) {
      progress.value = withSequence(
        withTiming(0, { duration: 0 }), // Reinicia para 0 instantaneamente
        withTiming(1, { duration, easing: Easing.linear }, (finished) => {
          if (finished) runOnJS(onFinish)();
        })
      );
    } else {
      // Caso contrário, estamos a retomar de uma pausa ou a começar um slide novo.
      // Esta lógica calcula a duração restante e continua a animação.
      const remainingProgress = 1 - progress.value;
      const remainingDuration = duration * remainingProgress;

      progress.value = withTiming(
        1,
        { duration: remainingDuration, easing: Easing.linear },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        }
      );
    }
  }, [isActive, isCompleted, progress, onFinish, isPaused, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.segmentContainer}>
      <Animated.View style={[styles.segmentFill, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    marginHorizontal: 2,
    overflow: "hidden",
  },
  segmentFill: {
    height: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
  },
});

export default RecapProgressBar;
