import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import AppText from "../AppText";
import { theme } from "../../../config/theme";
import confettiAnimation from "../../../assets/animations/confetti.json";

interface LevelUpViewProps {
  level: number;
  onContinue: () => void;
}

// Sub-componente para o crachá de nível com a sua própria animação
const LevelBadge = ({ level }: { level: number }) => {
  const oldLevel = level - 1;
  const numberAnimation = useSharedValue(0);
  const shineAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  useEffect(() => {
    // Animação do número a "virar"
    numberAnimation.value = withDelay(
      600, // Começa depois da animação principal
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    // Animação de brilho (shine) que corre depois da transição do número
    shineAnimation.value = withDelay(
      1200, // Começa depois da transição do número
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
    );

    // Animação de "respiração" que começa depois do brilho e repete
    scaleAnimation.value = withDelay(
      2000, // Começa depois do brilho
      withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Loop infinito
        true // Reverte a animação (efeito de "respiração")
      )
    );
  }, [numberAnimation, shineAnimation, scaleAnimation]);

  const oldNumberStyle = useAnimatedStyle(() => ({
    opacity: interpolate(numberAnimation.value, [0, 0.5], [1, 0]),
    transform: [
      { translateY: interpolate(numberAnimation.value, [0, 1], [0, 40]) },
    ],
  }));

  const newNumberStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    opacity: interpolate(numberAnimation.value, [0.5, 1], [0, 1]),
    transform: [
      { translateY: interpolate(numberAnimation.value, [0, 1], [-40, 0]) },
    ],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const animatedShineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shineAnimation.value, [0, 1], [-140, 140]);
    return {
      transform: [{ translateX }, { rotate: "20deg" }],
      opacity: interpolate(
        shineAnimation.value,
        [0, 0.2, 0.8, 1],
        [0, 0.5, 0.5, 0]
      ),
    };
  });

  return (
    <Animated.View style={[styles.levelCircleContainer, animatedBadgeStyle]}>
      <View style={styles.levelCircleInner}>
        <Animated.View style={oldNumberStyle}>
          <AppText variant="bold" style={styles.levelCircleText}>
            {oldLevel}
          </AppText>
        </Animated.View>
        <Animated.View style={newNumberStyle}>
          <AppText variant="bold" style={styles.levelCircleText}>
            {level}
          </AppText>
        </Animated.View>
        {/* Efeito de brilho */}
        <Animated.View style={[styles.shineOverlay, animatedShineStyle]}>
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.4)", "transparent"]}
            style={styles.shineGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const LevelUpView = ({ level, onContinue }: LevelUpViewProps) => {
  const confettiRef = useRef<LottieView>(null);

  const containerOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const buttonTranslateY = useSharedValue(100);

  useEffect(() => {
    // Animações de entrada escalonadas
    containerOpacity.value = withTiming(1, { duration: 400 });
    contentScale.value = withDelay(200, withSpring(1));
    buttonTranslateY.value = withDelay(800, withSpring(0));

    // Toca a animação de confetes
    confettiRef.current?.play();
  }, [containerOpacity, contentScale, buttonTranslateY]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLighter]}
        style={StyleSheet.absoluteFill}
      />
      <LottieView
        ref={confettiRef}
        style={styles.confetti}
        source={confettiAnimation}
        autoPlay={false}
        loop={false}
        resizeMode="cover"
      />
      <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
        <AppText variant="bold" style={styles.title}>
          Subiu de Nível!
        </AppText>
        <LevelBadge level={level} />
        <AppText variant="medium" style={styles.subtitle}>
          Parabéns! Continue com o excelente trabalho.
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={onContinue}
        >
          <AppText variant="bold" style={styles.buttonText}>
            Continuar
          </AppText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    // Move a animação para a camada de topo para que apareça sobre o conteúdo.
    zIndex: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  title: {
    fontSize: 48,
    color: theme.colors.surface,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 32,
  },
  levelCircleContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  levelCircleInner: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 70, // Garante que o fundo interior também é redondo
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Essencial para as animações internas
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderRadius: 70,
  },
  shineGradient: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "60%",
  },
  levelCircleText: {
    color: theme.colors.surface,
    fontSize: 72,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: theme.colors.surface,
    opacity: 0.9,
    marginTop: 24,
    textAlign: "center",
    maxWidth: "80%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    width: "90%",
    zIndex: 3,
  },
  button: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.xl,
    textAlign: "center",
  },
});

export default LevelUpView;
