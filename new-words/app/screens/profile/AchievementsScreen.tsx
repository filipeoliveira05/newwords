import React, { useMemo, useLayoutEffect } from "react";
import { View, StyleSheet, SectionList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
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
import Icon, { IconName } from "../../components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "Achievements">;

// Componente para a barra de progresso circular
const CircularProgress = ({
  size,
  strokeWidth,
  progress,
  unlocked,
  total,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  unlocked: number;
  total: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Círculo de fundo */}
        <Circle
          stroke={theme.colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Círculo de progresso */}
        <Circle
          stroke={theme.colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Texto no centro */}
        <SvgText
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy=".3em" // Alinhamento vertical
          fill={theme.colors.textMedium}
          fontSize={size * 0.28} // Tamanho da fonte relativo ao círculo
          fontFamily={theme.fonts.bold}
        >
          {`${unlocked}/${total}`}
        </SvgText>
      </Svg>
    </View>
  );
};

// Component for the header of each section (category)
const SectionHeader = ({
  title,
  icon,
  unlocked,
  total,
}: {
  title: string;
  icon: IconName;
  unlocked: number;
  total: number;
}) => {
  const progress = total > 0 ? (unlocked / total) * 100 : 0;
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderTitleContainer}>
        <Icon
          name={icon}
          size={22}
          color={theme.colors.textMedium}
          style={styles.sectionIcon}
        />
        <AppText variant="bold" style={styles.sectionTitle}>
          {title}
        </AppText>
      </View>
      {/* Adiciona uma View para aplicar um pequeno ajuste vertical */}
      <View style={{ marginTop: 4 }}>
        <CircularProgress
          size={36}
          strokeWidth={4}
          progress={progress}
          unlocked={unlocked}
          total={total}
        />
      </View>
    </View>
  );
};

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

// Mapeia cada categoria de conquista ao seu ícone principal para consistência visual.
const categoryIcons: Record<AchievementCategory, IconName> = {
  "Primeiros Passos": "school",
  Coleção: "libraryOutline",
  Domínio: "school",
  Treino: "barbell",
  Intensidade: "flashOutline",
  Foco: "flame",
  Perfeição: "diamond",
  Hábito: "calendar",
  "Meta-Conquistas": "trophy",
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

    return Object.entries(grouped)
      .map(([title, data]) => {
        const unlockedInSection = data.filter((ach) => ach.unlocked).length;
        const totalInSection = data.length;

        return {
          title: title as AchievementCategory,
          unlocked: unlockedInSection,
          total: totalInSection,
          data: data.sort((a, b) => {
            const rankA = a.rank ? rankOrder.indexOf(a.rank) : -1;
            const rankB = b.rank ? rankOrder.indexOf(b.rank) : -1;
            return rankA - rankB;
          }),
        };
      })
      .sort((a, b) => {
        const categoryOrder: AchievementCategory[] = [
          "Primeiros Passos",
          "Coleção",
          "Domínio",
          "Treino",
          "Intensidade",
          "Foco",
          "Perfeição",
          "Hábito",
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
        renderSectionHeader={({ section: { title, unlocked, total } }) => (
          <SectionHeader
            title={title}
            icon={categoryIcons[title]}
            unlocked={unlocked}
            total={total}
          />
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
    marginBottom: 8,
    backgroundColor: theme.colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: theme.fontSizes.xxl, color: theme.colors.text },
  sectionIcon: {
    marginRight: 12,
  },
});
