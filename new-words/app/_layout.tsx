import React, { useEffect } from "react";

import AppNavigator from "./navigation/AppNavigator";
import { initializeDB } from "../services/storage";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  useEffect(() => {
    initializeDB();
  }, []);

  return (
    <MenuProvider>
      <AppNavigator />
      <Toast />
    </MenuProvider>
  );
}
