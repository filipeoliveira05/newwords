import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getMetaValue, initializeDB } from "../../services/storage";
import { useAuthStore } from "../../stores/useAuthStore";
import AppNavigator from "./AppNavigator";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import UpdatePasswordScreen from "../screens/auth/UpdatePasswordScreen";
import { RootStackParamList } from "../../types/navigation";
import AuthNavigator from "./AuthNavigator";
import {
  performInitialSync,
  processSyncQueue,
} from "../../services/syncService";
import NetInfo from "@react-native-community/netinfo";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const {
    session,
    isAuthenticating,
    isSyncing,
    initialize,
    isRecoveringPassword,
  } = useAuthStore();
  const previousSession = useRef(session);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 1. Garante que a base de dados e as tabelas existem antes de qualquer leitura.
        await initializeDB();
        // 2. Verifica se o onboarding foi concluído.
        const status = await getMetaValue("has_completed_onboarding");
        setHasCompletedOnboarding(status === "true");
        // 3. Inicializa o estado de autenticação (verifica se há sessão ativa).
        initialize();
      } catch (error) {
        console.error("Falha ao preparar a aplicação:", error);
        setHasCompletedOnboarding(false);
        initialize();
      }
    };
    prepareApp();
  }, [initialize]);

  // Efeito para executar a sincronização inicial quando o utilizador faz login.
  useEffect(() => {
    // A condição verifica se a sessão acabou de se tornar disponível (mudou de null para um objeto).
    if (session && previousSession.current === null) {
      console.log("Utilizador autenticado. A iniciar sincronização inicial...");
      performInitialSync();
    }
    // Atualiza a referência da sessão para a próxima renderização.
    previousSession.current = session;
  }, [session]);

  // Efeito para processar a fila de sincronização quando a app arranca ou fica online.
  useEffect(() => {
    // Garante que este efeito só corre depois de a DB estar inicializada.
    // O hasCompletedOnboarding só é definido após o initializeDB().
    if (hasCompletedOnboarding === null) {
      return;
    }

    // Processa a fila uma vez no arranque, caso haja operações pendentes.
    processSyncQueue();

    // Subscreve a alterações no estado da rede.
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("Ligação à internet restabelecida. A processar a fila...");
        processSyncQueue();
      }
    });

    return () => unsubscribe(); // Limpa a subscrição ao desmontar.
  }, [hasCompletedOnboarding]); // Adiciona a dependência

  if (hasCompletedOnboarding === null || isAuthenticating || isSyncing) {
    // Mostra um ecrã de loading enquanto verificamos o estado de onboarding e autenticação.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isRecoveringPassword ? (
        <RootStack.Screen
          name="UpdatePassword"
          component={UpdatePasswordScreen}
        />
      ) : !hasCompletedOnboarding ? (
        <RootStack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onComplete={() => setHasCompletedOnboarding(true)}
            />
          )}
        </RootStack.Screen>
      ) : !session ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="MainApp" component={AppNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
