import React, { useMemo, useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useLeagueStore,
  LeaderboardUser,
} from "../../../stores/useLeagueStore";
import { theme } from "../../../config/theme";
import AppText from "../../components/AppText";
import { HomeStackParamList } from "../../../types/navigation";
import { addDays, intervalToDuration, isBefore } from "date-fns";
import Icon, { IconName } from "../../components/Icon";

// Define a union type for the items in our list
type ListItem =
  | { type: "user"; data: LeaderboardUser }
  | { type: "separator"; zone: "promotion" | "demotion" };

type Props = NativeStackScreenProps<HomeStackParamList, "LeagueDetails">;

const LeaderboardItem = ({
  item,
  isPromotion,
  isDemotion,
}: {
  item: LeaderboardUser;
  isPromotion: boolean;
  isDemotion: boolean;
}) => {
  const itemStyle = [
    styles.itemContainer,
    item.isCurrentUser && styles.currentUserItem,
    isPromotion && styles.promotionItem,
    isDemotion && styles.demotionItem,
  ];

  return (
    <View style={itemStyle}>
      {item.rank <= 3 ? (
        <AppText style={styles.rankIcon}>
          {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
        </AppText>
      ) : (
        <AppText
          variant="bold"
          style={[
            styles.rank,
            item.isCurrentUser && styles.currentUserText,
            isPromotion && { color: theme.colors.success },
            isDemotion && { color: theme.colors.danger },
          ]}
        >
          {item.rank}
        </AppText>
      )}
      {item.profilePictureUrl ? (
        <Image source={{ uri: item.profilePictureUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Icon name="person" size={20} color={theme.colors.textSecondary} />
        </View>
      )}
      <AppText
        variant={item.isCurrentUser ? "bold" : "regular"}
        style={[styles.name, item.isCurrentUser && styles.currentUserText]}
      >
        {item.name}
      </AppText>
      <AppText
        variant="bold"
        style={[styles.xp, item.isCurrentUser && styles.currentUserText]}
      >
        {item.xp} XP
      </AppText>
    </View>
  );
};

const ZoneSeparator = ({
  text,
  icon,
  color,
}: {
  text: string;
  icon: IconName;
  color: string;
}) => (
  <View style={styles.separatorContainer}>
    <Icon name={icon} size={16} color={color} />
    <AppText variant="bold" style={[styles.separatorText, { color }]}>
      {text}
    </AppText>
    <Icon name={icon} size={16} color={color} />
  </View>
);

// Helper function to avoid duplicating the countdown logic.
// It calculates the time remaining and returns a formatted string.
const calculateAndFormatCountdown = (startDate: Date): string => {
  const leagueEndDate = addDays(startDate, 7);
  const now = new Date();

  if (isBefore(now, leagueEndDate)) {
    const duration = intervalToDuration({ start: now, end: leagueEndDate });
    const days = duration.days ?? 0;
    const hours = duration.hours ?? 0;
    return `${days}d ${hours}h`;
  }

  return "A calcular resultados...";
};

export default function LeagueScreen({ navigation }: Props) {
  const {
    isLoading,
    currentLeague,
    leaderboard,
    leagues,
    currentLeagueIndex,
    leagueStartDate,
  } = useLeagueStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Liga Semanal",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Início",
      headerTintColor: theme.colors.text,
    });
  }, [navigation]);

  // Calcula o estado inicial do contador de forma "preguiçosa" (lazy initialization).
  // Isto evita o "piscar" da mensagem "A calcular..." ao entrar no ecrã.
  const [countdown, setCountdown] = useState(() => {
    if (!leagueStartDate) {
      return "Indisponível";
    }
    return calculateAndFormatCountdown(new Date(leagueStartDate));
  });

  useEffect(() => {
    if (!leagueStartDate) {
      return;
    }

    const startDate = new Date(leagueStartDate);

    const intervalId = setInterval(() => {
      // Recalcula o tempo restante a cada segundo.
      const newCountdown = calculateAndFormatCountdown(startDate);
      setCountdown(newCountdown);

      // Se o tempo acabou, limpa o intervalo para não continuar a correr desnecessariamente.
      if (newCountdown === "A calcular resultados...") {
        clearInterval(intervalId);
      }
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado para evitar memory leaks.
    return () => clearInterval(intervalId);
  }, [leagueStartDate]);

  // Use useMemo to create a new data source that includes the separators.
  // This prevents re-calculating on every render.
  // It's moved before the early return to follow the Rules of Hooks.
  const listData = useMemo((): ListItem[] => {
    if (!currentLeague) return [];

    const promotionZone = currentLeague.promotionZone;
    const demotionZone = currentLeague.demotionZone;
    const groupSize = currentLeague.groupSize;

    const items: ListItem[] = leaderboard.map((user) => ({
      type: "user",
      data: user,
    }));

    // Insert promotion separator after the last promoted user
    if (promotionZone > 0 && leaderboard.length > promotionZone) {
      items.splice(promotionZone, 0, { type: "separator", zone: "promotion" });
    }

    // Insert demotion separator before the first demoted user
    if (demotionZone > 0) {
      // The index in the original leaderboard
      const demotionStartIndexInLeaderboard = groupSize - demotionZone;
      // Account for the promotion separator that might have been added
      const insertionIndex =
        demotionStartIndexInLeaderboard +
        (leaderboard.length > promotionZone ? 1 : 0);

      if (items.length > insertionIndex) {
        items.splice(insertionIndex, 0, {
          type: "separator",
          zone: "demotion",
        });
      }
    }

    return items;
  }, [leaderboard, currentLeague]);

  if (isLoading || !currentLeague) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <>
      <View style={styles.leaguesScrollerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leaguesScrollerContent}
        >
          {leagues.map((league, index) => {
            const isLocked = index > currentLeagueIndex;
            const isActive = index === currentLeagueIndex;
            return (
              <View
                key={league.name}
                style={[
                  styles.leagueIconContainer,
                  isActive && styles.activeLeagueIconContainer,
                ]}
              >
                {isLocked ? (
                  <Icon name="lock" size={28} color={theme.colors.textMuted} />
                ) : (
                  <Icon name={league.icon} size={28} color={league.color} />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.headerContainer}>
        <Icon name={currentLeague.icon} size={54} color={currentLeague.color} />
        <AppText variant="bold" style={styles.leagueTitle}>
          Liga {currentLeague.name}
        </AppText>
        <View style={styles.countdownContainer}>
          <Icon name="time" size={16} color={theme.colors.textSecondary} />
          <AppText style={styles.countdownText}>
            Termina em: <AppText variant="bold">{countdown}</AppText>
          </AppText>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={listData}
        keyExtractor={(item, index) => {
          if (item.type === "separator") {
            return `separator-${item.zone}-${index}`;
          }
          return `${item.data.name}-${item.data.rank}`;
        }}
        renderItem={({ item }) => {
          if (item.type === "separator") {
            if (item.zone === "promotion") {
              return (
                <ZoneSeparator
                  text="ZONA DE PROMOÇÃO"
                  icon="caretUp"
                  color={theme.colors.success}
                />
              );
            }
            return (
              <ZoneSeparator
                text="ZONA DE DESPROMOÇÃO"
                icon="caretDown"
                color={theme.colors.danger}
              />
            );
          }

          const user = item.data;
          const isPromotion = user.rank <= currentLeague.promotionZone;
          const isDemotion =
            currentLeague.demotionZone > 0 &&
            user.rank > currentLeague.groupSize - currentLeague.demotionZone;

          return (
            <LeaderboardItem
              item={user}
              isPromotion={isPromotion}
              isDemotion={isDemotion}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingTop: 6, // Mantém para que não haja espaço extra no topo da lista
  },
  headerContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  leaguesScrollerContainer: {
    paddingVertical: 6,
  },
  leaguesScrollerContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 5, // Evitar que a borda da liga ativa seja cortada
  },
  leagueIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  activeLeagueIconContainer: {
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.1 }],
  },
  leagueTitle: {
    fontSize: theme.fontSizes["3xl"],
    marginTop: 4,
  },
  leagueSubtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  countdownText: {
    marginLeft: 8,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderColor: "transparent",
  },
  currentUserItem: {
    backgroundColor: theme.colors.primaryLighter,
    borderColor: theme.colors.primary,
  },
  promotionItem: {
    borderLeftColor: theme.colors.success,
  },
  demotionItem: {
    borderLeftColor: theme.colors.danger,
  },
  rank: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    width: 30,
    textAlign: "center",
  },
  rankIcon: {
    fontSize: theme.fontSizes["2xl"],
    width: 30,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  name: {
    flex: 1,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginLeft: 12,
  },
  xp: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  currentUserText: {
    color: theme.colors.primaryDarker,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 0, // A margem do item acima é 10, então 10 + 0 = 10
    marginBottom: 10, // A margem abaixo fica igual à de cima
  },
  separatorText: {
    fontSize: theme.fontSizes.lg,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginHorizontal: 10,
  },
});
