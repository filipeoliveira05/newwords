import React, { useEffect } from "react";
import { View, StyleSheet, TextInput, Dimensions } from "react-native";
import { Svg, Circle } from "react-native-svg";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon, { IconName } from "../../../Icon";
import { WeeklySummary } from "../../../../../services/storage";

const { width: screenWidth } = Dimensions.get("window");
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Componentes Auxiliares ---

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

// --- Componente Principal do Slide ---
interface PerformanceSlideProps {
  summary: WeeklySummary;
  isActive: boolean;
}

const PerformanceSlide = ({ summary, isActive }: PerformanceSlideProps) => {
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
            icon="shieldCheckmark"
            value={summary.wordsMasteredThisWeek}
            label="Palavras Dominadas"
            color={theme.colors.successMedium}
            isActive={isActive}
          />
          <PerformanceStatCard
            icon="flameFilled"
            value={summary.longestStreakThisWeek}
            label="Maior Sequência"
            color={theme.colors.challenge}
            isActive={isActive}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slideContent: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: -10,
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
    minHeight: 120,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
});

export default PerformanceSlide;
