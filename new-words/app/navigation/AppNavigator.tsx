import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
  BottomTabBar,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { theme } from "../../config/theme";
import { useLeagueStore } from "@/stores/useLeagueStore";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDeckStore } from "@/stores/deckStore";
import { useWordStore } from "@/stores/wordStore";
import { useUserStore } from "@/stores/useUserStore";
import { usePracticeStore } from "@/stores/usePracticeStore";
import * as hapticService from "../../services/hapticService";
import * as soundService from "../../services/soundService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import {
  DecksStackParamList,
  PracticeStackParamList,
  HomeStackParamList,
  ProfileStackParamList,
  RootTabParamList,
  CommunityStackParamList,
} from "../../types/navigation";

import HomeScreen from "../screens/home/HomeScreen";
import LeagueScreen from "../screens/home/LeagueScreen";
import WeeklyRecapScreen from "../screens/home/WeeklyRecapScreen";

import LibraryHubScreen from "../screens/decks/LibraryHubScreen";
import AllWordsScreen from "../screens/decks/AllWordsScreen";
import DecksScreen from "../screens/decks/DecksScreen";
import DeckDetailScreen from "../screens/decks/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/decks/AddOrEditDeckScreen";
import WordDetailsScreen from "../screens/decks/WordDetailsScreen";

import PracticeHubScreen from "../screens/practice/PracticeHubScreen";
import PracticeGameScreen from "../screens/practice/PracticeGameScreen";
import PracticeLoadingScreen from "../screens/practice/PracticeLoadingScreen";

import CommunityScreen from "../screens/community/CommunityScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";
import AccountScreen from "../screens/profile/AccountScreen";
import EditAccountScreen from "../screens/profile/EditAccountScreen";
import StatsScreen from "../screens/profile/StatsScreen";
import AchievementsScreen from "../screens/profile/AchievementsScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import HelpScreen from "../screens/profile/HelpScreen";
import LevelJourneyScreen from "../screens/profile/LevelJourneyScreen";
import LevelUpTestScreen from "../screens/dev/LevelUpTestScreen";
import SplashScreenTestScreen from "../screens/dev/SplashScreenTestScreen";
import IconTestScreen from "../screens/dev/IconTestScreen";

import AnimatedTabBarIcon from "../components/navigation/AnimatedTabBarIcon";
import Icon from "../components/Icon";

// --- Estilos e Componentes da Tab Bar ---

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  customButtonContainer: {
    top: -20, // Elevates the button. This value is used for padding below.
    justifyContent: "center",
    alignItems: "center",
  },
  customButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadowStyle,
    shadowColor: theme.colors.primary, // Sombra com a cor do botão
    shadowOpacity: 0.3,
  },
});

// --- Componente para o botão central da Tab Bar ---
const CustomTabBarButton = ({ children, onPress }: BottomTabBarButtonProps) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.customButton}>{children}</View>
  </TouchableOpacity>
);

// --- Componente para a Tab Bar animada ---

const TAB_BAR_HEIGHT = 60; // Altura padrão da tab bar

const AnimatedTabBar = (props: BottomTabBarProps) => {
  const { state, insets } = props;
  // Controla a propriedade 'overflow' para garantir que o botão é cortado quando escondido.
  const [overflow, setOverflow] = useState<ViewStyle["overflow"]>("visible");
  // Obtém o nome da rota focada dentro da stack atual
  const routeName = getFocusedRouteNameFromRoute(state.routes[state.index]);

  // Lista de ecrãs onde a tab bar deve ser escondida.
  const screensWithHiddenTabBar = [
    "LeagueDetails",
    "WeeklyRecap",
    "DecksList",
    "AllWords",
    "DeckDetail",
    "WordDetails",
    "AddOrEditDeck",
    "PracticeGame",
    "PracticeLoading",
    "Account",
    "EditAccount",
    "LevelJourney",
    "Stats",
    "Achievements",
    "Settings",
    "Help",
    "LevelUpTest",
    "SplashScreenTest",
    "IconTest",
  ];

  const isTabBarVisible = routeName
    ? !screensWithHiddenTabBar.includes(routeName)
    : true;

  const translateY = useSharedValue(0);

  // Anima a posição da tab bar com base na sua visibilidade
  useEffect(() => {
    // Para esconder completamente, precisamos de mover a tab bar para baixo
    // pela sua altura + a altura do safe area + a porção do botão que fica de fora.
    const hiddenTranslateY =
      TAB_BAR_HEIGHT +
      (insets.bottom || 0) +
      Math.abs(styles.customButtonContainer.top);
    translateY.value = withTiming(
      isTabBarVisible ? 0 : hiddenTranslateY,
      {
        duration: 350, // Aumenta ligeiramente a duração para uma animação mais suave
        easing: Easing.bezier(0.3, 0.01, 0, 1),
      },
      (finished) => {
        // Quando a animação de esconder termina, muda o overflow para 'hidden'.
        // Isto garante que o botão não fica visível se a animação não o esconder completamente.
        if (finished && !isTabBarVisible) {
          runOnJS(setOverflow)("hidden");
        }
      }
    );

    // Se a barra for ficar visível, o overflow tem de ser 'visible' desde o início
    // para que o botão apareça corretamente durante a animação de entrada.
    if (isTabBarVisible) {
      setOverflow("visible");
    }
  }, [isTabBarVisible, translateY, insets.bottom]);

  const animatedTransformStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.tabBarWrapper, { overflow }, animatedTransformStyle]}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

// --- Stacks de Navegação ---

const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <HomeStackNav.Screen
        name="HomeDashboard"
        component={HomeScreen}
        options={{ headerShown: true }}
      />
      <HomeStackNav.Screen name="LeagueDetails" component={LeagueScreen} />
      <HomeStackNav.Screen
        name="WeeklyRecap"
        component={WeeklyRecapScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </HomeStackNav.Navigator>
  );
}

const DecksStackNav = createNativeStackNavigator<DecksStackParamList>();

function DecksStack() {
  return (
    <DecksStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <DecksStackNav.Screen
        name="LibraryHub"
        component={LibraryHubScreen}
        options={{ headerShown: false }}
      />
      <DecksStackNav.Screen
        name="DecksList"
        component={DecksScreen}
        options={{ title: "Meus Conjuntos" }}
      />
      <DecksStackNav.Screen
        name="AllWords"
        component={AllWordsScreen}
        options={{ title: "Todo o Vocabulário" }}
      />
      <DecksStackNav.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ title: "Detalhes do Conjunto" }}
      />
      <DecksStackNav.Screen
        name="WordDetails"
        component={WordDetailsScreen}
        options={{ title: "Detalhes da Palavra" }}
      />
      <DecksStackNav.Screen
        name="AddOrEditDeck"
        component={AddOrEditDeckScreen}
        options={{ title: "Novo Conjunto" }}
      />
    </DecksStackNav.Navigator>
  );
}

const PracticeStackNav = createNativeStackNavigator<PracticeStackParamList>();

function PracticeStack() {
  return (
    <PracticeStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <PracticeStackNav.Screen
        name="PracticeHub"
        component={PracticeHubScreen}
        options={{ headerShown: false }} // pode se alterar
      />
      <PracticeStackNav.Screen
        name="PracticeLoading"
        component={PracticeLoadingScreen}
        options={{ headerShown: false }}
      />
      <PracticeStackNav.Screen
        name="PracticeGame"
        component={PracticeGameScreen}
        options={{ headerShown: false }} //pode se alterar
      />
    </PracticeStackNav.Navigator>
  );
}

const CommunityStackNav = createNativeStackNavigator<CommunityStackParamList>();

function CommunityStack() {
  return (
    <CommunityStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <CommunityStackNav.Screen
        name="CommunityHub"
        component={CommunityScreen}
        options={{ headerShown: false }}
      />
      <CommunityStackNav.Screen name="LeagueDetails" component={LeagueScreen} />
    </CommunityStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStackNav.Screen name="Stats" component={StatsScreen} />
      <ProfileStackNav.Screen
        name="Achievements"
        component={AchievementsScreen}
      />
      <ProfileStackNav.Screen
        name="LevelJourney"
        component={LevelJourneyScreen}
      />
      <ProfileStackNav.Screen name="Account" component={AccountScreen} />
      <ProfileStackNav.Screen
        name="EditAccount"
        component={EditAccountScreen}
      />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
      <ProfileStackNav.Screen name="Help" component={HelpScreen} />
      <ProfileStackNav.Screen
        name="LevelUpTest"
        component={LevelUpTestScreen}
      />
      <ProfileStackNav.Screen
        name="SplashScreenTest"
        component={SplashScreenTestScreen}
      />
      <ProfileStackNav.Screen name="IconTest" component={IconTestScreen} />
    </ProfileStackNav.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useUserStore();

  // Limpa os dados locais quando o utilizador faz logout.
  // Este efeito é acionado quando o AppNavigator é montado ou quando a sessão muda.
  // Se a sessão for nula (logout), todos os stores são reiniciados para garantir
  // que o próximo utilizador começa com um estado limpo.
  const session = useAuthStore((state) => state.session);
  useEffect(() => {
    if (session === null) {
      useDeckStore.setState({ decks: [], isInitialized: false });
      useWordStore.getState().clearWords();
      usePracticeStore.getState().endSession();
      // Os outros stores (user, league, achievements) serão reinicializados
      // automaticamente pelo RootNavigator quando um novo utilizador entrar.
    }
  }, [session]);

  useEffect(() => {
    // Initialize league data when the app loads
    useLeagueStore.getState().checkAndInitializeLeagues();
    // Initialize achievement store and listeners
    useAchievementStore.getState().initialize();
    soundService.loadSounds();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          tabBar={(props) => <AnimatedTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: TAB_BAR_HEIGHT,
              borderTopWidth: 0, // A sombra já cria uma separação visual
              ...shadowStyle,
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <AnimatedTabBarIcon
                  focused={focused}
                  name="home"
                  size={28}
                  color={color}
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                hapticService.impactAsync();
                e.preventDefault();
                navigation.navigate("Home", { screen: "HomeDashboard" });
              },
            })}
          />
          <Tab.Screen
            name="Decks"
            component={DecksStack}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <AnimatedTabBarIcon
                  focused={focused}
                  name="library"
                  size={28}
                  color={color}
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                hapticService.impactAsync();
                e.preventDefault();
                navigation.navigate("Decks", { screen: "LibraryHub" });
              },
            })}
          />
          <Tab.Screen
            name="Practice"
            component={PracticeStack}
            options={{
              tabBarIcon: () => {
                // O problema do corte do ícone é frequentemente causado pelas métricas internas da fonte do ícone (glyph).
                // O desenho do ícone pode não estar perfeitamente centrado na sua "caixa" de renderização.
                // Para resolver isto de forma definitiva, envolvemos o ícone numa View com um tamanho fixo,
                // exatamente igual ao do ícone. Esta View atua como um "normalizador" de layout.
                // O `justifyContent` e `alignItems` garantem que o ícone é perfeitamente centrado dentro desta caixa,
                // e a caixa, por sua vez, é centrada pelo botão circular pai, eliminando o corte.
                return (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon name="flash" size={32} color={theme.colors.surface} />
                  </View>
                );
              },
              tabBarButton: (props) => <CustomTabBarButton {...props} />,
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                hapticService.impactAsync();
                e.preventDefault();
                navigation.navigate("Practice", { screen: "PracticeHub" });
              },
            })}
          />
          <Tab.Screen
            name="Community"
            component={CommunityStack}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <AnimatedTabBarIcon
                  focused={focused}
                  name="community"
                  size={28}
                  color={color}
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: () => {
                hapticService.impactAsync();
              },
            })}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <AnimatedTabBarIcon
                  focused={focused}
                  name="profile"
                  size={28}
                  color={color}
                  profilePictureUrl={user?.profilePictureUrl}
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                hapticService.impactAsync();
                // Previne a ação padrão para podermos controlar a navegação.
                e.preventDefault();
                // Navega para o ecrã inicial do stack de Perfil.
                // Isto garante que, ao clicar no ícone do separador, o utilizador
                // volta sempre ao início, em vez de ficar "preso" num ecrã interior.
                navigation.navigate("Profile", { screen: "ProfileMain" });
              },
            })}
          />
        </Tab.Navigator>
      </View>
    </BottomSheetModalProvider>
  );
}
