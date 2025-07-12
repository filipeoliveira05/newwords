import React, { useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import * as Updates from "expo-updates";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { useAlertStore } from "../../../stores/useAlertStore";
import { setMetaValue } from "../../../services/storage";
import Icon, { IconName } from "../../components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileMain">;

const ProfileScreen = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // O título será gerido pelo Stack Navigator
    });
  }, [navigation]);

  const { showAlert } = useAlertStore.getState();

  const handleLogout = () => {
    showAlert({
      title: "Terminar Sessão",
      message:
        "Isto irá levá-lo para o ecrã inicial. O seu progresso e palavras não serão apagados. Quer continuar?",
      buttons: [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Terminar Sessão",
          style: "destructive",
          onPress: async () => {
            await setMetaValue("has_completed_onboarding", "false");
            await Updates.reloadAsync();
          },
        },
      ],
    });
  };

  const menuItems = [
    {
      title: "Conta",
      icon: "personCircle" as IconName,
      screen: "Account",
      color: theme.colors.primary,
    },
    {
      title: "Estatísticas",
      icon: "stats" as IconName,
      screen: "Stats",
      color: theme.colors.textMedium,
    },
    {
      title: "Definições",
      icon: "settings" as IconName,
      screen: "Settings",
      color: theme.colors.textMedium,
    },
    {
      title: "Ajuda & Suporte",
      icon: "helpBuoy" as IconName,
      screen: "Help",
      color: theme.colors.textMedium,
    },
  ];

  const authItems = [
    {
      title: "Terminar Sessão",
      icon: "logout" as IconName,
      screen: "Settings", // Placeholder
      color: theme.colors.danger,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Perfil e Definições
        </AppText>
      </View>
      <View style={styles.section}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as any)}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.color}
              style={styles.icon}
            />
            <AppText style={[styles.menuText, { color: item.color }]}>
              {item.title}
            </AppText>
            <Icon name="forward" size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        {authItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.color}
              style={styles.icon}
            />
            <AppText style={[styles.menuText, { color: item.color }]}>
              {item.title}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  title: { fontSize: theme.fontSizes["4xl"], color: theme.colors.text },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  icon: { marginRight: 20 },
  menuText: { flex: 1, fontSize: theme.fontSizes.lg },
});

export default ProfileScreen;
