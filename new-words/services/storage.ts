import * as SQLite from "expo-sqlite";
import { Deck, Word } from "@/types/database";
import { startOfDay, isYesterday, isToday, format } from "date-fns";

const db = SQLite.openDatabaseSync("flashcards.db");

export const initializeDB = () => {
  try {
    db.execSync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY NOT NULL,
            deckId INTEGER NOT NULL,
            name TEXT NOT NULL,
            meaning TEXT NOT NULL,
            timesTrained INTEGER NOT NULL DEFAULT 0,
            timesCorrect INTEGER NOT NULL DEFAULT 0,
            timesIncorrect INTEGER NOT NULL DEFAULT 0,
            lastTrained TEXT,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_metadata (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS practice_history (
            date TEXT PRIMARY KEY NOT NULL,
            words_trained INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS unlocked_achievements (
            achievement_id TEXT PRIMARY KEY NOT NULL,
            unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
    `);
  } catch (e) {
    console.error("Erro ao inicializar a base de dados:", e);
    throw e;
  }
};

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
    await db.runAsync("DELETE FROM decks WHERE id = ?", [id]);
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

export async function addWord(
  deckId: number,
  name: string,
  meaning: string
): Promise<Word> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    const result = await db.getFirstAsync<Word>(
      "INSERT INTO words (deckId, name, meaning) VALUES (?, ?, ?) RETURNING *",
      [deckId, name, meaning]
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
  meaning: string
): Promise<void> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    await db.runAsync("UPDATE words SET name = ?, meaning = ? WHERE id = ?", [
      name,
      meaning,
      id,
    ]);
  } catch (e) {
    console.error("Erro ao atualizar palavra:", e);
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

export async function updateWordStats(
  correctWordIds: number[],
  incorrectWordIds: number[]
): Promise<void> {
  const allTrainedIds = [...new Set([...correctWordIds, ...incorrectWordIds])];
  if (allTrainedIds.length === 0) {
    return;
  }

  const now = new Date().toISOString();

  try {
    await db.withTransactionAsync(async () => {
      // Update all trained words (increment timesTrained and set lastTrained)
      if (allTrainedIds.length > 0) {
        const placeholders = allTrainedIds.map(() => "?").join(",");
        await db.runAsync(
          `UPDATE words SET timesTrained = timesTrained + 1, lastTrained = ? WHERE id IN (${placeholders})`,
          [now, ...allTrainedIds]
        );
      }

      // Increment timesCorrect for correct words
      if (correctWordIds.length > 0) {
        const placeholders = correctWordIds.map(() => "?").join(",");
        await db.runAsync(
          `UPDATE words SET timesCorrect = timesCorrect + 1 WHERE id IN (${placeholders})`,
          correctWordIds
        );
      }

      // Increment timesIncorrect for incorrect words
      if (incorrectWordIds.length > 0) {
        const placeholders = incorrectWordIds.map(() => "?").join(",");
        await db.runAsync(
          `UPDATE words SET timesIncorrect = timesIncorrect + 1 WHERE id IN (${placeholders})`,
          incorrectWordIds
        );
      }
    });
  } catch (e) {
    console.error("Erro ao atualizar estatísticas das palavras:", e);
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
        (SELECT COUNT(*) FROM words WHERE timesTrained >= 3 AND (CAST(timesCorrect AS REAL) / timesTrained) >= 0.9) as wordsMastered
      FROM words
    `);
    return result || { successRate: 0, wordsMastered: 0 };
  } catch (e) {
    console.error("Erro ao obter estatísticas globais:", e);
    throw e;
  }
}

export type ChallengingWord = {
  id: number;
  name: string;
  successRate: number;
};

export async function getChallengingWords(): Promise<ChallengingWord[]> {
  try {
    return await db.getAllAsync<ChallengingWord>(`
      SELECT
        id,
        name,
        (CAST(timesCorrect AS REAL) * 100 / timesTrained) as successRate
      FROM words
      WHERE timesTrained > 0
      ORDER BY successRate ASC, timesIncorrect DESC
      LIMIT 3
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

// A helper to get a single metadata value
async function getMetaValue(
  key: string,
  defaultValue: string
): Promise<string> {
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM user_metadata WHERE key = ?",
    [key]
  );
  return result?.value ?? defaultValue;
}

// A helper to set a single metadata value
async function setMetaValue(key: string, value: string): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO user_metadata (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function getUserPracticeMetrics(): Promise<UserPracticeMetrics> {
  try {
    const [longestStreak, consecutiveDays] = await Promise.all([
      getMetaValue("longest_streak", "0"),
      getMetaValue("consecutive_days", "0"),
    ]);

    return {
      longestStreak: parseInt(longestStreak, 10),
      consecutiveDays: parseInt(consecutiveDays, 10),
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
  wordsTrainedInSession: number
): Promise<void> {
  if (wordsTrainedInSession === 0) {
    return;
  }

  try {
    await db.withTransactionAsync(async () => {
      const currentLongestStreak = parseInt(
        await getMetaValue("longest_streak", "0"),
        10
      );
      const currentConsecutiveDays = parseInt(
        await getMetaValue("consecutive_days", "0"),
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

      // Atualiza o histórico de prática
      const todayStr = format(today, "yyyy-MM-dd");
      await db.runAsync(
        "INSERT INTO practice_history (date, words_trained) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET words_trained = words_trained + excluded.words_trained",
        [todayStr, wordsTrainedInSession]
      );

      await Promise.all([
        setMetaValue("longest_streak", newLongestStreak.toString()),
        setMetaValue("consecutive_days", newConsecutiveDays.toString()),
        setMetaValue("last_practice_date", today.toISOString()),
      ]);
    });
  } catch (e) {
    console.error("Erro ao atualizar métricas de prática do utilizador:", e);
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
