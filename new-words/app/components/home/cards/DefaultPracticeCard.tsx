import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import AppText from "../../AppText";
import { theme } from "../../../../config/theme";
import { RootTabParamList } from "../../../../types/navigation";
import { Ionicons } from "@expo/vector-icons";

const DefaultPracticeCard = () => {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const handlePress = () => {
    navigation.navigate("Practice", { screen: "PracticeHub" });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Ionicons name="flash" size={24} color={theme.colors.surface} />
      <AppText variant="bold" style={styles.title}>
        Começar a Praticar
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
    marginLeft: 12,
  },
});

export default DefaultPracticeCard;
