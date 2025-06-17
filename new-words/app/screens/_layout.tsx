import React, { useEffect } from "react";

import AppNavigator from "../navigation/AppNavigator";
import { initializeDB } from "../../services/storage";
import { MenuProvider } from "react-native-popup-menu";

export default function RootLayout() {
  useEffect(() => {
    initializeDB();
  }, []);

  return (
    <MenuProvider>
      <AppNavigator />;
    </MenuProvider>
  );
}
