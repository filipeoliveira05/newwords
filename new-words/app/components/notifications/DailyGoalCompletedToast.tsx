import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eventStore } from "@/stores/eventStore";
import AppText from "../AppText";
import Icon, { IconName } from "../Icon";
import { theme } from "../../../config/theme";

// Information needed to display the toast
export interface DailyGoalToastInfo {
  id: string;
  title: string;
  icon: IconName;
}

type ToastInfo = DailyGoalToastInfo & { toastId: number };

const NUM_PARTICLES = 15;
const PARTICLE_SPREAD = 80;

// --- Componente para uma única partícula da explosão ---
interface ParticleProps {
  trigger: Animated.SharedValue<number>;
  config: { x: number; y: number; size: number; color: string };
}

const Particle = ({ trigger, config }: ParticleProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = trigger.value;

    // A partícula aparece, fica visível e depois desaparece.
    const opacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, 1, 1, 0]);
    // A partícula cresce e depois encolhe até desaparecer.
    const scale = interpolate(progress, [0, 0.2, 1], [0, 1, 0]);
    // Move-se do centro para a sua posição final.
    const translateX = interpolate(progress, [0, 1], [0, config.x]);
    const translateY = interpolate(progress, [0, 1], [0, config.y]);

    return {
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
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

const DailyGoalCompletedToast = () => {
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);
  const iconScale = useSharedValue(1);
  const particleTrigger = useSharedValue(0);

  const particleConfigs = useMemo(() => {
    if (!toastInfo) return [];

    // Usar a cor de sucesso do tema e uma cor secundária brilhante.
    const primaryColor = theme.colors.success;
    const secondaryColor = theme.colors.successLight;

    return Array.from({ length: NUM_PARTICLES }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * PARTICLE_SPREAD;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 6 + Math.random() * 8,
        color: Math.random() > 0.5 ? primaryColor : secondaryColor,
      };
    });
  }, [toastInfo]);

  useEffect(() => {
    const handleGoalCompleted = (data: DailyGoalToastInfo) => {
      // Adiciona um pequeno atraso para não colidir com o toast de conquista,
      // que pode ser disparado pela mesma ação.
      setTimeout(() => {
        setToastInfo({ ...data, toastId: Date.now() });
      }, 1200);
    };

    const unsubscribe = eventStore
      .getState()
      .subscribe("dailyGoalCompleted", handleGoalCompleted);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toastInfo) {
      // Reset de animações
      iconScale.value = 1;
      particleTrigger.value = 0;
      // Animação de entrada
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: 400 });

      // Animação de "pop" do ícone
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 10, stiffness: 200 }),
          withSpring(1)
        )
      );

      // Animação da explosão de partículas
      particleTrigger.value = withDelay(
        400,
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) })
      );

      // Animação de saída
      const timer = setTimeout(() => {
        translateY.value = withTiming(-50, {
          duration: 300,
          easing: Easing.in(Easing.quad),
        });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(setToastInfo)(null);
          }
        });
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [toastInfo, translateY, opacity, iconScale, particleTrigger]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!toastInfo) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 10 },
        animatedContainerStyle,
      ]}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.success },
            animatedIconStyle,
          ]}
        >
          <View style={styles.particleOrigin}>
            {particleConfigs.map((config, i) => (
              <Particle key={i} trigger={particleTrigger} config={config} />
            ))}
          </View>
          <Icon name={toastInfo.icon} size={24} color={theme.colors.surface} />
        </Animated.View>
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.title}>
            Meta Concluída!
          </AppText>
          <AppText style={styles.subtitle} numberOfLines={1}>
            {toastInfo.title}
          </AppText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 2900, // Um pouco abaixo do toast de conquista e level up
    overflow: "hidden",
  },
  gradient: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  particleOrigin: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1, // Fica atrás do ícone principal
  },
  particle: {
    position: "absolute",
    borderRadius: 10,
  },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});

export default DailyGoalCompletedToast;
