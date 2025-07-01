import { create } from "zustand";

export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: "default" | "destructive" | "cancel";
}

interface AlertState {
  isVisible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  showAlert: (config: {
    title: string;
    message: string;
    buttons: AlertButton[];
  }) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isVisible: false,
  title: "",
  message: "",
  buttons: [],
  showAlert: ({ title, message, buttons }) =>
    set({
      isVisible: true,
      title,
      message,
      buttons,
    }),
  hideAlert: () => set({ isVisible: false }),
}));
