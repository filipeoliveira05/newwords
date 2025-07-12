import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { WeeklySummaryStats } from "../../../../services/storage";
import { RootTabParamList } from "../../../../types/navigation";
import Icon from "../../Icon";

type Props = {
  summary: WeeklySummaryStats;
};

const WeeklySummaryCard = ({ summary }: Props) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Profile", { screen: "Stats" });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Icon name="podium" size={24} color={theme.colors.favorite} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Resumo da Semana
        </AppText>
        <AppText style={styles.subtitle}>
          Bom trabalho! Treinou {summary.wordsTrained} palavras.
        </AppText>
      </View>
      <Icon name="forward" size={22} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default WeeklySummaryCard;
