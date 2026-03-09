import * as SQLite from "expo-sqlite";

export type Bookmark = {
  id: number;
  verseID: number;
  verseNumber: number;
  chapterId: number;
  chapterName: string;
  pageNumber: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type NewBookmark = Omit<Bookmark, "id" | "createdAt" | "updatedAt">;

type SQLiteDb = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

const BOOKMARKS_DB = "bookmarks.db";

class BookmarkService {
  private db: SQLiteDb | null = null;
  private initPromise: Promise<SQLiteDb> | null = null;

  private async getDb(): Promise<SQLiteDb> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.init().catch((err) => {
      this.initPromise = null;
      throw err;
    });
    this.db = await this.initPromise;
    return this.db;
  }

  private async init(): Promise<SQLiteDb> {
    const db = await SQLite.openDatabaseAsync(BOOKMARKS_DB);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verseID INTEGER NOT NULL,
        verseNumber INTEGER NOT NULL,
        chapterId INTEGER NOT NULL,
        chapterName TEXT NOT NULL,
        pageNumber INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    await db.execAsync(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks(verseID);",
    );

    return db;
  }

  async addBookmark(bookmark: NewBookmark): Promise<Bookmark> {
    const db = await this.getDb();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO bookmarks (verseID, verseNumber, chapterId, chapterName, pageNumber, note, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookmark.verseID,
        bookmark.verseNumber,
        bookmark.chapterId,
        bookmark.chapterName,
        bookmark.pageNumber,
        bookmark.note,
        now,
        now,
      ],
    );

    return {
      ...bookmark,
      id: result.lastInsertRowId,
      createdAt: now,
      updatedAt: now,
    };
  }

  async removeBookmark(verseID: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync("DELETE FROM bookmarks WHERE verseID = ?", [verseID]);
  }

  async updateNote(verseID: number, note: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      "UPDATE bookmarks SET note = ?, updatedAt = datetime('now') WHERE verseID = ?",
      [note, verseID],
    );
  }

  async getBookmark(verseID: number): Promise<Bookmark | null> {
    const db = await this.getDb();
    return db.getFirstAsync<Bookmark>(
      "SELECT * FROM bookmarks WHERE verseID = ?",
      [verseID],
    );
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = await this.getDb();
    return db.getAllAsync<Bookmark>(
      "SELECT * FROM bookmarks ORDER BY createdAt DESC",
    );
  }

  async isBookmarked(verseID: number): Promise<boolean> {
    const bookmark = await this.getBookmark(verseID);
    return bookmark !== null;
  }

  async toggleBookmark(bookmark: NewBookmark): Promise<boolean> {
    const db = await this.getDb();
    const now = new Date().toISOString();
    let added = false;

    await db.withTransactionAsync(async () => {
      const deleted = await db.runAsync(
        "DELETE FROM bookmarks WHERE verseID = ?",
        [bookmark.verseID],
      );
      if (deleted.changes > 0) {
        added = false;
        return;
      }
      await db.runAsync(
        `INSERT INTO bookmarks (verseID, verseNumber, chapterId, chapterName, pageNumber, note, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookmark.verseID,
          bookmark.verseNumber,
          bookmark.chapterId,
          bookmark.chapterName,
          bookmark.pageNumber,
          bookmark.note,
          now,
          now,
        ],
      );
      added = true;
    });

    return added;
  }
}

export const bookmarkService = new BookmarkService();
