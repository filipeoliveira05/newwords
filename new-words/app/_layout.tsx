import React from "react";
import "../config/reanimated"; // Importa para executar a configuração da Reanimated
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./navigation/RootNavigator";
import { MenuProvider } from "react-native-popup-menu";
import CustomAlert from "./components/CustomAlert";
import NotificationToast from "./components/notifications/NotificationToast";
import SoundProvider from "./components/SoundProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SoundProvider>
        <MenuProvider>
          <RootNavigator />
          <CustomAlert />
          <NotificationToast />
        </MenuProvider>
      </SoundProvider>
    </GestureHandlerRootView>
  );
}
