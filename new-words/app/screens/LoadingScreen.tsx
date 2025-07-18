import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from "react-native-reanimated";
import { theme } from "../../config/theme";
import AppText from "../components/AppText";
import images from "../../services/imageService";

interface LoadingScreenProps {
  /** Controla a visibilidade do loader. */
  visible: boolean;
  /** Imagem da mascote a ser exibida. Usa uma padrão se não for fornecida. */
  mascotImage?: ImageSourcePropType;
  /** Texto a ser exibido abaixo da mascote. */
  loadingText?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  visible,
  mascotImage = images.mascotNeutral, // Mascote padrão
  loadingText = "A carregar...",
}) => {
  // Animação para os pontos a seguir ao texto
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    const animation = (
      sharedValue: Animated.SharedValue<number>,
      delay: number
    ) => {
      sharedValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, {
              duration: 600,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        )
      );
    };

    animation(dot1Opacity, 0);
    animation(dot2Opacity, 200);
    animation(dot3Opacity, 400);
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  const animatedDot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));
  const animatedDot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));
  const animatedDot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primaryLighter, theme.colors.background]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.mascotContainer}>
          <Image source={mascotImage} style={styles.mascot} />
        </View>
        <View style={styles.contentContainer}>
          <AppText variant="bold" style={styles.loadingText}>
            {loadingText}
          </AppText>
          <AppText style={styles.subtleText}>A preparar tudo para si!</AppText>
          <View style={styles.dotsContainer}>
            <Animated.Text style={[styles.dot, animatedDot1Style]}>
              .
            </Animated.Text>
            <Animated.Text style={[styles.dot, animatedDot2Style]}>
              .
            </Animated.Text>
            <Animated.Text style={[styles.dot, animatedDot3Style]}>
              .
            </Animated.Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  mascotContainer: {
    flex: 3, // Ocupa a maior parte do ecrã
    justifyContent: "flex-end", // Empurra a imagem para a parte de baixo do seu contentor
    width: "80%",
    marginTop: 80,
    marginBottom: 20,
  },
  mascot: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 2, // Ocupa o espaço restante
    alignItems: "center",
    justifyContent: "flex-start", // Alinha o conteúdo no topo do seu espaço
  },
  loadingText: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
  },
  subtleText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: "row",
  },
  dot: {
    fontSize: theme.fontSizes.loadingDots, // Aumenta o tamanho dos pontos
    color: theme.colors.text,
    marginHorizontal: 4,
  },
});

export default LoadingScreen;
