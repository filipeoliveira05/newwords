import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  withDelay,
  cancelAnimation,
} from "react-native-reanimated";
import { usePracticeStore } from "@/stores/usePracticeStore";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

interface SparkParticleProps {
  config: SparkConfig;
  isStreakActive: boolean;
}

interface SparkConfig {
  xEnd: number;
  yEnd: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const SparkParticle = ({ config, isStreakActive }: SparkParticleProps) => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (isStreakActive) {
      // A animação deve começar com o seu delay específico e repetir.
      animationValue.value = withRepeat(
        withSequence(
          withDelay(
            config.delay,
            withTiming(1, {
              duration: config.duration,
              easing: Easing.out(Easing.quad),
            })
          ),
          withTiming(0, { duration: 0 }) // Reinicia instantaneamente para o próximo loop
        ),
        -1 // Loop infinito
      );
    } else {
      // Se a streak não estiver ativa, cancela qualquer animação em andamento e reinicia.
      cancelAnimation(animationValue);
      animationValue.value = 0;
    }

    // Função de limpeza para cancelar a animação quando o componente desmonta
    // ou quando isStreakActive muda de true para false.
    return () => {
      cancelAnimation(animationValue);
    };
  }, [isStreakActive, config, animationValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = animationValue.value;
    const translateX = interpolate(p, [0, 1], [0, config.xEnd]);
    const translateY = interpolate(p, [0, 1], [0, config.yEnd]);
    const scale = interpolate(p, [0, 1], [1, 0]);
    // Fade in quickly, then fade out over its lifetime
    const opacity = interpolate(p, [0, 0.1, 1], [0, 1, 0]);

    return {
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.sparkParticle,
        {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function ProgressBar() {
  const wordsPracticedInSession = usePracticeStore(
    (state) => state.wordsPracticedInSession
  );
  const fullSessionWordPool = usePracticeStore(
    (state) => state.fullSessionWordPool
  );
  const sessionType = usePracticeStore((state) => state.sessionType);
  const streak = usePracticeStore((state) => state.streak);

  const totalWordsInPool = fullSessionWordPool.length;
  const wordsPracticedCount = wordsPracticedInSession.size;

  const progressPercentage =
    totalWordsInPool > 0 ? (wordsPracticedCount / totalWordsInPool) * 100 : 0;

  const progress = useSharedValue(progressPercentage);
  const streakActive = useSharedValue(0); // 0 para inativo, 1 para ativo

  const NUM_SPARKS = 5;
  const sparkConfigs = useMemo(
    () =>
      Array.from({ length: NUM_SPARKS }).map(
        (): SparkConfig => ({
          xEnd: (Math.random() - 0.5) * 40, // -20 to 20
          yEnd: -30 - Math.random() * 30, // -30 to -60
          size: 4 + Math.random() * 4, // 4 to 8
          color:
            Math.random() > 0.3 ? theme.colors.challenge : theme.colors.gold,
          delay: Math.random() * 1500, // delay up to 1.5s
          duration: 500 + Math.random() * 500, // duration 0.5s to 1s
        })
      ),
    []
  );

  const isStreakActive = streak >= 3;

  // Animate the progress bar width
  useEffect(() => {
    progress.value = withTiming(progressPercentage, { duration: 300 });
    streakActive.value = withTiming(isStreakActive ? 1 : 0, { duration: 300 });
  }, [progressPercentage, isStreakActive, progress, streakActive]);

  const animatedBarFillStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      streakActive.value,
      [0, 1],
      [theme.colors.primary, theme.colors.challenge] // Azul para Laranja
    );
    return {
      width: `${progress.value}%`,
      backgroundColor,
    };
  });

  const animatedSparkContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: streakActive.value, // Aparece/desaparece com a streak
      left: `${progress.value}%`,
    };
  });

  if (totalWordsInPool === 0) {
    return null;
  }

  const progressTitle =
    sessionType === "urgent" ? "Progresso da Revisão" : "Progresso da Prática";

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <AppText variant="medium" style={styles.progressTitle}>
          {progressTitle}
        </AppText>
        <AppText variant="medium" style={styles.progressText}>
          {wordsPracticedCount} / {totalWordsInPool}
        </AppText>
      </View>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, animatedBarFillStyle]} />
        <Animated.View
          style={[styles.sparkContainer, animatedSparkContainerStyle]}
        >
          {sparkConfigs.map((config, index) => (
            <SparkParticle
              key={index}
              config={config}
              isStreakActive={isStreakActive}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 400,
    marginBottom: 40,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  progressText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMedium,
  },
  barBackground: {
    width: "100%",
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
  },
  barFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  sparkContainer: {
    position: "absolute",
    bottom: 6, // Origem das faíscas no centro vertical da barra
  },
  sparkParticle: {
    position: "absolute",
    borderRadius: 50,
  },
});
