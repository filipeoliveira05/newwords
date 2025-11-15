import { AudioPlayer } from "expo-audio";
import { useSettingsStore } from "../stores/useSettingsStore";

export enum SoundType {
  Correct,
  Incorrect,
  Flip,
}

export const soundFiles = {
  [SoundType.Correct]: require("../assets/sounds/correct.mp3"),
  [SoundType.Incorrect]: require("../assets/sounds/incorrect.mp3"),
  [SoundType.Flip]: require("../assets/sounds/flip.mp3"),
};

const soundObjects: { [key in SoundType]?: AudioPlayer } = {};

const canPlaySound = (): boolean => {
  return useSettingsStore.getState().gameSoundsEnabled;
};

/**
 * Regista um objeto de áudio no serviço.
 * Esta função será chamada pelo SoundProvider.
 */
export const registerSound = (type: SoundType, player: AudioPlayer) => {
  soundObjects[type] = player;
};

/**
 * Toca um som que já foi registado.
 */
export const playSound = async (type: SoundType) => {
  if (!canPlaySound()) {
    return;
  }

  const player = soundObjects[type];
  if (player) {
    try {
      // Para sons curtos, reposicionar para o início e tocar é o ideal.
      await player.seekTo(0);
      await player.play();
    } catch (error) {
      console.error(`Não foi possível tocar o som para o tipo ${type}:`, error);
    }
  } else {
    console.warn(`O som para o tipo ${type} não está carregado.`);
  }
};

/**
 * Descarrega todos os sons da memória.
 */
export const unloadSounds = () => {
  for (const key in soundObjects) {
    delete soundObjects[Number(key) as SoundType];
  }
};
