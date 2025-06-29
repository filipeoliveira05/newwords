import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Calendar, LocaleConfig } from "react-native-calendars";
import StatCard from "../components/stats/StatCard";
import {
  getGlobalStats,
  getChallengingWords,
  getUserPracticeMetrics,
  getPracticeHistory,
  getUnlockedAchievementIds,
  getTotalWordCount,
  getTodaysPracticeStats,
  getTodaysActiveGoalIds,
  setTodaysActiveGoalIds,
  unlockAchievements,
  GlobalStats,
  ChallengingWord,
  UserPracticeMetrics,
  PracticeHistory,
} from "../../services/storage";
import { RootTabParamList } from "../../types/navigation";
import { allPossibleDailyGoals, DailyGoal } from "../../config/dailyGoals";
import DailyGoalProgress from "../components/stats/DailyGoalProgress";
import { achievements, Achievement } from "../../config/achievements";
import AchievementBadge from "../components/stats/AchievementBadge";

// Define the type for the marked dates object locally.
// This is necessary because the version of `react-native-calendars`
// installed might not export the `MarkedDates` type directly.
type MarkedDates = {
  [key: string]: {
    selected: boolean;
    selectedColor: string;
    disableTouchEvent: boolean;
  };
};

// Helper function to shuffle an array
const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserPracticeMetrics | null>(
    null
  );
  const [challengingWords, setChallengingWords] = useState<ChallengingWord[]>(
    []
  );
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory[]>([]);
  const [todaysStats, setTodaysStats] = useState<PracticeHistory | null>(null);
  const [activeDailyGoals, setActiveDailyGoals] = useState<DailyGoal[]>([]);
  const [timeRemaining, setTimeRemaining] = useState("");

  const [processedAchievements, setProcessedAchievements] = useState<
    (Achievement & { unlocked: boolean; isNew: boolean })[]
  >([]);

  const navigation =
    useNavigation<BottomTabNavigationProp<RootTabParamList, "Stats">>();

  // Countdown timer effect
  useEffect(() => {
    const timerId = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((diff / 1000 / 60) % 60)
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((diff / 1000) % 60)
        .toString()
        .padStart(2, "0");

      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
          const [
            globalStats,
            challenging,
            metrics,
            history,
            unlockedIds,
            totalWords,
            todaysPractice,
            todaysActiveGoalIds,
          ] = await Promise.all([
            getGlobalStats(),
            getChallengingWords(),
            getUserPracticeMetrics(),
            getPracticeHistory(),
            getUnlockedAchievementIds(),
            getTotalWordCount(),
            getTodaysPracticeStats(),
            getTodaysActiveGoalIds(),
          ]);
          setStats(globalStats);
          setChallengingWords(challenging);
          setUserMetrics(metrics);
          setPracticeHistory(history);
          setTodaysStats(todaysPractice);

          // --- Daily Goals Logic ---
          let finalGoals: DailyGoal[] = [];
          if (todaysActiveGoalIds) {
            // Goals for today already exist, find them in the config
            const goalMap = new Map(
              allPossibleDailyGoals.map((g) => [g.id, g])
            );
            finalGoals = todaysActiveGoalIds
              .map((id) => goalMap.get(id))
              .filter((g): g is DailyGoal => !!g);
          } else {
            // First time today, shuffle and pick 3 new goals
            finalGoals = shuffle([...allPossibleDailyGoals]).slice(0, 3);
            await setTodaysActiveGoalIds(finalGoals.map((g) => g.id));
          }
          setActiveDailyGoals(finalGoals);

          // Lógica de verificação de conquistas otimizada
          if (globalStats && metrics && history && totalWords !== undefined) {
            const unlockedIdsSet = new Set(unlockedIds);
            const newlyUnlocked: Achievement[] = [];

            const checkedAchievements = achievements.map((ach) => {
              const isAlreadyUnlocked = unlockedIdsSet.has(ach.id);
              if (isAlreadyUnlocked) {
                return { ...ach, unlocked: true, isNew: false };
              }

              // Se não estiver desbloqueada, verifica agora
              const isNowUnlocked = ach.check({
                global: globalStats,
                user: metrics,
                history: history,
                totalWords: totalWords,
              });

              if (isNowUnlocked) {
                newlyUnlocked.push(ach);
              }

              return { ...ach, unlocked: isNowUnlocked, isNew: isNowUnlocked };
            });

            // Se houver novas conquistas, guarda-as na DB
            if (newlyUnlocked.length > 0) {
              const newIds = newlyUnlocked.map((ach) => ach.id);
              await unlockAchievements(newIds);
              // Mostra uma notificação para cada nova conquista!
              newlyUnlocked.forEach((ach, index) => {
                // Adiciona um pequeno delay para não sobrepor as notificações
                setTimeout(() => {
                  Toast.show({
                    type: "success",
                    text1: "Conquista Desbloqueada! 🎉",
                    text2: ach.title,
                    visibilityTime: 4000,
                  });
                }, index * 600);
              });
            }

            setProcessedAchievements(checkedAchievements);
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, [])
  );

  const markedDates: MarkedDates = useMemo(() => {
    const getHeatmapColor = (count: number) => {
      if (count >= 20) return "#2a9d8f"; // Darkest
      if (count >= 10) return "#83c5be";
      if (count > 0) return "#edf6f9"; // Lightest
      return "transparent";
    };

    return practiceHistory.reduce((acc, day) => {
      acc[day.date] = {
        selected: true,
        selectedColor: getHeatmapColor(day.words_trained),
        disableTouchEvent: true,
      };
      return acc;
    }, {} as MarkedDates);
  }, [practiceHistory]);

  const handlePracticeChallengingWords = () => {
    if (challengingWords.length === 0) return;

    // Navega para o ecrã de prática, passando apenas as palavras desafiadoras.
    // O modo 'multiple-choice' é ótimo para uma revisão focada.
    navigation.navigate("Practice", {
      screen: "PracticeGame",
      params: {
        mode: "multiple-choice",
        words: challengingWords,
      },
    });
  };

  // Configura o calendário para português
  LocaleConfig.locales["pt"] = {
    monthNames:
      "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split(
        "_"
      ),
    monthNamesShort: "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split(
      "_"
    ),
    dayNames:
      "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split(
        "_"
      ),
    dayNamesShort: "D_S_T_Q_Q_S_S".split("_"),
    today: "Hoje",
  };
  LocaleConfig.defaultLocale = "pt";

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#22223b" />
        <Text style={styles.loadingText}>A calcular estatísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>As suas Estatísticas</Text>

      {/* Secção 1: Métricas Principais */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="checkmark-circle-outline"
          value={`${Math.round(stats?.successRate ?? 0)}%`}
          label="Taxa de Sucesso"
          color="#2a9d8f"
        />
        <StatCard
          icon="star-outline"
          value={stats?.wordsMastered ?? 0}
          label="Palavras Dominadas"
          color="#e9c46a"
        />
        <StatCard
          icon="flame-outline"
          value={userMetrics?.longestStreak ?? 0}
          label="Maior Streak"
          color="#f4a261"
        />
        <StatCard
          icon="calendar-outline"
          value={userMetrics?.consecutiveDays ?? 0}
          label="Dias Seguidos"
          color="#e76f51"
        />
      </View>

      {/* Secção : Metas Diárias */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Metas Diárias</Text>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
        </View>
        {activeDailyGoals.map((goal) => (
          <DailyGoalProgress
            key={goal.id}
            icon={goal.icon}
            title={goal.title}
            target={goal.target}
            current={goal.getCurrentProgress(todaysStats)}
          />
        ))}
      </View>

      {/* Secção 2: Mapa de Atividade (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa de Atividade</Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            calendarBackground: "#fff",
            textSectionTitleColor: "#b6c1cd",
            selectedDayBackgroundColor: "#00adf5",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#e76f51",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            arrowColor: "#e76f51",
            monthTextColor: "#22223b",
            textMonthFontWeight: "bold",
          }}
        />
      </View>

      {/* Secção 3: Palavras Desafiadoras */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Palavras Desafiadoras</Text>
        {challengingWords.length > 0 ? (
          <>
            {challengingWords.map((word) => (
              <View key={word.id} style={styles.wordItem}>
                <Text style={styles.wordName}>{word.name}</Text>
                <Text style={styles.wordSuccessRate}>
                  Acerto: {Math.round(word.successRate)}%
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.practiceButton}
              onPress={handlePracticeChallengingWords}
            >
              <Ionicons name="flame-outline" size={20} color="#fff" />
              <Text style={styles.practiceButtonText}>
                Praticar estas palavras
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>
            Nenhuma palavra difícil por agora. Bom trabalho!
          </Text>
        )}
      </View>

      {/* Secção 4: Conquistas (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conquistas</Text>
        {processedAchievements.map((ach) => (
          <AchievementBadge
            key={ach.id}
            title={ach.title}
            description={ach.description}
            icon={ach.icon}
            unlocked={ach.unlocked}
            isNew={ach.isNew}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 14,
    color: "#e76f51",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 16,
  },
  wordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  wordName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  wordSuccessRate: {
    fontSize: 14,
    color: "#e76f51",
    fontWeight: "600",
  },
  placeholderBox: {
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#adb5bd",
    fontSize: 14,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4a261",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
  },
});
