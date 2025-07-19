import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { theme } from "@/config/theme";

const ProgressSegment = ({
  isActive,
  isCompleted,
  onFinish,
}: {
  onFinish: () => void;
  isActive: boolean;
  isCompleted: boolean;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Garante que a animação é reiniciada se o utilizador navegar para trás e para a frente.
    cancelAnimation(progress);
    if (isCompleted) {
      progress.value = 1;
    } else if (isActive) {
      // Anima a barra de progresso ao longo de 5 segundos quando o slide está ativo.
      // É crucial reiniciar o progresso para 0 antes de iniciar a animação.
      progress.value = 0;
      progress.value = withTiming(
        1,
        {
          duration: 5000,
          easing: Easing.linear,
        },
        (finished) => {
          // Quando a animação termina com sucesso, chama a função onFinish.
          // runOnJS é necessário para executar uma função JS a partir do thread da UI.
          if (finished) {
            runOnJS(onFinish)();
          }
        }
      );
    } else {
      progress.value = 0;
    }
  }, [isActive, isCompleted, progress, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.segmentContainer}>
      <Animated.View style={[styles.progress, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginHorizontal: 2,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
  },
});

export default ProgressSegment;
