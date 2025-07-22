import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions,
} from "react-native";
import * as Sharing from "expo-sharing";
import { Svg, Circle } from "react-native-svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import ViewShot from "react-native-view-shot";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  FadeInUp,
  Easing,
} from "react-native-reanimated";
import { format, parseISO, getWeek, subWeeks } from "date-fns";
import { pt } from "date-fns/locale";

import { HomeStackParamList } from "../../../types/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import { theme } from "../../../config/theme";
import AppText from "../../components/AppText";
import Icon, { IconName } from "../../components/Icon";
import images from "../../../services/imageService";
import RecapProgressBar from "../../components/home/recap/RecapProgressBar";
import { WeeklySummary } from "../../../services/storage";

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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const StatCard = ({
  icon,
  value,
  label,
  color,
  isActive,
  delay = 0,
}: {
  icon: IconName;
  value: number;
  label: string;
  color: string;
  isActive: boolean;
  delay?: number;
}) => {
  const animatedNumber = useSharedValue(0);

  useEffect(() => {
    // A animação só começa quando o slide está ativo.
    if (isActive && value > 0) {
      // É importante reiniciar o valor para 0 para que a animação corra
      // sempre que o slide se torna ativo (ex: ao navegar para trás).
      animatedNumber.value = 0;
      animatedNumber.value = withTiming(value, {
        duration: 3500,
        easing: Easing.out(Easing.cubic),
      });
    } else if (!isActive) {
      // Reinicia o valor para 0 se o slide ficar inativo, para a animação correr novamente
      animatedNumber.value = 0;
    }
  }, [value, animatedNumber, isActive]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedNumber.value)}`,
    } as any;
  });

  return (
    <Animated.View
      style={styles.statCard}
      entering={FadeInUp.delay(delay).duration(600).springify()}
    >
      <Icon name={icon} size={40} color={color} style={styles.statIcon} />
      <View style={styles.statTextContainer}>
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          style={[styles.statValue, { color }]}
          animatedProps={animatedProps}
        />
        <AppText style={styles.statLabel}>{label}</AppText>
      </View>
    </Animated.View>
  );
};

const AnimatedPercentage = ({
  value,
  isActive,
}: {
  value: number;
  isActive: boolean;
}) => {
  const animatedNumber = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      animatedNumber.value = 0;
      animatedNumber.value = withTiming(value, {
        duration: 3500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedNumber.value = 0;
    }
  }, [value, isActive, animatedNumber]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedNumber.value)}%`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={styles.chartValue}
      animatedProps={animatedProps}
    />
  );
};

const AnimatedDonutChart = ({
  progress,
  radius,
  strokeWidth,
  color,
  isActive,
}: {
  progress: number;
  radius: number;
  strokeWidth: number;
  color: string;
  isActive: boolean;
}) => {
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      animatedProgress.value = withTiming(progress / 100, {
        duration: 3500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = 0;
    }
  }, [isActive, progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Svg
      width={radius * 2}
      height={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
    >
      <Circle
        cx={radius}
        cy={radius}
        r={innerRadius}
        stroke={theme.colors.successLight}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <AnimatedCircle
        cx={radius}
        cy={radius}
        r={innerRadius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        fill="transparent"
        strokeLinecap="round"
        transform={`rotate(-90 ${radius} ${radius})`}
      />
    </Svg>
  );
};

const PerformanceStatCard = ({
  icon,
  value,
  label,
  color,
  isActive,
}: {
  icon: IconName;
  value: number;
  label: string;
  color: string;
  isActive: boolean;
}) => {
  const animatedNumber = useSharedValue(0);

  useEffect(() => {
    if (isActive && value > 0) {
      animatedNumber.value = 0;
      animatedNumber.value = withTiming(value, {
        duration: 3500,
        easing: Easing.out(Easing.cubic),
      });
    } else if (!isActive) {
      animatedNumber.value = 0;
    }
  }, [value, animatedNumber, isActive]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedNumber.value)}`,
    } as any;
  });

  return (
    <View style={styles.statItem}>
      <Icon name={icon} size={32} color={color} style={{ marginBottom: 8 }} />
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        style={[styles.statValue, { color }]}
        animatedProps={animatedProps}
      />
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get("window");

// --- Componentes dos Slides ---

// --- Slide 1: Abertura Cativante ---
const IntroSlide = ({
  userName,
  weekNumber,
}: {
  userName: string;
  weekNumber: number;
}) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      O Seu Resumo Semanal Chegou!
    </AppText>
    <AppText style={styles.subtitle}>
      A semana foi boa, {userName}! Vamos ver o seu progresso da Semana{" "}
      {weekNumber}.
    </AppText>
    <Image source={images.mascotAmazed} style={styles.mascotImage} />
  </Animated.View>
);

// --- Slide 2: O Seu Maior Feito ---
type HighlightData = {
  label: string;
  value: string;
  subValue?: string;
};

const MainHighlightSlide = ({ data }: { data: HighlightData }) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      O Seu Grande Destaque!
    </AppText>
    <View style={styles.mainHighlightCard}>
      <AppText style={styles.mainHighlightText}>{data.label}</AppText>
      <AppText variant="bold" style={styles.mainHighlightValue}>
        {data.value}
      </AppText>
      {data.subValue && (
        <AppText style={styles.mainHighlightSubValue}>{data.subValue}</AppText>
      )}
    </View>
  </Animated.View>
);

// --- Slide 3: A Força do Hábito ---
type ConsistencyHabitData = {
  practiceDays: boolean[];
  unlockedAchievements: { icon: IconName; name: string }[];
};

const PracticeDaysChart = ({ days }: { days: boolean[] }) => {
  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <View style={styles.practiceDaysContainer}>
      {days.map((practiced, index) => (
        <Animated.View
          key={index}
          style={styles.dayContainer}
          entering={FadeIn.delay(100 + index * 150)}
        >
          <View
            style={[styles.dayCircle, practiced && styles.dayCirclePracticed]}
          >
            {practiced && (
              <Icon name="checkmark" size={24} color={theme.colors.surface} />
            )}
          </View>
          <AppText style={styles.dayLabel}>{dayLabels[index]}</AppText>
        </Animated.View>
      ))}
    </View>
  );
};

const ConsistencyHabitSlide = ({ data }: { data: ConsistencyHabitData }) => (
  <Animated.View
    style={styles.scrollableSlideContainer}
    entering={FadeIn.duration(800)}
  >
    <AppText variant="bold" style={styles.title}>
      Consistência é a Chave.
    </AppText>

    <AppText style={styles.subtitle}>Dias de prática na semana</AppText>
    <PracticeDaysChart days={data.practiceDays} />

    {data.unlockedAchievements.length > 0 && (
      <View style={{ width: "100%", alignItems: "center" }}>
        <AppText style={[styles.subtitle, { marginTop: 40 }]}>
          Conquistas Desbloqueadas
        </AppText>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.achievementsContainer}>
            {data.unlockedAchievements.map((ach, index) => (
              <Animated.View
                key={ach.name}
                style={styles.achievementItem}
                entering={FadeInUp.delay(300 + index * 200).springify()}
              >
                <View style={styles.achievementIconContainer}>
                  <Icon name={ach.icon} size={32} color={theme.colors.gold} />
                </View>
                <AppText style={styles.achievementName}>{ach.name}</AppText>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </View>
    )}
  </Animated.View>
);

// --- Slide 4: O Seu Esforço em Números ---
const MetricsSlide = ({
  summary,
  isActive,
}: {
  summary: WeeklySummary;
  isActive: boolean;
}) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <AppText variant="bold" style={styles.title}>
      A Sua Dedicação
    </AppText>
    <AppText style={styles.subtitle}>
      O seu esforço em números na semana que passou.
    </AppText>
    <View style={styles.statsContainer}>
      <StatCard
        icon="flash"
        value={summary.wordsTrained}
        label="Palavras Treinadas"
        color={theme.colors.challenge}
        isActive={isActive}
        delay={200}
      />
      <StatCard
        icon="addCircle"
        value={summary.wordsLearned}
        label="Palavras Adicionadas"
        color={theme.colors.success}
        isActive={isActive}
        delay={400}
      />
      <StatCard
        icon="barbell"
        value={summary.weeklyXpGained}
        label="XP Ganho na Semana"
        color={theme.colors.primary}
        isActive={isActive}
        delay={600}
      />
    </View>
  </Animated.View>
);

// --- Slide 5: Performance de Elite ---
const PerformanceSlide = ({
  summary,
  isActive,
}: {
  summary: WeeklySummary;
  isActive: boolean;
}) => {
  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        Precisão e Mestria.
      </AppText>
      <AppText style={styles.subtitle}>
        Análise da sua performance na semana.
      </AppText>

      <View style={styles.performanceStatsContainer}>
        <View style={styles.chartContainer}>
          <AnimatedDonutChart
            radius={110}
            strokeWidth={20}
            progress={summary.weeklySuccessRate}
            color={theme.colors.success}
            isActive={isActive}
          />
          <View style={styles.chartTextContainer}>
            <AnimatedPercentage
              value={summary.weeklySuccessRate}
              isActive={isActive}
            />
            <AppText style={styles.chartLabel}>Taxa de Sucesso</AppText>
          </View>
        </View>

        <View style={styles.performanceDetails}>
          <PerformanceStatCard
            icon="school"
            value={summary.wordsMasteredThisWeek}
            label="Palavras Dominadas"
            color={theme.colors.successMedium}
            isActive={isActive}
          />
          <PerformanceStatCard
            icon="trendingUp"
            value={summary.longestStreakThisWeek}
            label="Maior Sequência de Respostas Corretas"
            color={theme.colors.challenge}
            isActive={isActive}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// --- Slide 6: Mergulho Profundo ---
const DeepDiveSlide = ({ summary }: { summary: WeeklySummary }) => {
  const hasContent =
    summary.mostProductiveDay ||
    summary.mostTrainedWord ||
    summary.mostChallengingWord;

  if (!hasContent) {
    return (
      <Animated.View
        style={styles.slideContent}
        entering={FadeIn.duration(800)}
      >
        <Image source={images.mascotHappy} style={styles.mascotImage} />
        <AppText variant="bold" style={styles.title}>
          Semana Sólida!
        </AppText>
        <AppText style={styles.subtitle}>
          Continuaste a praticar e a progredir. Força!
        </AppText>
      </Animated.View>
    );
  }

  const dayOfWeek = summary.mostProductiveDay
    ? format(parseISO(summary.mostProductiveDay.date), "EEEE", {
        locale: pt,
      })
    : "";

  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        Os Detalhes da Semana
      </AppText>
      <View style={styles.highlightContainer}>
        {summary.mostProductiveDay && (
          <View style={styles.highlightCard}>
            <Icon name="rocket" size={28} color={theme.colors.primary} />
            <View style={styles.highlightTextContainer}>
              <AppText style={styles.highlightLabel}>
                Dia Mais Produtivo
              </AppText>
              <AppText variant="bold" style={styles.highlightValue}>
                {dayOfWeek}
              </AppText>
              <AppText style={styles.highlightDetail}>
                {summary.mostProductiveDay.wordsTrained} palavras treinadas
              </AppText>
            </View>
          </View>
        )}
        {summary.mostTrainedWord && (
          <View style={styles.highlightCard}>
            <Icon name="trendingUp" size={28} color={theme.colors.success} />
            <View style={styles.highlightTextContainer}>
              <AppText style={styles.highlightLabel}>Mais Treinada</AppText>
              <AppText variant="bold" style={styles.highlightValue}>
                {summary.mostTrainedWord.name}
              </AppText>
              <AppText style={styles.highlightDetail}>
                {summary.mostTrainedWord.timesTrained} vezes
              </AppText>
            </View>
          </View>
        )}
        {summary.mostChallengingWord && (
          <View style={styles.highlightCard}>
            <Icon name="fitness" size={28} color={theme.colors.challenge} />
            <View style={styles.highlightTextContainer}>
              <AppText style={styles.highlightLabel}>Mais Desafiadora</AppText>
              <AppText variant="bold" style={styles.highlightValue}>
                {summary.mostChallengingWord.name}
              </AppText>
              <AppText style={styles.highlightDetail}>
                {summary.mostChallengingWord.timesIncorrect} erros
              </AppText>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// --- Slide 7: A Sua Evolução ---
const ComparisonStat = ({
  label,
  currentValue,
  previousValue,
}: {
  label: string;
  currentValue: number;
  previousValue: number;
}) => {
  const difference = currentValue - previousValue;

  // Caso 1: Sem atividade em nenhuma das semanas
  if (previousValue === 0 && currentValue === 0) {
    return (
      <View style={styles.comparisonStatItem}>
        <AppText style={styles.comparisonLabel}>{label}</AppText>
        <AppText variant="bold" style={styles.comparisonValue}>
          {currentValue}
        </AppText>
        <View
          style={[
            styles.comparisonBadge,
            { backgroundColor: theme.colors.borderLight },
          ]}
        >
          <AppText
            style={[
              styles.comparisonPercentage,
              { color: theme.colors.textSecondary },
            ]}
          >
            Sem atividade
          </AppText>
        </View>
      </View>
    );
  }

  // Caso 2: Atividade esta semana, mas nenhuma na semana passada
  if (previousValue === 0 && currentValue > 0) {
    return (
      <View style={styles.comparisonStatItem}>
        <AppText style={styles.comparisonLabel}>{label}</AppText>
        <AppText variant="bold" style={styles.comparisonValue}>
          {currentValue}
        </AppText>
        <View
          style={[
            styles.comparisonBadge,
            { backgroundColor: theme.colors.successLight },
          ]}
        >
          <Icon name="star" size={16} color={theme.colors.success} />
          <AppText
            style={[
              styles.comparisonPercentage,
              { color: theme.colors.success },
            ]}
          >
            Começou bem!
          </AppText>
        </View>
      </View>
    );
  }

  const percentageChange =
    previousValue > 0 ? Math.round((difference / previousValue) * 100) : 0;

  let icon: IconName, text: string, badgeStyle, textColor;

  if (difference > 0) {
    icon = "caretUp";
    text = `+${percentageChange}%`;
    badgeStyle = { backgroundColor: theme.colors.successLight };
    textColor = theme.colors.success;
  } else if (difference < 0) {
    icon = "caretDown";
    text = `${percentageChange}%`;
    badgeStyle = { backgroundColor: theme.colors.dangerLight };
    textColor = theme.colors.danger;
  } else {
    // difference === 0
    icon = "remove";
    text = "Manteve";
    badgeStyle = { backgroundColor: theme.colors.borderLight };
    textColor = theme.colors.textMedium;
  }

  return (
    <View style={styles.comparisonStatItem}>
      <AppText style={styles.comparisonLabel}>{label}</AppText>
      <AppText variant="bold" style={styles.comparisonValue}>
        {currentValue}
      </AppText>
      <View style={[styles.comparisonBadge, badgeStyle]}>
        <Icon name={icon} size={16} color={textColor} />
        <AppText style={[styles.comparisonPercentage, { color: textColor }]}>
          {text}
        </AppText>
      </View>
    </View>
  );
};

const ComparisonSlide = ({ summary }: { summary: WeeklySummary }) => {
  if (!summary.comparison) {
    return null;
  }
  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        Comparação Semanal
      </AppText>
      <AppText style={styles.subtitle}>
        Veja como se saiu em relação à semana anterior.
      </AppText>
      <View style={styles.comparisonContainer}>
        <ComparisonStat
          label="Palavras Treinadas"
          currentValue={summary.wordsTrained}
          previousValue={summary.comparison.wordsTrained}
        />
        <ComparisonStat
          label="Dias de Prática"
          currentValue={summary.practiceDaysCount}
          previousValue={summary.comparison.practiceDaysCount}
        />
      </View>
    </Animated.View>
  );
};

// --- Slide 8: Liga Semanal ---
const LeaguePerformanceSlide = ({ summary }: { summary: WeeklySummary }) => {
  if (!summary.leaguePerformance) {
    return null; // Should not happen if logic is correct, but good for safety
  }

  const { finalRank, result, leagueName } = summary.leaguePerformance;

  let icon: IconName = "shield";
  let color = theme.colors.textMedium;
  let title = "Desempenho Sólido!";
  let description = `Você manteve a sua posição na Liga ${leagueName}.`;

  switch (result) {
    case "promoted":
      icon = "trophyFilled";
      color = theme.colors.gold;
      title = "Promovido!";
      description = `Parabéns! Você subiu para a próxima liga.`;
      break;
    case "demoted":
      icon = "trendingDown";
      color = theme.colors.danger;
      title = "Despromovido";
      description = `Não desista! Você pode recuperar na próxima semana.`;
      break;
  }

  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        A Sua Liga Semanal
      </AppText>
      <View style={[styles.leagueCard, { borderColor: color }]}>
        <Animated.View entering={FadeIn.delay(200).duration(1000).springify()}>
          <Icon name={icon} size={80} color={color} />
        </Animated.View>
        <AppText variant="bold" style={[styles.leagueResultTitle, { color }]}>
          {title}
        </AppText>
        <AppText style={styles.leagueResultDescription}>{description}</AppText>
        <View style={styles.leagueRankContainer}>
          <AppText style={styles.leagueRankLabel}>Posição Final</AppText>
          <AppText variant="bold" style={styles.leagueRankValue}>
            {finalRank}º
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
};

// --- Slide 9: Partilha ---
const ShareStatItem = ({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) => (
  <View style={styles.shareStatItem}>
    <Icon name={icon} size={28} color={theme.colors.primaryLighter} />
    <AppText variant="bold" style={styles.shareStatValue}>
      {value}
    </AppText>
    <AppText style={styles.shareStatLabel}>{label}</AppText>
  </View>
);

const ShareCardContent = ({
  summary,
  mainHighlight,
  userName,
  weekNumber,
}: {
  summary: WeeklySummary;
  mainHighlight: HighlightData | null;
  userName: string;
  weekNumber: number;
}) => (
  <LinearGradient
    colors={[theme.colors.primaryDarker, theme.colors.primary]}
    style={styles.shareCard}
  >
    <View style={styles.shareHeader}>
      <View>
        <AppText style={styles.shareUserName}>{userName}</AppText>
        <AppText style={styles.shareWeekText}>
          Resumo da Semana {weekNumber}
        </AppText>
      </View>
      <Icon name="flash" size={32} color={theme.colors.gold} />
    </View>

    {mainHighlight && (
      <View style={styles.shareMainHighlight}>
        <AppText style={styles.shareMainHighlightLabel}>
          {mainHighlight.label}
        </AppText>
        <AppText variant="bold" style={styles.shareMainHighlightValue}>
          {mainHighlight.value}
        </AppText>
        <AppText style={styles.shareMainHighlightSubValue}>
          {mainHighlight.subValue}
        </AppText>
      </View>
    )}

    <View style={styles.shareStatsGrid}>
      <ShareStatItem
        icon="flash"
        value={summary.wordsTrained.toString()}
        label="Palavras Treinadas"
      />
      <ShareStatItem
        icon="school"
        value={summary.wordsMasteredThisWeek.toString()}
        label="Dominadas"
      />
      {summary.leaguePerformance && (
        <ShareStatItem
          icon="podium"
          value={`${summary.leaguePerformance.finalRank}º`}
          label={`Liga ${summary.leaguePerformance.leagueName}`}
        />
      )}
    </View>

    <View style={styles.shareFooter}>
      <AppText variant="bold" style={styles.shareAppName}>
        NewWords
      </AppText>
    </View>
  </LinearGradient>
);

const ShareableRecapSlide = ({
  data,
  userName,
  weekNumber,
}: {
  data: { summary: WeeklySummary; mainHighlight: HighlightData | null };
  userName: string;
  weekNumber: number;
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("A partilha não está disponível nesta plataforma.");
      return;
    }

    try {
      // O método capture() por defeito retorna um URI de ficheiro local
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Partilhe a sua conquista!",
        });
      }
    } catch (error) {
      console.error("Erro ao partilhar o resumo:", error);
    }
  };

  return (
    <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
      <AppText variant="bold" style={styles.title}>
        Mostre ao Mundo o Seu Progresso!
      </AppText>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: "jpg",
          quality: 0.9,
        }}
      >
        <ShareCardContent
          {...data}
          userName={userName}
          weekNumber={weekNumber}
        />
      </ViewShot>
      <TouchableOpacity
        style={styles.shareButton}
        activeOpacity={0.8}
        onPress={handleShare}
      >
        <Icon name="share" size={22} color={theme.colors.primary} />
        <AppText variant="bold" style={styles.shareButtonText}>
          Partilhar Conquista
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Slide 10: Conclusão ---
const FinalSlide = ({ onFinish }: { onFinish: () => void }) => (
  <Animated.View style={styles.slideContent} entering={FadeIn.duration(800)}>
    <Image source={images.mascotNeutral} style={styles.mascotImage} />
    <AppText variant="bold" style={styles.mascotText}>
      Continue o bom trabalho!
    </AppText>
    <AppText style={styles.mascotSubtext}>
      A consistência é o segredo para a maestria.
    </AppText>
    <TouchableOpacity
      style={styles.doneButton}
      activeOpacity={0.8}
      onPress={onFinish}
    >
      <AppText variant="bold" style={styles.doneButtonText}>
        Continuar
      </AppText>
    </TouchableOpacity>
  </Animated.View>
);

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

  const renderSlide = ({ item, index }: { item: SlideItem; index: number }) => {
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
  };

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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
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
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
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
  statsContainer: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statIcon: {
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  mainHighlightCard: {
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  mainHighlightText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.primaryDarker,
    textAlign: "center",
  },
  mainHighlightValue: {
    fontSize: 80,
    color: theme.colors.primary,
    marginVertical: 8,
    textAlign: "center",
  },
  mainHighlightSubValue: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.primaryDarker,
    textAlign: "center",
    marginTop: -8,
  },
  singleHighlightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "90%",
    marginVertical: 20,
    flexDirection: "row",
  },
  statValue: {
    fontSize: 36,
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  highlightContainer: {
    width: "100%",
    marginTop: 20,
  },
  highlightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  highlightLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  highlightValue: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginVertical: 2,
  },
  highlightDetail: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginVertical: 20,
  },
  mascotText: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
    marginTop: 16,
  },
  mascotSubtext: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  doneButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xl,
  },
  slideContent: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollableSlideContainer: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80, // Espaço para o cabeçalho e barra de progresso
    paddingBottom: 20,
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
  comparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  comparisonStatItem: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    width: "45%",
  },
  comparisonLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 36,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  comparisonBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: theme.colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  comparisonPercentage: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    marginLeft: 4,
  },
  comparisonNewText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  practiceDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  dayCirclePracticed: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  achievementsContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: "90%",
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.goldLighter,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  performanceStatsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,
  },
  chartContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  chartTextContainer: {
    position: "absolute",
    // Força o container a ocupar todo o espaço do pai (o círculo)
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },
  chartValue: {
    fontSize: 52,
    color: theme.colors.successDark,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
  chartLabel: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    top: -10,
  },
  performanceDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    backgroundColor: theme.colors.surface,
    padding: 16,
    // Garante que ambos os cartões têm a mesma altura para um layout consistente
    minHeight: 120,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  leagueCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
  },
  leagueResultTitle: {
    fontSize: theme.fontSizes["4xl"],
    marginTop: 16,
    marginBottom: 8,
  },
  leagueResultDescription: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  leagueRankContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  leagueRankLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  leagueRankValue: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.text,
    marginLeft: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    width: "95%",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.lg,
    marginLeft: 12,
  },
  shareCard: {
    width: screenWidth * 0.85,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  shareHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  shareUserName: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.surface,
    fontFamily: theme.fonts.bold,
  },
  shareWeekText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.primaryLighter,
  },
  shareMainHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  shareMainHighlightLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.primaryLighter,
  },
  shareMainHighlightValue: {
    fontSize: 48,
    color: theme.colors.surface,
  },
  shareMainHighlightSubValue: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.primaryLighter,
  },
  shareStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  shareStatItem: {
    alignItems: "center",
    flex: 1,
  },
  shareStatValue: {
    fontSize: theme.fontSizes["3xl"],
    color: theme.colors.surface,
    marginVertical: 4,
  },
  shareStatLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primaryLighter,
    textAlign: "center",
  },
  shareFooter: {
    marginTop: 20,
  },
  shareAppName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.surface,
    opacity: 0.7,
  },
});

export default WeeklyRecapScreen;
