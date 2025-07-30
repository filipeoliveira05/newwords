import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import { ProcessedAchievement } from "../../../hooks/useAchievements";
import AppText from "../AppText";
import Icon, { IconName } from "../Icon";
import { theme } from "../../../config/theme";
import AchievementRadarChart, {
  RadarDataPoint,
} from "../profile/AchievementRadarChart";

// Define um tipo específico para os IDs das categorias do radar.
// Isto garante que apenas chaves válidas são usadas para aceder às cores no tema,
// resolvendo o erro de tipagem.
type AchievementRadarCategoryId =
  | "collector"
  | "mastery"
  | "training"
  | "power_session"
  | "streak"
  | "perfectionist"
  | "consistency";

// Mapeia os IDs de prefixo para um nome e ícone, servindo como a "lenda" do gráfico.
const categoryConfig: {
  id: AchievementRadarCategoryId;
  label: string;
  icon: IconName;
}[] = [
  { id: "collector", label: "Coleção", icon: "libraryOutline" },
  { id: "mastery", label: "Domínio", icon: "school" },
  { id: "training", label: "Treino", icon: "barbell" },
  { id: "power_session", label: "Intensidade", icon: "flashOutline" },
  { id: "streak", label: "Foco", icon: "flame" },
  { id: "perfectionist", label: "Perfeição", icon: "diamond" },
  { id: "consistency", label: "Hábito", icon: "calendar" },
];

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Stats">;
  achievements: ProcessedAchievement[];
  unlockedCount: number;
};

const AchievementsSummaryCard = ({
  navigation,
  achievements,
  unlockedCount,
}: Props) => {
  const totalCount = achievements.length;

  // Calcula o progresso para cada uma das 7 categorias principais.
  const radarData = useMemo((): RadarDataPoint[] => {
    return categoryConfig.map((cat) => {
      const achievementsInCategory = achievements.filter((ach) =>
        ach.id.startsWith(cat.id)
      );
      const unlockedInCategory = achievementsInCategory.filter(
        (ach) => ach.unlocked
      ).length;
      const totalInCategory = achievementsInCategory.length;

      const progress =
        totalInCategory > 0 ? unlockedInCategory / totalInCategory : 0;

      return {
        ...cat,
        progress,
        color:
          theme.colors.achievementTypeColors[cat.id] || theme.colors.primary,
      };
    });
  }, [achievements]);

  const navigateToAchievements = () => {
    navigation.navigate("Achievements");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={navigateToAchievements}
    >
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Conquistas
        </AppText>
        <View style={styles.progressContainer}>
          <AppText variant="bold" style={styles.progressText}>
            {unlockedCount} / {totalCount}
          </AppText>
          <Icon name="forward" size={18} color={theme.colors.textSecondary} />
        </View>
      </View>
      <View style={styles.body}>
        <AchievementRadarChart data={radarData} size={320} />
        <View style={styles.legendContainer}>
          {radarData.map((item) => (
            <View key={item.id} style={styles.legendItem}>
              <Icon name={item.icon} size={16} color={item.color} />
              <AppText style={styles.legendLabel}>{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: theme.fontSizes.xxl, color: theme.colors.text },
  progressContainer: { flexDirection: "row", alignItems: "center" },
  progressText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  body: {
    alignItems: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legendLabel: {
    marginLeft: 6,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default AchievementsSummaryCard;
