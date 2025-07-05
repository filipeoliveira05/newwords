import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { theme } from "../../config/theme";

import {
  HomeStackParamList,
  PracticeStackParamList,
  ProfileStackParamList,
  RootTabParamList,
} from "../../types/navigation";

import HomeDecksScreen from "../screens/HomeDecksScreen";
import DeckDetailScreen from "../screens/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/AddOrEditDeckScreen";
import WordDetailsScreen from "../screens/WordDetailsScreen";

import PracticeHubScreen from "../screens/PracticeHubScreen";
import PracticeGameScreen from "../screens/PracticeGameScreen";

import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

import CustomAlert from "../components/CustomAlert";

const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <HomeStackNav.Screen
        name="HomeDecksList"
        component={HomeDecksScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNav.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ title: "Detalhes do Conjunto" }}
      />
      <HomeStackNav.Screen
        name="WordDetails"
        component={WordDetailsScreen}
        options={{ title: "Detalhes da Palavra" }}
      />
      <HomeStackNav.Screen
        name="AddOrEditDeck"
        component={AddOrEditDeckScreen}
        options={{ title: "Novo Conjunto" }}
      />
    </HomeStackNav.Navigator>
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
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
    </ProfileStackNav.Navigator>
  );
}

const iconMapping = {
  HomeDecks: ["home", "home-outline"],
  Practice: ["flash", "flash-outline"],
  Stats: ["stats-chart", "stats-chart-outline"],
  Profile: ["person-circle", "person-circle-outline"],
};

export default function AppNavigator() {
  const [fontsLoaded] = useFonts({
    "Satoshi-Regular": require("../../assets/fonts/Satoshi-Regular.otf"),
    "Satoshi-Medium": require("../../assets/fonts/Satoshi-Medium.otf"),
    "Satoshi-Bold": require("../../assets/fonts/Satoshi-Bold.otf"),
  });

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
          name="HomeDecks"
          component={HomeStack}
          options={{ tabBarLabel: "Conjuntos" }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("HomeDecks", { screen: "HomeDecksList" });
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
    </View>
  );
}
