import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";
import * as Asset from "expo-asset";

const DB_NAME = "quran.db";

type VerseMarker = {
  numberCodePoint: string | null;
  line: number | null;
  centerX: number | null;
  centerY: number | null;
};

type VerseHighlight = {
  line: number;
  left_position: number;
  right_position: number;
};

export type Chapter = {
  identifier: number;
  number: number;
  isMeccan: number;
  title: string;
  arabicTitle: string;
  englishTitle: string;
  titleCodePoint: string;
  searchableText: string | null;
  searchableKeywords: string | null;
};

export type Verse = {
  verseID: number;
  humanReadableID: string;
  number: number;
  text: string;
  textWithoutTashkil: string;
  uthmanicHafsText: string;
  hafsSmartText: string;
  searchableText: string;
  chapter_id: number | null;
  part_id: number | null;
  quarter_id: number | null;
  section_id: number | null;
  page1441_id: number | null;
  page1405_id: number | null;
  marker1441: VerseMarker;
  marker1405: VerseMarker;
  highlights1441: VerseHighlight[];
  highlights1405: VerseHighlight[];
};

export type Page = {
  identifier: number;
  number: number;
  isRight: boolean;
  header1441: {
    part_id: number | null;
    quarter_id: number | null;
  } | null;
  header1405: {
    part_id: number | null;
    quarter_id: number | null;
  } | null;
  chapterHeaders1441: Array<{
    id: number;
    chapter_id: number | null;
    line: number;
    centerX: number;
    centerY: number;
  }>;
  chapterHeaders1405: Array<{
    id: number;
    chapter_id: number | null;
    line: number;
    centerX: number;
    centerY: number;
  }>;
  verses1441: Verse[];
  verses1405: Verse[];
};

type VerseRow = Omit<
  Verse,
  "marker1441" | "marker1405" | "highlights1441" | "highlights1405"
> & {
  marker1441_numberCodePoint: string | null;
  marker1441_line: number | null;
  marker1441_centerX: number | null;
  marker1441_centerY: number | null;
  marker1405_numberCodePoint: string | null;
  marker1405_line: number | null;
  marker1405_centerX: number | null;
  marker1405_centerY: number | null;
};

type SQLiteDb = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

class DatabaseService {
  private db: SQLiteDb | null = null;
  private initPromise: Promise<SQLiteDb> | null = null;

  async getDb(): Promise<SQLiteDb> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initDatabase();
    this.db = await this.initPromise;
    return this.db;
  }

  private async initDatabase(): Promise<SQLiteDb> {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

    try {
      const dbInfo = await FileSystem.getInfoAsync(dbPath);

      if (dbInfo.exists) {
        const existingDb = await SQLite.openDatabaseAsync(DB_NAME);
        const chapterCount = await existingDb.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM chapters",
        );

        if (chapterCount && chapterCount.count > 0) {
          return existingDb;
        }

        await existingDb.closeAsync().catch(() => {});
        await FileSystem.deleteAsync(dbPath, { idempotent: true }).catch(
          () => {},
        );
      }

      const asset = Asset.Asset.fromModule(require("../../assets/quran.db"));
      await asset.downloadAsync();

      if (asset.localUri) {
        await FileSystem.deleteAsync(dbPath, { idempotent: true }).catch(
          () => {},
        );
        await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });

        return SQLite.openDatabaseAsync(DB_NAME);
      }

      const newDb = await SQLite.openDatabaseAsync(DB_NAME);
      await this.initializeDatabase(newDb);
      return newDb;
    } catch {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.runMigrations(db);
      return db;
    }
  }

  private async runMigrations(db: SQLiteDb): Promise<void> {
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='chapter_headers'",
    );

    if (!result || result.count === 0) {
      await this.initializeDatabase(db);
    } else {
      const pageColumns = await db.getFirstAsync<{ sql: string }>(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='pages'",
      );

      if (pageColumns && !pageColumns.sql.includes("header1441_part_id")) {
        await db
          .execAsync("ALTER TABLE pages ADD COLUMN header1441_part_id INTEGER")
          .catch(() => {});
        await db
          .execAsync(
            "ALTER TABLE pages ADD COLUMN header1441_quarter_id INTEGER",
          )
          .catch(() => {});
        await db
          .execAsync("ALTER TABLE pages ADD COLUMN header1405_part_id INTEGER")
          .catch(() => {});
        await db
          .execAsync(
            "ALTER TABLE pages ADD COLUMN header1405_quarter_id INTEGER",
          )
          .catch(() => {});
      }

      const verseHighlightsColumns = await db.getFirstAsync<{ sql: string }>(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='verse_highlights'",
      );

      if (
        verseHighlightsColumns &&
        !verseHighlightsColumns.sql.includes("id INTEGER PRIMARY KEY")
      ) {
        await db
          .execAsync(
            `
          CREATE TABLE IF NOT EXISTS verse_highlights_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            verse_id INTEGER NOT NULL,
            layout_type INTEGER NOT NULL,
            line INTEGER NOT NULL,
            left_position REAL NOT NULL,
            right_position REAL NOT NULL,
            FOREIGN KEY (verse_id) REFERENCES verses(verseID)
          )
        `,
          )
          .catch(() => {});
        await db
          .execAsync(
            `
          INSERT INTO verse_highlights_new (verse_id, layout_type, line, left_position, right_position)
          SELECT verse_id, layout_type, line, left_position, right_position FROM verse_highlights
        `,
          )
          .catch(() => {});
        await db.execAsync("DROP TABLE verse_highlights").catch(() => {});
        await db
          .execAsync(
            "ALTER TABLE verse_highlights_new RENAME TO verse_highlights",
          )
          .catch(() => {});
      }
    }
  }

  private async initializeDatabase(db: SQLiteDb): Promise<void> {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pages (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        isRight INTEGER NOT NULL DEFAULT 1
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chapters (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        isMeccan INTEGER NOT NULL DEFAULT 0,
        title TEXT NOT NULL,
        arabicTitle TEXT NOT NULL,
        englishTitle TEXT NOT NULL,
        titleCodePoint TEXT NOT NULL,
        searchableText TEXT,
        searchableKeywords TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS parts (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        arabicTitle TEXT NOT NULL,
        englishTitle TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quarters (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        hizbNumber INTEGER NOT NULL,
        hizbFraction INTEGER NOT NULL,
        arabicTitle TEXT NOT NULL,
        englishTitle TEXT NOT NULL,
        part_id INTEGER,
        FOREIGN KEY (part_id) REFERENCES parts(identifier)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS verses (
        verseID INTEGER PRIMARY KEY AUTOINCREMENT,
        humanReadableID TEXT NOT NULL,
        number INTEGER NOT NULL,
        text TEXT NOT NULL,
        textWithoutTashkil TEXT NOT NULL,
        uthmanicHafsText TEXT NOT NULL,
        hafsSmartText TEXT NOT NULL,
        searchableText TEXT NOT NULL,
        chapter_id INTEGER,
        part_id INTEGER,
        quarter_id INTEGER,
        section_id INTEGER,
        page1441_id INTEGER,
        page1405_id INTEGER,
        marker1441_numberCodePoint TEXT,
        marker1441_line INTEGER,
        marker1441_centerX REAL,
        marker1441_centerY REAL,
        marker1405_numberCodePoint TEXT,
        marker1405_line INTEGER,
        marker1405_centerX REAL,
        marker1405_centerY REAL,
        FOREIGN KEY (chapter_id) REFERENCES chapters(identifier),
        FOREIGN KEY (part_id) REFERENCES parts(identifier),
        FOREIGN KEY (quarter_id) REFERENCES quarters(identifier)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS page_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id INTEGER NOT NULL,
        part_id INTEGER,
        quarter_id INTEGER,
        layout_type INTEGER NOT NULL DEFAULT 1441,
        FOREIGN KEY (page_id) REFERENCES pages(identifier),
        FOREIGN KEY (part_id) REFERENCES parts(identifier),
        FOREIGN KEY (quarter_id) REFERENCES quarters(identifier)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chapter_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER,
        page_id INTEGER NOT NULL,
        line INTEGER NOT NULL,
        centerX REAL NOT NULL,
        centerY REAL NOT NULL,
        layout_type INTEGER NOT NULL DEFAULT 1441,
        FOREIGN KEY (chapter_id) REFERENCES chapters(identifier),
        FOREIGN KEY (page_id) REFERENCES pages(identifier)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS verse_highlights (
        line INTEGER NOT NULL,
        left_position REAL NOT NULL,
        right_position REAL NOT NULL,
        verse_id INTEGER NOT NULL,
        layout_type INTEGER NOT NULL DEFAULT 1441,
        FOREIGN KEY (verse_id) REFERENCES verses(verseID)
      );
    `);
  }

  async getPageByNumber(pageNumber: number): Promise<Page | null> {
    const db = await this.getDb();

    const pageResult = await db.getFirstAsync<{
      identifier: number;
      number: number;
      isRight: number;
    }>("SELECT * FROM pages WHERE number = ? LIMIT 1", [pageNumber]);

    if (!pageResult) {
      return null;
    }

    const pageId = pageResult.identifier;

    const [
      header1441,
      header1405,
      chapterHeaders1441,
      chapterHeaders1405,
      verses1441Result,
      verses1405Result,
    ] = await Promise.all([
      db.getFirstAsync<{
        id: number;
        part_id: number | null;
        quarter_id: number | null;
      }>(
        "SELECT * FROM page_headers WHERE page_id = ? AND layout_type = 1441 LIMIT 1",
        [pageId],
      ),
      db.getFirstAsync<{
        id: number;
        part_id: number | null;
        quarter_id: number | null;
      }>(
        "SELECT * FROM page_headers WHERE page_id = ? AND layout_type = 1405 LIMIT 1",
        [pageId],
      ),
      db.getAllAsync<{
        id: number;
        chapter_id: number | null;
        line: number;
        centerX: number;
        centerY: number;
      }>(
        "SELECT * FROM chapter_headers WHERE page_id = ? AND layout_type = 1441 ORDER BY line ASC",
        [pageId],
      ),
      db.getAllAsync<{
        id: number;
        chapter_id: number | null;
        line: number;
        centerX: number;
        centerY: number;
      }>(
        "SELECT * FROM chapter_headers WHERE page_id = ? AND layout_type = 1405 ORDER BY line ASC",
        [pageId],
      ),
      db.getAllAsync<VerseRow>("SELECT * FROM verses WHERE page1441_id = ?", [
        pageId,
      ]),
      db.getAllAsync<VerseRow>("SELECT * FROM verses WHERE page1405_id = ?", [
        pageId,
      ]),
    ]);

    const verses1441 = await Promise.all(
      verses1441Result.map(async (verse) => {
        const [highlights1441, highlights1405] = await Promise.all([
          db.getAllAsync<{
            line: number;
            left_position: number;
            right_position: number;
          }>(
            "SELECT * FROM verse_highlights WHERE verse_id = ? AND layout_type = 1441",
            [verse.verseID],
          ),
          db.getAllAsync<{
            line: number;
            left_position: number;
            right_position: number;
          }>(
            "SELECT * FROM verse_highlights WHERE verse_id = ? AND layout_type = 1405",
            [verse.verseID],
          ),
        ]);

        return this.mapVerseRow(verse, highlights1441, highlights1405);
      }),
    );

    const verses1405 = await Promise.all(
      verses1405Result.map(async (verse) => {
        const [highlights1441, highlights1405] = await Promise.all([
          db.getAllAsync<{
            line: number;
            left_position: number;
            right_position: number;
          }>(
            "SELECT * FROM verse_highlights WHERE verse_id = ? AND layout_type = 1441",
            [verse.verseID],
          ),
          db.getAllAsync<{
            line: number;
            left_position: number;
            right_position: number;
          }>(
            "SELECT * FROM verse_highlights WHERE verse_id = ? AND layout_type = 1405",
            [verse.verseID],
          ),
        ]);

        return this.mapVerseRow(verse, highlights1441, highlights1405);
      }),
    );

    return {
      identifier: pageResult.identifier,
      number: pageResult.number,
      isRight: pageResult.isRight === 1,
      header1441: header1441
        ? {
            part_id: header1441.part_id,
            quarter_id: header1441.quarter_id,
          }
        : null,
      header1405: header1405
        ? {
            part_id: header1405.part_id,
            quarter_id: header1405.quarter_id,
          }
        : null,
      chapterHeaders1441,
      chapterHeaders1405,
      verses1441,
      verses1405,
    };
  }

  private mapVerseRow(
    verse: VerseRow,
    highlights1441: VerseHighlight[],
    highlights1405: VerseHighlight[],
  ): Verse {
    return {
      verseID: verse.verseID,
      humanReadableID: verse.humanReadableID,
      number: verse.number,
      text: verse.text,
      textWithoutTashkil: verse.textWithoutTashkil,
      uthmanicHafsText: verse.uthmanicHafsText,
      hafsSmartText: verse.hafsSmartText,
      searchableText: verse.searchableText,
      chapter_id: verse.chapter_id,
      part_id: verse.part_id,
      quarter_id: verse.quarter_id,
      section_id: verse.section_id,
      page1441_id: verse.page1441_id,
      page1405_id: verse.page1405_id,
      marker1441: {
        numberCodePoint: verse.marker1441_numberCodePoint,
        line: verse.marker1441_line,
        centerX: verse.marker1441_centerX,
        centerY: verse.marker1441_centerY,
      },
      marker1405: {
        numberCodePoint: verse.marker1405_numberCodePoint,
        line: verse.marker1405_line,
        centerX: verse.marker1405_centerX,
        centerY: verse.marker1405_centerY,
      },
      highlights1441,
      highlights1405,
    };
  }

  async getChapterByNumber(chapterNumber: number): Promise<Chapter | null> {
    const db = await this.getDb();

    const chapter = await db.getFirstAsync<Chapter>(
      "SELECT * FROM chapters WHERE number = ? LIMIT 1",
      [chapterNumber],
    );

    return chapter;
  }

  async getChapters(): Promise<Chapter[]> {
    const db = await this.getDb();

    const chapters = await db.getAllAsync<Chapter>(
      "SELECT * FROM chapters ORDER BY number ASC",
    );

    return chapters;
  }
}

export const databaseService = new DatabaseService();
