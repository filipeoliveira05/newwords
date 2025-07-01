import { create } from "zustand";

type Listener = (data: any) => void;

interface EventState {
  listeners: Record<string, Listener[]>;
  subscribe: (eventName: string, listener: Listener) => void;
  publish: (eventName: string, data: any) => void;
}

export const eventStore = create<EventState>((set, get) => ({
  listeners: {},
  subscribe: (eventName, listener) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [eventName]: [...(state.listeners[eventName] || []), listener],
      },
    }));
  },
  publish: (eventName, data) => {
    const eventListeners = get().listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  },
}));
