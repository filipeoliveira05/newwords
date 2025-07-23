import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon, { IconName } from "../../../Icon";
import { WeeklySummary } from "../../../../../services/storage";

const { width: screenWidth } = Dimensions.get("window");

// --- Componente Auxiliar: ComparisonStat ---
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

// --- Componente Principal do Slide ---
interface ComparisonSlideProps {
  summary: WeeklySummary;
}

const ComparisonSlide = ({ summary }: ComparisonSlideProps) => {
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
});

export default ComparisonSlide;
