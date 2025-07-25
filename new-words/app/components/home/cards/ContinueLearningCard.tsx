import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { Deck } from "../../../../types/database";
import { RootTabParamList } from "../../../../types/navigation";
import Icon from "../../Icon";

type Props = {
  deck: Deck;
};

const ContinueLearningCard = ({ deck }: Props) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Decks", {
      screen: "DeckDetail",
      params: {
        deckId: deck.id,
        title: deck.title,
        author: deck.author,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Icon name="book" size={24} color={theme.colors.primary} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Continue a Aprender
        </AppText>
        <AppText style={styles.subtitle}>
          Pratique o conjunto <AppText variant="bold">{deck.title}</AppText>
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

export default ContinueLearningCard;
