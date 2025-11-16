import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DecksStackParamList } from "../../../types/navigation";
import AppText from "../../components/AppText";
import Icon, { IconName } from "../../components/Icon";
import { theme } from "../../../config/theme";
import * as hapticService from "../../../services/hapticService";

type Props = NativeStackScreenProps<DecksStackParamList, "LibraryHub">;

// A reusable component for the main action cards
const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.card, disabled && styles.cardDisabled]}
    onPress={() => {
      if (!disabled) {
        hapticService.impactAsync();
        onPress();
      }
    }}
    activeOpacity={disabled ? 1 : 0.8}
  >
    <Icon
      name={icon}
      size={32}
      color={disabled ? theme.colors.iconMuted : theme.colors.primary}
    />
    <View style={styles.cardTextContainer}>
      <AppText
        variant="bold"
        style={[styles.cardTitle, disabled && styles.cardTextDisabled]}
      >
        {title}
      </AppText>
      <AppText
        style={[styles.cardSubtitle, disabled && styles.cardTextDisabled]}
      >
        {subtitle}
      </AppText>
    </View>
    {!disabled && (
      <Icon name="forward" size={24} color={theme.colors.textMuted} />
    )}
  </TouchableOpacity>
);

const LibraryHubScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Biblioteca
        </AppText>
        <AppText style={styles.subtitle}>
          Gira os seus conjuntos, explore o seu vocabulário e use as ferramentas
          de IA.
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ActionCard
          icon="decksOutline"
          title="Meus Conjuntos"
          subtitle="Ver e gerir os seus conjuntos de palavras."
          onPress={() => navigation.navigate("DecksList")}
        />
        <ActionCard
          icon="libraryOutline"
          title="Todo o Vocabulário"
          subtitle="Lista completa das palavras que já adicionou."
          onPress={() => navigation.navigate("AllWords")}
        />

        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Ferramentas com IA
          </AppText>
          <ActionCard
            icon="bonfire"
            title="Criar com IA"
            subtitle="Gere palavras e exemplos automaticamente."
            onPress={() => {}} // Placeholder
            disabled={true}
          />
          <ActionCard
            icon="scan"
            title="Scanner Inteligente"
            subtitle="Extraia palavras de textos com a câmara."
            onPress={() => {}} // Placeholder
            disabled={true}
          />
          {/* Mensagem genérica de "em breve" para as funcionalidades de IA */}
          <View style={styles.aiTeaserMessageContainer}>
            <Icon
              name="sparkles"
              size={20}
              color={theme.colors.textSecondary}
            />
            <AppText style={styles.aiTeaserMessageText}>
              Funcionalidades inteligentes para acelerar a sua aprendizagem
              estão a chegar.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSizes["4xl"],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cardDisabled: {
    backgroundColor: theme.colors.background,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cardTextDisabled: {
    color: theme.colors.textMuted,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  aiTeaserMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "transparent",
    marginTop: -16,
  },
  aiTeaserMessageText: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
  },
});

export default LibraryHubScreen;
