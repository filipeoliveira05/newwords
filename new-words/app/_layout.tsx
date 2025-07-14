import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./navigation/RootNavigator";
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <RootNavigator />
        <Toast config={toastConfig} />
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
