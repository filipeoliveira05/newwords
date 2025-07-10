import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { ChallengingWord } from "../../../../services/storage";
import { RootTabParamList } from "../../../../types/navigation";
import Icon from "../../Icon";

type Props = {
  words: ChallengingWord[];
};

const ChallengingWordsCard = ({ words }: Props) => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Practice", {
      // Navega para o separador de prática
      screen: "PracticeLoading", // Inicia o ecrã de carregamento
      params: {
        mode: "multiple-choice",
        sessionType: "free",
        words: words,
        origin: "Stats", // Re-using this origin for now
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Icon name="fitness" size={24} color={theme.colors.challenge} />
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Revisão Desafiadora
        </AppText>
        <AppText style={styles.subtitle}>
          Vamos rever as palavras que lhe estão a dar mais trabalho.
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

export default ChallengingWordsCard;
