import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import Animated, { FadeIn } from "react-native-reanimated";

import AppText from "../../../AppText";
import { theme } from "../../../../../config/theme";
import Icon, { IconName } from "../../../Icon";
import { WeeklySummary } from "../../../../../services/storage";
import { HighlightData } from "./MainHighlightSlide";

const { width: screenWidth } = Dimensions.get("window");

// --- Componentes Auxiliares ---

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
        {mainHighlight.subValue && (
          <AppText style={styles.shareMainHighlightSubValue}>
            {mainHighlight.subValue}
          </AppText>
        )}
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

// --- Componente Principal do Slide ---
interface ShareableRecapSlideProps {
  data: { summary: WeeklySummary; mainHighlight: HighlightData | null };
  userName: string;
  weekNumber: number;
}

const ShareableRecapSlide = ({
  data,
  userName,
  weekNumber,
}: ShareableRecapSlideProps) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("A partilha não está disponível nesta plataforma.");
      return;
    }

    try {
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

export default ShareableRecapSlide;
