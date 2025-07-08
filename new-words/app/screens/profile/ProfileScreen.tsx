import React, { useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileMain">;

const ProfileScreen = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // O título será gerido pelo Stack Navigator
    });
  }, [navigation]);

  const menuItems = [
    {
      title: "Conta",
      icon: "person-circle-outline",
      screen: "Account",
      color: theme.colors.primary,
    },
    {
      title: "Definições",
      icon: "cog-outline",
      screen: "Settings",
      color: theme.colors.textMedium,
    },
    {
      title: "Ajuda & Suporte",
      icon: "help-buoy-outline",
      screen: "Help",
      color: theme.colors.textMedium,
    },
  ];

  const authItems = [
    {
      title: "Terminar Sessão",
      icon: "log-out-outline",
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
            <Ionicons
              name={item.icon as any}
              size={24}
              color={item.color}
              style={styles.icon}
            />
            <AppText style={[styles.menuText, { color: item.color }]}>
              {item.title}
            </AppText>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        {authItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={() => {
              /* Futuramente, aqui irá a lógica de logout */
            }}
          >
            <Ionicons
              name={item.icon as any}
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
  title: { fontSize: theme.fontSizes["3xl"], color: theme.colors.text },
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
  menuText: { flex: 1, fontSize: theme.fontSizes.base },
});

export default ProfileScreen;
