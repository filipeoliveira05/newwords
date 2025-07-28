import React, { useMemo, useLayoutEffect } from "react";
import { View, StyleSheet, SectionList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useAchievements,
  ProcessedAchievement,
} from "../../../hooks/useAchievements";
import { ProfileStackParamList } from "../../../types/navigation";
import {
  AchievementCategory,
  AchievementRank,
} from "../../../config/achievements";
import AchievementBadge from "../../components/profile/AchievementBadge";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import LoadingScreen from "../LoadingScreen";

type Props = NativeStackScreenProps<ProfileStackParamList, "Achievements">;

// Component for the header of each section (category)
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <AppText variant="bold" style={styles.sectionTitle}>
      {title}
    </AppText>
  </View>
);

// Component for the main header of the list
const ListHeader = ({
  unlockedCount,
  totalCount,
}: {
  unlockedCount: number;
  totalCount: number;
}) => {
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.listHeaderContainer}>
      <AppText variant="bold" style={styles.headerTitle}>
        Mural de Conquistas
      </AppText>
      <AppText style={styles.headerSubtitle}>
        Explore todos os desafios e celebre o seu progresso.
      </AppText>
      <View style={styles.progressCard}>
        <View style={styles.progressInfo}>
          <AppText variant="bold" style={styles.progressText}>
            {unlockedCount} / {totalCount} Desbloqueadas
          </AppText>
          <AppText variant="bold" style={styles.progressPercentage}>
            {Math.round(progress)}%
          </AppText>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

export default function AchievementsScreen({ navigation }: Props) {
  const { achievements, unlockedCount, loading } = useAchievements();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Conquistas",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

  // Agrupa as conquistas por categoria
  const groupedAchievements = useMemo(() => {
    if (!achievements) return [];

    const grouped = achievements.reduce((acc, ach) => {
      const category = ach.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ach);
      return acc;
    }, {} as Record<AchievementCategory, ProcessedAchievement[]>);

    const rankOrder: AchievementRank[] = [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Master",
      "Legendary",
    ];

    // Define a ordem explícita dos tipos de conquista dentro de cada categoria.
    // Isto garante que, por exemplo, em "Maestria", todas as conquistas de "Domínio"
    // aparecem juntas antes das de "Treino", etc.
    const achievementTypeOrder = [
      // Primeiros Passos
      "first_session",
      // Colecionador
      "collector",
      // Maestria
      "mastery",
      "training",
      "power_session",
      "streak",
      "perfectionist",
      // Consistência
      "consistency",
      "weekend_warrior",
      "versatile_learner",
      "perfect_month",
      "triumphant_return",
      // Meta-Conquistas
      "achievement_hunter",
      "halfway_there",
      "living_legend",
    ];

    return Object.entries(grouped)
      .map(([title, data]) => ({
        title: title as AchievementCategory,
        data: data.sort((a, b) => {
          // 1. Ordena pelo tipo de conquista (ex: 'mastery' vs 'training')
          const typeA = a.id.split("_")[0];
          const typeB = b.id.split("_")[0];
          if (typeA !== typeB) {
            return (
              achievementTypeOrder.indexOf(typeA) -
              achievementTypeOrder.indexOf(typeB)
            );
          }

          // 2. Dentro do mesmo tipo, ordena por rank (Bronze, Silver, etc.)
          const rankA = a.rank ? rankOrder.indexOf(a.rank) : -1;
          const rankB = b.rank ? rankOrder.indexOf(b.rank) : -1;
          return rankA - rankB;
        }),
      }))
      .sort((a, b) => {
        const categoryOrder: AchievementCategory[] = [
          "Primeiros Passos",
          "Colecionador",
          "Maestria",
          "Consistência",
          "Meta-Conquistas",
        ];
        return categoryOrder.indexOf(a.title) - categoryOrder.indexOf(b.title);
      });
  }, [achievements]);

  if (loading) {
    return (
      <LoadingScreen visible={loading} loadingText="A carregar conquistas..." />
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedAchievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AchievementBadge
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
            category={item.category}
            rank={item.rank}
            unlocked={item.unlocked}
            isNew={item.isNew}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader title={title} />
        )}
        ListHeaderComponent={
          <ListHeader
            unlockedCount={unlockedCount}
            totalCount={achievements.length}
          />
        }
        contentContainerStyle={styles.listContentContainer}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContentContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  listHeaderContainer: { paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: theme.fontSizes["4xl"], color: theme.colors.text },
  headerSubtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { fontSize: theme.fontSizes.base, color: theme.colors.text },
  progressPercentage: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.primary,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  sectionHeader: {
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: { fontSize: theme.fontSizes.xxl, color: theme.colors.text },
});
