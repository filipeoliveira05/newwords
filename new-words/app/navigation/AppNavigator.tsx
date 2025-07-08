import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { theme } from "../../config/theme";
import { useLeagueStore } from "@/stores/useLeagueStore";

import {
  DecksStackParamList,
  PracticeStackParamList,
  HomeStackParamList,
  ProfileStackParamList,
  RootTabParamList,
} from "../../types/navigation";

import HomeScreen from "../screens/home/HomeScreen";
import LeagueScreen from "../screens/home/LeagueScreen";

import DecksScreen from "../screens/decks/DecksScreen";
import DeckDetailScreen from "../screens/decks/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/decks/AddOrEditDeckScreen";
import WordDetailsScreen from "../screens/decks/WordDetailsScreen";

import PracticeHubScreen from "../screens/practice/PracticeHubScreen";
import PracticeGameScreen from "../screens/practice/PracticeGameScreen";

import StatsScreen from "../screens/stats/StatsScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";
import AccountScreen from "../screens/profile/AccountScreen";
import EditAccountScreen from "../screens/profile/EditAccountScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import HelpScreen from "../screens/profile/HelpScreen";

import CustomAlert from "../components/CustomAlert";
import LevelUpOverlay from "../components/LevelUpOverlay";

// Import fonts using ES6 modules for consistency and to satisfy the linter
import SatoshiRegular from "../../assets/fonts/Satoshi-Regular.otf";
import SatoshiMedium from "../../assets/fonts/Satoshi-Medium.otf";
import SatoshiBold from "../../assets/fonts/Satoshi-Bold.otf";

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
        options={{ headerShown: false }}
      />
      <HomeStackNav.Screen
        name="LeagueDetails"
        component={LeagueScreen}
        options={{ title: "Liga Semanal" }}
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
        name="DecksList"
        component={DecksScreen}
        options={{ headerShown: false }}
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
    <PracticeStackNav.Navigator>
      <PracticeStackNav.Screen
        name="PracticeHub"
        component={PracticeHubScreen}
        options={{ headerShown: false }} // pode se alterar
      />
      <PracticeStackNav.Screen
        name="PracticeGame"
        component={PracticeGameScreen}
        options={{ headerShown: false }} //pode se alterar
      />
    </PracticeStackNav.Navigator>
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
      <ProfileStackNav.Screen name="Account" component={AccountScreen} />
      <ProfileStackNav.Screen
        name="EditAccount"
        component={EditAccountScreen}
      />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
      <ProfileStackNav.Screen name="Help" component={HelpScreen} />
    </ProfileStackNav.Navigator>
  );
}

const iconMapping = {
  Home: ["home", "home-outline"],
  Decks: ["file-tray-stacked", "file-tray-stacked-outline"],
  Practice: ["flash", "flash-outline"],
  Stats: ["stats-chart", "stats-chart-outline"],
  Profile: ["person-circle", "person-circle-outline"],
};

export default function AppNavigator() {
  const [fontsLoaded] = useFonts({
    "Satoshi-Regular": SatoshiRegular,
    "Satoshi-Medium": SatoshiMedium,
    "Satoshi-Bold": SatoshiBold,
  });

  useEffect(() => {
    // Initialize league data when the app loads
    useLeagueStore.getState().checkAndInitializeLeagues();
  }, []);

  if (!fontsLoaded) {
    // Pode mostrar um ecrã de loading mais elaborado, mas por agora isto é suficiente.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const [iconFocused, iconInactive] = iconMapping[route.name];
            const iconName = focused ? iconFocused : iconInactive;

            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.medium,
            fontSize: theme.fontSizes.xs,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarLabel: "Início" }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Home", { screen: "HomeDashboard" });
            },
          })}
        />
        <Tab.Screen
          name="Decks"
          component={DecksStack}
          options={{ tabBarLabel: "Conjuntos" }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Decks", { screen: "DecksList" });
            },
          })}
        />
        <Tab.Screen
          name="Practice"
          component={PracticeStack}
          options={({ route }) => ({
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? "";
              if (routeName === "PracticeGame") {
                return { display: "none" };
              }
              return {};
            })(route),
            tabBarLabel: "Praticar",
          })}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Practice", { screen: "PracticeHub" });
            },
          })}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{ tabBarLabel: "Estatísticas" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarLabel: "Perfil",
            headerShown: false,
          }}
        />
      </Tab.Navigator>
      <CustomAlert />
      <LevelUpOverlay />
    </View>
  );
}
