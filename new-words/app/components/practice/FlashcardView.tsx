import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { usePracticeStore } from "@/stores/usePracticeStore";
import AppText from "../AppText";
import { theme } from "../../theme";

export default function FlashcardView() {
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const { recordAnswer, nextWord } = usePracticeStore.getState();

  // Valor da animação para a rotação do cartão
  const rotation = useSharedValue(0);

  // Estilo animado para a frente do cartão
  const frontAnimatedStyle = useAnimatedStyle(() => {
    // Interpola a rotação para criar um efeito de escala que "salta"
    const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1]);

    return {
      transform: [{ rotateY: `${rotation.value}deg` }, { scale }],
    };
  });

  // Estilo animado para o verso do cartão
  const backAnimatedStyle = useAnimatedStyle(() => {
    // A escala é a mesma para ambas as faces para parecer um único objeto
    const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1]);

    return {
      transform: [{ rotateY: `${rotation.value + 180}deg` }, { scale }],
    };
  });

  useEffect(() => {
    setIsFlipped(false);
    // Reseta a animação para a nova palavra
    rotation.value = withTiming(0, { duration: 0 });
  }, [currentWord]);

  if (!currentWord) {
    return null;
  }

  const handleReveal = () => {
    if (isFlipped) return; // Previne virar novamente
    rotation.value = withTiming(180, { duration: 600 });
    setTimeout(() => setIsFlipped(true), 250); // Mostra os botões a meio da animação
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    recordAnswer(currentWord.id, isCorrect);
    nextWord();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handleReveal} // A área de toque agora tem a sombra e a perspetiva
        activeOpacity={0.7}
        disabled={isFlipped}
      >
        {/* Frente do Cartão */}
        <Animated.View
          style={[styles.card, styles.cardFront, frontAnimatedStyle]}
        >
          <View style={styles.cardContent}>
            <AppText variant="medium" style={styles.cardTitle}>
              Palavra
            </AppText>
            <AppText variant="bold" style={styles.cardText}>
              {currentWord.name}
            </AppText>
          </View>
          <AppText style={styles.cardHint}>Toque para virar</AppText>
        </Animated.View>

        {/* Verso do Cartão */}
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          <View style={styles.cardContent}>
            <AppText variant="medium" style={styles.cardTitle}>
              Significado
            </AppText>
            <AppText variant="bold" style={styles.cardText}>
              {currentWord.meaning}
            </AppText>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.incorrectButton]}
            onPress={() => handleAnswer(false)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Errei
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.correctButton]}
            onPress={() => handleAnswer(true)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Acertei!
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignItems: "center",
    maxWidth: 400,
  },
  cardContainer: {
    width: "100%",
    height: 320,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    transform: [{ perspective: 1200 }],
  },
  card: {
    width: "100%",
    height: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    position: "absolute",
    top: 0,
    left: 0,
    backfaceVisibility: "hidden",
  },
  cardFront: {},
  cardBack: {},
  cardContent: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardText: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  cardHint: {
    position: "absolute",
    bottom: 20,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 40,
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  incorrectButton: {
    backgroundColor: theme.colors.danger,
  },
  correctButton: {
    backgroundColor: theme.colors.success,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.base,
  },
});
