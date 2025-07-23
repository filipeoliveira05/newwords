import React, { useEffect } from "react";
import { View, StyleSheet, TextInput, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
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

// --- Componente Auxiliar: StatCard ---
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

// --- Componente Principal do Slide ---
interface MetricsSlideProps {
  summary: WeeklySummary;
  isActive: boolean;
}

const MetricsSlide = ({ summary, isActive }: MetricsSlideProps) => (
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
  statValue: {
    fontSize: 36,
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});

export default MetricsSlide;
