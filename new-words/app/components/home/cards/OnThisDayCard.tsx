import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDistanceToNow, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { Word } from "../../../../types/database";
import {
  RootTabParamList,
  HomeStackParamList,
} from "../../../../types/navigation";
import Icon from "../../Icon";

// We need a composite navigation prop type because we are navigating from a screen
// in the Home stack to a screen in the Decks stack.
type OnThisDayNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

type Props = {
  word: Word;
};

const OnThisDayCard = ({ word }: Props) => {
  const navigation = useNavigation<OnThisDayNavigationProp>();

  const handlePress = () => {
    // Navigate to the Decks tab, then to the WordDetails screen within that tab's stack.
    navigation.navigate("Decks", {
      screen: "WordDetails",
      params: { wordId: word.id },
    });
  };

  const timeAgo = formatDistanceToNow(parseISO(word.createdAt), {
    addSuffix: true,
    locale: pt,
  });

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Icon name="calendar" size={24} color={theme.colors.primary} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Neste dia, {timeAgo}...
        </AppText>
        <AppText style={styles.subtitle}>
          Você aprendeu a palavra <AppText variant="bold">{word.name}</AppText>.
          Lembra-se dela?
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
    marginTop: 16, // Add margin to separate from other cards
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
    lineHeight: 18,
  },
});

export default OnThisDayCard;
