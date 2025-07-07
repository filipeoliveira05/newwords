import React from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import {
  useLeagueStore,
  LeaderboardUser,
} from "../../../stores/useLeagueStore";
import { theme } from "../../../config/theme";
import AppText from "../../components/AppText";

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
      <AppText
        variant="bold"
        style={[styles.rank, item.isCurrentUser && styles.currentUserText]}
      >
        {item.rank}
      </AppText>
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

export default function LeagueScreen() {
  const { isLoading, currentLeague, leaderboard } = useLeagueStore();

  if (isLoading || !currentLeague) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <AppText style={styles.leagueIcon}>{currentLeague.icon}</AppText>
      <AppText variant="bold" style={styles.leagueTitle}>
        Liga {currentLeague.name}
      </AppText>
      <AppText style={styles.leagueSubtitle}>
        Os {currentLeague.promotionZone} melhores sobem. Os{" "}
        {currentLeague.demotionZone} piores descem.
      </AppText>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={leaderboard}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      ListHeaderComponent={renderHeader}
      renderItem={({ item, index }) => {
        const isPromotion = index < currentLeague.promotionZone;
        const isDemotion =
          currentLeague.demotionZone > 0 &&
          index >= currentLeague.groupSize - currentLeague.demotionZone;
        return (
          <LeaderboardItem
            item={item}
            isPromotion={isPromotion}
            isDemotion={isDemotion}
          />
        );
      }}
      contentContainerStyle={styles.listContent}
    />
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
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  leagueIcon: {
    fontSize: 48,
  },
  leagueTitle: {
    fontSize: theme.fontSizes["3xl"],
    marginTop: 8,
  },
  leagueSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 8,
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
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    width: 30,
  },
  name: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    marginLeft: 16,
  },
  xp: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.primary,
  },
  currentUserText: {
    color: theme.colors.primaryDarker,
  },
});
