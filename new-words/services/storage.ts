import * as SQLite from "expo-sqlite";
import { Deck, Word } from "@/types/database";
import { startOfDay, isYesterday, isToday, format } from "date-fns";

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
            FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
        );
      `);

      // Schema Migration for existing users
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(words);"
      );
      const columnNames = columns.map((c) => c.name);

      // Columns with constant defaults, which are safe to add directly.
      const safeColumnsToAdd = [
        { name: "timesTrained", type: "INTEGER NOT NULL DEFAULT 0" },
        { name: "timesCorrect", type: "INTEGER NOT NULL DEFAULT 0" },
        { name: "timesIncorrect", type: "INTEGER NOT NULL DEFAULT 0" },
        { name: "lastTrained", type: "TEXT" },
        { name: "lastAnswerCorrect", type: "INTEGER" },
        { name: "masteryLevel", type: "TEXT NOT NULL DEFAULT 'new'" },
        { name: "category", type: "TEXT" },
        { name: "synonyms", type: "TEXT" }, // JSON array as string
        { name: "antonyms", type: "TEXT" }, // JSON array as string
        { name: "sentences", type: "TEXT" }, // JSON array as string
        { name: "isFavorite", type: "INTEGER NOT NULL DEFAULT 0" },
      ];

      for (const col of safeColumnsToAdd) {
        if (!columnNames.includes(col.name)) {
          await db.runAsync(
            `ALTER TABLE words ADD COLUMN ${col.name} ${col.type};`
          );
        }
      }

      // Handle the column with a non-constant default separately.
      // This is because older SQLite versions don't support non-constant defaults on ALTER TABLE.
      if (!columnNames.includes("nextReviewDate")) {
        // 1. Add the column allowing NULL values.
        await db.runAsync("ALTER TABLE words ADD COLUMN nextReviewDate TEXT;");
        // 2. Update existing rows to set a valid default value.
        await db.runAsync(
          "UPDATE words SET nextReviewDate = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE nextReviewDate IS NULL;"
        );
      }

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
    });
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
  meaning: string
): Promise<Word> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    const result = await db.getFirstAsync<Word>(
      // Define explicitamente a nextReviewDate para 'agora' no momento da inserção.
      // Isto garante que palavras novas são imediatamente elegíveis para prática.
      "INSERT INTO words (deckId, name, meaning, nextReviewDate) VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) RETURNING *",
      [deckId, name, meaning] // O valor da data é definido diretamente no SQL.
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

export async function getWordsForPractice(deckId?: number): Promise<Word[]> {
  try {
    // Seleciona palavras cuja data de revisão já passou
    // e ordena por prioridade: novas > em aprendizagem > dominadas,
    // e depois pela data de treino mais antiga.
    const query = `
      SELECT * FROM words
      WHERE nextReviewDate <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ${deckId ? "AND deckId = ?" : ""}
      ORDER BY
        CASE masteryLevel
          WHEN 'new' THEN 1
          WHEN 'learning' THEN 2
          WHEN 'mastered' THEN 3
        END,
        lastTrained ASC;
    `;
    const params = deckId ? [deckId] : [];
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
      ORDER BY lastTrained ASC, createdAt ASC
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

const getNextReviewDate = (level: Word["masteryLevel"]): string => {
  const date = new Date();
  if (level === "learning") date.setDate(date.getDate() + 1); // Review tomorrow
  else if (level === "mastered") date.setDate(date.getDate() + 3); // Review in 3 days
  return date.toISOString();
};

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
  wordId: number,
  wasCorrect: boolean
): Promise<Word | null> {
  try {
    await db.withTransactionAsync(async () => {
      const word = await db.getFirstAsync<Word>(
        "SELECT * FROM words WHERE id = ?",
        [wordId]
      );
      // Se a palavra não for encontrada, a transação simplesmente termina sem fazer nada.
      if (!word) {
        return;
      }

      let newMasteryLevel = word.masteryLevel;
      if (wasCorrect) {
        if (word.masteryLevel === "new") newMasteryLevel = "learning";
        else if (word.masteryLevel === "learning") newMasteryLevel = "mastered";
      } else {
        newMasteryLevel = "learning";
      }

      const nextReviewDate = getNextReviewDate(newMasteryLevel);

      // A transação apenas executa a atualização.
      await db.runAsync(
        `UPDATE words SET
          timesTrained = timesTrained + 1,
          timesCorrect = timesCorrect + ?,
          timesIncorrect = timesIncorrect + ?,
          lastTrained = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
          lastAnswerCorrect = ?,
          masteryLevel = ?,
          nextReviewDate = ?
         WHERE id = ?;`,
        [
          wasCorrect ? 1 : 0,
          wasCorrect ? 0 : 1,
          wasCorrect ? 1 : 0,
          newMasteryLevel,
          nextReviewDate,
          wordId,
        ]
      );
    });
    // Após a transação ser bem-sucedida, buscamos a palavra atualizada para a retornar.
    const updatedWord = await db.getFirstAsync<Word>(
      "SELECT * FROM words WHERE id = ?",
      [wordId]
    );
    return updatedWord;
  } catch (e) {
    console.error("Erro ao atualizar estatísticas da palavra:", e);
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
      WHERE timesTrained > 0
      ORDER BY successRate ASC, timesIncorrect DESC, lastTrained ASC
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
  } catch (e) {
    console.error("Erro ao atualizar métricas de prática do utilizador:", e);
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
