import React, { useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../../types/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Account">;

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: React.ReactNode;
}) => (
  <View style={styles.infoRow}>
    <Ionicons
      name={icon}
      size={22}
      color={theme.colors.textSecondary}
      style={styles.infoIcon}
    />
    <AppText style={styles.infoLabel}>{label}</AppText>
    <AppText variant="medium" style={styles.infoValue}>
      {value}
    </AppText>
  </View>
);

const AccountScreen = ({ navigation }: Props) => {
  const { level, xp, xpForNextLevel, consecutiveDays, totalWords, user } =
    useUserStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "A Minha Conta",
      headerStyle: { backgroundColor: theme.colors.background },
      headerTitleStyle: { fontFamily: theme.fonts.bold },
      headerShadowVisible: false,
      headerBackTitle: "Perfil",
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("EditAccount")}>
          <Ionicons name="pencil" size={22} color={theme.colors.textMedium} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        {user?.profilePictureUrl ? (
          <Image
            source={{ uri: user.profilePictureUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={50}
              color={theme.colors.primary}
            />
          </View>
        )}
        <View style={styles.usernameContainer}>
          <AppText variant="bold" style={styles.username}>
            {user?.firstName} {user?.lastName}
          </AppText>
        </View>
        <AppText style={styles.userLevel}>Nível {level}</AppText>
      </View>
      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Progresso
        </AppText>
        <View style={styles.infoCard}>
          <InfoRow icon="bar-chart-outline" label="Nível" value={level} />
          <InfoRow
            icon="star-outline"
            label="Experiência"
            value={`${xp} / ${xpForNextLevel}`}
          />
          <InfoRow
            icon="flame-outline"
            label="Dias Seguidos"
            value={consecutiveDays}
          />
          <InfoRow
            icon="library-outline"
            label="Palavras Totais"
            value={totalWords}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.primaryLighter,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: theme.fontSizes["2xl"],
    color: theme.colors.text,
  },
  userLevel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden", // to clip children with the border radius
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});

export default AccountScreen;
