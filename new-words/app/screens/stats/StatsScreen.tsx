import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { format, parseISO } from "date-fns";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Calendar, LocaleConfig } from "react-native-calendars";
import StatCard from "../../components/stats/StatCard";
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
  countWordsAddedOnDate,
  getAchievementsUnlockedOnDate,
  GlobalStats,
  ChallengingWord,
  UserPracticeMetrics,
  PracticeHistory,
} from "../../../services/storage";
import {
  RootTabParamList,
  ProfileStackParamList,
} from "../../../types/navigation";
import { eventStore } from "@/stores/eventStore";
import { shuffle } from "@/utils/arrayUtils";
import { pt } from "date-fns/locale";
import { allPossibleDailyGoals, DailyGoal } from "../../../config/dailyGoals";
import DailyGoalProgress from "../../components/stats/DailyGoalProgress";
import { achievements, Achievement } from "../../../config/achievements";
import AchievementBadge from "../../components/stats/AchievementBadge";
import AppText from "../../components/AppText";
import Icon, { IconName } from "../../components/Icon";
import { theme } from "../../../config/theme";

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

type Props = NativeStackScreenProps<ProfileStackParamList, "Stats">;

export default function StatsScreen({ navigation }: Props) {
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

  // State for modal animation
  const [isModalRendered, setIsModalRendered] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(300);

  const [isDayDetailModalVisible, setIsDayDetailModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    words_trained: number;
    words_added: number;
    unlocked_achievements: Achievement[];
  } | null>(null);

  const [processedAchievements, setProcessedAchievements] = useState<
    (Achievement & { unlocked: boolean; isNew: boolean })[]
  >([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Estatísticas",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

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

  // Effect to handle modal open/close animations
  useEffect(() => {
    if (isDayDetailModalVisible) {
      setIsModalRendered(true);
      overlayOpacity.value = withTiming(1, { duration: 250 });
      modalTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else if (isModalRendered) {
      // Only run close animation if it was rendered
      overlayOpacity.value = withTiming(0, { duration: 250 });
      modalTranslateY.value = withTiming(
        300,
        { duration: 300, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(setIsModalRendered)(false);
          }
        }
      );
    }
  }, [
    isDayDetailModalVisible,
    isModalRendered,
    overlayOpacity,
    modalTranslateY,
  ]);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: modalTranslateY.value }],
    };
  });

  useEffect(() => {
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
          const goalMap = new Map(allPossibleDailyGoals.map((g) => [g.id, g]));
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

    // Subscribe to multiple events to keep stats fresh.
    const unsubscribePractice = eventStore
      .getState()
      .subscribe("practiceSessionCompleted", fetchStats);
    const unsubscribeWordAdded = eventStore
      .getState()
      .subscribe("wordAdded", fetchStats);
    const unsubscribeWordDeleted = eventStore
      .getState()
      .subscribe("wordDeleted", fetchStats);
    const unsubscribeWordUpdated = eventStore
      .getState()
      .subscribe("wordUpdated", fetchStats);
    const unsubscribeDeckDeleted = eventStore
      .getState()
      .subscribe("deckDeleted", fetchStats);

    // Cleanup function to unsubscribe from all events when the component unmounts.
    return () => {
      unsubscribePractice();
      unsubscribeWordAdded();
      unsubscribeWordDeleted();
      unsubscribeWordUpdated();
      unsubscribeDeckDeleted();
    };
  }, []);

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
        disableTouchEvent: false,
      };
      return acc;
    }, {} as MarkedDates);
  }, [practiceHistory]);

  const handleDayPress = useCallback(
    async (day: { dateString: string }) => {
      const historyForDay = practiceHistory.find(
        (h) => h.date === day.dateString
      );

      const [wordsAddedCount, unlockedAchievementIds] = await Promise.all([
        countWordsAddedOnDate(day.dateString),
        getAchievementsUnlockedOnDate(day.dateString),
      ]);

      const unlockedAchievements = achievements.filter((ach) =>
        unlockedAchievementIds.includes(ach.id)
      );

      if (
        historyForDay ||
        wordsAddedCount > 0 ||
        unlockedAchievements.length > 0
      ) {
        setSelectedDayData({
          date: day.dateString,
          words_trained: historyForDay?.words_trained ?? 0,
          words_added: wordsAddedCount,
          unlocked_achievements: unlockedAchievements,
        });
        setIsDayDetailModalVisible(true);
      }
    },
    [practiceHistory]
  );

  const handlePracticeChallengingWords = () => {
    if (challengingWords.length === 0) return;

    // Navega para o ecrã de prática, passando apenas as palavras desafiadoras.
    // O modo 'multiple-choice' é ótimo para uma revisão focada.
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate("Practice", {
        screen: "PracticeLoading",
        params: {
          mode: "multiple-choice",
          sessionType: "free", // Prática de palavras específicas é sempre 'free'
          words: challengingWords,
          origin: "Stats",
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
        <ActivityIndicator size="large" color={theme.colors.text} />
        <AppText style={styles.loadingText}>A calcular estatísticas...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {/* Secção 1: Métricas Principais */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="checkmarkCircleOutline"
            value={`${Math.round(stats?.successRate ?? 0)}%`}
            label="Taxa de Sucesso"
            color={theme.colors.success}
          />
          <StatCard
            icon="school"
            value={stats?.wordsMastered ?? 0}
            label="Palavras Dominadas"
            color={theme.colors.dark}
          />
          <StatCard
            icon="trendingUp"
            value={userMetrics?.longestStreak ?? 0}
            label="Maior Sequência de Acertos"
            color={theme.colors.primary}
          />
          <StatCard
            icon="flame"
            value={userMetrics?.consecutiveDays ?? 0}
            label="Dias Seguidos"
            color={theme.colors.challenge}
          />
        </View>

        {/* Secção : Metas Diárias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="bold" style={styles.sectionTitle}>
              Metas Diárias
            </AppText>
            <AppText variant="bold" style={styles.countdownText}>
              {timeRemaining}
            </AppText>
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

        {/* Secção 2: Mapa de Atividade */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Mapa de Atividade
          </AppText>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.textMuted,
              selectedDayBackgroundColor: "#00adf5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: theme.colors.danger,
              dayTextColor: theme.colors.textMedium,
              textDisabledColor: theme.colors.border,
              arrowColor: theme.colors.danger,
              monthTextColor: theme.colors.text,
              textMonthFontFamily: theme.fonts.bold,
              textDayFontFamily: theme.fonts.regular,
              textDayHeaderFontFamily: theme.fonts.medium,
            }}
          />
        </View>

        {/* Secção 3: Palavras Desafiadoras */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Palavras Desafiadoras
          </AppText>
          {challengingWords.length > 0 ? (
            <>
              {challengingWords.map((word) => (
                <View key={word.id} style={styles.wordItem}>
                  <AppText variant="medium" style={styles.wordName}>
                    {word.name}
                  </AppText>
                  <AppText variant="bold" style={styles.wordSuccessRate}>
                    Acerto: {Math.round(word.successRate)}%
                  </AppText>
                </View>
              ))}
              <TouchableOpacity
                style={styles.practiceButton}
                onPress={handlePracticeChallengingWords}
              >
                <Icon name="flame" size={20} color={theme.colors.surface} />
                <AppText variant="bold" style={styles.practiceButtonText}>
                  Praticar estas palavras
                </AppText>
              </TouchableOpacity>
            </>
          ) : (
            <AppText style={styles.placeholderText}>
              Nenhuma palavra difícil por agora. Bom trabalho!
            </AppText>
          )}
        </View>

        {/* Secção 4: Conquistas (Placeholder) */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Conquistas
          </AppText>
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

      {/* Day Detail Modal */}
      <Modal
        visible={isModalRendered}
        transparent
        animationType="none"
        onRequestClose={() => setIsDayDetailModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, animatedOverlayStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsDayDetailModalVisible(false)}
          />
          <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                Detalhes do Dia
              </AppText>
              <TouchableOpacity
                onPress={() => setIsDayDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>
            {selectedDayData && (
              <View style={styles.dayDetailContent}>
                <AppText style={styles.dayDetailDate}>
                  {format(
                    parseISO(selectedDayData.date),
                    "EEEE, dd 'de' MMMM 'de' yyyy",
                    { locale: pt }
                  )}
                </AppText>
                {/* Palavras Adicionadas - sempre visível */}
                <View style={styles.dayDetailStat}>
                  <Icon
                    name="addCircle"
                    size={24}
                    color={theme.colors.success}
                  />
                  <AppText style={styles.dayDetailStatText}>
                    <AppText variant="bold">
                      {selectedDayData.words_added}
                    </AppText>
                    {selectedDayData.words_added === 1
                      ? " palavra adicionada"
                      : " palavras adicionadas"}
                  </AppText>
                </View>

                {/* Palavras Praticadas - sempre visível */}
                <View style={styles.dayDetailStat}>
                  <Icon
                    name="flashOutline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <AppText style={styles.dayDetailStatText}>
                    <AppText variant="bold">
                      {selectedDayData.words_trained}
                    </AppText>
                    {selectedDayData.words_trained === 1
                      ? " palavra praticada"
                      : " palavras praticadas"}
                  </AppText>
                </View>

                {/* Conquistas - visível apenas se > 0 */}
                {selectedDayData.unlocked_achievements.length > 0 && (
                  <View style={styles.dayDetailSection}>
                    <AppText
                      variant="medium"
                      style={styles.dayDetailSectionTitle}
                    >
                      Conquistas Desbloqueadas
                    </AppText>
                    {selectedDayData.unlocked_achievements.map((ach) => (
                      <View key={ach.id} style={styles.dayDetailStat}>
                        <Icon
                          name={ach.icon as IconName}
                          size={24}
                          color={theme.colors.gold}
                        />
                        <AppText style={styles.dayDetailStatText}>
                          {ach.title}
                        </AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20, // Add margin to separate from header
  },
  section: {
    backgroundColor: theme.colors.surface,
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.danger,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
  },
  wordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  wordName: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMedium,
  },
  wordSuccessRate: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.danger,
  },
  placeholderText: {
    marginTop: 5,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.challenge,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  practiceButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -18,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
  },
  closeButton: {
    padding: 8,
  },
  dayDetailContent: {
    paddingTop: 16,
  },
  dayDetailDate: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: "left",
  },
  dayDetailStat: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  dayDetailStatText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    marginLeft: 12,
  },
  dayDetailSection: {
    width: "100%",
    marginTop: 16,
  },
  dayDetailSectionTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
  },
});
