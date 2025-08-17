import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_SYNC_KEY = "last_synced_at";

const LAST_USER_KEY = "last_logged_in_user_id";
/**
 * Obtém o timestamp da última sincronização bem-sucedida.
 * @returns {Promise<string | null>} O timestamp em formato ISO, ou null se nunca foi sincronizado.
 */
export async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error("Erro ao obter o timestamp da última sincronização:", error);
    return null;
  }
}

/**
 * Define o timestamp da última sincronização bem-sucedida.
 * @param {string} timestamp - O timestamp atual em formato ISO a ser guardado.
 */
export async function setLastSyncTimestamp(timestamp: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
  } catch (error) {
    console.error(
      "Erro ao definir o timestamp da última sincronização:",
      error
    );
  }
}

/**
 * Limpa o timestamp da última sincronização.
 * Deve ser chamado durante o logout para forçar uma sincronização completa no próximo login.
 */
export async function clearLastSyncTimestamp(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error("Erro ao limpar o timestamp da última sincronização:", error);
  }
}

/**
 * Obtém o ID do último utilizador que fez login com sucesso no dispositivo.
 * @returns {Promise<string | null>} O ID do utilizador, ou null se for o primeiro login.
 */
export async function getLastLoggedInUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_USER_KEY);
  } catch (error) {
    console.error("Erro ao obter o ID do último utilizador:", error);
    return null;
  }
}

/**
 * Define o ID do utilizador que acabou de fazer login.
 * @param {string | null} userId - O ID do utilizador a ser guardado, ou null para limpar.
 */
export async function setLastLoggedInUserId(
  userId: string | null
): Promise<void> {
  try {
    if (userId) {
      await AsyncStorage.setItem(LAST_USER_KEY, userId);
    } else {
      await AsyncStorage.removeItem(LAST_USER_KEY);
    }
  } catch (error) {
    console.error("Erro ao definir o ID do último utilizador:", error);
  }
}
