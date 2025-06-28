import React from "react";
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import {
  HomeStackParamList,
  PracticeStackParamList,
  RootTabParamList,
} from "./types";

import HomeDecksScreen from "../screens/HomeDecksScreen";
import DeckDetailScreen from "../screens/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/AddOrEditDeckScreen";

import PracticeHubScreen from "../screens/PracticeHubScreen";
import PracticeGameScreen from "../screens/PracticeGameScreen";

import StatsScreen from "../screens/StatsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen
        name="HomeDecksList"
        component={HomeDecksScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNav.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ title: "Detalhes do Conjunto", animation: "fade" }}
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

const iconMapping = {
  HomeDecks: ["home", "home-outline"],
  Practice: ["flash", "flash-outline"],
  Stats: ["stats-chart", "stats-chart-outline"],
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const [iconFocused, iconInactive] = iconMapping[route.name];
          const iconName = focused ? iconFocused : iconInactive;

          return <Ionicons name={iconName as any} size={size} color={color} />;
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
    </Tab.Navigator>
  );
}
