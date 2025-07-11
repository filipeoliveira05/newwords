import { create } from "zustand";
import { getMetaValue, setMetaValue } from "../services/storage";

interface SettingsState {
  hapticsEnabled: boolean;
  gameSoundsEnabled: boolean;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setGameSoundsEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true, // Default value
  gameSoundsEnabled: true, // Default value
  isLoading: true,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const [hapticsValue, soundsValue] = await Promise.all([
        getMetaValue("haptics_enabled", "true"),
        getMetaValue("game_sounds_enabled", "true"),
      ]);

      set({
        hapticsEnabled: hapticsValue === "true",
        gameSoundsEnabled: soundsValue === "true",
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch haptics setting:", error);
      set({ hapticsEnabled: true, gameSoundsEnabled: true, isLoading: false }); // Fallback to enabled
    }
  },

  setHapticsEnabled: async (enabled) => {
    try {
      // Update state optimistically for a responsive UI
      set({ hapticsEnabled: enabled });
      await setMetaValue("haptics_enabled", enabled ? "true" : "false");
    } catch (error) {
      console.error("Failed to save haptics setting:", error);
      // Revert state if the DB update fails
      set({ hapticsEnabled: !enabled });
    }
  },

  setGameSoundsEnabled: async (enabled) => {
    try {
      // Update state optimistically for a responsive UI
      set({ gameSoundsEnabled: enabled });
      await setMetaValue("game_sounds_enabled", enabled ? "true" : "false");
    } catch (error) {
      console.error("Failed to save game sounds setting:", error);
      // Revert state if the DB update fails
      set({ gameSoundsEnabled: !enabled });
    }
  },
}));
