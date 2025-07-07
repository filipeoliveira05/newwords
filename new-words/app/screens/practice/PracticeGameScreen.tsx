import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  RouteProp,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePracticeStore } from "../../../stores/usePracticeStore";
import { useWordStore } from "../../../stores/wordStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { Word } from "../../../types/database";
import {
  PracticeStackParamList,
  RootTabParamList,
} from "../../../types/navigation";

import StreakCounter from "../../components/practice/StreakCounter";
import ProgressBar from "../../components/practice/ProgressBar";
import FlashcardView from "../../components/practice/FlashcardView";
import MultipleChoiceView from "../../components/practice/MultipleChoiceView";
import WritingView from "../../components/practice/WritingView";
import CombineListsView from "../../components/practice/CombineListsView";
import SessionResults from "../../components/practice/SessionResults";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

type Props = {
  route: RouteProp<PracticeStackParamList, "PracticeGame">;
};

const gameModeTitles = {
  flashcard: "Revisão Clássica",
  "multiple-choice": "Escolha Múltipla",
  writing: "Jogo da Escrita",
  "combine-lists": "Combinar Listas",
};

const GameHeader = ({
  mode,
  onBackPress,
}: {
  mode: "flashcard" | "multiple-choice" | "writing" | "combine-lists";
  onBackPress: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textMedium} />
      </TouchableOpacity>
      <AppText variant="bold" style={styles.headerTitle}>
        {gameModeTitles[mode]}
      </AppText>
      <View style={styles.headerRight}>
        <StreakCounter />
      </View>
    </View>
  );
};

export default function PracticeGameScreen({ route }: Props) {
  const {
    mode,
    deckId,
    words: wordsFromRoute,
    sessionType,
    origin,
  } = route.params;
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { showAlert } = useAlertStore.getState();

  const [isLoading, setIsLoading] = useState(true);
  const hasConfirmedExit = useRef(false);

  const sessionState = usePracticeStore((state) => state.sessionState);
  const {
    fetchWordsForPractice,
    fetchLeastPracticedWords,
    fetchWrongWords,
    fetchFavoriteWords,
  } = useWordStore.getState();
  const initializeSession = usePracticeStore(
    (state) => state.initializeSession
  );
  const endSession = usePracticeStore((state) => state.endSession);
  const startNextRound = usePracticeStore((state) => state.startNextRound);

  // useFocusEffect é usado em vez de useEffect para garantir que a sessão
  // é recarregada sempre que o ecrã entra em foco, resolvendo o bug de
  // não iniciar uma nova sessão ao reentrar com os mesmos parâmetros.
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true; // Flag para evitar updates de estado se o componente for desmontado

      const loadSessionData = async () => {
        try {
          setIsLoading(true);
          const SESSION_LIMIT = 20; // Limite para qualquer tipo de sessão
          let fullWordPool: Word[];

          if (wordsFromRoute && wordsFromRoute.length > 0) {
            // Use a lista de palavras passada diretamente (ex: palavras desafiadoras).
            fullWordPool = wordsFromRoute;
          } else if (sessionType === "urgent") {
            // Busca até 20 palavras urgentes, priorizadas pela data de revisão mais antiga.
            fullWordPool = await fetchWordsForPractice(deckId, SESSION_LIMIT);
          } else if (sessionType === "wrong") {
            fullWordPool = await fetchWrongWords();
          } else if (sessionType === "favorite") {
            fullWordPool = await fetchFavoriteWords();
          } else {
            // Para uma sessão livre, busca as 20 palavras mais desafiadoras
            // (menor 'easinessFactor') ou as menos praticadas.
            fullWordPool = await fetchLeastPracticedWords(
              deckId,
              SESSION_LIMIT
            );
          }

          if (fullWordPool.length === 0) {
            // Apenas mostra o alerta se o ecrã ainda estiver ativo
            if (isActive) {
              showAlert({
                title: "Tudo em dia!",
                message:
                  "Não há palavras para praticar neste momento. Adicione novas palavras ou volte mais tarde.",
                buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
              });
            }
            return; // Sai da função mais cedo
          }

          initializeSession(fullWordPool, mode, sessionType, deckId);
          hasConfirmedExit.current = false;
        } catch (error) {
          console.error("Erro ao carregar a sessão de prática:", error);
          showAlert({
            title: "Erro",
            message: "Não foi possível iniciar a sessão.",
            buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadSessionData();

      // A função de limpeza do useFocusEffect é chamada quando o ecrã perde o foco.
      // É o local perfeito para limpar o estado da sessão.
      return () => {
        isActive = false;
        endSession();
      };
    }, [
      deckId,
      mode,
      sessionType,
      wordsFromRoute,
      fetchWordsForPractice,
      fetchLeastPracticedWords,
      fetchWrongWords,
      fetchFavoriteWords,
      showAlert,
      navigation,
      initializeSession,
      endSession,
    ])
  );

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        // Previne o utilizador de sair a meio de uma ronda sem querer.
        if (hasConfirmedExit.current || sessionState !== "in-progress") {
          return;
        }

        e.preventDefault();

        // Com o CustomAlert baseado em View, já não é necessário o InteractionManager.
        showAlert({
          title: "Sair da Prática?",
          message: "Tem a certeza que quer sair?",
          buttons: [
            { text: "Ficar", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: () => {
                hasConfirmedExit.current = true;

                if (origin === "DeckDetail") {
                  // Volta para o ecrã anterior (PracticeHub) e depois navega para o separador Home.
                  navigation.goBack();
                  navigation.navigate("Decks"); // O stack do HomeDecks irá mostrar o DeckDetail
                } else if (origin === "Stats") {
                  // Volta para o ecrã anterior (PracticeHub) e depois navega para o separador Stats.
                  navigation.goBack();
                  navigation.navigate("Stats");
                } else {
                  // Comportamento padrão (vindo do PracticeHub): apenas executa a ação de voltar original.
                  navigation.dispatch(e.data.action);
                }
              },
            },
          ],
        });
      }),
    [navigation, sessionState, showAlert, origin]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText variant="bold" style={styles.loadingText}>
          A preparar a sua sessão...
        </AppText>
      </View>
    );
  }

  if (sessionState === "finished") {
    return (
      <SessionResults
        onPlayAgain={startNextRound}
        onExit={endSession}
        deckId={deckId}
        origin={origin}
      />
    );
  }

  if (sessionState === "in-progress") {
    return (
      <View style={styles.container}>
        <GameHeader mode={mode} onBackPress={() => navigation.goBack()} />
        <ProgressBar key={sessionState} />
        {mode === "flashcard" && <FlashcardView />}
        {mode === "multiple-choice" && <MultipleChoiceView />}
        {mode === "writing" && <WritingView />}
        {mode === "combine-lists" && <CombineListsView />}
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer} /> // Ecrã vazio enquanto a lógica decide o que fazer
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingTop: 100, // Increased padding to create more space for the absolute header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8, // Larger touch area
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMedium,
  },
  headerRight: {
    minWidth: 40, // Approx width of back button to keep title centered
    alignItems: "flex-end",
  },
});
