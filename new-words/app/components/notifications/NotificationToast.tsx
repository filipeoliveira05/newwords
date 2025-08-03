import React, { useEffect, useMemo } from "react";
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
import {
  NotificationPayload,
  useNotificationStore,
} from "../../../stores/useNotificationStore";
import { getAchievementRankColor } from "@/config/achievements";
import AppText from "../AppText";
import Icon from "../Icon";
import { theme } from "../../../config/theme";

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

const getNotificationColors = (
  notification: NotificationPayload | null
): { primary: string; secondary: string } => {
  if (!notification)
    return { primary: theme.colors.primary, secondary: theme.colors.primary };

  switch (notification.type) {
    case "achievement":
      return {
        primary: getAchievementRankColor(notification.rank),
        secondary: theme.colors.goldLighter,
      };
    case "levelUp":
      return {
        primary: theme.colors.primary,
        secondary: theme.colors.primaryLight,
      };
    case "dailyGoal":
    default:
      return {
        primary: theme.colors.success,
        secondary: theme.colors.successLight,
      };
  }
};

const NotificationToast = () => {
  const { currentNotification, clearCurrentNotification } =
    useNotificationStore();
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);
  const iconScale = useSharedValue(1);
  const particleTrigger = useSharedValue(0);
  const numberAnimationProgress = useSharedValue(0); // Para a animação de level up

  const particleConfigs = useMemo(() => {
    if (!currentNotification) return [];

    const { primary, secondary } = getNotificationColors(currentNotification);

    return Array.from({ length: NUM_PARTICLES }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * PARTICLE_SPREAD;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 6 + Math.random() * 8,
        color: Math.random() > 0.5 ? primary : secondary,
      };
    });
  }, [currentNotification]);

  useEffect(() => {
    if (currentNotification) {
      // Reset de animações
      iconScale.value = 1;
      particleTrigger.value = 0;
      numberAnimationProgress.value = 0;
      // Animação de entrada
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: 400 });

      if (currentNotification.type === "levelUp") {
        // Animação específica para os números do level up
        numberAnimationProgress.value = withDelay(
          400,
          withSpring(1, { damping: 12, stiffness: 150 })
        );
      } else {
        // Animação de "pop" do ícone para outros tipos de notificação
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
      }

      // Animação de saída
      const timer = setTimeout(() => {
        translateY.value = withTiming(-50, {
          duration: 300,
          easing: Easing.in(Easing.quad),
        });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          "worklet";
          // Garante que a função para limpar a notificação só é chamada
          // na thread de JS quando a animação termina.
          if (finished) {
            runOnJS(clearCurrentNotification)();
          }
        });
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [
    currentNotification,
    clearCurrentNotification,
    iconScale,
    opacity,
    particleTrigger,
    numberAnimationProgress,
    translateY,
  ]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const oldLevelNumberStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(numberAnimationProgress.value, [0, 0.5], [1, 0]),
      transform: [
        {
          translateY: interpolate(
            numberAnimationProgress.value,
            [0, 1],
            [0, 20]
          ),
        },
      ],
    };
  });

  const newLevelNumberStyle = useAnimatedStyle(() => {
    return {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      opacity: interpolate(numberAnimationProgress.value, [0.5, 1], [0, 1]),
      transform: [
        {
          translateY: interpolate(
            numberAnimationProgress.value,
            [0, 1],
            [-20, 0]
          ),
        },
      ],
    };
  });

  if (!currentNotification) {
    return null;
  }

  const { primary: iconColor } = getNotificationColors(currentNotification);
  let headerText = "Notificação";
  let titleText = currentNotification.title;
  let subtitleText = currentNotification.subtitle;

  switch (currentNotification.type) {
    case "achievement":
      headerText = "CONQUISTA DESBLOQUEADA";
      break;
    case "dailyGoal":
      headerText = "META CONCLUÍDA!";
      subtitleText = currentNotification.title;
      titleText = "Bom trabalho!";
      break;
    case "levelUp":
      headerText = "SUBIU DE NÍVEL!";
      titleText = `Nível ${currentNotification.newLevel}`;
      subtitleText = `Você alcançou o nível ${currentNotification.newLevel}!`;
      break;
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
            { backgroundColor: iconColor },
            animatedIconStyle,
          ]}
        >
          {currentNotification.type === "levelUp" ? (
            <>
              <Animated.View style={oldLevelNumberStyle}>
                <AppText variant="bold" style={styles.levelCircleText}>
                  {currentNotification.newLevel! - 1}
                </AppText>
              </Animated.View>
              <Animated.View style={newLevelNumberStyle}>
                <AppText variant="bold" style={styles.levelCircleText}>
                  {currentNotification.newLevel}
                </AppText>
              </Animated.View>
            </>
          ) : (
            <>
              <View style={styles.particleOrigin}>
                {particleConfigs.map((config, i) => (
                  <Particle key={i} trigger={particleTrigger} config={config} />
                ))}
              </View>
              <Icon
                name={currentNotification.icon}
                size={24}
                color={theme.colors.surface}
              />
            </>
          )}
        </Animated.View>
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.headerText}>
            {headerText}
          </AppText>
          <AppText variant="bold" style={styles.title} numberOfLines={1}>
            {titleText}
          </AppText>
          {subtitleText && (
            <AppText style={styles.subtitle} numberOfLines={2}>
              {subtitleText}
            </AppText>
          )}
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
    zIndex: 3000, // Garante que fica por cima de outros elementos da UI
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden", // Essencial para a animação de scroll dos números
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  levelCircleText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
});

export default NotificationToast;
