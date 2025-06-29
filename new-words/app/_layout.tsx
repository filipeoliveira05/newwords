import React, { useEffect } from "react";

import AppNavigator from "./navigation/AppNavigator";
import { initializeDB } from "../services/storage";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";

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
    <MenuProvider>
      <AppNavigator />
      <Toast />
    </MenuProvider>
  );
}
