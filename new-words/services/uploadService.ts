import { supabase } from "./supabaseClient";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import * as Crypto from "expo-crypto";

/**
 * Faz o upload de uma imagem para o bucket de avatares no Supabase Storage.
 * @param uri O URI local do ficheiro da imagem selecionada.
 * @param userId O ID do utilizador, para o organizar numa pasta.
 * @returns O caminho (path) do ficheiro guardado no Storage.
 */
export const uploadAvatar = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, decode(base64), {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return filePath;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};
