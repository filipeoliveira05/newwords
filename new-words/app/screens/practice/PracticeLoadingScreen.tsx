import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { usePracticeStore } from "../../../stores/usePracticeStore";
import { useWordStore } from "../../../stores/wordStore";
import { useAlertStore } from "../../../stores/useAlertStore";
// import { Word } from "../../../types/database";
import { PracticeStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import Icon from "../../components/Icon";

const loadingTips = [
  "A consistência é a chave para a maestria.",
  "Cada erro é um passo em direção ao acerto.",
  "Está a um passo de expandir o seu conhecimento.",
  "Respire fundo. A sua mente está pronta.",
  "A repetição espaçada é a sua melhor amiga.",
];

type Props = {
  route: RouteProp<PracticeStackParamList, "PracticeLoading">;
};

export default function PracticeLoadingScreen({ route }: Props) {
  const {
    mode,
    deckId,
    words: wordsFromRoute,
    sessionType,
    origin,
  } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<PracticeStackParamList>>();
  const { showAlert } = useAlertStore.getState();

  const {
    fetchWordsForPractice,
    fetchLeastPracticedWords,
    fetchWrongWords,
    fetchFavoriteWords,
  } = useWordStore.getState();
  const initializeSession = usePracticeStore(
    (state) => state.initializeSession
  );

  // --- Animation State ---
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const tipOpacity = useSharedValue(0);

  // --- Animation Styles ---
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedTipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
  }));

  // --- Effects ---
  // Effect for the main animations on mount
  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 500 });
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1, // Infinite loop
      true // Reverse direction
    );
    textOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    // Cleanup function to cancel animations when the component unmounts
    return () => {
      cancelAnimation(iconOpacity);
      cancelAnimation(iconScale);
      cancelAnimation(textOpacity);
    };
  }, [iconOpacity, iconScale, textOpacity]);

  // Effect for cycling through tips
  useEffect(() => {
    tipOpacity.value = withSequence(
      withDelay(800, withTiming(1, { duration: 600 })), // Fade in
      withDelay(2000, withTiming(0, { duration: 600 }))
    );

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % loadingTips.length);
      tipOpacity.value = withSequence(
        withTiming(1, { duration: 600 }),
        withDelay(2000, withTiming(0, { duration: 600 }))
      );
    }, 3200); // 600ms in + 2000ms visible + 600ms out

    return () => {
      clearInterval(tipInterval);
      // Also cancel the tip animation on unmount
      cancelAnimation(tipOpacity);
    };
  }, [tipOpacity, setCurrentTipIndex]);

  // Effect for loading data and navigating
  useEffect(() => {
    const MIN_LOADING_TIME = 3000; // 3 seconds

    const fetchData = async () => {
      const SESSION_LIMIT = 20;
      if (wordsFromRoute && wordsFromRoute.length > 0) {
        return wordsFromRoute;
      }
      if (sessionType === "urgent") {
        return await fetchWordsForPractice(deckId, SESSION_LIMIT);
      }
      if (sessionType === "wrong") {
        return await fetchWrongWords();
      }
      if (sessionType === "favorite") {
        return await fetchFavoriteWords();
      }
      return await fetchLeastPracticedWords(deckId, SESSION_LIMIT);
    };

    const startSession = async () => {
      const startTime = Date.now();
      try {
        const fullWordPool = await fetchData();

        if (fullWordPool.length === 0) {
          showAlert({
            title: "Tudo em dia!",
            message:
              "Não há palavras para praticar neste momento. Adicione novas palavras ou volte mais tarde.",
            buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
          });
          return;
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = MIN_LOADING_TIME - elapsedTime;

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        initializeSession(fullWordPool, mode, sessionType, deckId);
        navigation.replace("PracticeGame", { origin });
      } catch (error) {
        console.error("Erro ao carregar a sessão de prática:", error);
        showAlert({
          title: "Erro",
          message: "Não foi possível iniciar a sessão.",
          buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
        });
      }
    };

    startSession();
    // Queremos que isto corra apenas uma vez quando o ecrã é montado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={animatedIconStyle}>
        <Icon name="flashOutline" size={80} color={theme.colors.primary} />
      </Animated.View>
      <Animated.View style={animatedTextStyle}>
        <AppText variant="bold" style={styles.loadingText}>
          A preparar a sua sessão...
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.tipContainer, animatedTipStyle]}>
        <AppText style={styles.tipText}>{loadingTips[currentTipIndex]}</AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 30,
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    textAlign: "center",
  },
  tipContainer: {
    position: "absolute",
    bottom: 80,
    paddingHorizontal: 20,
  },
  tipText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
