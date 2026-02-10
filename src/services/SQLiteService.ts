import * as SQLite from "expo-sqlite";

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

type VerseRow = {
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
  marker1441_numberCodePoint: string | null;
  marker1441_line: number | null;
  marker1441_centerX: number | null;
  marker1441_centerY: number | null;
  marker1405_numberCodePoint: string | null;
  marker1405_line: number | null;
  marker1405_centerX: number | null;
  marker1405_centerY: number | null;
};

export type ChapterHeader = {
  id: number;
  chapter_id: number | null;
  line: number;
  centerX: number;
  centerY: number;
};

export type PageHeader = {
  id: number;
  part_id: number | null;
  quarter_id: number | null;
};

export type Page = {
  identifier: number;
  number: number;
  isRight: number;
  header1441: PageHeader | null;
  header1405: PageHeader | null;
  chapterHeaders1441: ChapterHeader[];
  chapterHeaders1405: ChapterHeader[];
  verses1441: Verse[];
  verses1405: Verse[];
};

export type Part = {
  identifier: number;
  number: number;
  arabicTitle: string;
  englishTitle: string;
};

export type Quarter = {
  identifier: number;
  hizbNumber: number;
  hizbFraction: number;
  arabicTitle: string;
  englishTitle: string;
  part_id: number | null;
};

export type QuranSection = {
  identifier: number;
};

type SQLiteDb = Awaited<ReturnType<typeof SQLite.openDatabaseAsync>>;

class DatabaseService {
  private db: SQLiteDb | null = null;
  private initPromise: Promise<SQLiteDb> | null = null;

  private async getDb(): Promise<SQLiteDb> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = SQLite.openDatabaseAsync(DB_NAME);
    this.db = await this.initPromise;
    await this.initializeDatabase();
    return this.db;
  }

  private async initializeDatabase(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pages (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        isRight INTEGER NOT NULL DEFAULT 1
      );
    `);

    await this.db.execAsync(`
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

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS parts (
        identifier INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL,
        arabicTitle TEXT NOT NULL,
        englishTitle TEXT NOT NULL
      );
    `);

    await this.db.execAsync(`
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

    await this.db.execAsync(`
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

    await this.db.execAsync(`
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

    await this.db.execAsync(`
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

    await this.db.execAsync(`
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

        return this.inflateVerse(verse, highlights1441, highlights1405);
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

        return this.inflateVerse(verse, highlights1441, highlights1405);
      }),
    );

    return {
      identifier: pageId,
      number: pageResult.number,
      isRight: pageResult.isRight,
      header1441: header1441
        ? {
            id: header1441.id,
            part_id: header1441.part_id,
            quarter_id: header1441.quarter_id,
          }
        : null,
      header1405: header1405
        ? {
            id: header1405.id,
            part_id: header1405.part_id,
            quarter_id: header1405.quarter_id,
          }
        : null,
      chapterHeaders1441: chapterHeaders1441.map((h) => ({
        id: h.id,
        chapter_id: h.chapter_id,
        line: h.line,
        centerX: h.centerX,
        centerY: h.centerY,
      })),
      chapterHeaders1405: chapterHeaders1405.map((h) => ({
        id: h.id,
        chapter_id: h.chapter_id,
        line: h.line,
        centerX: h.centerX,
        centerY: h.centerY,
      })),
      verses1441,
      verses1405,
    };
  }

  private inflateVerse(
    verse: VerseRow,
    highlights1441: Array<{
      line: number;
      left_position: number;
      right_position: number;
    }>,
    highlights1405: Array<{
      line: number;
      left_position: number;
      right_position: number;
    }>,
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
    return db.getFirstAsync<Chapter>(
      "SELECT * FROM chapters WHERE number = ? LIMIT 1",
      [chapterNumber],
    );
  }

  async getVersesByChapter(chapterNumber: number): Promise<Verse[]> {
    const db = await this.getDb();

    const versesResult = await db.getAllAsync<VerseRow>(
      "SELECT * FROM verses WHERE chapter_id = (SELECT identifier FROM chapters WHERE number = ?) ORDER BY number ASC",
      [chapterNumber],
    );

    return Promise.all(
      versesResult.map(async (verse) => {
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

        return this.inflateVerse(verse, highlights1441, highlights1405);
      }),
    );
  }

  async searchVerses(query: string): Promise<Verse[]> {
    const db = await this.getDb();

    const versesResult = await db.getAllAsync<VerseRow>(
      "SELECT * FROM verses WHERE searchableText LIKE ? ORDER BY chapter_id, number ASC LIMIT 100",
      [`%${query}%`],
    );

    return Promise.all(
      versesResult.map(async (verse) => {
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

        return this.inflateVerse(verse, highlights1441, highlights1405);
      }),
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const databaseService = new DatabaseService();
