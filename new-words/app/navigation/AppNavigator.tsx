import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeDecksScreen from "../screens/HomeDecksScreen";
import PracticeScreen from "../screens/PracticeScreen";
import StatsScreen from "../screens/StatsScreen";
import DeckDetailScreen from "../screens/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/AddOrEditDeckScreen";

const Tab = createBottomTabNavigator();

const iconMapping = {
  HomeDecks: ["home", "home-outline"],
  Practice: ["flash", "flash-outline"],
  Stats: ["stats-chart", "stats-chart-outline"],
};

const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeDecksList"
        component={HomeDecksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{ title: "Detalhes do Conjunto", animation: "fade" }}
      />
      <Stack.Screen
        name="AddOrEditDeck"
        component={AddOrEditDeckScreen}
        options={{ title: "Novo Conjunto" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const [iconFocused, iconInactive] =
            iconMapping[route.name as keyof typeof iconMapping];
          const iconName = focused ? iconFocused : iconInactive;

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeDecks"
        component={HomeStack}
        options={{ tabBarLabel: "Conjuntos" }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ tabBarLabel: "Praticar" }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: "Estatísticas" }}
      />
    </Tab.Navigator>
  );
}
