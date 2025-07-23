import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon from "../../../Icon";
import { WeeklySummary } from "../../../../../services/storage";
import images from "../../../../../services/imageService";

const { width: screenWidth } = Dimensions.get("window");

interface DeepDiveSlideProps {
  summary: WeeklySummary;
}

const DeepDiveSlide = ({ summary }: DeepDiveSlideProps) => {
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
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginVertical: 20,
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
});

export default DeepDiveSlide;
