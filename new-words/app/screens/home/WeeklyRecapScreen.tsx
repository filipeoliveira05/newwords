import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getWeek, subWeeks } from "date-fns";

import { HomeStackParamList } from "../../../types/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import { theme } from "../../../config/theme";
import Icon from "../../components/Icon";
import RecapProgressBar from "../../components/home/recap/RecapProgressBar";
import { WeeklySummary } from "../../../services/storage";

import {
  IntroSlide,
  MainHighlightSlide,
  HighlightData,
  ConsistencyHabitSlide,
  ConsistencyHabitData,
  MetricsSlide,
  PerformanceSlide,
  DeepDiveSlide,
  ComparisonSlide,
  LeaguePerformanceSlide,
  ShareableRecapSlide,
  FinalSlide,
} from "../../components/home/recap/slides";
type Props = NativeStackScreenProps<HomeStackParamList, "WeeklyRecap">;

// Define a discriminated union for the slide types to help TypeScript
// understand the data structure within the switch statement.
type SlideItem =
  | { id: "intro"; type: "intro" }
  | { id: "mainHighlight"; type: "mainHighlight"; data: HighlightData }
  | {
      id: "consistencyHabit";
      type: "consistencyHabit";
      data: ConsistencyHabitData;
    }
  | { id: "metrics"; type: "metrics"; data: WeeklySummary }
  | { id: "performance"; type: "performance"; data: WeeklySummary }
  | { id: "deepDive"; type: "deepDive"; data: WeeklySummary }
  | { id: "comparison"; type: "comparison"; data: WeeklySummary }
  | { id: "leaguePerformance"; type: "leaguePerformance"; data: WeeklySummary }
  | {
      id: "share";
      type: "share";
      data: { summary: WeeklySummary; mainHighlight: HighlightData | null };
    }
  | { id: "final"; type: "final" };

// --- Ecrã Principal ---

const WeeklyRecapScreen = ({ route, navigation }: Props) => {
  const { summary } = route.params;
  const { user } = useUserStore();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const userName = user?.firstName ?? "colega";
  const lastWeekNumber = getWeek(subWeeks(new Date(), 1));

  const slides = useMemo((): SlideItem[] => {
    const slideItems: SlideItem[] = [{ id: "intro", type: "intro" }];

    // --- Slide 2: O Seu Grande Destaque ---
    // --- Lógica para determinar o "Grande Destaque" ---
    let mainHighlight: HighlightData | null = null;

    if (summary.practiceDaysCount === 7) {
      mainHighlight = {
        label: "Sequência Perfeita! 🔥",
        value: "7",
        subValue: "dias de prática",
      };
    } else if (summary.wordsTrained > 50) {
      // Um valor arbitrário para ser considerado um "recorde"
      mainHighlight = {
        label: "Novo Recorde Pessoal! 🚀",
        value: `${summary.wordsTrained}`,
        subValue: "palavras treinadas",
      };
    } else if (summary.achievementsUnlockedCount > 1) {
      mainHighlight = {
        label: "Caçador de Conquistas! 🏆",
        value: `${summary.achievementsUnlockedCount}`,
        subValue: "conquistas desbloqueadas",
      };
    }

    if (mainHighlight) {
      slideItems.push({
        id: "mainHighlight",
        type: "mainHighlight",
        data: mainHighlight,
      });
    }

    // --- Slide 3: A Força do Hábito ---
    // Only show this slide if there's something to show
    if (
      summary.practiceDays.some((day) => day) ||
      summary.unlockedAchievements.length > 0
    ) {
      slideItems.push({
        id: "consistencyHabit",
        type: "consistencyHabit",
        data: {
          practiceDays: summary.practiceDays,
          unlockedAchievements: summary.unlockedAchievements,
        },
      });
    }

    // --- Slide 4: O Seu Esforço em Números ---
    if (summary.wordsTrained > 0 || summary.wordsLearned > 0) {
      slideItems.push({ id: "metrics", type: "metrics", data: summary });
    }

    // --- Slide 5: Performance de Elite ---
    slideItems.push({ id: "performance", type: "performance", data: summary });

    // --- Slide 6: Mergulho Profundo ---
    if (
      summary.mostProductiveDay ||
      summary.mostTrainedWord ||
      summary.mostChallengingWord
    ) {
      slideItems.push({ id: "deepDive", type: "deepDive", data: summary });
    }

    // --- Slide 7: A Sua Evolução ---
    if (summary.comparison) {
      slideItems.push({ id: "comparison", type: "comparison", data: summary });
    }

    // --- Slide 8: Liga Semanal ---
    if (summary.leaguePerformance) {
      slideItems.push({
        id: "leaguePerformance",
        type: "leaguePerformance",
        data: summary,
      });
    }

    // --- Slide 9: Partilha ---
    slideItems.push({
      id: "share",
      type: "share",
      data: { summary, mainHighlight },
    });

    // --- Slide 10: Conclusão ---
    slideItems.push({ id: "final", type: "final" });

    return slideItems;
  }, [summary]);

  const currentSlideType = slides[currentIndex]?.type;
  const isNavOverlayDisabled =
    currentSlideType === "consistencyHabit" || // Slide com scroll
    currentSlideType === "share"; // Slide com botão de partilha

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const goToNextSlide = useCallback(() => {
    // Se o utilizador navegar manualmente enquanto está em pausa, retoma a reprodução.
    if (isPaused) {
      setIsPaused(false);
    }
    // Atualizamos o estado do índice imediatamente para que a barra de progresso
    // responda ao clique instantaneamente, em vez de esperar que a animação
    // de scroll do FlatList termine e o `onViewableItemsChanged` seja chamado.
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex });
    } else {
      handleClose(); // Fecha no último slide
    }
  }, [currentIndex, slides.length, handleClose, isPaused]);

  const goToPreviousSlide = useCallback(() => {
    // Se o utilizador navegar manualmente enquanto está em pausa, retoma a reprodução.
    if (isPaused) {
      setIsPaused(false);
    }
    // Mesma lógica do goToNextSlide para uma resposta imediata da UI.
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex });
    }
  }, [currentIndex, isPaused]);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = useCallback(
    ({ item, index }: { item: SlideItem; index: number }) => {
      const isActive = index === currentIndex;

      switch (item.type) {
        case "intro":
          return <IntroSlide userName={userName} weekNumber={lastWeekNumber} />;
        case "mainHighlight":
          return <MainHighlightSlide data={item.data} />;
        case "consistencyHabit":
          return <ConsistencyHabitSlide data={item.data} />;
        case "metrics":
          return <MetricsSlide summary={item.data} isActive={isActive} />;
        case "performance":
          return <PerformanceSlide summary={item.data} isActive={isActive} />;
        case "deepDive":
          return <DeepDiveSlide summary={item.data} />;
        case "comparison":
          return <ComparisonSlide summary={item.data} />;
        case "leaguePerformance":
          return <LeaguePerformanceSlide summary={item.data} />;
        case "share":
          return (
            <ShareableRecapSlide
              data={item.data}
              userName={userName}
              weekNumber={lastWeekNumber}
            />
          );
        case "final":
          return <FinalSlide onFinish={handleClose} />;
        default:
          return null;
      }
    },
    // A função só será recriada se um destes valores mudar.
    [currentIndex, userName, lastWeekNumber, handleClose]
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primaryLighter, theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <RecapProgressBar
              key={index}
              isActive={index === currentIndex}
              isCompleted={index < currentIndex}
              onFinish={goToNextSlide}
              isPaused={isPaused}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={togglePause}
        >
          <Icon
            name={isPaused ? "play" : "pause"}
            size={24}
            style={isPaused ? { marginLeft: 3 } : {}} // Corrige o alinhamento visual do ícone de play
            color={theme.colors.surface}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={handleClose}
        >
          <Icon name="close" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
      />

      {/* Camadas de navegação por toque */}
      {!isNavOverlayDisabled && (
        <View style={styles.navOverlay}>
          <TouchableOpacity
            style={styles.navArea}
            activeOpacity={0.8}
            onPress={goToPreviousSlide}
          />
          <TouchableOpacity
            style={styles.navArea}
            activeOpacity={0.8}
            onPress={goToNextSlide}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  navArea: {
    flex: 1,
  },
});

export default WeeklyRecapScreen;
