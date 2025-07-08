import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getMetaValue } from "../../services/storage";
import AppNavigator from "./AppNavigator";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import { RootStackParamList } from "../../types/navigation";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const status = await getMetaValue("has_completed_onboarding");
      setHasCompletedOnboarding(status === "true");
    };
    checkOnboardingStatus();
  }, []);

  if (hasCompletedOnboarding === null) {
    // Mostra um ecrã de loading enquanto verificamos o estado.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={hasCompletedOnboarding ? "MainApp" : "Onboarding"}
    >
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="MainApp" component={AppNavigator} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
