import { create } from "zustand";

// The listener function now has a more specific type for better type safety.
type Listener<T> = (data: T) => void;
// A function that, when called, unsubscribes the listener.
type UnsubscribeFn = () => void;

interface EventState {
  // The listeners are now stored in a Map for easier addition and removal.
  listeners: Map<string, Set<Listener<any>>>;
  // The subscribe method now returns an unsubscribe function.
  subscribe: <T>(eventName: string, listener: Listener<T>) => UnsubscribeFn;
  publish: <T>(eventName: string, data: T) => void;
}

export const eventStore = create<EventState>((set, get) => ({
  listeners: new Map(),

  subscribe: <T>(eventName: string, listener: Listener<T>): UnsubscribeFn => {
    const { listeners } = get();
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }
    const eventListeners = listeners.get(eventName)!;
    eventListeners.add(listener);

    // Return an unsubscribe function.
    return () => {
      const { listeners } = get();
      const eventListeners = listeners.get(eventName);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    };
  },

  publish: <T>(eventName: string, data: T) => {
    const eventListeners = get().listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  },
}));
