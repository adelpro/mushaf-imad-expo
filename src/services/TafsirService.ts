import * as SQLite from "expo-sqlite";

const TAFSIR_DB = "tafsir_cache.db";
const TAFSIR_TABLE = "tafsir_muyassar";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Quran.com API v4 — Tafsir Al-Muyassar (resource id 16)
const API_BASE = "https://api.quran.com/api/v4";
const TAFSIR_RESOURCE_ID = 16;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export interface TafsirEntry {
  chapterId: number;
  verseNumber: number;
  text: string;
}

type SQLiteDb = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

class TafsirService {
  private db: SQLiteDb | null = null;
  private initPromise: Promise<SQLiteDb> | null = null;

  private async getDb(): Promise<SQLiteDb> {
    if (this.db) return this.db;
    if (!this.initPromise) {
      this.initPromise = this.initDatabase()
        .then((db) => {
          this.db = db;
          return db;
        })
        .catch((e) => {
          this.initPromise = null;
          throw e;
        });
    }
    return this.initPromise;
  }

  private async initDatabase(): Promise<SQLiteDb> {
    const db = await SQLite.openDatabaseAsync(TAFSIR_DB);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TAFSIR_TABLE} (
        chapter_id INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        text TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        PRIMARY KEY (chapter_id, verse_number)
      )
    `);
    return db;
  }

  async getTafsir(
    chapterId: number,
    verseNumber: number,
  ): Promise<TafsirEntry | null> {
    if (chapterId < 1 || chapterId > 114 || verseNumber < 1) return null;

    // Try cache first
    const cached = await this.getFromCache(chapterId, verseNumber);
    if (cached) return cached;

    // Fetch from API
    const fetched = await this.fetchFromApi(chapterId, verseNumber);
    if (fetched) {
      await this.saveToCache(fetched);
      return fetched;
    }

    return null;
  }

  private async getFromCache(
    chapterId: number,
    verseNumber: number,
  ): Promise<TafsirEntry | null> {
    try {
      const db = await this.getDb();
      const row = await db.getFirstAsync<{
        chapter_id: number;
        verse_number: number;
        text: string;
      }>(
        `SELECT chapter_id, verse_number, text FROM ${TAFSIR_TABLE} WHERE chapter_id = ? AND verse_number = ? AND fetched_at > ?`,
        [chapterId, verseNumber, Date.now() - CACHE_TTL_MS],
      );

      if (row) {
        return {
          chapterId: row.chapter_id,
          verseNumber: row.verse_number,
          text: row.text,
        };
      }
    } catch (e) {
      console.warn("[TafsirService] Cache read failed:", e);
    }
    return null;
  }

  private async saveToCache(entry: TafsirEntry): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TAFSIR_TABLE} (chapter_id, verse_number, text, fetched_at) VALUES (?, ?, ?, ?)`,
        [entry.chapterId, entry.verseNumber, entry.text, Date.now()],
      );
    } catch (e) {
      console.warn("[TafsirService] Cache write failed:", e);
    }
  }

  private async fetchFromApi(
    chapterId: number,
    verseNumber: number,
  ): Promise<TafsirEntry | null> {
    const ayahKey = `${chapterId}:${verseNumber}`;
    const url = `${API_BASE}/tafsirs/${TAFSIR_RESOURCE_ID}/by_ayah/${ayahKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        console.warn(
          `[TafsirService] API returned ${response.status} for ${ayahKey}`,
        );
        return null;
      }

      const data = await response.json();
      const tafsirText = data?.tafsir?.text;

      if (typeof tafsirText === "string" && tafsirText.length > 0) {
        return {
          chapterId,
          verseNumber,
          text: stripHtml(tafsirText),
        };
      }

      return null;
    } catch (e) {
      console.warn("[TafsirService] API fetch failed:", e);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const tafsirService = new TafsirService();
