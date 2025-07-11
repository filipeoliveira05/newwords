import * as SQLite from "expo-sqlite";
import { Deck, Word } from "@/types/database";
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

const db = SQLite.openDatabaseSync("flashcards.db");

export const initializeDB = async () => {
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`PRAGMA foreign_keys = ON;`);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY NOT NULL,
            deckId INTEGER NOT NULL,
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
            easinessFactor REAL NOT NULL DEFAULT 2.5,
            interval INTEGER NOT NULL DEFAULT 0,
            repetitions INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
        );
      `);

      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS user_metadata (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS practice_history (
            date TEXT PRIMARY KEY NOT NULL,
            words_trained INTEGER NOT NULL DEFAULT 0
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS unlocked_achievements (
            achievement_id TEXT PRIMARY KEY NOT NULL,
            unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS daily_active_goals (
            date TEXT PRIMARY KEY NOT NULL,
            goal_ids TEXT NOT NULL
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
    });
  } catch (e) {
    console.error("Erro ao inicializar a base de dados:", e);
    throw e;
  }
};

export const deleteDatabase = async (): Promise<void> => {
  try {
    // Fecha a conexão com a base de dados se estiver aberta
    await db.closeAsync();

    const dbFilePath = `${FileSystem.documentDirectory}SQLite/flashcards.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbFilePath);
      console.log("Base de dados apagada com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao apagar a base de dados:", error);
  }
};

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
    xpForNextLevel = getXPForNextLevel(currentLevel);
  }

  await Promise.all([
    setMetaValue("user_xp", newXP.toString()),
    setMetaValue("user_level", currentLevel.toString()),
  ]);

  return { newXP, newLevel: currentLevel, didLevelUp };
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

export async function getDeckById(id: number): Promise<Deck | null> {
  try {
    return await db.getFirstAsync<Deck>("SELECT * FROM decks WHERE id = ?", [
      id,
    ]);
  } catch (e) {
    console.error("Erro ao obter deck por id:", e);
    throw e;
  }
}

export async function getWordCountByDeck(deckId: number): Promise<number> {
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
  deckId: number
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
    const result = await db.getFirstAsync<Deck>(
      "INSERT INTO decks (title, author) VALUES (?, ?) RETURNING *",
      [title, author]
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
  id: number,
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

export async function deleteDeck(id: number): Promise<void> {
  try {
    // Usa uma transação para garantir que tanto as palavras como o deck são apagados.
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM words WHERE deckId = ?", [id]); // 1. Apaga as palavras associadas
      await db.runAsync("DELETE FROM decks WHERE id = ?", [id]); // 2. Apaga o deck
    });
  } catch (e) {
    console.error("Erro ao apagar deck:", e);
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

export async function getWordsOfDeck(deckId: number): Promise<Word[]> {
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

export async function getWordById(id: number): Promise<Word | null> {
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
  deckId: number,
  name: string,
  meaning: string,
  category: string | null
): Promise<Word> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    const result = await db.getFirstAsync<Word>(
      "INSERT INTO words (deckId, name, meaning, category, nextReviewDate) VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) RETURNING *",
      [deckId, name, meaning, category]
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
  id: number,
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
  id: number
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
  id: number,
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

export async function deleteWord(id: number): Promise<void> {
  try {
    await db.runAsync("DELETE FROM words WHERE id = ?", [id]);
  } catch (e) {
    console.error("Erro ao apagar palavra:", e);
    throw e;
  }
}

export async function getWordsForPractice(
  deckId?: number,
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

export async function countWordsForPractice(deckId?: number): Promise<number> {
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
  deckId?: number,
  limit?: number,
  excludeIds: number[] = []
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
  deckId?: number,
  excludeIds: number[] = []
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
  wordId: number,
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

    // Determine mastery level based on repetitions
    let newMasteryLevel: Word["masteryLevel"] = "new";
    if (newRepetitions > 0 && newRepetitions <= 2) {
      newMasteryLevel = "learning";
    } else if (newRepetitions > 2) {
      newMasteryLevel = "mastered";
    }

    // Incrementa o contador de palavras praticadas para o dia atual.
    // Isto garante que a contagem é atualizada em tempo real, mesmo se o utilizador sair a meio da sessão.
    const todayStr = format(now, "yyyy-MM-dd");
    await db.runAsync(
      "INSERT INTO practice_history (date, words_trained) VALUES (?, 1) ON CONFLICT(date) DO UPDATE SET words_trained = words_trained + 1",
      [todayStr]
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
        masteryLevel = ?
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

export type PracticeHistory = {
  date: string; // YYYY-MM-DD
  words_trained: number;
};

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
  deckId?: number
): Promise<void> {
  try {
    const currentLongestStreak = parseInt(
      (await getMetaValue("longest_streak", "0")) ?? "0",
      10
    );
    const currentConsecutiveDays = parseInt(
      (await getMetaValue("consecutive_days", "0")) ?? "0",
      10
    );
    const lastPracticeDateStr = await getMetaValue("last_practice_date", "");

    const today = startOfDay(new Date());
    const lastPracticeDate = lastPracticeDateStr
      ? startOfDay(new Date(lastPracticeDateStr))
      : null;

    let newConsecutiveDays = lastPracticeDate
      ? isYesterday(lastPracticeDate)
        ? currentConsecutiveDays + 1
        : isToday(lastPracticeDate)
        ? currentConsecutiveDays
        : 1
      : 1;

    const newLongestStreak = Math.max(currentLongestStreak, sessionStreak);

    await Promise.all([
      setMetaValue("longest_streak", newLongestStreak.toString()),
      setMetaValue("consecutive_days", newConsecutiveDays.toString()),
      setMetaValue("last_practice_date", today.toISOString()),
    ]);
    if (deckId) {
      await setMetaValue("last_practiced_deck_id", deckId.toString());
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

export interface WeeklySummaryStats {
  wordsLearned: number;
  wordsTrained: number;
}

export async function getWeeklySummaryStats(): Promise<WeeklySummaryStats> {
  try {
    const startOfThisWeek = format(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );

    const practiceResult = await db.getFirstAsync<{ total_trained: number }>(
      `SELECT SUM(words_trained) as total_trained FROM practice_history WHERE date >= ?`,
      [startOfThisWeek]
    );

    const wordsResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM words WHERE date(createdAt) >= ?`,
      [startOfThisWeek]
    );

    return {
      wordsLearned: wordsResult?.count ?? 0,
      wordsTrained: practiceResult?.total_trained ?? 0,
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

export async function countWordsAddedOnDate(date: string): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM words WHERE date(createdAt) = ?",
      [date]
    );
    return result?.count ?? 0;
  } catch (e) {
    console.error("Erro ao contar palavras adicionadas na data:", e);
    throw e;
  }
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
    await db.withTransactionAsync(async () => {
      for (const id of achievementIds) {
        await db.runAsync(
          "INSERT OR IGNORE INTO unlocked_achievements (achievement_id) VALUES (?)",
          [id]
        );
      }
    });
  } catch (e) {
    console.error("Erro ao desbloquear conquistas:", e);
    throw e;
  }
}
