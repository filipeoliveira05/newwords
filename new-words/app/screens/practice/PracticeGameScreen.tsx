import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePracticeStore } from "../../../stores/usePracticeStore";
import { useAlertStore } from "../../../stores/useAlertStore";
import { updateUserPracticeMetrics } from "../../../services/storage";
import { eventStore } from "../../../stores/eventStore";
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
import confettiAnimation from "../../../assets/animations/confetti.json";
// import XpFeedbackManager from "../../components/practice/XpFeedbackManager";
import AppText from "../../components/AppText";
import Icon from "../../components/Icon";
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
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={onBackPress}
      >
        <Icon name="back" size={24} color={theme.colors.textMedium} />
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
  const { origin } = route.params;
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { showAlert } = useAlertStore.getState();

  const hasConfirmedExit = useRef(false);

  const sessionState = usePracticeStore((state) => state.sessionState);
  const gameMode = usePracticeStore((state) => state.gameMode);
  const deckId = usePracticeStore((state) => state.deckId);
  const endSession = usePracticeStore((state) => state.endSession);
  const startNextRound = usePracticeStore((state) => state.startNextRound);
  const highestStreakThisRound = usePracticeStore(
    (state) => state.highestStreakThisRound
  );

  // Limpa a sessão quando o ecrã é desmontado.
  useEffect(() => endSession, [endSession]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        // Previne o utilizador de sair a meio de uma ronda sem querer,
        // a menos que a saída já tenha sido confirmada ou a sessão não esteja em progresso.
        if (hasConfirmedExit.current || sessionState !== "in-progress") {
          return;
        }

        // Previne a ação de voltar padrão para podermos mostrar o nosso alerta.
        e.preventDefault();

        showAlert({
          title: "Sair da Prática?",
          message: "Tem a certeza que quer sair?",
          buttons: [
            { text: "Ficar", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: async () => {
                // Salva as estatísticas antes de sair
                await updateUserPracticeMetrics(highestStreakThisRound, deckId);
                // Publica o evento para que outros ecrãs (como o HomeScreen) atualizem os seus dados.
                eventStore.getState().publish("practiceSessionCompleted", {});

                // Marca que a saída foi confirmada para não mostrar o alerta novamente.
                hasConfirmedExit.current = true;
                // Executa a ação de navegação original que foi prevenida (ex: voltar atrás).
                navigation.dispatch(e.data.action);
              },
            },
          ],
        });
      }),
    [navigation, sessionState, showAlert, highestStreakThisRound, deckId]
  );

  if (sessionState === "finished") {
    return (
      <SessionResults
        onPlayAgain={startNextRound}
        onExit={endSession}
        deckId={deckId}
        origin={origin}
        confettiAnimation={confettiAnimation}
      />
    );
  }

  if (sessionState === "in-progress" && gameMode) {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.contentContainer}>
          <ProgressBar key={sessionState} />
          {gameMode === "flashcard" && <FlashcardView />}
          {gameMode === "multiple-choice" && <MultipleChoiceView />}
          {gameMode === "writing" && <WritingView />}
          {gameMode === "combine-lists" && <CombineListsView />}
        </View>
        <GameHeader mode={gameMode} onBackPress={() => navigation.goBack()} />
        {/* <XpFeedbackManager /> */}
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer} /> // Ecrã vazio enquanto a lógica decide o que fazer
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    // Padding to ensure content is below the absolute header
    paddingTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  // loadingText: {
  //   marginTop: 20,
  //   fontSize: theme.fontSizes.lg,
  //   color: theme.colors.textMedium,
  // },
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
    textAlign: "center",
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textMedium,
  },
  headerRight: {
    minWidth: 40, // Approx width of back button to keep title centered
    alignItems: "flex-end",
  },
});
