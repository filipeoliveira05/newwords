import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import * as Updates from "expo-updates";
import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import { deleteDatabase } from "../../../services/storage";
import { useAlertStore } from "../../../stores/useAlertStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import Icon from "../../components/Icon";
import * as hapticService from "../../../services/hapticService";
import * as soundService from "../../../services/soundService";
import { useAuthStore } from "../../../stores/useAuthStore";
import { getLastSyncTimestamp } from "../../../services/syncState";
import { formatDistanceToNow, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

const SettingsScreen = ({ navigation }: Props) => {
  const { showAlert } = useAlertStore.getState();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { manualSync, isManuallySyncing } = useAuthStore();
  const {
    hapticsEnabled,
    setHapticsEnabled,
    gameSoundsEnabled,
    setGameSoundsEnabled,
    fetchSettings,
  } = useSettingsStore();

  useEffect(() => {
    setAppVersion(Application.nativeApplicationVersion);
    fetchSettings();
  }, [fetchSettings]);

  useFocusEffect(
    useCallback(() => {
      const fetchLastSync = async () => {
        const timestamp = await getLastSyncTimestamp();
        setLastSync(timestamp);
      };
      fetchLastSync();
    }, [])
  );

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) return "Nunca sincronizado";
    try {
      const date = parseISO(timestamp);
      return `há ${formatDistanceToNow(date, { locale: pt })}`;
    } catch (error) {
      console.log("Erro a formatar a data lastSync: ", error);
      return "Data inválida";
    }
  };

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
          </View>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <AppText style={styles.settingLabel}>Sons do Jogo</AppText>
            <Switch
              trackColor={{
                false: theme.colors.disabled,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
              onValueChange={(value) => {
                hapticService.impactAsync();
                soundService.playSound(soundService.SoundType.Flip);
                setGameSoundsEnabled(value);
              }}
              value={gameSoundsEnabled}
            />
          </View>
          <View style={[styles.settingItem]}>
            <AppText style={styles.settingLabel}>Vibrações</AppText>
            <Switch
              trackColor={{
                false: theme.colors.disabled,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
              onValueChange={(value) => {
                hapticService.impactAsync();
                soundService.playSound(soundService.SoundType.Flip);
                setHapticsEnabled(value);
              }}
              value={hapticsEnabled}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Dados e Sincronização
        </AppText>
        <TouchableOpacity
          style={styles.syncButton}
          activeOpacity={0.8}
          onPress={async () => {
            await manualSync();
            // Refresh the last sync timestamp after sync completes
            const timestamp = await getLastSyncTimestamp();
            setLastSync(timestamp);
          }}
          disabled={isManuallySyncing}
        >
          {isManuallySyncing ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Icon
                name="cloud"
                size={22}
                color={theme.colors.primary}
                style={styles.syncIcon}
              />
              <AppText variant="medium" style={styles.syncButtonText}>
                Sincronizar Agora
              </AppText>
            </>
          )}
        </TouchableOpacity>
        <AppText style={styles.lastSyncText}>
          Última sincronização: {formatLastSync(lastSync)}
        </AppText>
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
            activeOpacity={0.8}
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
            activeOpacity={0.8}
            onPress={() => handleLinkPress("https://www.exemplo.com/termos")}
          >
            <AppText style={styles.settingLabel}>Termos de Serviço</AppText>
            <Icon name="open" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botão para apagar os dados */}
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Desenvolvimento
        </AppText>
        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.8}
          onPress={handleResetData}
        >
          <AppText variant="bold" style={styles.resetButtonText}>
            Apagar Todos os Dados
          </AppText>
        </TouchableOpacity>
      </View>
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
  syncButton: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  syncIcon: {
    marginRight: 12,
  },
  syncButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.base,
  },
  lastSyncText: {
    textAlign: "center",
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
});

export default SettingsScreen;
