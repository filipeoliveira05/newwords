import React, { useEffect } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePracticeStore } from "../../../stores/usePracticeStore";
import { useWordStore } from "../../../stores/wordStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { PracticeStackParamList } from "../../../types/navigation";
import LoadingScreen from "../LoadingScreen";

// const loadingTips = [
//   "A consistência é a chave para a maestria.",
//   "Cada erro é um passo em direção ao acerto.",
//   "Está a um passo de expandir o seu conhecimento.",
//   "Respire fundo. A sua mente está pronta.",
//   "A repetição espaçada é a sua melhor amiga.",
// ];

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

  // Effect for loading data and navigating
  useEffect(() => {
    const MIN_LOADING_TIME = 2000; // 2 seconds

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

  return <LoadingScreen visible={true} loadingText="A preparar a sessão..." />;
}
