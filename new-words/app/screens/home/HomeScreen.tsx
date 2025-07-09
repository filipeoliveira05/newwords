import React, { useEffect, useState, useMemo, useLayoutEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../../../stores/useUserStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { eventStore } from "../../../stores/eventStore";
import {
  RootTabParamList,
  HomeStackParamList,
} from "../../../types/navigation";
import DailyGoalProgress from "../../components/stats/DailyGoalProgress";
import LeagueWidget from "../../components/home/LeagueWidget";
import DynamicActionCard from "../../components/home/DynamicActionCard";
import OnThisDayCard from "../../components/home/cards/OnThisDayCard";
import TipOfTheDayCard from "../../components/home/cards/TipOfTheDayCard";
import GamificationHeader from "../../components/home/GamificationHeader";
import {
  getPersonalizedWelcomeMessage,
  WelcomeMessageContext,
} from "../../../services/welcomeMessageService";

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "HomeDashboard">,
  BottomTabScreenProps<RootTabParamList>
>;
export default function HomeScreen({ navigation }: Props) {
  const {
    consecutiveDays,
    wordsMastered,
    lastPracticeDate,
    todaysPractice,
    totalWords,
    onThisDayWord,
    loading,
    fetchUserStats,
    dailyGoals,
    user,
  } = useUserStore();

  const learningTips = useMemo(
    () => [
      {
        title: "Dica de Aprendizagem",
        text: "Tente criar uma imagem mental para cada nova palavra. Associar uma imagem ao significado torna a memorização muito mais eficaz.",
      },
      {
        title: "Sabia Que?",
        text: "Praticar em sessões curtas e frequentes (ex: 5-10 minutos por dia) é mais eficiente do que uma sessão longa uma vez por semana.",
      },
    ],
    []
  );

  useEffect(() => {
    // Carrega os dados quando o ecrã é montado
    fetchUserStats();

    // Ouve eventos para manter os dados atualizados sem recarregar tudo
    const unsubPractice = eventStore
      .getState()
      .subscribe("practiceSessionCompleted", fetchUserStats);
    const unsubWordAdded = eventStore
      .getState()
      .subscribe("wordAdded", fetchUserStats);
    const unsubWordDeleted = eventStore
      .getState()
      .subscribe("wordDeleted", fetchUserStats);

    return () => {
      unsubPractice();
      unsubWordAdded();
      unsubWordDeleted();
    };
  }, [fetchUserStats]);

  const [welcomeMessage, setWelcomeMessage] = useState("Bem-vindo(a)!");
  const [tipOfTheDay, setTipOfTheDay] = useState(learningTips[0]);

  useEffect(() => {
    // O objeto de contexto corresponde à interface definida no serviço
    const context: WelcomeMessageContext = {
      user,
      lastPracticeDate,
      totalWords,
      dailyGoals,
      consecutiveDays,
      todaysPractice,
      wordsMastered,
    };

    setWelcomeMessage(getPersonalizedWelcomeMessage(context));

    // Seleciona uma dica aleatória sempre que os dados do utilizador são carregados
    setTipOfTheDay(
      learningTips[Math.floor(Math.random() * learningTips.length)]
    );
  }, [
    user,
    consecutiveDays,
    lastPracticeDate,
    totalWords,
    dailyGoals,
    todaysPractice,
    wordsMastered,
    learningTips,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <GamificationHeader />,
      headerShadowVisible: false, // Torna a transição mais suave
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          {welcomeMessage}
        </AppText>
      </View>

      <View style={styles.content}>
        <View style={styles.dynamicCardContainer}>
          <DynamicActionCard />
        </View>
        <LeagueWidget />

        {/*
          ==================================================================
          SECÇÃO 4: JORNADA DE APRENDIZAGEM E DESCOBERTA
          ==================================================================
        */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            As Suas Metas
          </AppText>
          {dailyGoals.map((goal) => (
            <DailyGoalProgress
              key={goal.id}
              icon={goal.icon}
              title={goal.title}
              target={goal.target}
              current={goal.current}
            />
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Explore e Recorde
          </AppText>
          {onThisDayWord && <OnThisDayCard word={onThisDayWord} />}
          <TipOfTheDayCard tip={tipOfTheDay} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 0,
  },
  dynamicCardContainer: {
    marginBottom: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: 16,
  },
});
