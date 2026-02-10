const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const realmPath = path.resolve(__dirname, "..", "assets", "quran.realm");
const sqlitePath = path.resolve(__dirname, "..", "assets", "quran.db");

function migrateRealmToSQLite() {
    console.log("=== Starting Realm to SQLite Migration ===\n");

    console.log("1. Opening Realm database...");
    const Realm = require("realm");
    const realm = new Realm({ path: realmPath });
    console.log("   Realm database opened successfully.\n");

    console.log("2. Creating SQLite database...");
    if (fs.existsSync(sqlitePath)) {
        fs.unlinkSync(sqlitePath);
    }
    const db = new Database(sqlitePath);
    db.pragma("journal_mode = WAL");
    console.log("   SQLite database created successfully.\n");

    console.log("3. Creating tables and indexes...\n");

    db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      identifier INTEGER PRIMARY KEY,
      number INTEGER NOT NULL,
      isMeccan INTEGER NOT NULL,
      title TEXT NOT NULL,
      arabicTitle TEXT NOT NULL,
      englishTitle TEXT NOT NULL,
      titleCodePoint TEXT NOT NULL,
      searchableText TEXT,
      searchableKeywords TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(number);

    CREATE TABLE IF NOT EXISTS pages (
      identifier INTEGER PRIMARY KEY,
      number INTEGER NOT NULL,
      isRight INTEGER NOT NULL,
      header1441_part_id INTEGER,
      header1441_quarter_id INTEGER,
      header1405_part_id INTEGER,
      header1405_quarter_id INTEGER,
      FOREIGN KEY (header1441_part_id) REFERENCES parts(identifier),
      FOREIGN KEY (header1441_quarter_id) REFERENCES quarters(identifier),
      FOREIGN KEY (header1405_part_id) REFERENCES parts(identifier),
      FOREIGN KEY (header1405_quarter_id) REFERENCES quarters(identifier)
    );

    CREATE INDEX IF NOT EXISTS idx_pages_number ON pages(number);

    CREATE TABLE IF NOT EXISTS verses (
      verseID INTEGER PRIMARY KEY,
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
      FOREIGN KEY (quarter_id) REFERENCES quarters(identifier),
      FOREIGN KEY (section_id) REFERENCES sections(identifier),
      FOREIGN KEY (page1441_id) REFERENCES pages(identifier),
      FOREIGN KEY (page1405_id) REFERENCES pages(identifier)
    );

    CREATE INDEX IF NOT EXISTS verses_humanReadableID ON verses(humanReadableID);
    CREATE INDEX IF NOT EXISTS verses_number ON verses(number);
    CREATE INDEX IF NOT EXISTS verses_searchableText ON verses(searchableText);
    CREATE INDEX IF NOT EXISTS verses_chapter_id ON verses(chapter_id);
    CREATE INDEX IF NOT EXISTS verses_page1441_id ON verses(page1441_id);
    CREATE INDEX IF NOT EXISTS verses_page1405_id ON verses(page1405_id);

    CREATE TABLE IF NOT EXISTS parts (
      identifier INTEGER PRIMARY KEY,
      number INTEGER NOT NULL,
      arabicTitle TEXT NOT NULL,
      englishTitle TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS parts_number ON parts(number);

    CREATE TABLE IF NOT EXISTS quarters (
      identifier INTEGER PRIMARY KEY,
      hizbNumber INTEGER NOT NULL,
      hizbFraction INTEGER NOT NULL,
      arabicTitle TEXT NOT NULL,
      englishTitle TEXT NOT NULL,
      part_id INTEGER,
      FOREIGN KEY (part_id) REFERENCES parts(identifier)
    );

    CREATE INDEX IF NOT EXISTS quarters_hizbNumber ON quarters(hizbNumber);

    CREATE TABLE IF NOT EXISTS sections (
      identifier INTEGER PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS verse_highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      layout_type INTEGER NOT NULL,
      line INTEGER NOT NULL,
      left_position REAL NOT NULL,
      right_position REAL NOT NULL,
      FOREIGN KEY (verse_id) REFERENCES verses(verseID)
    );

    CREATE INDEX IF NOT EXISTS verse_highlights_verse_id ON verse_highlights(verse_id);

    CREATE TABLE IF NOT EXISTS chapter_headers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      layout_type INTEGER NOT NULL,
      chapter_id INTEGER,
      line INTEGER NOT NULL,
      centerX REAL NOT NULL,
      centerY REAL NOT NULL,
      FOREIGN KEY (page_id) REFERENCES pages(identifier),
      FOREIGN KEY (chapter_id) REFERENCES chapters(identifier)
    );

    CREATE TABLE IF NOT EXISTS page_headers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      layout_type INTEGER NOT NULL,
      part_id INTEGER,
      quarter_id INTEGER,
      FOREIGN KEY (page_id) REFERENCES pages(identifier),
      FOREIGN KEY (part_id) REFERENCES parts(identifier),
      FOREIGN KEY (quarter_id) REFERENCES quarters(identifier)
    );
  `);

    console.log("   Tables and indexes created.\n");

    console.log("4. Migrating data...\n");

    const insertPart = db.prepare(
        "INSERT INTO parts (identifier, number, arabicTitle, englishTitle) VALUES (?, ?, ?, ?)"
    );
    const insertQuarter = db.prepare(
        "INSERT INTO quarters (identifier, hizbNumber, hizbFraction, arabicTitle, englishTitle, part_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const insertChapter = db.prepare(
        "INSERT INTO chapters (identifier, number, isMeccan, title, arabicTitle, englishTitle, titleCodePoint, searchableText, searchableKeywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const insertPage = db.prepare(
        "INSERT INTO pages (identifier, number, isRight, header1441_part_id, header1441_quarter_id, header1405_part_id, header1405_quarter_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const insertSection = db.prepare(
        "INSERT INTO sections (identifier) VALUES (?)"
    );
    const insertVerse = db.prepare(
        `INSERT INTO verses (
      verseID, humanReadableID, number, text, textWithoutTashkil,
      uthmanicHafsText, hafsSmartText, searchableText,
      chapter_id, part_id, quarter_id, section_id, page1441_id, page1405_id,
      marker1441_numberCodePoint, marker1441_line, marker1441_centerX, marker1441_centerY,
      marker1405_numberCodePoint, marker1405_line, marker1405_centerX, marker1405_centerY
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertVerseHighlight = db.prepare(
        "INSERT INTO verse_highlights (verse_id, layout_type, line, left_position, right_position) VALUES (?, ?, ?, ?, ?)"
    );
    const insertChapterHeader = db.prepare(
        "INSERT INTO chapter_headers (page_id, layout_type, chapter_id, line, centerX, centerY) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const insertPageHeader = db.prepare(
        "INSERT INTO page_headers (page_id, layout_type, part_id, quarter_id) VALUES (?, ?, ?, ?)"
    );

    const insertPartTransaction = db.transaction((parts) => {
        for (const part of parts) {
            insertPart.run(part.identifier, part.number, part.arabicTitle, part.englishTitle);
        }
    });

    const insertQuarterTransaction = db.transaction((quarters) => {
        for (const quarter of quarters) {
            insertQuarter.run(
                quarter.identifier,
                quarter.hizbNumber,
                quarter.hizbFraction,
                quarter.arabicTitle,
                quarter.englishTitle,
                quarter.part?.identifier ?? null
            );
        }
    });

    const insertChapterTransaction = db.transaction((chapters) => {
        for (const chapter of chapters) {
            insertChapter.run(
                chapter.identifier,
                chapter.number,
                chapter.isMeccan ? 1 : 0,
                chapter.title,
                chapter.arabicTitle,
                chapter.englishTitle,
                chapter.titleCodePoint,
                chapter.searchableText,
                chapter.searchableKeywords
            );
        }
    });

    const insertPageTransaction = db.transaction((pages) => {
        for (const page of pages) {
            insertPage.run(
                page.identifier,
                page.number,
                page.isRight ? 1 : 0,
                page.header1441?.part?.identifier ?? null,
                page.header1441?.quarter?.identifier ?? null,
                page.header1405?.part?.identifier ?? null,
                page.header1405?.quarter?.identifier ?? null
            );
        }
    });

    const insertSectionTransaction = db.transaction((sections) => {
        for (const section of sections) {
            insertSection.run(section.identifier);
        }
    });

    const insertVerseTransaction = db.transaction((verses) => {
        for (const verse of verses) {
            insertVerse.run(
                verse.verseID,
                verse.humanReadableID,
                verse.number,
                verse.text,
                verse.textWithoutTashkil,
                verse.uthmanicHafsText,
                verse.hafsSmartText,
                verse.searchableText,
                verse.chapter?.identifier ?? null,
                verse.part?.identifier ?? null,
                verse.quarter?.identifier ?? null,
                verse.section?.identifier ?? null,
                verse.page1441?.identifier ?? null,
                verse.page1405?.identifier ?? null,
                verse.marker1441?.numberCodePoint ?? null,
                verse.marker1441?.line ?? null,
                verse.marker1441?.centerX ?? null,
                verse.marker1441?.centerY ?? null,
                verse.marker1405?.numberCodePoint ?? null,
                verse.marker1405?.line ?? null,
                verse.marker1405?.centerX ?? null,
                verse.marker1405?.centerY ?? null
            );
        }
    });

    const insertVerseHighlightTransaction = db.transaction((highlights) => {
        for (const h of highlights) {
            insertVerseHighlight.run(h.verse_id, h.layout_type, h.line, h.left_position, h.right_position);
        }
    });

    const insertChapterHeaderTransaction = db.transaction((headers) => {
        for (const h of headers) {
            insertChapterHeader.run(h.page_id, h.layout_type, h.chapter_id, h.line, h.centerX, h.centerY);
        }
    });

    const insertPageHeaderTransaction = db.transaction((headers) => {
        for (const h of headers) {
            insertPageHeader.run(h.page_id, h.layout_type, h.part_id, h.quarter_id);
        }
    });

    console.log("   a) Migrating parts...");
    const parts = realm.objects("Part");
    insertPartTransaction(Array.from(parts));
    console.log(`      Migrated ${parts.length} parts.\n`);

    console.log("   b) Migrating quarters...");
    const quarters = realm.objects("Quarter");
    insertQuarterTransaction(Array.from(quarters));
    console.log(`      Migrated ${quarters.length} quarters.\n`);

    console.log("   c) Migrating chapters...");
    const chapters = realm.objects("Chapter");
    insertChapterTransaction(Array.from(chapters));
    console.log(`      Migrated ${chapters.length} chapters.\n`);

    console.log("   d) Migrating pages...");
    const pages = realm.objects("Page");
    insertPageTransaction(Array.from(pages));
    console.log(`      Migrated ${pages.length} pages.\n`);

    console.log("   e) Migrating sections...");
    const sections = realm.objects("Section");
    insertSectionTransaction(Array.from(sections));
    console.log(`      Migrated ${sections.length} sections.\n`);

    console.log("   f) Migrating verses...");
    const verses = realm.objects("Verse");
    let verseArray = Array.from(verses);
    insertVerseTransaction(verseArray);
    console.log(`      Migrated ${verseArray.length} verses.\n`);

    console.log("   g) Migrating verse highlights...");
    const allVerses = realm.objects("Verse");
    const highlights = [];
    for (const verse of allVerses) {
        for (const highlight of verse.highlights1441) {
            highlights.push({ verse_id: verse.verseID, layout_type: 1441, line: highlight.line, left_position: highlight.left, right_position: highlight.right });
        }
        for (const highlight of verse.highlights1405) {
            highlights.push({ verse_id: verse.verseID, layout_type: 1405, line: highlight.line, left_position: highlight.left, right_position: highlight.right });
        }
    }
    insertVerseHighlightTransaction(highlights);
    console.log(`      Migrated ${highlights.length} highlights.\n`);

    console.log("   h) Migrating chapter headers...");
    const chapterHeaders = [];
    for (const page of realm.objects("Page")) {
        for (const header of page.chapterHeaders1441) {
            chapterHeaders.push({
                page_id: page.identifier,
                layout_type: 1441,
                chapter_id: header.chapter?.identifier ?? null,
                line: header.line,
                centerX: header.centerX,
                centerY: header.centerY
            });
        }
        for (const header of page.chapterHeaders1405) {
            chapterHeaders.push({
                page_id: page.identifier,
                layout_type: 1405,
                chapter_id: header.chapter?.identifier ?? null,
                line: header.line,
                centerX: header.centerX,
                centerY: header.centerY
            });
        }
    }
    insertChapterHeaderTransaction(chapterHeaders);
    console.log(`      Migrated ${chapterHeaders.length} chapter headers.\n`);

    console.log("   i) Migrating page headers...");
    const pageHeaders = [];
    for (const page of realm.objects("Page")) {
        if (page.header1441) {
            pageHeaders.push({
                page_id: page.identifier,
                layout_type: 1441,
                part_id: page.header1441.part?.identifier ?? null,
                quarter_id: page.header1441.quarter?.identifier ?? null
            });
        }
        if (page.header1405) {
            pageHeaders.push({
                page_id: page.identifier,
                layout_type: 1405,
                part_id: page.header1405.part?.identifier ?? null,
                quarter_id: page.header1405.quarter?.identifier ?? null
            });
        }
    }
    insertPageHeaderTransaction(pageHeaders);
    console.log(`      Migrated ${pageHeaders.length} page headers.\n`);

    realm.close();
    db.close();

    console.log("=== Migration Complete ===\n");

    console.log("Verifying migration...\n");

    const dbVerify = new Database(sqlitePath);

    console.log("Final counts:");
    console.log(`  Chapters: ${dbVerify.prepare("SELECT COUNT(*) as count FROM chapters").get().count}`);
    console.log(`  Pages: ${dbVerify.prepare("SELECT COUNT(*) as count FROM pages").get().count}`);
    console.log(`  Verses: ${dbVerify.prepare("SELECT COUNT(*) as count FROM verses").get().count}`);
    console.log(`  Parts: ${dbVerify.prepare("SELECT COUNT(*) as count FROM parts").get().count}`);
    console.log(`  Quarters: ${dbVerify.prepare("SELECT COUNT(*) as count FROM quarters").get().count}`);
    console.log(`  Sections: ${dbVerify.prepare("SELECT COUNT(*) as count FROM sections").get().count}`);
    console.log(`  Verse Highlights: ${dbVerify.prepare("SELECT COUNT(*) as count FROM verse_highlights").get().count}`);
    console.log(`  Chapter Headers: ${dbVerify.prepare("SELECT COUNT(*) as count FROM chapter_headers").get().count}`);
    console.log(`  Page Headers: ${dbVerify.prepare("SELECT COUNT(*) as count FROM page_headers").get().count}`);

    dbVerify.close();
}

migrateRealmToSQLite();
