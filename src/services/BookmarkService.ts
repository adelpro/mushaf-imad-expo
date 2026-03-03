import * as SQLite from "expo-sqlite";
import type { Bookmark, CreateBookmarkInput } from "../types/Bookmark";

const DB_NAME = "user_data.db";

type SQLiteDb = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

class BookmarkService {
  private db: SQLiteDb | null = null;
  private initPromise: Promise<SQLiteDb> | null = null;

  async getDb(): Promise<SQLiteDb> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.initDatabase();
    try {
      this.db = await this.initPromise;
      return this.db;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  private async initDatabase(): Promise<SQLiteDb> {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER NOT NULL UNIQUE,
        chapter_id INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        page_number INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    await db
      .execAsync(
        "CREATE INDEX IF NOT EXISTS idx_bookmarks_verse_id ON bookmarks(verse_id);",
      )
      .catch((err) => console.warn("Failed to create verse_id index:", err));
    await db
      .execAsync(
        "CREATE INDEX IF NOT EXISTS idx_bookmarks_chapter_id ON bookmarks(chapter_id);",
      )
      .catch((err) => console.warn("Failed to create chapter_id index:", err));
    return db;
  }

  async addBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
    const db = await this.getDb();
    const existing = await this.getBookmarkByVerseId(input.verse_id);
    if (existing) return existing;

    const result = await db.runAsync(
      "INSERT INTO bookmarks (verse_id, chapter_id, verse_number, page_number, note) VALUES (?, ?, ?, ?, ?)",
      [
        input.verse_id,
        input.chapter_id,
        input.verse_number,
        input.page_number,
        input.note,
      ],
    );
    const bookmark = await db.getFirstAsync<Bookmark>(
      "SELECT * FROM bookmarks WHERE id = ?",
      [result.lastInsertRowId],
    );
    if (!bookmark) {
      throw new Error(
        `Failed to retrieve bookmark after insert (id=${result.lastInsertRowId})`,
      );
    }
    return bookmark;
  }

  async getBookmarkByVerseId(verseId: number): Promise<Bookmark | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Bookmark>(
      "SELECT * FROM bookmarks WHERE verse_id = ?",
      [verseId],
    );
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = await this.getDb();
    return db.getAllAsync<Bookmark>(
      "SELECT * FROM bookmarks ORDER BY created_at DESC",
    );
  }

  async updateBookmarkNote(id: number, note: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      "UPDATE bookmarks SET note = ?, updated_at = datetime('now') WHERE id = ?",
      [note, id],
    );
  }

  async deleteBookmark(id: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync("DELETE FROM bookmarks WHERE id = ?", [id]);
  }
}

export const bookmarkService = new BookmarkService();
