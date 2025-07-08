import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useUserStore } from "../../../stores/useUserStore";
import AppText from "../../components/AppText";
import { differenceInDays } from "date-fns";
import { theme } from "../../../config/theme";
import { Ionicons } from "@expo/vector-icons";
import { eventStore } from "../../../stores/eventStore";
import {
  RootTabParamList,
  HomeStackParamList,
} from "../../../types/navigation";
import DailyGoalProgress from "../../components/stats/DailyGoalProgress";
import LeagueWidget from "../../components/home/LeagueWidget";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <AppText variant="bold" style={[styles.statValue, { color }]}>
      {value}
    </AppText>
    <AppText style={styles.statLabel}>{label}</AppText>
  </View>
);

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "HomeDashboard">,
  BottomTabScreenProps<RootTabParamList>
>;
export default function HomeScreen({ navigation }: Props) {
  const {
    xp,
    level,
    xpForNextLevel,
    consecutiveDays,
    wordsMastered,
    lastPracticeDate,
    todaysPractice,
    totalWords,
    loading,
    fetchUserStats,
    dailyGoals,
    lastPracticedDeck,
    user,
  } = useUserStore();

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

  useEffect(() => {
    const getPersonalizedWelcomeMessage = (): string => {
      if (!user?.firstName) return "Bem-vindo(a)!";

      const name = user.firstName;

      // Helper to get a random element from an array
      const getRandomItem = <T,>(arr: T[]): T =>
        arr[Math.floor(Math.random() * arr.length)];

      // --- Message Templates for different contexts ---

      const firstSessionTemplates = [
        "Bem-vindo ao início da tua jornada, {name}! Cada palavra é uma conquista.",
        "A primeira sessão é sempre especial. Bora deixar a curiosidade guiar-te, {name}!",
        "Estás prestes a abrir as portas de um novo mundo, {name}!",
      ];

      const longPauseTemplates = [
        "Sentimos a tua falta, {name}! Vamos retomar de onde paraste?",
        "O mais importante é voltar. Que bom ter-te de volta, {name}!",
        "As palavras estavam com saudades tuas, {name}!",
      ];

      const streakMilestoneTemplates = [
        "🔥 {consecutiveDays} dias seguidos! A tua consistência é impressionante, {name}!",
        "Estás a criar um hábito poderoso. Já vais com {consecutiveDays} dias seguidos!",
        "{consecutiveDays} dias de treino! Quem te para, {name}?",
      ];

      const allGoalsDoneTemplates = [
        "Objetivos do dia completados! Missão cumprida, {name}!",
        "Mais um check na tua lista de vitórias hoje, {name}!",
        "Boa! Cumpriste as tuas metas diárias, e com estilo!",
      ];

      const highVolumePracticeTemplates = [
        "Treinaste {numWords} palavras hoje. Que dedicação, {name}!",
        "Foi uma verdadeira maratona de vocabulário. Excelente trabalho!",
        "{numWords} palavras praticadas hoje! Estás a jogar em modo avançado.",
      ];

      const masteredWordsMilestoneTemplates = [
        "Já dominaste {totalMasteredWords} palavras. Estás a construir um vocabulário imbatível!",
        "O teu dicionário interno está a crescer rápido, {name}!",
        "{totalMasteredWords} palavras memorizadas. És imparável!",
      ];

      const returningUserTemplates = [
        // For regular returns
        "Que bom te ver por aqui, {name}!",
        "De volta à ação, {name}!",
        "Continue o bom trabalho, {name}!",
        "Cada sessão conta, {name}. Vamos em frente!",
        "A prática leva à perfeição, {name}. Vamos lá!",
        "Mais um dia, mais progresso, {name}!",
        "Vamos manter o ritmo, {name}!",
      ];

      const genericTemplates = [
        // For new users or no specific context
        "Olá, {name}!",
        "O que vamos treinar hoje, {name}?",
        "Vamos a isso, {name}!",
        "Hora de expandir o vocabulário, {name}!",
        "Vamos aprender algo novo hoje, {name}?",
        "Tudo a postos para uma sessão, {name}?",
        "Bora praticar, {name}!",
        "Que tal aprender umas palavras novas, {name}?",
      ];

      // --- Logic to select the right message ---

      // Priority 1: First Session Ever
      if (!lastPracticeDate && totalWords < 5) {
        return getRandomItem(firstSessionTemplates).replace("{name}", name);
      }

      // Priority 2: Return After Long Pause
      const daysSinceLastPractice = lastPracticeDate
        ? differenceInDays(new Date(), new Date(lastPracticeDate))
        : 0;
      if (daysSinceLastPractice > 5) {
        return getRandomItem(longPauseTemplates).replace("{name}", name);
      }

      // Priority 3: All Daily Goals Completed
      const allGoalsCompleted =
        dailyGoals.length > 0 && dailyGoals.every((g) => g.current >= g.target);
      if (allGoalsCompleted) {
        return getRandomItem(allGoalsDoneTemplates).replace("{name}", name);
      }

      // Priority 4: Streak Milestones
      const streakMilestones = [3, 5, 7, 10, 15, 20, 30, 50, 100];
      if (streakMilestones.includes(consecutiveDays)) {
        return getRandomItem(streakMilestoneTemplates)
          .replace("{consecutiveDays}", consecutiveDays.toString())
          .replace("{name}", name);
      }

      // Priority 5: High Volume Practice Today
      const wordsPracticedToday = todaysPractice?.words_trained ?? 0;
      if (wordsPracticedToday >= 50) {
        return getRandomItem(highVolumePracticeTemplates)
          .replace("{numWords}", wordsPracticedToday.toString())
          .replace("{name}", name);
      }

      // Priority 6: Mastered Words Milestones
      const masteredMilestones = [10, 25, 50, 100, 200, 500];
      if (masteredMilestones.includes(wordsMastered)) {
        return getRandomItem(masteredWordsMilestoneTemplates)
          .replace("{totalMasteredWords}", wordsMastered.toString())
          .replace("{name}", name);
      }

      // Fallback: Regular returning user or generic
      const templates =
        consecutiveDays >= 2
          ? [...returningUserTemplates, ...genericTemplates]
          : genericTemplates;
      return getRandomItem(templates).replace("{name}", name);
    };

    setWelcomeMessage(getPersonalizedWelcomeMessage());
  }, [
    user,
    consecutiveDays,
    lastPracticeDate,
    totalWords,
    dailyGoals,
    todaysPractice,
    wordsMastered,
  ]);

  const xpProgress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;

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
        <AppText style={styles.subtitle}>O seu progresso de hoje</AppText>
      </View>

      <View style={styles.content}>
        {/* Level and XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.levelCircle}>
            <AppText variant="bold" style={styles.levelText}>
              {level}
            </AppText>
          </View>
          <View style={styles.xpBarContainer}>
            <AppText variant="bold" style={styles.xpLabel}>
              Nível {level}
            </AppText>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${xpProgress}%` }]}
              />
            </View>
            <AppText style={styles.xpText}>
              {xp} / {xpForNextLevel} XP
            </AppText>
          </View>
        </View>

        {/* League Widget */}
        <LeagueWidget />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="flame-outline"
            value={`${consecutiveDays} ${
              consecutiveDays === 1 ? "dia" : "dias"
            }`}
            label="Streak"
            color={theme.colors.challenge}
          />
          <StatCard
            icon="library-outline"
            value={totalWords}
            label="Palavras"
            color={theme.colors.primary}
          />
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() =>
            navigation.navigate("Practice", { screen: "PracticeHub" })
          }
        >
          <Ionicons name="flash" size={24} color={theme.colors.surface} />
          <AppText variant="bold" style={styles.mainActionButtonText}>
            Começar a Praticar
          </AppText>
        </TouchableOpacity>

        {/* Daily Goals Widget */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Metas Diárias
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

        {/* Continue Learning Widget */}
        {lastPracticedDeck && (
          <View style={styles.section}>
            <AppText variant="bold" style={styles.sectionTitle}>
              Continue a Aprender
            </AppText>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate("Decks", {
                  screen: "DeckDetail",
                  params: {
                    deckId: lastPracticedDeck.id,
                    title: lastPracticedDeck.title,
                    author: lastPracticedDeck.author,
                  },
                })
              }
            >
              <Ionicons
                name="book-outline"
                size={24}
                color={theme.colors.primary}
              />
              <AppText variant="bold" style={styles.actionCardText}>
                {lastPracticedDeck.title}
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  xpCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  levelText: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.primary,
  },
  xpBarContainer: {
    flex: 1,
  },
  xpLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  xpText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    marginTop: 8,
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  mainActionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mainActionButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
    marginLeft: 12,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardText: {
    flex: 1,
    marginLeft: 16,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  challengingWordItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.challenge,
  },
  challengingWordText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMedium,
  },
});
