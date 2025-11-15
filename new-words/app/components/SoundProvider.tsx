import React, { useEffect } from "react";
import { useAudioPlayer } from "expo-audio";
import {
  registerSound,
  soundFiles,
  SoundType,
  unloadSounds,
} from "../../services/soundService";

/**
 * Um componente "provider" que não renderiza nada, mas é responsável por
 * carregar todos os efeitos sonoros da aplicação usando o hook `useAudioPlayer`
 * e registá-los no `soundService`.
 */
const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Carrega cada som com o seu próprio hook
  const correctPlayer = useAudioPlayer(soundFiles[SoundType.Correct]);
  const incorrectPlayer = useAudioPlayer(soundFiles[SoundType.Incorrect]);
  const flipPlayer = useAudioPlayer(soundFiles[SoundType.Flip]);

  // Regista os players no serviço sempre que eles mudam
  useEffect(() => {
    if (correctPlayer) registerSound(SoundType.Correct, correctPlayer);
    if (incorrectPlayer) registerSound(SoundType.Incorrect, incorrectPlayer);
    if (flipPlayer) registerSound(SoundType.Flip, flipPlayer);

    // Limpa os sons quando o provider é desmontado
    return () => unloadSounds();
  }, [correctPlayer, incorrectPlayer, flipPlayer]);

  return <>{children}</>;
};

export default SoundProvider;
