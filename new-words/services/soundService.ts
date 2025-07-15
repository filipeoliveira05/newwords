import { AudioPlayer } from "expo-audio";
import { useSettingsStore } from "../stores/useSettingsStore";

export enum SoundType {
  Correct,
  Incorrect,
  Flip,
}

const soundFiles = {
  [SoundType.Correct]: require("../assets/sounds/correct.mp3"),
  [SoundType.Incorrect]: require("../assets/sounds/incorrect.mp3"),
  [SoundType.Flip]: require("../assets/sounds/flip.mp3"),
};

const soundObjects: { [key in SoundType]?: AudioPlayer } = {};

const canPlaySound = (): boolean => {
  return useSettingsStore.getState().gameSoundsEnabled;
};

export const loadSounds = async () => {
  // console.log("A carregar sons...");
  for (const key in soundFiles) {
    const soundType = Number(key) as SoundType;
    try {
      const player = new AudioPlayer(soundFiles[soundType], 500);
      soundObjects[soundType] = player;
    } catch (error) {
      // console.error(
      //   `Não foi possível carregar o som para o tipo ${soundType}:`,
      //   error
      // );
    }
  }
  // console.log("Sons carregados.");
};

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
      // console.error(`Não foi possível tocar o som para o tipo ${type}:`, error);
    }
  } else {
    //console.warn(`O som para o tipo ${type} não está carregado.`);
  }
};

// Futuramente, pode adicionar uma função para descarregar os sons se necessário.
// export const unloadAllSounds = async () => { ... };
