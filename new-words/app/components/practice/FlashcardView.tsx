import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as soundService from "@/services/soundService";
import * as hapticService from "@/services/hapticService";
import { usePracticeStore } from "@/stores/usePracticeStore";
import AppText from "../AppText";
import { theme } from "../../../config/theme";

export default function FlashcardView() {
  // Controla a visibilidade dos botões "Acertei" e "Errei".
  // Torna-se verdadeiro após a primeira viragem e permanece assim.
  const [showAnswerButtons, setShowAnswerButtons] = useState(false);

  const currentWord = usePracticeStore((state) => state.getCurrentWord());
  const { recordAnswer, nextWord } = usePracticeStore.getState();

  // Valor da animação para a rotação do cartão
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  // Estilo animado para a frente do cartão
  const frontAnimatedStyle = useAnimatedStyle(() => {
    // Interpola a rotação para criar um efeito de escala que "salta"
    const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1]);

    return {
      transform: [{ rotateY: `${-rotation.value}deg` }, { scale }],
    };
  });

  // Estilo animado para o verso do cartão
  const backAnimatedStyle = useAnimatedStyle(() => {
    // A escala é a mesma para ambas as faces para parecer um único objeto
    const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1]);

    return {
      transform: [{ rotateY: `${-rotation.value + 180}deg` }, { scale }],
    };
  });

  useEffect(() => {
    setShowAnswerButtons(false);
    // Reseta as animações para a nova palavra.
    rotation.value = 0;
    translateX.value = 0;
    opacity.value = 0; // Começa invisível
    opacity.value = withTiming(1, { duration: 300 }); // Anima a entrada
  }, [currentWord, rotation, translateX, opacity]);

  if (!currentWord) {
    return null;
  }

  const handleReveal = () => {
    soundService.playSound(soundService.SoundType.Flip);
    // Anima a rotação para o lado oposto
    rotation.value = withTiming(rotation.value === 0 ? 180 : 0, {
      duration: 600,
    });

    // Mostra os botões de resposta após a primeira viragem e mantém-nos visíveis.
    if (!showAnswerButtons) {
      setTimeout(() => {
        setShowAnswerButtons(true);
      }, 250);
    }
  };

  const handleAnswer = (quality: number) => {
    // Quality < 3 is incorrect, >= 3 is correct
    if (quality >= 3) {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Success
      );
      soundService.playSound(soundService.SoundType.Correct);
    } else {
      hapticService.notificationAsync(
        hapticService.NotificationFeedbackType.Error
      );
      soundService.playSound(soundService.SoundType.Incorrect);
    }
    // Use the new SM-2 based function
    recordAnswer(currentWord.id, quality);

    const slideDirection = -500;

    // Anima a saída do cartão
    opacity.value = withTiming(0, { duration: 300 });
    translateX.value = withTiming(
      slideDirection,
      { duration: 400 },
      (finished) => {
        if (finished) {
          // Chama a próxima palavra no thread de JS quando a animação termina
          runOnJS(nextWord)();
        }
      }
    );
  };

  const getCategoryColors = (categoryName: string) => {
    const key = categoryName as keyof typeof theme.colors.category;
    const defaultKey = "Outro" as keyof typeof theme.colors.category;

    return {
      background:
        theme.colors.categoryLighter[key] ||
        theme.colors.categoryLighter[defaultKey],
      text:
        theme.colors.categoryDarker[key] ||
        theme.colors.categoryDarker[defaultKey],
    };
  };

  const categoryColors = getCategoryColors(currentWord.category);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handleReveal} // A área de toque agora tem a sombra e a perspetiva
        activeOpacity={0.8}
      >
        {/* Frente do Cartão */}
        <Animated.View
          style={[styles.card, styles.cardFront, frontAnimatedStyle]}
        >
          <View style={styles.cardMainContent}>
            <AppText variant="medium" style={styles.cardTitle}>
              Palavra
            </AppText>
            <AppText variant="bold" style={styles.cardText}>
              {currentWord.name}
            </AppText>
            <View
              style={[
                styles.categoryContainer,
                { backgroundColor: categoryColors.background },
              ]}
            >
              <AppText
                style={[styles.categoryText, { color: categoryColors.text }]}
              >
                {currentWord.category}
              </AppText>
            </View>
          </View>
          <AppText style={styles.cardHint}>Toque para virar</AppText>
        </Animated.View>

        {/* Verso do Cartão */}
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          <View style={styles.cardMainContent}>
            <AppText variant="medium" style={styles.cardTitle}>
              Significado
            </AppText>
            <AppText variant="bold" style={styles.cardText}>
              {currentWord.meaning}
            </AppText>
            <View style={styles.categoryPlaceholder} />
          </View>
          <View style={{ height: 21 }} />
          <AppText style={styles.cardHint}>Toque para virar</AppText>
        </Animated.View>
      </TouchableOpacity>

      {showAnswerButtons && (
        <View style={styles.buttonContainer}>
          {/* Quality 2: Incorrect */}
          <TouchableOpacity
            style={[styles.button, styles.buttonQuality2]}
            activeOpacity={0.8}
            onPress={() => handleAnswer(2)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Errei
            </AppText>
          </TouchableOpacity>
          {/* Quality 3: Correct, but hard */}
          <TouchableOpacity
            style={[styles.button, styles.buttonQuality3]}
            activeOpacity={0.8}
            onPress={() => handleAnswer(3)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Difícil
            </AppText>
          </TouchableOpacity>
          {/* Quality 4: Correct, good recall */}
          <TouchableOpacity
            style={[styles.button, styles.buttonQuality4]}
            activeOpacity={0.8}
            onPress={() => handleAnswer(4)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Bom
            </AppText>
          </TouchableOpacity>
          {/* Quality 5: Correct, easy recall */}
          <TouchableOpacity
            style={[styles.button, styles.buttonQuality5]}
            activeOpacity={0.8}
            onPress={() => handleAnswer(5)}
          >
            <AppText variant="bold" style={styles.buttonText}>
              Fácil
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
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
    transform: [{ perspective: 1200 }],
  },
  card: {
    width: "100%",
    height: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    position: "absolute",
    top: 0,
    left: 0,
    backfaceVisibility: "hidden",
    // A sombra foi removida para evitar artefactos na animação.
    // Usamos uma borda para manter a definição visual.
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  cardFront: {},
  cardBack: {},
  cardMainContent: {
    alignItems: "center",
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 16, // Espaço entre a palavra e a categoria
  },
  categoryPlaceholder: {
    // Simula o espaço da categoria para alinhamento.
    // Altura (16px) + marginTop (16px) = 32px
    height: 16,
    marginTop: 16,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: 40, // Espaço entre o título ("Palavra") e a palavra
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardText: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
  },
  cardHint: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 40,
    width: "105%", // A bit wider to accommodate spacing
    justifyContent: "center",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonQuality2: {
    backgroundColor: theme.colors.danger,
  },
  buttonQuality3: {
    backgroundColor: theme.colors.challenge,
  },
  buttonQuality4: {
    backgroundColor: theme.colors.success,
  },
  buttonQuality5: {
    backgroundColor: theme.colors.successMedium,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
  },
});
