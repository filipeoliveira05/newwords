import React, { useLayoutEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types/navigation";
import AppText from "../components/AppText";
import { theme } from "../../config/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

const SettingsScreen = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Definições",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: { fontFamily: theme.fonts.bold },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppText>Ecrã de Definições</AppText>
      <AppText style={styles.subtitle}>
        Aqui poderá alterar o tema, notificações, etc.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default SettingsScreen;
