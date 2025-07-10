import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import * as Updates from "expo-updates";
import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { deleteDatabase } from "../../../services/storage";
import { useAlertStore } from "../../../stores/useAlertStore";
import Icon from "../../components/Icon";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

const SettingsScreen = ({ navigation }: Props) => {
  const { showAlert } = useAlertStore.getState();
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    setAppVersion(Application.nativeApplicationVersion);
  }, []);

  const handleResetData = () => {
    showAlert({
      title: "Apagar Dados",
      message:
        "Tem a certeza que quer apagar todos os dados da aplicação? Esta ação é irreversível.",
      buttons: [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Apagar Tudo",
          style: "destructive",
          onPress: async () => {
            await deleteDatabase();
            await Updates.reloadAsync(); // Recarrega a aplicação
          },
        },
      ],
    });
  };

  const handleLinkPress = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showAlert({
          title: "Erro",
          message: `Não foi possível abrir o URL: ${url}`,
          buttons: [{ text: "OK", onPress: () => {} }],
        });
      }
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Definições",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: {
        fontFamily: theme.fonts.bold,
        fontSize: theme.fontSizes["2xl"],
      },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Geral
        </AppText>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <AppText style={styles.settingLabel}>Notificações</AppText>
            {/* Futuramente, um switch para ligar/desligar */}
          </View>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <AppText style={styles.settingLabel}>Sons do Jogo</AppText>
            {/* Futuramente, um switch para ligar/desligar */}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Sobre
        </AppText>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <AppText style={styles.settingLabel}>Versão da Aplicação</AppText>
            <AppText style={styles.settingValue}>{appVersion || "..."}</AppText>
          </View>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() =>
              handleLinkPress("https://www.exemplo.com/privacidade")
            }
          >
            <AppText style={styles.settingLabel}>
              Política de Privacidade
            </AppText>
            <Icon name="open" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={() => handleLinkPress("https://www.exemplo.com/termos")}
          >
            <AppText style={styles.settingLabel}>Termos de Serviço</AppText>
            <Icon name="open" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botão de desenvolvimento para apagar os dados */}
      {__DEV__ && (
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Desenvolvimento
          </AppText>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <AppText variant="bold" style={styles.resetButtonText}>
              Apagar Todos os Dados
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  resetButton: {
    backgroundColor: theme.colors.dangerLight,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  resetButtonText: {
    color: theme.colors.dangerDark,
    fontSize: theme.fontSizes.base,
  },
});

export default SettingsScreen;
