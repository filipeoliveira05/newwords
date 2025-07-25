import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { eventStore } from "@/stores/eventStore";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

interface ToastInfo {
  level: number;
  id: number;
}

const LevelUpToast = () => {
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);

  // Shared values para animações mais granulares
  const numberAnimation = useSharedValue(0); // 0 = old level, 1 = new level

  // Efeito para subscrever ao evento de level up
  useEffect(() => {
    const handleLevelUp = ({ newLevel }: { newLevel: number }) => {
      // Obtém o estado da sessão de prática para decidir se o toast deve ser mostrado.
      const { sessionState } = usePracticeStore.getState();
      // Só mostra o toast se não houver uma sessão de prática em andamento.
      if (sessionState !== "in-progress") {
        setToastInfo({ level: newLevel, id: Date.now() });
      }
    };

    const unsubscribe = eventStore
      .getState()
      .subscribe("levelUp", handleLevelUp);
    return () => unsubscribe();
  }, []);

  // Efeito para controlar as animações de entrada e saída do toast
  useEffect(() => {
    if (toastInfo) {
      // Reset de animações para garantir que correm corretamente em cada notificação
      numberAnimation.value = 0;

      // Animação de entrada
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: 400 });

      // Animação dos números (ocorre após a entrada do toast)
      numberAnimation.value = withDelay(
        400,
        withSpring(1, { damping: 12, stiffness: 150 })
      );

      // Animação de saída após 3 segundos
      const timer = setTimeout(() => {
        translateY.value = withTiming(-50, {
          duration: 300,
          easing: Easing.in(Easing.quad),
        });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            // Limpa a informação do toast quando a animação termina
            runOnJS(setToastInfo)(null);
          }
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toastInfo, translateY, opacity, numberAnimation]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const oldNumberAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(numberAnimation.value, [0, 0.5], [1, 0]),
      transform: [
        { translateY: interpolate(numberAnimation.value, [0, 1], [0, 20]) },
      ],
    };
  });

  const newNumberAnimatedStyle = useAnimatedStyle(() => {
    return {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      opacity: interpolate(numberAnimation.value, [0.5, 1], [0, 1]),
      transform: [
        { translateY: interpolate(numberAnimation.value, [0, 1], [-20, 0]) },
      ],
    };
  });

  if (!toastInfo) {
    return null;
  }

  // Deriva o nível antigo a partir do novo.
  // Isto evita ter de passar o nível antigo no evento, simplificando a lógica.
  const oldLevel = toastInfo.level - 1;

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
        <View style={styles.levelCircle}>
          <Animated.View style={oldNumberAnimatedStyle}>
            <AppText variant="bold" style={styles.levelCircleText}>
              {oldLevel}
            </AppText>
          </Animated.View>
          <Animated.View style={newNumberAnimatedStyle}>
            <AppText variant="bold" style={styles.levelCircleText}>
              {toastInfo.level}
            </AppText>
          </Animated.View>
        </View>
        <View style={styles.textContainer}>
          <AppText variant="bold" style={styles.title}>
            Subiu de Nível!
          </AppText>
          <AppText style={styles.subtitle}>
            Você alcançou o nível {toastInfo.level}!
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
    zIndex: 3000, // Garante que fica por cima de tudo
    overflow: "hidden", // Necessário para o LinearGradient respeitar o borderRadius
  },
  gradient: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
  },
  levelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden", // Essencial para a animação de scroll dos números
  },
  levelCircleText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});

export default LevelUpToast;
