import * as SQLite from "expo-sqlite";
import { Deck, Word } from "@/app/types/database";

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
  }
};

//FUNÇÕES CRUD

export function getDecks(): Deck[] {
  try {
    const result = db.getAllSync<Deck>(
      "SELECT * FROM decks ORDER BY createdAt DESC"
    );
    return result;
  } catch (e) {
    console.error("Erro ao obter decks:", e);
    return [];
  }
}

export function addDeck(title: string, author: string): number | null {
  if (!title.trim() || !author.trim()) {
    console.error("Título e autor são obrigatórios.");
    return null;
  }
  try {
    db.runSync("INSERT INTO decks (title, author) VALUES (?, ?)", [
      title,
      author,
    ]);
    const [{ id }] = db.getAllSync<{ id: number }>(
      "SELECT last_insert_rowid() as id"
    );
    return id;
  } catch (e) {
    console.error("Erro ao adicionar deck:", e);
    return null;
  }
}

export function updateDeck(id: number, title: string, author: string): boolean {
  if (!title.trim() || !author.trim()) {
    console.error("Título e autor são obrigatórios.");
    return false;
  }
  try {
    db.runSync("UPDATE decks SET title = ?, author = ? WHERE id = ?", [
      title,
      author,
      id,
    ]);
    return true;
  } catch (e) {
    console.error("Erro ao atualizar deck:", e);
    return false;
  }
}

export function deleteDeck(id: number): boolean {
  try {
    db.runSync("DELETE FROM decks WHERE id = ?", [id]);
    return true;
  } catch (e) {
    console.error("Erro ao apagar deck:", e);
    return false;
  }
}

export function getWordsByDeck(deckId: number): Word[] {
  try {
    const result = db.getAllSync<Word>(
      "SELECT * FROM words WHERE deckId = ? ORDER BY createdAt DESC",
      [deckId]
    );
    return result;
  } catch (e) {
    console.error("Erro ao obter palavras do deck:", e);
    return [];
  }
}

export function addWord(
  deckId: number,
  name: string,
  meaning: string
): number | null {
  if (!name.trim() || !meaning.trim()) {
    console.error("Nome e significado são obrigatórios.");
    return null;
  }
  try {
    db.runSync("INSERT INTO words (deckId, name, meaning) VALUES (?, ?, ?)", [
      deckId,
      name,
      meaning,
    ]);
    const [{ id }] = db.getAllSync<{ id: number }>(
      "SELECT last_insert_rowid() as id"
    );
    return id;
  } catch (e) {
    console.error("Erro ao adicionar palavra:", e);
    return null;
  }
}

export function updateWord(id: number, name: string, meaning: string): boolean {
  if (!name.trim() || !meaning.trim()) {
    console.error("Nome e significado são obrigatórios.");
    return false;
  }
  try {
    db.runSync("UPDATE words SET name = ?, meaning = ? WHERE id = ?", [
      name,
      meaning,
      id,
    ]);
    return true;
  } catch (e) {
    console.error("Erro ao atualizar palavra:", e);
    return false;
  }
}

export function deleteWord(id: number): boolean {
  try {
    db.runSync("DELETE FROM words WHERE id = ?", [id]);
    return true;
  } catch (e) {
    console.error("Erro ao apagar palavra:", e);
    return false;
  }
}
