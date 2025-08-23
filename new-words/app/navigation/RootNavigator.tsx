import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, AppState } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { Asset } from "expo-asset";
import { initializeDB } from "../../services/storage";
import { useAuthStore } from "../../stores/useAuthStore";
import AppNavigator from "./AppNavigator";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import UpdatePasswordScreen from "../screens/auth/UpdatePasswordScreen";
import { RootStackParamList } from "../../types/navigation";
import AuthNavigator from "./AuthNavigator";
import images from "@/services/imageService";
import * as soundService from "@/services/soundService";
import { theme } from "@/config/theme";

// Import fonts
import SatoshiRegular from "../../assets/fonts/Satoshi-Regular.otf";
import SatoshiMedium from "../../assets/fonts/Satoshi-Medium.otf";
import SatoshiBold from "../../assets/fonts/Satoshi-Bold.otf";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [areAssetsLoaded, setAreAssetsLoaded] = useState(false);
  const {
    session,
    isAuthenticating,
    isSyncing,
    hasCompletedOnboarding,
    initialize,
    runAutomaticSync,
    isRecoveringPassword,
  } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    "Satoshi-Regular": SatoshiRegular,
    "Satoshi-Medium": SatoshiMedium,
    "Satoshi-Bold": SatoshiBold,
  });

  // Efeito para lidar com possíveis erros no carregamento das fontes.
  useEffect(() => {
    if (fontError) {
      console.error("Erro ao carregar as fontes:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 1. Prepara os recursos estáticos (imagens, sons) e a base de dados em paralelo.
        const assetPromises = [
          // Pre-load all images from the image service
          ...Object.values(images).map((image) =>
            Asset.fromModule(image).downloadAsync()
          ),
          // Pre-load all sounds
          soundService.loadSounds(),
          // Garante que a base de dados e as tabelas existem antes de qualquer leitura.
          initializeDB(),
        ];

        await Promise.all(assetPromises);

        setAreAssetsLoaded(true);
        setIsDbInitialized(true); // A DB está incluída nas promessas de assets

        // 2. Após os recursos estarem prontos, inicializa o estado de autenticação.
        // Isto garante que a UI de login/registo já tem as fontes e imagens prontas.
        await initialize();
      } catch (error) {
        console.error("Falha ao preparar a aplicação:", error);
        // Mesmo com erro, tentamos inicializar a autenticação para não bloquear a app.
        // O utilizador poderá ver assets em falta, mas a app não crasha.
        await initialize();
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

  if (
    !isDbInitialized ||
    !fontsLoaded ||
    !areAssetsLoaded ||
    isAuthenticating ||
    isSyncing
  ) {
    // Mostra um ecrã de loading enquanto verificamos o estado de onboarding e autenticação.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
