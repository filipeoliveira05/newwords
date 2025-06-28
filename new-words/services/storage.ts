import * as SQLite from "expo-sqlite";
import { Deck, Word } from "@/types/database";

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

// --- Stats Functions ---

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
