import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { ChallengingWord } from "../../../../services/storage";
import { RootTabParamList } from "../../../../types/navigation";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  words: ChallengingWord[];
};

const ChallengingWordsCard = ({ words }: Props) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Practice", {
      screen: "PracticeGame",
      params: {
        mode: "flashcard",
        sessionType: "free",
        words: words,
        origin: "Stats", // Re-using this origin for now
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Ionicons
        name="fitness-outline"
        size={24}
        color={theme.colors.challenge}
      />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Revisão Desafiadora
        </AppText>
        <AppText style={styles.subtitle}>
          Vamos rever as palavras que lhe estão a dar mais trabalho.
        </AppText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={theme.colors.textMuted}
      />
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

export default ChallengingWordsCard;
