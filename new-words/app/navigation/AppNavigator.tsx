import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast, {
  BaseToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

import {
  HomeStackParamList,
  PracticeStackParamList,
  RootTabParamList,
} from "../../types/navigation";

import HomeDecksScreen from "../screens/HomeDecksScreen";
import DeckDetailScreen from "../screens/DeckDetailScreen";
import AddOrEditDeckScreen from "../screens/AddOrEditDeckScreen";
import WordDetailsScreen from "../screens/WordDetailsScreen";

import PracticeHubScreen from "../screens/PracticeHubScreen";
import PracticeGameScreen from "../screens/PracticeGameScreen";

import StatsScreen from "../screens/StatsScreen";

import CustomAlert from "../components/CustomAlert";

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
        name="WordDetails"
        component={WordDetailsScreen}
        options={{ title: "Detalhes da Palavra", animation: "fade" }}
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

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#2a9d8f",
        height: 80, // Aumenta a altura
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17, // Aumenta o tamanho do texto do título
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 15, // Aumenta o tamanho do texto da mensagem
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ height: 80, width: "90%", borderLeftColor: "#ef4444" }}
      text1Style={{ fontSize: 17, fontWeight: "bold" }}
      text2Style={{ fontSize: 15 }}
    />
  ),
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
      <CustomAlert />
      <Toast config={toastConfig} />
    </View>
  );
}
