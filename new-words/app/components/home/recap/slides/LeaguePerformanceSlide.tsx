import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon, { IconName } from "../../../Icon";
import { WeeklySummary } from "../../../../../services/storage";

const { width: screenWidth } = Dimensions.get("window");

interface LeaguePerformanceSlideProps {
  summary: WeeklySummary;
}

const LeaguePerformanceSlide = ({ summary }: LeaguePerformanceSlideProps) => {
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
});

export default LeaguePerformanceSlide;
