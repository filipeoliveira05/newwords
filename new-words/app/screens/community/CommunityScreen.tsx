import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AppText from "../../components/AppText";
import { theme } from "../../../config/theme";
import images from "@/services/imageService";
import OfflinePlaceholder from "@/app/components/OfflinePlaceholder";
import Icon from "@/app/components/Icon";
import { CommunityStackParamList } from "@/types/navigation";
import CommunityDeckCard from "@/app/components/community/CommunityDeckCard";
import { useAlertStore } from "@/stores/useAlertStore";
import LoadingScreen from "../LoadingScreen";

import LeagueWidget from "@/app/components/home/LeagueWidget";

type Props = NativeStackScreenProps<CommunityStackParamList, "CommunityHub">;

const TabButton = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <AppText
      variant="bold"
      style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
    >
      {label}
    </AppText>
  </TouchableOpacity>
);

const dummyDecks = {
  trending: [
    {
      id: 1,
      title: "Vocabulário Essencial de Inglês",
      authorName: "Ana Pereira",
      wordCount: 150,
      upvotes: 1234,
      category: "Idiomas",
    },
    {
      id: 2,
      title: "Termos de Biologia Celular",
      authorName: "Carlos Silva",
      wordCount: 85,
      upvotes: 876,
      category: "Ciência",
    },
  ],
  new: [
    {
      id: 3,
      title: "História da Arte Renascentista",
      authorName: "Sofia Almeida",
      wordCount: 50,
      upvotes: 12,
      category: "Artes",
    },
    {
      id: 4,
      title: "Capitais do Mundo",
      authorName: "Rui Viana",
      wordCount: 195,
      upvotes: 5,
      category: "Geografia",
    },
  ],
  top: [
    {
      id: 5,
      title: "Conceitos de Programação",
      authorName: "Beatriz Costa",
      wordCount: 210,
      upvotes: 2500,
      category: "Tecnologia",
    },
  ],
};

const tabIndices = { trending: 0, new: 1, top: 2 };

const CommunityScreen = ({ navigation }: Props) => {
  const netInfo = useNetInfo();
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<"trending" | "new" | "top">(
    "trending"
  );

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedListStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const { showAlert } = useAlertStore.getState();
  // Simula uma nova tentativa de carregamento
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    // Aqui, no futuro, você chamaria a função para carregar os dados da comunidade.
    // Por agora, apenas simulamos um pequeno atraso.
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  }, []);

  const handleTabChange = (newTab: "trending" | "new" | "top") => {
    const newTabIndex = tabIndices[newTab];
    const currentTabIndex = tabIndices[activeTab];

    if (currentTabIndex === newTabIndex) return;

    const direction = newTabIndex > currentTabIndex ? 1 : -1;

    // Animação de saída
    opacity.value = withTiming(0, { duration: 150, easing: Easing.ease });
    translateX.value = withTiming(
      -40 * direction,
      { duration: 150, easing: Easing.ease },
      (finished) => {
        if (finished) {
          runOnJS(setActiveTab)(newTab);

          // Prepara para a animação de entrada
          translateX.value = 40 * direction;

          // Animação de entrada
          opacity.value = withTiming(1, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          });
          translateX.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          });
        }
      }
    );
  };

  const handleAddDeck = (event: GestureResponderEvent, deckTitle: string) => {
    // Impede que o evento de clique se propague para o card pai,
    // evitando que a navegação seja acionada ao mesmo tempo.
    event.stopPropagation();

    showAlert({
      title: "Adicionar Conjunto",
      message: `Tem a certeza que quer adicionar o conjunto "${deckTitle}" à sua biblioteca?`,
      buttons: [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Adicionar",
          style: "default",
          onPress: () => {}, // Lógica futura para adicionar o conjunto
        },
      ],
    });
  };
  // Estado de carregamento inicial ou durante uma nova tentativa
  if (netInfo.isConnected === null || isRetrying) {
    return (
      <LoadingScreen
        visible={true}
        loadingText="A ligar à comunidade..."
        mascotImage={images.mascotNeutral}
      />
    );
  }

  // Estado offline
  if (netInfo.isConnected === false) {
    return <OfflinePlaceholder onRetry={handleRetry} />;
  }

  // Estado online (conteúdo real da comunidade)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="bold" style={styles.title}>
          Comunidade
        </AppText>
        <AppText style={styles.subtitle}>
          Explore conjuntos, compita nas ligas e desafie os seus amigos.
        </AppText>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Secção da Liga */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Liga Semanal
          </AppText>
          <LeagueWidget />
        </View>

        {/* Secção de Conjuntos da Comunidade */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Explorar Conjuntos
          </AppText>
          <View style={styles.tabsContainer}>
            <TabButton
              label="Em Destaque"
              isActive={activeTab === "trending"}
              onPress={() => handleTabChange("trending")}
            />
            <TabButton
              label="Novos"
              isActive={activeTab === "new"}
              onPress={() => handleTabChange("new")}
            />
            <TabButton
              label="Top"
              isActive={activeTab === "top"}
              onPress={() => handleTabChange("top")}
            />
          </View>
          <Animated.View style={animatedListStyle} collapsable={false}>
            {dummyDecks[activeTab].map((deck) => (
              <CommunityDeckCard
                key={deck.id}
                title={deck.title}
                authorName={deck.authorName}
                wordCount={deck.wordCount}
                upvotes={deck.upvotes}
                category={deck.category}
                onPress={() => {}} // Futuramente, navegar para os detalhes do conjunto
                onAddPress={(e) => handleAddDeck(e, deck.title)}
              />
            ))}
          </Animated.View>
        </View>

        {/* Secção de Duelos (Teaser) */}
        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Desafie os seus Amigos
          </AppText>
          <View style={[styles.teaserCard]}>
            <Icon
              name="gameController"
              size={32}
              color={theme.colors.iconMuted}
            />
            <AppText variant="bold" style={styles.teaserTitle}>
              Duelos 1v1
            </AppText>
            <AppText style={styles.teaserSubtitle}>Em breve...</AppText>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  // loadingContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: theme.colors.background,
  // },
  // loadingText: {
  //   marginTop: 16,
  //   fontSize: theme.fontSizes.lg,
  //   color: theme.colors.textSecondary,
  // },
  widgetContainer: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    marginBottom: 16,
  },
  leagueCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  leagueCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  leagueCardSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  viewLeagueButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primaryLighter,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewLeagueButtonText: {
    color: theme.colors.primary,
    marginRight: 6,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
  },
  teaserCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    opacity: 0.6,
  },
  teaserTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textMedium,
    marginTop: 12,
  },
  teaserSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

export default CommunityScreen;
