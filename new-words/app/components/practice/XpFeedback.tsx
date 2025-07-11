import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

interface XpFeedbackProps {
  xp: number;
  xOffset: number;
  yEnd: number;
  onAnimationComplete: () => void;
}

const ANIMATION_DURATION = 1500;

const XpFeedback = ({
  xp,
  xOffset,
  yEnd,
  onAnimationComplete,
}: XpFeedbackProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // A animação agora é uma sequência única e correta.
    opacity.value = withSequence(
      // 1. Aparece (Fade in)
      withTiming(1, { duration: 200 }),
      // 2. Fica visível por um tempo
      withDelay(ANIMATION_DURATION - 700, withTiming(1)),
      // 3. Desaparece (Fade out)
      withTiming(0, { duration: 200 })
    );

    // Anima o movimento para cima em paralelo.
    translateY.value = withTiming(yEnd, {
      duration: ANIMATION_DURATION,
    });

    // Chama a função de limpeza no final da animação completa.
    const timeoutId = setTimeout(
      () => runOnJS(onAnimationComplete)(),
      ANIMATION_DURATION
    );
    return () => clearTimeout(timeoutId);
  }, [onAnimationComplete, opacity, translateY, yEnd]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: xOffset }, { translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <AppText variant="bold" style={styles.xpText}>
        +{xp} XP
      </AppText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", // Permite que cada animação se posicione independentemente
    backgroundColor: theme.colors.xpFeedback,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  xpText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
  },
});

export default XpFeedback;
