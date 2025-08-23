import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, AppState } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeDB } from "../../services/storage";
import { useAuthStore } from "../../stores/useAuthStore";
import AppNavigator from "./AppNavigator";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import UpdatePasswordScreen from "../screens/auth/UpdatePasswordScreen";
import { RootStackParamList } from "../../types/navigation";
import AuthNavigator from "./AuthNavigator";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const {
    session,
    isAuthenticating,
    isSyncing,
    hasCompletedOnboarding,
    initialize,
    runAutomaticSync,
    isRecoveringPassword,
  } = useAuthStore();

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 1. Garante que a base de dados e as tabelas existem antes de qualquer leitura.
        await initializeDB();
        setIsDbInitialized(true);
        // 2. Inicializa o estado de autenticação (verifica se há sessão ativa).
        initialize();
      } catch (error) {
        console.error("Falha ao preparar a aplicação:", error);
        initialize();
      }
    };
    prepareApp();
  }, [initialize]);

  // Efeito para sincronizar quando a app volta para o primeiro plano.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Só sincroniza se a app estiver ativa e houver uma sessão.
      if (nextAppState === "active" && session) {
        console.log("App has come to the foreground, triggering sync.");
        runAutomaticSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session, runAutomaticSync]); // Depende da sessão para não sincronizar se o utilizador estiver deslogado.

  if (!isDbInitialized || isAuthenticating || isSyncing) {
    // Mostra um ecrã de loading enquanto verificamos o estado de onboarding e autenticação.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* O RootNavigator funciona como um porteiro principal, decidindo o estado global da app. */}
      {isRecoveringPassword ? (
        // 1. Prioridade máxima: Se o utilizador veio de um link de recuperação de passe.
        <RootStack.Screen
          name="UpdatePassword"
          component={UpdatePasswordScreen}
        />
      ) : !session ? (
        // 2. Se não há sessão, o controlo é passado para o AuthNavigator,
        // que gere o fluxo de boas-vindas, onboarding para novos utilizadores, login e registo.
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasCompletedOnboarding ? (
        // 3. Se há sessão mas o onboarding nunca foi concluído (ex: utilizador antigo),
        // força a passagem pelo onboarding antes de entrar na app principal.
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // 4. Se há sessão e o onboarding está completo, o utilizador entra na app.
        <RootStack.Screen name="MainApp" component={AppNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
