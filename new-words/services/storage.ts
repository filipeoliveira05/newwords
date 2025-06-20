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

export async function addDeck(title: string, author: string): Promise<number> {
  if (!title.trim() || !author.trim()) {
    throw new Error("Título e autor são obrigatórios.");
  }
  try {
    const result = await db.runAsync(
      "INSERT INTO decks (title, author) VALUES (?, ?)",
      [title, author]
    );
    return result.lastInsertRowId;
  } catch (e) {
    console.error("Erro ao adicionar deck:", e);
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
): Promise<number> {
  if (!name.trim() || !meaning.trim()) {
    throw new Error("Nome e significado são obrigatórios.");
  }
  try {
    const result = await db.runAsync(
      "INSERT INTO words (deckId, name, meaning) VALUES (?, ?, ?)",
      [deckId, name, meaning]
    );
    return result.lastInsertRowId;
  } catch (e) {
    console.error("Erro ao adicionar palavra:", e);
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
