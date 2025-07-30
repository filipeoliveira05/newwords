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
import { usePracticeStore } from "@/stores/usePracticeStore";
import { eventStore } from "@/stores/eventStore";
import { AchievementToastInfo } from "@/hooks/useAchievements";
import { AchievementRank } from "@/config/achievements";
import AppText from "../AppText";
import Icon from "../Icon";
import { theme } from "../../../config/theme";

// Adiciona um ID para gerir múltiplos toasts na fila
type ToastInfo = AchievementToastInfo & { id: number };

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

// Mapeia um rank de conquista para a sua cor correspondente.
// Esta função é pura e pode ser definida fora do componente para melhor performance.
const getRankColor = (rank?: AchievementRank) => {
  if (!rank) return theme.colors.gold;
  const rankColorMap: Record<AchievementRank, string> = {
    Bronze: theme.colors.bronze,
    Silver: theme.colors.silver,
    Gold: theme.colors.gold,
    Platinum: theme.colors.platinum,
    Diamond: theme.colors.diamond,
    Master: theme.colors.master,
    Legendary: theme.colors.legendary,
  };
  return rankColorMap[rank] ?? theme.colors.gold;
};

const AchievementUnlockedToast = () => {
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);
  const iconScale = useSharedValue(1);
  const particleTrigger = useSharedValue(0);

  useEffect(() => {
    const handleAchievementUnlocked = (data: AchievementToastInfo) => {
      const { sessionState } = usePracticeStore.getState();
      if (sessionState !== "in-progress") {
        setToastInfo({ ...data, id: Date.now() });
      }
    };

    const unsubscribe = eventStore
      .getState()
      .subscribe("achievementToast", handleAchievementUnlocked);
    return () => unsubscribe();
  }, []);

  // Gera as configurações das partículas sempre que um novo toast aparece,
  // para que as cores correspondam ao rank da conquista.
  const particleConfigs = useMemo(() => {
    if (!toastInfo) return [];

    const primaryColor = getRankColor(toastInfo.rank);
    // Usar uma cor secundária brilhante que combine bem com a maioria das cores de rank.
    const secondaryColor = theme.colors.goldLighter;

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
    if (toastInfo) {
      // Reset de animações
      iconScale.value = 1;
      particleTrigger.value = 0;

      // Animação de entrada do toast
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

      // Animação de saída do toast
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

  const iconColor = getRankColor(toastInfo.rank);

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
            { backgroundColor: iconColor },
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
          <AppText variant="bold" style={styles.headerText}>
            CONQUISTA DESBLOQUEADA
          </AppText>
          <AppText variant="bold" style={styles.title} numberOfLines={1}>
            {toastInfo.title}
          </AppText>
          <AppText style={styles.subtitle} numberOfLines={2}>
            {toastInfo.description}
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
    zIndex: 3000,
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
  headerText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  title: { fontSize: theme.fontSizes.lg, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default AchievementUnlockedToast;
