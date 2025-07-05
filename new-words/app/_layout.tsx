import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./navigation/AppNavigator";
import { initializeDB } from "../services/storage";
import { MenuProvider } from "react-native-popup-menu";
import Toast, {
  BaseToast,
  ErrorToast,
  BaseToastProps,
} from "react-native-toast-message";

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#2a9d8f",
        height: 80,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 15,
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

export default function RootLayout() {
  useEffect(() => {
    async function setupDatabase() {
      try {
        await initializeDB();
      } catch (e) {
        console.error("Falha crítica ao configurar a base de dados:", e);
      }
    }
    setupDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
