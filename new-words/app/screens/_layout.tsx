import React, { useEffect } from "react";

import AppNavigator from "../navigation/AppNavigator";
import { initializeDB } from "../../services/storage";

export default function RootLayout() {
  useEffect(() => {
    initializeDB();
  }, []);

  return <AppNavigator />;
}
