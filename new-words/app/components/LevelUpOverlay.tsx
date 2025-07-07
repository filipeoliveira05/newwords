import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
// import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  withSpring,
} from "react-native-reanimated";
import { useUserStore } from "@/stores/useUserStore";
import AppText from "./AppText";
import { theme } from "../../config/theme";
// import confettiAnimation from "../../assets/animations/confetti.lottie"; // Temporariamente comentado

const LevelUpOverlay = () => {
  // O estado agora é controlado pelo useUserStore para desacoplar a animação do evento.
  const { pendingLevelUpAnimation, clearPendingLevelUpAnimation } =
    useUserStore();

  // const confettiRef = useRef<LottieView>(null);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (pendingLevelUpAnimation) {
      // Inicia as animações
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withDelay(100, withTiming(1.1, { duration: 400 })),
        withSpring(1)
      );
      // Garante que a animação Lottie é reiniciada e tocada
      // confettiRef.current?.reset();
      // confettiRef.current?.play(0);

      // Esconde o overlay após um tempo
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 }, (finished) => {
          if (finished) {
            // Limpa o estado no store para que a animação não se repita.
            runOnJS(clearPendingLevelUpAnimation)();
          }
        });
      }, 3500); // Duração total do overlay

      return () => clearTimeout(timer);
    }
  }, [pendingLevelUpAnimation, opacity, scale, clearPendingLevelUpAnimation]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // O componente só é renderizado se houver uma animação de level up pendente.
  if (!pendingLevelUpAnimation) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedContainerStyle]}>
      {/* --- Lottie View (Temporariamente Desativada) --- */}
      {/* <LottieView
        ref={confettiRef}
        source={confettiAnimation}
        style={styles.lottie}
        autoPlay={false}
        loop={false}
        resizeMode="cover"
      /> */}
      {/* --- Placeholder para Teste --- */}
      {/* Esta View colorida prova que a lógica de exibição está a funcionar. */}
      <View style={styles.testPlaceholder} />
      <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
        <AppText variant="bold" style={styles.title}>
          Level Up!
        </AppText>
        <AppText variant="medium" style={styles.levelText}>
          Nível {pendingLevelUpAnimation}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2000, // Garante que está acima de tudo (incluindo o CustomAlert)
  },
  lottie: { ...StyleSheet.absoluteFillObject },
  testPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(100, 200, 100, 0.3)", // Um verde semi-transparente para o teste
  },
  contentContainer: { alignItems: "center" },
  title: {
    fontSize: 52,
    color: theme.colors.surface,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  levelText: {
    fontSize: 32,
    color: theme.colors.favorite,
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
});

export default LevelUpOverlay;
