import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLeagueStore } from "../../../stores/useLeagueStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../types/navigation";
import { theme } from "../../../config/theme";
import AppText from "../AppText";
import { Ionicons } from "@expo/vector-icons";

type LeagueNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "HomeDashboard"
>;

export default function LeagueWidget() {
  const { isLoading, currentLeague, userRank } = useLeagueStore();
  const navigation = useNavigation<LeagueNavigationProp>();

  if (isLoading || !currentLeague) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: currentLeague.color }]}
      onPress={() => navigation.navigate("LeagueDetails")}
    >
      <View style={styles.leftContent}>
        <Ionicons
          name={currentLeague.icon}
          size={32}
          color={theme.colors.surface}
          style={styles.leagueIcon}
        />
        <View>
          <AppText variant="bold" style={styles.title}>
            Liga {currentLeague.name}
          </AppText>
          <AppText style={styles.subtitle}>
            Posição atual: <AppText variant="bold">{userRank}º</AppText>
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.surface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  leagueIcon: {
    marginRight: 16,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.surface,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.surface,
    opacity: 0.9,
  },
});
