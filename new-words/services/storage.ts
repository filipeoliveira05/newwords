import * as SQLite from "expo-sqlite";
import {
  Deck,
  Word,
  PracticeHistory,
  PracticeLog,
  LevelUpRecord,
  DailyActiveGoal,
} from "@/types/database";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import {
  startOfDay,
  isYesterday,
  isToday,
  format,
  addDays,
  startOfWeek,
} from "date-fns";
import { calculateSm2Factors } from "../utils/sm2";
import { achievements } from "../config/achievements";
import { IconName } from "../app/components/Icon";

let db: SQLite.SQLiteDatabase | null = null;

export const initializeDB = async () => {
  try {
    // Garante que a conexão com a base de dados é criada aqui e apenas aqui.
    // Se já existir (por exemplo, em hot-reloads), não faz nada. Se for nula, cria.
    if (!db) {
      db = SQLite.openDatabaseSync("flashcards.db");
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync(`PRAGMA foreign_keys = ON;`);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS decks (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS words (
            id TEXT PRIMARY KEY NOT NULL,
            deckId TEXT NOT NULL,
            name TEXT NOT NULL,
            meaning TEXT NOT NULL,
            timesTrained INTEGER NOT NULL DEFAULT 0,
            timesCorrect INTEGER NOT NULL DEFAULT 0,
            timesIncorrect INTEGER NOT NULL DEFAULT 0,
            lastTrained TEXT,
            lastAnswerCorrect INTEGER,
            masteryLevel TEXT NOT NULL DEFAULT 'new',
            nextReviewDate TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            category TEXT,
            synonyms TEXT,
            antonyms TEXT,
            sentences TEXT,
            isFavorite INTEGER NOT NULL DEFAULT 0,
            masteredAt TEXT,
            easinessFactor REAL NOT NULL DEFAULT 2.5,
            interval INTEGER NOT NULL DEFAULT 0,
            repetitions INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS user_metadata (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS practice_history (
            date TEXT PRIMARY KEY NOT NULL,
            words_trained INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS practice_log (
            id TEXT PRIMARY KEY NOT NULL,
            word_id TEXT NOT NULL,
            practice_date TEXT NOT NULL,
            was_correct INTEGER NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS unlocked_achievements (
            achievement_id TEXT PRIMARY KEY NOT NULL,
            unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS level_up_history (
            level INTEGER PRIMARY KEY NOT NULL,
            unlocked_at TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS daily_active_goals (
            date TEXT PRIMARY KEY NOT NULL,
            goal_ids TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            is_deleted INTEGER NOT NULL DEFAULT 0
        );
      `);

      // --- Insere valores padrão para gamificação se não existirem ---
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('user_xp', '0');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('has_completed_onboarding', 'false');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_practiced_deck_id', '');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('user_level', '1');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_practice_date', '');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('current_league', 'Bronze');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('weekly_xp', '0');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('league_start_date', '');`
      );
      // Novas chaves para o resumo da liga semanal
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_week_final_rank', '0');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_week_league_result', 'maintained');` // 'promoted', 'demoted', 'maintained'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_week_league_name', '');`
      );

      // Substituímos 'user_name' por campos mais detalhados
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('first_name', 'Novo');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('last_name', 'Utilizador');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('email', '');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('profile_picture_url', '');`
      );
      // Adiciona o caminho para a foto de perfil personalizada
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('profile_picture_path', '');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('haptics_enabled', 'true');`
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO user_metadata (key, value) VALUES ('game_sounds_enabled', 'true');`
      );

      // --- INDEXES FOR PERFORMANCE ---
      // Index to quickly fetch words for a specific deck.
      await db.runAsync(
        `CREATE INDEX IF NOT EXISTS idx_words_deckId ON words(deckId);`
      );
      // Index for the most common query: finding words that are due for practice.
      await db.runAsync(
        `CREATE INDEX IF NOT EXISTS idx_words_nextReviewDate ON words(nextReviewDate);`
      );
      // Composite index for finding fallback words for practice (least practiced/easiest).
      await db.runAsync(
        `CREATE INDEX IF NOT EXISTS idx_words_practice_order ON words(easinessFactor ASC, lastTrained ASC);`
      );
      // Index to quickly find words answered incorrectly.
      await db.runAsync(
        `CREATE INDEX IF NOT EXISTS idx_words_lastAnswerCorrect ON words(lastAnswerCorrect);`
      );
      // Index to quickly query practice logs by date.
      await db.runAsync(
        `CREATE INDEX IF NOT EXISTS idx_practice_log_date ON practice_log(practice_date);`
      );

      // --- TRIGGERS FOR updated_at ---
      // Trigger for 'decks' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_decks_updated_at
        AFTER UPDATE ON decks
        FOR EACH ROW
        BEGIN
            UPDATE decks SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
        END;
      `);
      // Trigger for 'words' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_words_updated_at
        AFTER UPDATE ON words
        FOR EACH ROW
        BEGIN
            UPDATE words SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
        END;
      `);
      // Trigger for 'user_metadata' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_user_metadata_updated_at
        AFTER UPDATE ON user_metadata
        FOR EACH ROW
        BEGIN
            UPDATE user_metadata SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = OLD.key;
        END;
      `);
      // Trigger for 'unlocked_achievements' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_unlocked_achievements_updated_at
        AFTER UPDATE ON unlocked_achievements
        FOR EACH ROW
        BEGIN
            UPDATE unlocked_achievements SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE achievement_id = OLD.achievement_id;
        END;
      `);
      // Trigger for 'practice_history' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_practice_history_updated_at
        AFTER UPDATE ON practice_history
        FOR EACH ROW
        BEGIN
            UPDATE practice_history SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE date = OLD.date;
        END;
      `);
      // Trigger for 'practice_log' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_practice_log_updated_at
        AFTER UPDATE ON practice_log
        FOR EACH ROW
        BEGIN
            UPDATE practice_log SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
        END;
      `);
      // Trigger for 'level_up_history' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_level_up_history_updated_at
        AFTER UPDATE ON level_up_history
        FOR EACH ROW
        BEGIN
            UPDATE level_up_history SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE level = OLD.level;
        END;
      `);
      // Trigger for 'daily_active_goals' table
      await db.runAsync(`
        CREATE TRIGGER IF NOT EXISTS update_daily_active_goals_updated_at
        AFTER UPDATE ON daily_active_goals
        FOR EACH ROW
        BEGIN
            UPDATE daily_active_goals SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE date = OLD.date;
        END;
      `);
    });
  } catch (e) {
    console.error("Erro ao inicializar a base de dados:", e);
    throw e;
  }
};

export const deleteDatabase = async (): Promise<void> => {
  try {
    // Primeiro, fecha a conexão se ela existir.
    // Fecha a conexão com a base de dados se estiver aberta.
    if (db) {
      await db.closeAsync();
    }

    const dbFilePath = `${FileSystem.documentDirectory}SQLite/flashcards.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbFilePath);
      // Importante: define a variável db como nula para que a próxima chamada a initializeDB a recrie.
      db = null;
      console.log("Base de dados apagada com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao apagar a base de dados:", error);
  }
};

/**
 * Expõe a funcionalidade de transação da base de dados para ser usada por outros serviços.
 */
export async function withTransaction(
  action: () => Promise<void>
): Promise<void> {
  await db.withTransactionAsync(action);
}

// --- Metadata Helper Functions ---

// A helper to get a single metadata value
export async function getMetaValue(
  key: string,
  defaultValue: string | null = null
): Promise<string | null> {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM user_metadata WHERE key = ?",
      [key]
    );
    return result?.value ?? defaultValue;
  } catch (e) {
    console.error(`Erro ao obter metadado '${key}':`, e);
    throw e;
  }
}

// --- Gamification Functions ---

export interface GamificationStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  consecutiveDays: number;
  totalWords: number;
  wordsMastered: number;
  lastPracticeDate: string | null;
}

const getXPForNextLevel = (level: number) =>
  Math.floor(100 * Math.pow(level, 1.5));

export async function getGamificationStats(): Promise<GamificationStats> {
  const [
    xpStr,
    levelStr,
    practiceMetrics,
    totalWords,
    globalStats,
    lastPracticeDate,
  ] = await Promise.all([
    getMetaValue("user_xp", "0"),
    getMetaValue("user_level", "1"),
    getUserPracticeMetrics(),
    getTotalWordCount(),
    getGlobalStats(),
    getMetaValue("last_practice_date", null),
  ]);

  const level = parseInt(levelStr ?? "1", 10);

  return {
    xp: parseInt(xpStr ?? "0", 10),
    level: level,
    xpForNextLevel: getXPForNextLevel(level),
    consecutiveDays: practiceMetrics.consecutiveDays,
    totalWords: totalWords,
    wordsMastered: globalStats.wordsMastered,
    lastPracticeDate: lastPracticeDate,
  };
}

export async function updateUserXP(
  xpToAdd: number
): Promise<{ newXP: number; newLevel: number; didLevelUp: boolean }> {
  let didLevelUp = false;
  const currentXP = parseInt((await getMetaValue("user_xp", "0")) ?? "0", 10);
  let currentLevel = parseInt(
    (await getMetaValue("user_level", "1")) ?? "1",
    10
  );

  let newXP = currentXP + xpToAdd;
  let xpForNextLevel = getXPForNextLevel(currentLevel);

  while (newXP >= xpForNextLevel) {
    newXP -= xpForNextLevel;
    currentLevel++;
    didLevelUp = true;
    await db.runAsync(
      "INSERT OR IGNORE INTO level_up_history (level, unlocked_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
      [currentLevel]
    );
    xpForNextLevel = getXPForNextLevel(currentLevel);
  }

  await Promise.all([
    setMetaValue("user_xp", newXP.toString()),
    setMetaValue("user_level", currentLevel.toString()),
  ]);

  return { newXP, newLevel: currentLevel, didLevelUp };
}

export async function getLevelUpHistory(): Promise<LevelUpRecord[]> {
  try {
    return await db.getAllAsync<LevelUpRecord>(
      "SELECT * FROM level_up_history"
    );
  } catch (e) {
    console.error("Erro ao obter histórico de subida de nível:", e);
    throw e;
  }
}

export async function seedLevelUpHistory(): Promise<void> {
  try {
    await db.withTransactionAsync(async () => {
      // Apaga o histórico existente para garantir um estado limpo
      await db.runAsync("DELETE FROM level_up_history");

      // Insere alguns dados de teste.
      // Nível 2 desbloqueado há 10 dias
      await db.runAsync(
        "INSERT INTO level_up_history (level, unlocked_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-10 days'))",
        [2]
      );
      // Nível 3 desbloqueado há 5 dias
      await db.runAsync(
        "INSERT INTO level_up_history (level, unlocked_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days'))",
        [3]
      );
      // Nível 4 desbloqueado ontem
      await db.runAsync(
        "INSERT INTO level_up_history (level, unlocked_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'))",
        [4]
      );
    });
  } catch (e) {
    console.error("Erro ao popular o histórico de subida de nível:", e);
    throw e;
  }
}

export interface LeagueData {
  currentLeague: string;
  weeklyXP: number;
  leagueStartDate: string | null;
}

export async function getLeagueData(): Promise<LeagueData> {
  const [currentLeague, weeklyXP, leagueStartDate] = await Promise.all([
    getMetaValue("current_league", "Bronze"),
    getMetaValue("weekly_xp", "0"),
    getMetaValue("league_start_date", null),
  ]);
  return {
    currentLeague: currentLeague ?? "Bronze",
    weeklyXP: parseInt(weeklyXP ?? "0", 10),
    leagueStartDate: leagueStartDate,
  };
}

export async function updateLeagueData(
  data: Partial<LeagueData>
): Promise<void> {
  const promises: Promise<void>[] = [];
  if (data.currentLeague !== undefined) {
    promises.push(setMetaValue("current_league", data.currentLeague));
  }
  if (data.weeklyXP !== undefined) {
    promises.push(setMetaValue("weekly_xp", data.weeklyXP.toString()));
  }
  if (data.leagueStartDate !== undefined) {
    promises.push(
      setMetaValue("league_start_date", data.leagueStartDate ?? "")
    );
  }
  await Promise.all(promises);
}

export async function addWeeklyXP(xpToAdd: number): Promise<void> {
  const currentXP = parseInt((await getMetaValue("weekly_xp", "0")) ?? "0", 10);
  await setMetaValue("weekly_xp", (currentXP + xpToAdd).toString());
}
// A helper to set a single metadata value

export async function checkAndResetDailyStreak(): Promise<void> {
  try {
    const lastPracticeDateStr = await getMetaValue("last_practice_date", null);
    if (!lastPracticeDateStr) {
      // Se nunca praticou, a streak é 0.
      await setMetaValue("consecutive_days", "0");
      return;
    }

    const lastPracticeDate = startOfDay(new Date(lastPracticeDateStr));

    // Se a última prática não foi hoje nem ontem, a streak quebrou.
    if (!isToday(lastPracticeDate) && !isYesterday(lastPracticeDate)) {
      await setMetaValue("consecutive_days", "0");
    }
  } catch (e) {
    console.error("Erro ao verificar e reiniciar a streak diária:", e);
    throw e;
  }
}
export async function setMetaValue(key: string, value: string): Promise<void> {
  try {
    await db.runAsync(
      "INSERT OR REPLACE INTO user_metadata (key, value) VALUES (?, ?)",
      [key, value]
    );
  } catch (e) {
    console.error(`Erro ao definir metadado '${key}':`, e);
    throw e;
  }
}

// --- Deck Functions

export async function getDecks(): Promise<Deck[]> {
  try {
    return await db.getAllAsync<Deck>(
      "SELECT * FROM decks ORDER BY createdAt DESC"
    );
  } catch (e) {
    console.error("Erro ao obter decks:", e);
    throw e;
  }
}

export async function getDeckById(id: string): Promise<Deck | null> {
  try {
    return await db.getFirstAsync<Deck>("SELECT * FROM decks WHERE id = ?", [
      id,
    ]);
  } catch (e) {
    console.error("Erro ao obter deck por id:", e);
    throw e;
  }
}

export async function getWordCountByDeck(deckId: string): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM words WHERE deckId = ?",
      [deckId]
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras do deck:", e);
    throw e;
  }
}

export async function countMasteredWordsByDeck(
  deckId: string
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM words WHERE deckId = ? AND masteryLevel = 'mastered'",
      [deckId]
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras dominadas do deck:", e);
    throw e;
  }
}

export async function addDeck(title: string, author: string): Promise<Deck> {
  if (!title.trim() || !author.trim()) {
    throw new Error("Título e autor são obrigatórios.");
  }
  try {
    const newId = Crypto.randomUUID();
    const result = await db.getFirstAsync<Deck>(
      "INSERT INTO decks (id, title, author) VALUES (?, ?, ?) RETURNING *",
      [newId, title, author]
    );
    if (!result) {
      throw new Error("Falha ao adicionar deck e obter o resultado.");
    }
    return result;
  } catch (e) {
    console.error("Erro ao adicionar o deck:", e);
    throw e;
  }
}

export async function updateDeck(
  id: string,
  title: string,
  author: string
): Promise<void> {
  if (!title.trim() || !author.trim()) {
    throw new Error("Título e autor são obrigatórios.");
  }
  try {
    await db.runAsync("UPDATE decks SET title = ?, author = ? WHERE id = ?", [
      title,
      author,
      id,
    ]);
  } catch (e) {
    console.error("Erro ao atualizar deck:", e);
    throw e;
  }
}

export async function deleteDeck(id: string): Promise<void> {
  try {
    // Usa uma transação para garantir que tanto as palavras como o deck são apagados.
    // SOFT DELETE: Em vez de apagar, marcamos os registos como apagados.
    // O trigger que criámos irá atualizar o `updated_at` automaticamente.
    await db.withTransactionAsync(async () => {
      // 1. Marca as palavras associadas como apagadas
      await db.runAsync("UPDATE words SET is_deleted = 1 WHERE deckId = ?", [
        id,
      ]);
      // 2. Marca o deck como apagado
      await db.runAsync("UPDATE decks SET is_deleted = 1 WHERE id = ?", [id]);
    });
  } catch (e) {
    console.error("Erro ao apagar deck:", e);
    throw e;
  }
}

export async function deleteDecks(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }
  try {
    // SOFT DELETE: Em vez de apagar, marcamos os registos como apagados.
    // O trigger que criámos irá atualizar o `updated_at` automaticamente.
    await db.withTransactionAsync(async () => {
      const placeholders = ids.map(() => "?").join(",");
      // 1. Marca as palavras associadas a todos os decks selecionados como apagadas
      await db.runAsync(
        `UPDATE words SET is_deleted = 1 WHERE deckId IN (${placeholders})`,
        ids
      );
      // 2. Marca todos os decks selecionados como apagados
      await db.runAsync(
        `UPDATE decks SET is_deleted = 1 WHERE id IN (${placeholders})`,
        ids
      );
    });
  } catch (e) {
    console.error("Erro ao apagar múltiplos decks:", e);
    throw e;
  }
}

/**
 * Apaga permanentemente um deck e as suas palavras associadas da base de dados local.
 * Usado após receber a confirmação de que o deck foi apagado na nuvem.
 */
export async function hardDeleteDeck(id: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM words WHERE deckId = ?", [id]);
    await db.runAsync("DELETE FROM decks WHERE id = ?", [id]);
  } catch (e) {
    console.error("Erro ao apagar permanentemente o deck:", e);
    throw e;
  }
}

/**
 * Apaga permanentemente uma palavra da base de dados local.
 * Usado após receber a confirmação de que a palavra foi apagada na nuvem.
 */
export async function hardDeleteWord(id: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM words WHERE id = ?", [id]);
  } catch (e) {
    console.error("Erro ao apagar permanentemente a palavra:", e);
    throw e;
  }
}

/**
 * Apaga permanentemente uma conquista da base de dados local.
 */
export async function hardDeleteUnlockedAchievement(
  achievementId: string
): Promise<void> {
  await db.runAsync(
    "DELETE FROM unlocked_achievements WHERE achievement_id = ?",
    [achievementId]
  );
}

/**
 * Apaga permanentemente um registo de log da base de dados local.
 */
export async function hardDeletePracticeLog(id: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM practice_log WHERE id = ?", [id]);
  } catch (e) {
    console.error("Erro ao apagar permanentemente o log de prática:", e);
    throw e;
  }
}

/**
 * Apaga permanentemente um registo de histórico de nível da base de dados local.
 */
export async function hardDeleteLevelUpHistory(level: number): Promise<void> {
  try {
    await db.runAsync("DELETE FROM level_up_history WHERE level = ?", [level]);
  } catch (e) {
    console.error("Erro ao apagar permanentemente o histórico de nível:", e);
    throw e;
  }
}

/**
 * Apaga permanentemente um registo de metas diárias da base de dados local.
 */
export async function hardDeleteDailyActiveGoals(date: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM daily_active_goals WHERE date = ?", [date]);
  } catch (e) {
    console.error("Erro ao apagar permanentemente as metas diárias ativas:", e);
    throw e;
  }
}
// --- Word Functions

export async function getAllWords(): Promise<Word[]> {
  try {
    return await db.getAllAsync<Word>(
      "SELECT * FROM words ORDER BY createdAt DESC"
    );
  } catch (e) {
    console.error("Erro ao obter palavras:", e);
    throw e;
  }
}

// --- Funções para Delta Sync ---

export interface LocalChanges {
  decks: Deck[];
  words: Word[];
  user_metadata: { key: string; value: string; updated_at: string }[];
  unlocked_achievements: {
    achievement_id: string;
    unlocked_at: string;
    updated_at: string;
    is_deleted: number;
  }[];
  practice_history: PracticeHistory[];
  practice_log: PracticeLog[];
  level_up_history: LevelUpRecord[];
  daily_active_goals: DailyActiveGoal[];
}

/**
 * Obtém todos os registos locais que foram modificados desde o último timestamp de sincronização.
 */
export async function getLocalChanges(
  timestamp: string
): Promise<LocalChanges> {
  const [
    decks,
    words,
    user_metadata,
    unlocked_achievements,
    practice_history,
    practice_log,
    level_up_history,
    daily_active_goals,
  ] = await Promise.all([
    db.getAllAsync<Deck>("SELECT * FROM decks WHERE updated_at > ?", [
      timestamp,
    ]),
    db.getAllAsync<Word>("SELECT * FROM words WHERE updated_at > ?", [
      timestamp,
    ]),
    db.getAllAsync<any>("SELECT * FROM user_metadata WHERE updated_at > ?", [
      timestamp,
    ]),
    db.getAllAsync<any>(
      "SELECT * FROM unlocked_achievements WHERE updated_at > ?",
      [timestamp]
    ),
    db.getAllAsync<PracticeHistory>(
      "SELECT * FROM practice_history WHERE updated_at > ?",
      [timestamp]
    ),
    db.getAllAsync<PracticeLog>(
      "SELECT * FROM practice_log WHERE updated_at > ?",
      [timestamp]
    ),
    db.getAllAsync<LevelUpRecord>(
      "SELECT * FROM level_up_history WHERE updated_at > ?",
      [timestamp]
    ),
    db.getAllAsync<DailyActiveGoal>(
      "SELECT * FROM daily_active_goals WHERE updated_at > ?",
      [timestamp]
    ),
  ]);

  return {
    decks,
    words,
    user_metadata,
    unlocked_achievements,
    practice_history,
    practice_log,
    level_up_history,
    daily_active_goals,
  };
}

export async function getWordsOfDeck(deckId: string): Promise<Word[]> {
  try {
    return await db.getAllAsync<Word>(
      "SELECT * FROM words WHERE deckId = ? ORDER BY createdAt",
      [deckId]
    );
  } catch (e) {
    console.error("Erro ao obter palavras do deck:", e);
    throw e;
  }
}

export async function getWordById(id: string): Promise<Word | null> {
  try {
    return await db.getFirstAsync<Word>("SELECT * FROM words WHERE id = ?", [
      id,
    ]);
  } catch (e) {
    console.error("Erro ao obter palavra por id:", e);
    throw e;
  }
}

export async function addWord(
  deckId: string,
  name: string,
  meaning: string,
  category: string | null
): Promise<Word> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    const newId = Crypto.randomUUID();
    const result = await db.getFirstAsync<Word>(
      "INSERT INTO words (id, deckId, name, meaning, category, nextReviewDate) VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) RETURNING *",
      [newId, deckId, name, meaning, category]
    );
    if (!result) {
      throw new Error("Falha ao adicionar palavra e obter o resultado.");
    }
    return result;
  } catch (e) {
    console.error("Erro ao adicionar a palavra:", e);
    throw e;
  }
}

export async function updateWord(
  id: string,
  name: string,
  meaning: string,
  category: string | null
): Promise<void> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    await db.runAsync(
      "UPDATE words SET name = ?, meaning = ?, category = ? WHERE id = ?",
      [name, meaning, category, id]
    );
  } catch (e) {
    console.error("Erro ao atualizar palavra:", e);
    throw e;
  }
}

export async function toggleWordFavoriteStatus(
  id: string
): Promise<Word | null> {
  try {
    // 1. Obter o estado atual do favorito
    const currentWord = await getWordById(id);
    if (!currentWord) return null;

    const newFavoriteStatus = currentWord.isFavorite === 1 ? 0 : 1;
    // 2. Inverter o estado
    await db.runAsync("UPDATE words SET isFavorite = ? WHERE id = ?", [
      newFavoriteStatus,
      id,
    ]);
    // 3. Retornar a palavra atualizada
    return await getWordById(id);
  } catch (e) {
    console.error("Erro ao alterar estado de favorito da palavra:", e);
    throw e;
  }
}

export async function updateWordDetails(
  id: string,
  category: string | null,
  synonyms: string[],
  antonyms: string[],
  sentences: string[]
): Promise<void> {
  try {
    await db.runAsync(
      "UPDATE words SET category = ?, synonyms = ?, antonyms = ?, sentences = ? WHERE id = ?",
      [
        category,
        JSON.stringify(synonyms),
        JSON.stringify(antonyms),
        JSON.stringify(sentences),
        id,
      ]
    );
  } catch (e) {
    console.error("Erro ao atualizar detalhes da palavra:", e);
    throw e;
  }
}

export async function deleteWord(id: string): Promise<void> {
  try {
    // SOFT DELETE: Em vez de apagar, marcamos a palavra como apagada.
    // O trigger que criámos irá atualizar o `updated_at` automaticamente.
    await db.runAsync("UPDATE words SET is_deleted = 1 WHERE id = ?", [id]);
  } catch (e) {
    console.error("Erro ao apagar palavra:", e);
    throw e;
  }
}

/**
 * Insere múltiplos decks na base de dados local.
 * Usado pelo syncService para popular a BD após o download da nuvem.
 * @param decks Array de objetos de Deck a inserir.
 */
export async function bulkInsertDecks(
  decks: (Deck & { updated_at: string; is_deleted: number })[]
): Promise<void> {
  if (decks.length === 0) return;
  try {
    // Usamos ON CONFLICT para evitar erros se um deck com o mesmo ID já existir,
    // substituindo-o. Isto torna a função de download mais robusta.
    for (const deck of decks) {
      await db.runAsync(
        "INSERT OR REPLACE INTO decks (id, title, author, createdAt, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
        [
          deck.id,
          deck.title,
          deck.author,
          deck.createdAt,
          deck.updated_at,
          deck.is_deleted,
        ]
      );
    }
  } catch (e) {
    console.error("Erro ao inserir decks em massa:", e);
    throw e;
  }
}

/**
 * Insere múltiplas palavras na base de dados local.
 * Usado pelo syncService para popular a BD após o download da nuvem.
 * @param words Array de objetos de Word a inserir.
 */
export async function bulkInsertWords(
  words: (Word & { updated_at: string; is_deleted: number })[]
): Promise<void> {
  if (words.length === 0) return;
  try {
    for (const word of words) {
      // A query completa com todos os campos para garantir a inserção correta.
      await db.runAsync(
        `INSERT OR REPLACE INTO words (id, deckId, name, meaning, timesTrained, timesCorrect, timesIncorrect, lastTrained, lastAnswerCorrect, masteryLevel, nextReviewDate, createdAt, category, synonyms, antonyms, sentences, isFavorite, masteredAt, easinessFactor, interval, repetitions, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          word.id,
          word.deckId,
          word.name,
          word.meaning,
          word.timesTrained,
          word.timesCorrect,
          word.timesIncorrect,
          word.lastTrained,
          word.lastAnswerCorrect,
          word.masteryLevel,
          word.nextReviewDate,
          word.createdAt,
          word.category,
          word.synonyms,
          word.antonyms,
          word.sentences,
          word.isFavorite,
          word.masteredAt,
          word.easinessFactor,
          word.interval,
          word.repetitions,
          word.updated_at,
          word.is_deleted,
        ]
      );
    }
  } catch (e) {
    console.error("Erro ao inserir palavras em massa:", e);
    throw e;
  }
}

/**
 * Insere o histórico de subida de nível em massa. Usado no download.
 */
export async function bulkInsertLevelUpHistory(
  history: LevelUpRecord[]
): Promise<void> {
  if (history.length === 0) return;
  for (const record of history) {
    await db.runAsync(
      "INSERT OR REPLACE INTO level_up_history (level, unlocked_at, updated_at, is_deleted) VALUES (?, ?, ?, ?)",
      [record.level, record.unlocked_at, record.updated_at, record.is_deleted]
    );
  }
}

/**
 * Insere as conquistas desbloqueadas em massa. Usado no download.
 */
export async function bulkInsertUnlockedAchievements(
  achievements: {
    achievement_id: string;
    unlocked_at: string;
    updated_at: string;
    is_deleted: number;
  }[]
): Promise<void> {
  if (achievements.length === 0) return;
  for (const achievement of achievements) {
    await db.runAsync(
      "INSERT OR REPLACE INTO unlocked_achievements (achievement_id, unlocked_at, updated_at, is_deleted) VALUES (?, ?, ?, ?)",
      [
        achievement.achievement_id,
        achievement.unlocked_at,
        achievement.updated_at,
        achievement.is_deleted,
      ]
    );
  }
}

export async function getWordsForPractice(
  deckId?: string,
  limit?: number
): Promise<Word[]> {
  try {
    // Seleciona palavras cuja data de revisão já passou
    // e ordena pela data de revisão mais antiga para priorizar as mais urgentes.
    const query = `
      SELECT * FROM words
      WHERE nextReviewDate <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ${deckId ? "AND deckId = ?" : ""}
      ORDER BY nextReviewDate ASC
      ${limit ? "LIMIT ?" : ""};
    `;
    const params: (string | number)[] = deckId ? [deckId] : [];
    if (limit) {
      params.push(limit);
    }
    return await db.getAllAsync<Word>(query, params);
  } catch (e) {
    console.error("Erro ao obter palavras para praticar:", e);
    throw e;
  }
}

/**
 * Insere o histórico de prática em massa. Usado no download.
 */
export async function bulkInsertPracticeHistory(
  history: (PracticeHistory & { updated_at: string })[]
): Promise<void> {
  if (history.length === 0) return;
  for (const record of history) {
    await db.runAsync(
      "INSERT OR REPLACE INTO practice_history (date, words_trained, updated_at) VALUES (?, ?, ?)",
      [record.date, record.words_trained, record.updated_at]
    );
  }
}

/**
 * Insere o log de prática em massa. Usado no download.
 */
export async function bulkInsertPracticeLog(
  logs: PracticeLog[]
): Promise<void> {
  if (logs.length === 0) return;
  for (const record of logs) {
    await db.runAsync(
      "INSERT OR REPLACE INTO practice_log (id, word_id, practice_date, was_correct, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
      [
        record.id,
        record.word_id,
        record.practice_date,
        record.was_correct,
        record.updated_at,
        record.is_deleted,
      ]
    );
  }
}

/**
 * Insere as metas diárias em massa. Usado no download.
 */
export async function bulkInsertDailyActiveGoals(
  goals: DailyActiveGoal[]
): Promise<void> {
  if (goals.length === 0) return;
  for (const record of goals) {
    await db.runAsync(
      "INSERT OR REPLACE INTO daily_active_goals (date, goal_ids, updated_at, is_deleted) VALUES (?, ?, ?, ?)",
      [record.date, record.goal_ids, record.updated_at, record.is_deleted]
    );
  }
}

/**
 * Insere ou atualiza múltiplos metadados do perfil em massa.
 * Usado no download dos dados do perfil.
 */
export async function bulkSetMetaValues(
  metadata: { key: string; value: string }[]
): Promise<void> {
  if (metadata.length === 0) return;
  for (const item of metadata) {
    await db.runAsync(
      "INSERT OR REPLACE INTO user_metadata (key, value) VALUES (?, ?)",
      [item.key, item.value]
    );
  }
}

export async function countWordsForPractice(deckId?: string): Promise<number> {
  try {
    const query = `
      SELECT COUNT(*) as count FROM words
      WHERE nextReviewDate <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ${deckId ? "AND deckId = ?" : ""}
    `;
    const params = deckId ? [deckId] : [];
    const result = await db.getFirstAsync<{ count: number }>(query, params);
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras para praticar:", e);
    throw e;
  }
}

export async function getLeastPracticedWords(
  deckId?: string,
  limit?: number,
  excludeIds: string[] = []
): Promise<Word[]> {
  try {
    let whereClause = deckId ? "WHERE deckId = ?" : "WHERE 1=1";
    if (excludeIds.length > 0) {
      const placeholders = excludeIds.map(() => "?").join(",");
      whereClause += ` AND id NOT IN (${placeholders})`;
    }

    const query = `
      SELECT * FROM words
      ${whereClause}
      ORDER BY easinessFactor ASC, lastTrained ASC
      ${limit ? "LIMIT ?" : ""};
    `;
    const params: (string | number)[] = deckId ? [deckId] : [];
    params.push(...excludeIds);
    if (limit) {
      params.push(limit);
    }
    return await db.getAllAsync<Word>(query, params);
  } catch (e) {
    console.error("Erro ao obter palavras menos praticadas:", e);
    throw e;
  }
}

export async function getRandomWords(
  limit: number,
  deckId?: string,
  excludeIds: string[] = []
): Promise<Word[]> {
  try {
    let whereClause = deckId ? "WHERE deckId = ?" : "WHERE 1=1";
    if (excludeIds.length > 0) {
      const placeholders = excludeIds.map(() => "?").join(",");
      whereClause += ` AND id NOT IN (${placeholders})`;
    }

    const query = `
      SELECT * FROM words
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT ?;
    `;
    const params: (string | number)[] = deckId ? [deckId] : [];
    params.push(...excludeIds, limit);
    return await db.getAllAsync<Word>(query, params);
  } catch (e) {
    console.error("Erro ao obter palavras aleatórias:", e);
    throw e;
  }
}

export async function getWrongWords(): Promise<Word[]> {
  try {
    // Recolhe todas as palavras cuja última resposta foi incorreta (0).
    const query = `
      SELECT * FROM words
      WHERE lastAnswerCorrect = 0
      ORDER BY lastTrained ASC;
    `;
    return await db.getAllAsync<Word>(query);
  } catch (e) {
    console.error("Erro ao obter palavras erradas:", e);
    throw e;
  }
}

export async function countWrongWords(): Promise<number> {
  try {
    const query =
      "SELECT COUNT(*) as count FROM words WHERE lastAnswerCorrect = 0";
    const result = await db.getFirstAsync<{ count: number }>(query);
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras erradas:", e);
    throw e;
  }
}

export async function getFavoriteWords(): Promise<Word[]> {
  try {
    const query = `
      SELECT * FROM words
      WHERE isFavorite = 1
      ORDER BY lastTrained ASC;
    `;
    return await db.getAllAsync<Word>(query);
  } catch (e) {
    console.error("Erro ao obter palavras favoritas:", e);
    throw e;
  }
}

export async function countFavoriteWords(): Promise<number> {
  try {
    const query = "SELECT COUNT(*) as count FROM words WHERE isFavorite = 1";
    const result = await db.getFirstAsync<{ count: number }>(query);
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras favoritas:", e);
    throw e;
  }
}

export async function getTotalWordCount(): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM words"
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar o total de palavras:", e);
    throw e;
  }
}

export async function updateWordStatsWithQuality(
  wordId: string,
  quality: number
): Promise<Word | null> {
  try {
    const word = await getWordById(wordId);
    if (!word) {
      console.warn(`Word with id ${wordId} not found for stat update.`);
      return null;
    }

    const { newEasinessFactor, newInterval, newRepetitions } =
      calculateSm2Factors(word, quality);

    const now = new Date();
    const nextReviewDate = addDays(now, newInterval);

    let masteredAtUpdate: string | null = word.masteredAt;
    // Determine mastery level based on repetitions
    let newMasteryLevel: Word["masteryLevel"] = "new";
    if (newRepetitions > 0 && newRepetitions <= 2) {
      newMasteryLevel = "learning";
    } else if (newRepetitions > 2) {
      newMasteryLevel = "mastered";
      // If it just became mastered and wasn't before, set the date
      if (word.masteryLevel !== "mastered") {
        masteredAtUpdate = now.toISOString();
      }
    }

    // Incrementa o contador de palavras praticadas para o dia atual.
    // Isto garante que a contagem é atualizada em tempo real, mesmo se o utilizador sair a meio da sessão.
    const todayStr = format(now, "yyyy-MM-dd");
    await db.runAsync(
      "INSERT INTO practice_history (date, words_trained) VALUES (?, 1) ON CONFLICT(date) DO UPDATE SET words_trained = words_trained + 1",
      [todayStr]
    );

    // Log the individual practice event in the new table
    await db.runAsync(
      `INSERT INTO practice_log (id, word_id, practice_date, was_correct) VALUES (?, ?, ?, ?);`,
      [Crypto.randomUUID(), wordId, now.toISOString(), quality >= 3 ? 1 : 0]
    );

    await db.runAsync(
      `UPDATE words SET
        timesTrained = timesTrained + 1,
        timesCorrect = timesCorrect + ?,
        timesIncorrect = timesIncorrect + ?,
        lastTrained = ?,
        lastAnswerCorrect = ?,
        easinessFactor = ?,
        interval = ?,
        repetitions = ?,
        nextReviewDate = ?,
        masteryLevel = ?,
        masteredAt = ?
       WHERE id = ?;`,
      [
        quality >= 3 ? 1 : 0,
        quality < 3 ? 1 : 0,
        now.toISOString(),
        quality >= 3 ? 1 : 0,
        newEasinessFactor,
        newInterval,
        newRepetitions,
        nextReviewDate.toISOString(),
        newMasteryLevel,
        masteredAtUpdate,
        wordId,
      ]
    );

    // Return the updated word
    return await getWordById(wordId);
  } catch (e) {
    console.error("Erro ao atualizar estatísticas da palavra com SM-2:", e);
    throw e;
  }
}

// --- Stats Functions ---

export type GlobalStats = {
  successRate: number;
  wordsMastered: number;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const result = await db.getFirstAsync<GlobalStats>(`
      SELECT
        COALESCE(SUM(timesCorrect) * 100.0 / SUM(timesTrained), 0) as successRate,
        (SELECT COUNT(*) FROM words WHERE masteryLevel = 'mastered') as wordsMastered
      FROM words
    `);
    return result || { successRate: 0, wordsMastered: 0 };
  } catch (e) {
    console.error("Erro ao obter estatísticas globais:", e);
    throw e;
  }
}

export type ChallengingWord = Word & {
  successRate: number;
};

export async function getChallengingWords(): Promise<ChallengingWord[]> {
  try {
    return await db.getAllAsync<ChallengingWord>(`
      SELECT
        *,
        (CAST(timesCorrect AS REAL) * 100 / timesTrained) as successRate
      FROM words
      WHERE
        timesTrained > 2 AND
        (CAST(timesCorrect AS REAL) / timesTrained) < 0.8
      ORDER BY successRate ASC, timesIncorrect DESC, lastTrained ASC
      LIMIT 10
    `);
  } catch (e) {
    console.error("Erro ao obter palavras desafiadoras:", e);
    throw e;
  }
}

export type UserPracticeMetrics = {
  longestStreak: number;
  consecutiveDays: number;
};

export async function getUserPracticeMetrics(): Promise<UserPracticeMetrics> {
  try {
    const [longestStreak, consecutiveDays] = await Promise.all([
      getMetaValue("longest_streak", "0"),
      getMetaValue("consecutive_days", "0"),
    ]);

    return {
      longestStreak: parseInt(longestStreak ?? "0", 10),
      consecutiveDays: parseInt(consecutiveDays ?? "0", 10),
    };
  } catch (e) {
    console.error("Erro ao obter métricas de prática do utilizador:", e);
    throw e;
  }
}

export async function getPracticeHistory(): Promise<PracticeHistory[]> {
  try {
    return await db.getAllAsync<PracticeHistory>(
      "SELECT date, words_trained FROM practice_history ORDER BY date ASC"
    );
  } catch (e) {
    console.error("Erro ao obter histórico de prática:", e);
    throw e;
  }
}

export async function updateUserPracticeMetrics(
  sessionStreak: number,
  deckId?: string
): Promise<void> {
  try {
    const currentLongestStreak = parseInt(
      (await getMetaValue("longest_streak", "0")) ?? "0",
      10
    );
    // A streak é verificada e reiniciada no arranque da app. Aqui apenas a incrementamos.
    const currentConsecutiveDays = parseInt(
      (await getMetaValue("consecutive_days", "0")) ?? "0",
      10
    );
    const lastPracticeDateStr = await getMetaValue("last_practice_date", "");

    const today = startOfDay(new Date());
    const lastPracticeDate = lastPracticeDateStr
      ? startOfDay(new Date(lastPracticeDateStr))
      : null;

    let newConsecutiveDays = currentConsecutiveDays;
    // Só incrementa a streak se a última prática não foi hoje.
    if (!lastPracticeDate || !isToday(lastPracticeDate)) {
      newConsecutiveDays = currentConsecutiveDays + 1;
    }

    const newLongestStreak = Math.max(currentLongestStreak, sessionStreak);

    await Promise.all([
      setMetaValue("longest_streak", newLongestStreak.toString()),
      setMetaValue("consecutive_days", newConsecutiveDays.toString()),
      setMetaValue("last_practice_date", today.toISOString()),
    ]);
    if (deckId) {
      await setMetaValue("last_practiced_deck_id", deckId);
    }
  } catch (e) {
    console.error("Erro ao atualizar métricas de prática do utilizador:", e);
    throw e;
  }
}

export async function getAchievementsCount(): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM unlocked_achievements"
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar conquistas:", e);
    throw e;
  }
}

/**
 * Representa um resumo detalhado das estatísticas do utilizador para a semana passada,
 * incluindo dados comparativos com a semana anterior.
 */
export interface WeeklySummary {
  weeklyXpGained: number;
  wordsLearned: number;
  wordsTrained: number;
  practiceDaysCount: number;
  practiceDays: boolean[]; // Array de 7 booleans, de Segunda a Domingo
  achievementsUnlockedCount: number;
  unlockedAchievements: { id: string; name: string; icon: IconName }[];
  mostProductiveDay: { date: string; wordsTrained: number } | null;
  mostTrainedWord: { name: string; timesTrained: number } | null;
  mostChallengingWord: { name: string; timesIncorrect: number } | null;
  weeklySuccessRate: number;
  wordsMasteredThisWeek: number;
  longestStreakThisWeek: number;
  comparison: {
    wordsTrained: number;
    practiceDaysCount: number;
  } | null;
  leaguePerformance: {
    finalRank: number;
    result: "promoted" | "demoted" | "maintained";
    leagueName: string;
  } | null;
}

export async function getWeeklySummaryStats(): Promise<WeeklySummary> {
  try {
    const now = new Date();
    // Define os intervalos de tempo para a semana passada e a semana anterior a essa.
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfLastWeek = addDays(startOfCurrentWeek, -7);
    const startOfWeekBeforeLast = addDays(startOfLastWeek, -7);

    const startOfCurrentWeekStr = format(startOfCurrentWeek, "yyyy-MM-dd");
    const startOfLastWeekStr = format(startOfLastWeek, "yyyy-MM-dd");
    const startOfWeekBeforeLastStr = format(
      startOfWeekBeforeLast,
      "yyyy-MM-dd"
    );

    // --- Queries para a SEMANA PASSADA ---
    const [
      lastWeekPractice,
      lastWeekLearned,
      lastWeekPracticeDaysCount,
      lastWeekPracticeDates,
      lastWeekAchievementIds,
      mostProductiveDay,
      mostTrainedWord,
      mostChallengingWord,
      lastWeekPracticeLogs,
      lastWeekMasteredWords,
      lastWeekFinalXp,
      // Novos dados para a liga
      lastWeekFinalRank,
      lastWeekLeagueResult,
      lastWeekLeagueName,
    ] = await Promise.all([
      db.getFirstAsync<{ total: number }>(
        `SELECT SUM(words_trained) as total FROM practice_history WHERE date >= ? AND date < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM words WHERE date(createdAt) >= ? AND date(createdAt) < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(DISTINCT date) as total FROM practice_history WHERE date >= ? AND date < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getAllAsync<{ date: string }>(
        `SELECT date FROM practice_history WHERE date >= ? AND date < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getAllAsync<{ achievement_id: string }>(
        `SELECT achievement_id FROM unlocked_achievements WHERE date(unlocked_at) >= ? AND date(unlocked_at) < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ date: string; words_trained: number }>(
        `SELECT date, words_trained FROM practice_history WHERE date >= ? AND date < ? ORDER BY words_trained DESC LIMIT 1`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ name: string; timesTrained: number }>(
        `SELECT w.name, COUNT(pl.word_id) as timesTrained
         FROM practice_log pl JOIN words w ON w.id = pl.word_id
         WHERE pl.practice_date >= ? AND pl.practice_date < ?
         GROUP BY pl.word_id ORDER BY timesTrained DESC LIMIT 1;`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ name: string; timesIncorrect: number }>(
        `SELECT w.name, COUNT(pl.word_id) as timesIncorrect
         FROM practice_log pl JOIN words w ON w.id = pl.word_id
         WHERE pl.practice_date >= ? AND pl.practice_date < ? AND pl.was_correct = 0
         GROUP BY pl.word_id ORDER BY timesIncorrect DESC LIMIT 1;`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getAllAsync<{ was_correct: number }>(
        `SELECT was_correct FROM practice_log WHERE practice_date >= ? AND practice_date < ? ORDER BY id ASC`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM words WHERE date(masteredAt) >= ? AND date(masteredAt) < ?`,
        [startOfLastWeekStr, startOfCurrentWeekStr]
      ),
      getMetaValue("last_week_final_xp", "0"),
      // Obter os novos dados da liga
      getMetaValue("last_week_final_rank", "0"),
      getMetaValue("last_week_league_result", "maintained"),
      getMetaValue("last_week_league_name", ""),
    ]);

    // --- Queries para a SEMANA ANTERIOR (para comparação) ---
    const [prevWeekPractice, prevWeekPracticeDays] = await Promise.all([
      db.getFirstAsync<{ total: number }>(
        `SELECT SUM(words_trained) as total FROM practice_history WHERE date >= ? AND date < ?`,
        [startOfWeekBeforeLastStr, startOfLastWeekStr]
      ),
      db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(DISTINCT date) as total FROM practice_history WHERE date >= ? AND date < ?`,
        [startOfWeekBeforeLastStr, startOfLastWeekStr]
      ),
    ]);

    // Processar os dias de prática para um array de booleans
    const practiceDaysArray = Array(7).fill(false);
    const practicedDates = new Set(
      lastWeekPracticeDates.map((d) => new Date(d.date).getUTCDay())
    );
    // Mapear de Domingo (0) -> 6, Segunda (1) -> 0, etc.
    practicedDates.forEach((dayIndex) => {
      const adjustedIndex = (dayIndex + 6) % 7; // Converte Domingo (0) para 6, Segunda (1) para 0, etc.
      practiceDaysArray[adjustedIndex] = true;
    });

    // Mapear os IDs das conquistas para os objetos completos
    const achievementMap = new Map(achievements.map((a) => [a.id, a]));
    const unlockedAchievementsDetails = lastWeekAchievementIds
      .map((record) => {
        const achievement = achievementMap.get(record.achievement_id);
        return achievement
          ? {
              id: achievement.id,
              name: achievement.title,
              icon: achievement.icon,
            }
          : null;
      })
      .filter((a): a is { id: string; name: string; icon: IconName } => !!a);

    // Calcular taxa de sucesso e maior streak da semana
    let weeklySuccessRate = 0;
    let longestStreakThisWeek = 0;
    if (lastWeekPracticeLogs && lastWeekPracticeLogs.length > 0) {
      const correctCount = lastWeekPracticeLogs.filter(
        (log) => log.was_correct === 1
      ).length;
      weeklySuccessRate = (correctCount / lastWeekPracticeLogs.length) * 100;

      let currentStreak = 0;
      for (const log of lastWeekPracticeLogs) {
        currentStreak = log.was_correct === 1 ? currentStreak + 1 : 0;
        if (currentStreak > longestStreakThisWeek) {
          longestStreakThisWeek = currentStreak;
        }
      }
    }

    // Processar os dados da liga
    const finalRank = parseInt(lastWeekFinalRank ?? "0", 10);
    const leagueName = lastWeekLeagueName ?? "";
    const leagueResult =
      (lastWeekLeagueResult as "promoted" | "demoted" | "maintained") ??
      "maintained";

    let leaguePerformance: WeeklySummary["leaguePerformance"] = null;
    // Só mostra o slide da liga se o utilizador teve uma classificação
    if (finalRank > 0 && leagueName) {
      leaguePerformance = {
        finalRank,
        result: leagueResult,
        leagueName,
      };
    }

    return {
      // Dados da semana passada
      weeklyXpGained: parseInt(lastWeekFinalXp ?? "0", 10),
      wordsLearned: lastWeekLearned?.total ?? 0,
      wordsTrained: lastWeekPractice?.total ?? 0,
      practiceDaysCount: lastWeekPracticeDaysCount?.total ?? 0,
      practiceDays: practiceDaysArray,
      achievementsUnlockedCount: unlockedAchievementsDetails.length,
      unlockedAchievements: unlockedAchievementsDetails,
      mostProductiveDay: mostProductiveDay
        ? {
            date: mostProductiveDay.date,
            wordsTrained: mostProductiveDay.words_trained,
          }
        : null,
      mostTrainedWord: mostTrainedWord,
      mostChallengingWord: mostChallengingWord,
      weeklySuccessRate: Math.round(weeklySuccessRate),
      wordsMasteredThisWeek: lastWeekMasteredWords?.total ?? 0,
      longestStreakThisWeek: longestStreakThisWeek,
      // Dados de comparação
      comparison: {
        wordsTrained: prevWeekPractice?.total ?? 0,
        practiceDaysCount: prevWeekPracticeDays?.total ?? 0,
      },
      leaguePerformance,
    };
  } catch (e) {
    console.error("Erro ao obter estatísticas do resumo semanal:", e);
    throw e;
  }
}

export async function getWordLearnedOnThisDay(): Promise<Word | null> {
  try {
    const now = new Date();
    const currentMonthDay = format(now, "MM-dd");
    const currentYear = format(now, "yyyy");

    const query = `
      SELECT * FROM words
      WHERE strftime('%m-%d', createdAt) = ?
        AND strftime('%Y', createdAt) < ?
      ORDER BY RANDOM()
      LIMIT 1;
    `;

    const result = await db.getFirstAsync<Word>(query, [
      currentMonthDay,
      currentYear,
    ]);
    return result;
  } catch (e) {
    console.error("Erro ao obter palavra 'Neste Dia':", e);
    throw e;
  }
}

export async function getTodaysPracticeStats(): Promise<PracticeHistory | null> {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return await db.getFirstAsync<PracticeHistory>(
      "SELECT date, words_trained FROM practice_history WHERE date = ?",
      [todayStr]
    );
  } catch (e) {
    console.error("Erro ao obter estatísticas de prática de hoje:", e);
    throw e;
  }
}

export async function getPracticeHistoryOnDate(
  date: string
): Promise<PracticeHistory | null> {
  try {
    return await db.getFirstAsync<PracticeHistory>(
      "SELECT date, words_trained FROM practice_history WHERE date = ?",
      [date]
    );
  } catch (e) {
    console.error("Erro ao obter estatísticas de prática da data:", e);
    throw e;
  }
}

export async function countWordsMasteredOnDate(date: string): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM words WHERE date(masteredAt) = ?",
      [date]
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras dominadas na data:", e);
    throw e;
  }
}

export type SessionCompletionType =
  | "favorite"
  | "wrong"
  | "flashcard"
  | "multiple-choice"
  | "writing"
  | "combine-lists";

// --- Funções para Métricas de Metas Diárias ---

export async function incrementPerfectRoundsToday(): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `perfect_rounds_${todayStr}`;
  try {
    const currentCount = parseInt((await getMetaValue(key, "0")) ?? "0", 10);
    await setMetaValue(key, (currentCount + 1).toString());
  } catch (e) {
    console.error("Erro ao incrementar rondas perfeitas:", e);
  }
}

export async function getPerfectRoundsToday(): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `perfect_rounds_${todayStr}`;
  try {
    return parseInt((await getMetaValue(key, "0")) ?? "0", 10);
  } catch (e) {
    console.error("Erro ao obter rondas perfeitas de hoje:", e);
    return 0;
  }
}

export async function incrementWordsAddedToday(): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `words_added_${todayStr}`;
  try {
    const currentCount = parseInt((await getMetaValue(key, "0")) ?? "0", 10);
    await setMetaValue(key, (currentCount + 1).toString());
  } catch (e) {
    console.error("Erro ao incrementar palavras adicionadas hoje:", e);
  }
}

export async function getWordsAddedToday(): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `words_added_${todayStr}`;
  try {
    return parseInt((await getMetaValue(key, "0")) ?? "0", 10);
  } catch (e) {
    console.error("Erro ao obter palavras adicionadas hoje:", e);
    return 0;
  }
}

export async function getWordsAddedOnDate(date: string): Promise<number> {
  const key = `words_added_${date}`;
  try {
    return parseInt((await getMetaValue(key, "0")) ?? "0", 10);
  } catch (e) {
    console.error(`Erro ao obter palavras adicionadas na data ${date}:`, e);
    return 0;
  }
}

export async function incrementDecksCreatedToday(): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `decks_created_${todayStr}`;
  try {
    const currentCount = parseInt((await getMetaValue(key, "0")) ?? "0", 10);
    await setMetaValue(key, (currentCount + 1).toString());
  } catch (e) {
    console.error("Erro ao incrementar decks criados hoje:", e);
  }
}

export async function getDecksCreatedToday(): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `decks_created_${todayStr}`;
  try {
    return parseInt((await getMetaValue(key, "0")) ?? "0", 10);
  } catch (e) {
    console.error("Erro ao obter decks criados hoje:", e);
    return 0;
  }
}

export async function countCorrectAnswersOnDate(date: string): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM practice_log WHERE practice_date = ? AND was_correct = 1",
      [date]
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar respostas corretas na data:", e);
    throw e;
  }
}

export async function getHighestStreakToday(): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `highest_streak_${todayStr}`;
  try {
    return parseInt((await getMetaValue(key, "0")) ?? "0", 10);
  } catch (e) {
    console.error("Erro ao obter a maior sequência de hoje:", e);
    return 0;
  }
}

export async function updateHighestStreakToday(
  currentStreak: number
): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `highest_streak_${todayStr}`;
  try {
    const highestToday = parseInt((await getMetaValue(key, "0")) ?? "0", 10);
    if (currentStreak > highestToday) {
      await setMetaValue(key, currentStreak.toString());
    }
  } catch (e) {
    console.error("Erro ao atualizar a maior sequência de hoje:", e);
  }
}

export async function getNotifiedGoalIdsToday(): Promise<string[]> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `notified_goals_${todayStr}`;
  try {
    const value = await getMetaValue(key, "[]");
    return JSON.parse(value ?? "[]");
  } catch (e) {
    console.error("Erro ao obter IDs de metas notificadas hoje:", e);
    return [];
  }
}

export async function addNotifiedGoalIdToday(goalId: string): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `notified_goals_${todayStr}`;
  try {
    const currentIds = await getNotifiedGoalIdsToday();
    if (!currentIds.includes(goalId)) {
      const newIds = [...currentIds, goalId];
      await setMetaValue(key, JSON.stringify(newIds));
    }
  } catch (e) {
    console.error("Erro ao adicionar ID de meta notificada hoje:", e);
  }
}

export async function setSessionCompletedToday(
  type: SessionCompletionType
): Promise<void> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `completed_${type}_session_${todayStr}`;
  await setMetaValue(key, "true");
}

export async function getSessionCompletedToday(
  type: SessionCompletionType
): Promise<boolean> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const key = `completed_${type}_session_${todayStr}`;
  const value = await getMetaValue(key, "false");
  return value === "true";
}

// --- Daily Goal Functions ---

export async function getTodaysActiveGoalIds(): Promise<string[] | null> {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const result = await db.getFirstAsync<{ goal_ids: string }>(
      "SELECT goal_ids FROM daily_active_goals WHERE date = ?",
      [todayStr]
    );

    return result ? JSON.parse(result.goal_ids) : null;
  } catch (e) {
    console.error("Erro ao obter IDs das metas diárias ativas:", e);
    throw e;
  }
}

export async function getAchievementsUnlockedOnDate(
  date: string
): Promise<string[]> {
  try {
    const results = await db.getAllAsync<{ achievement_id: string }>(
      "SELECT achievement_id FROM unlocked_achievements WHERE date(unlocked_at) = ?",
      [date]
    );
    return results.map((r) => r.achievement_id);
  } catch (e) {
    console.error("Erro ao obter conquistas desbloqueadas na data:", e);
    throw e;
  }
}

export async function setTodaysActiveGoalIds(goalIds: string[]): Promise<void> {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    await db.runAsync(
      "INSERT OR REPLACE INTO daily_active_goals (date, goal_ids) VALUES (?, ?)",
      [todayStr, JSON.stringify(goalIds)]
    );
  } catch (e) {
    console.error("Erro ao definir IDs das metas diárias ativas:", e);
    throw e;
  }
}

// --- Achievement Functions ---

export async function getUnlockedAchievementIds(): Promise<string[]> {
  try {
    const results = await db.getAllAsync<{ achievement_id: string }>(
      "SELECT achievement_id FROM unlocked_achievements"
    );
    return results.map((r) => r.achievement_id);
  } catch (e) {
    console.error("Erro ao obter conquistas desbloqueadas:", e);
    throw e;
  }
}

export async function unlockAchievements(
  achievementIds: string[]
): Promise<void> {
  if (achievementIds.length === 0) return;

  try {
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      for (const id of achievementIds) {
        // 1. Grava localmente com um timestamp explícito
        await db.runAsync(
          "INSERT OR IGNORE INTO unlocked_achievements (achievement_id, unlocked_at) VALUES (?, ?)",
          [id, now]
        );
      }
    });
  } catch (e) {
    console.error("Erro ao desbloquear conquistas:", e);
    throw e;
  }
}
