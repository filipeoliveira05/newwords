import { create } from "zustand";
import { eventStore } from "./eventStore";
import { AchievementRank } from "../config/achievements";
import { IconName } from "../app/components/Icon";

export type NotificationType =
  | "dailyGoal"
  | "achievement"
  | "levelUp"
  | "generic"
  | "error";

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  icon: IconName;
  // Propriedades específicas de cada tipo
  rank?: AchievementRank;
  newLevel?: number;
}

interface NotificationState {
  queue: NotificationPayload[];
  currentNotification: NotificationPayload | null;
  addNotification: (notification: NotificationPayload) => void;
  showNextNotification: () => void;
  clearCurrentNotification: () => void;
  reset: () => void;
}

const initialState: Omit<
  NotificationState,
  | "addNotification"
  | "showNextNotification"
  | "clearCurrentNotification"
  | "reset"
> = {
  queue: [],
  currentNotification: null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,
  addNotification: (notification) => {
    set((state) => ({ queue: [...state.queue, notification] }));
    // Se não houver notificação a ser exibida, mostra a próxima
    if (!get().currentNotification) {
      get().showNextNotification();
    }
  },

  showNextNotification: () => {
    const { queue, currentNotification } = get();
    if (queue.length > 0 && !currentNotification) {
      const [nextNotification, ...rest] = queue;
      set({
        currentNotification: nextNotification,
        queue: rest,
      });
    }
  },

  clearCurrentNotification: () => {
    set({ currentNotification: null });
    // Após limpar, verifica se há mais alguma na fila
    setTimeout(() => {
      get().showNextNotification();
    }, 300); // Pequeno atraso para a animação de saída
  },

  reset: () => {
    set(initialState);
  },
}));

// Ouve o evento de logout para se resetar.
eventStore.getState().subscribe("userLoggedOut", () => {
  useNotificationStore.getState().reset();
});
