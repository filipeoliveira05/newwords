import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../stores/useSettingsStore";

// Re-export enums for convenience, so consumers of this service
// don't need to import from 'expo-haptics' directly.
export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

/**
 * A wrapper around the Expo Haptics module that respects the user's settings.
 * This service ensures that haptic feedback is only triggered if the user
 * has enabled it in the app's settings.
 */

const canVibrate = (): boolean => {
  return useSettingsStore.getState().hapticsEnabled;
};

export const impactAsync = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): Promise<void> => {
  if (canVibrate()) {
    await Haptics.impactAsync(style);
  }
};

export const notificationAsync = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType
    .Success
): Promise<void> => {
  if (canVibrate()) {
    await Haptics.notificationAsync(type);
  }
};

export const selectionAsync = async (): Promise<void> => {
  if (canVibrate()) {
    // Used for a light tap when a selection changes.
    // Good for pickers, sliders, or toggles.
    await Haptics.selectionAsync();
  }
};
