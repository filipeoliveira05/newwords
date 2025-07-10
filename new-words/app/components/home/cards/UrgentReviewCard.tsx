import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { RootTabParamList } from "../../../../types/navigation";
import Icon from "../../Icon";

type Props = {
  count: number;
};

const UrgentReviewCard = ({ count }: Props) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Practice", {
      screen: "PracticeLoading",
      params: {
        mode: "flashcard",
        sessionType: "urgent",
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Icon name="alarm" size={24} color={theme.colors.primary} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Revisão Urgente
        </AppText>
        <AppText style={styles.subtitle}>
          {count} {count === 1 ? "palavra precisa" : "palavras precisam"} da sua
          atenção.
        </AppText>
      </View>
      <View style={styles.badge}>
        <AppText variant="bold" style={styles.badgeText}>
          {count}
        </AppText>
      </View>
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
  textContainer: { flex: 1, marginHorizontal: 16 },
  title: { fontSize: theme.fontSizes.xl, color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: theme.colors.surface, fontSize: theme.fontSizes.base },
});

export default UrgentReviewCard;
