import React from "react";
import "../config/reanimated"; // Importa para executar a configuração da Reanimated
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./navigation/RootNavigator";
import { MenuProvider } from "react-native-popup-menu";
import CustomAlert from "./components/CustomAlert";
import NotificationToast from "./components/notifications/NotificationToast";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <RootNavigator />
        <CustomAlert />
        <NotificationToast />
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
