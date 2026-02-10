# Realm to SQLite Migration Documentation

## Overview

This document describes the migration from Realm database to SQLite using `@expo-sqlite/next` in the Mushaf Imad RN React Native application.

## Migration Summary

| Metric | Value |
|--------|-------|
| Source Database | Realm (`quran.realm`) |
| Target Database | SQLite (`quran.db`) |
| Migration Date | 2026-02-10 |
| Total Tables | 9 |
| Total Records | ~40,000 |

## Database Schema

### Tables

| Table | Records | Description |
|-------|---------|-------------|
| `chapters` | 114 | Quran chapters (surahs) |
| `pages` | 604 | Quran pages |
| `verses` | 6,236 | Quran verses (ayahs) |
| `parts` | 30 | Quran parts (juz') |
| `quarters` | 240 | Quarter divisions (hizb) |
| `sections` | 1,325 | Quran sections |
| `verse_highlights` | 27,039 | Verse highlight positions |
| `chapter_headers` | 228 | Chapter title markers |
| `page_headers` | 1,208 | Page header markers |

### Table Schemas

#### chapters

```sql
CREATE TABLE chapters (
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
CREATE INDEX idx_chapters_number ON chapters(number);
```

#### pages

```sql
CREATE TABLE pages (
  identifier INTEGER PRIMARY KEY,
  number INTEGER NOT NULL,
  isRight INTEGER NOT NULL,
  header1441_part_id INTEGER,
  header1441_quarter_id INTEGER,
  header1405_part_id INTEGER,
  header1405_quarter_id INTEGER
);
CREATE INDEX idx_pages_number ON pages(number);
```

#### verses

```sql
CREATE TABLE verses (
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
  marker1405_centerY REAL
);
CREATE INDEX verses_humanReadableID ON verses(humanReadableID);
CREATE INDEX verses_number ON verses(number);
CREATE INDEX verses_searchableText ON verses(searchableText);
CREATE INDEX verses_chapter_id ON verses(chapter_id);
CREATE INDEX verses_page1441_id ON verses(page1441_id);
CREATE INDEX verses_page1405_id ON verses(page1405_id);
```

#### parts

```sql
CREATE TABLE parts (
  identifier INTEGER PRIMARY KEY,
  number INTEGER NOT NULL,
  arabicTitle TEXT NOT NULL,
  englishTitle TEXT NOT NULL
);
CREATE INDEX parts_number ON parts(number);
```

#### quarters

```sql
CREATE TABLE quarters (
  identifier INTEGER PRIMARY KEY,
  hizbNumber INTEGER NOT NULL,
  hizbFraction INTEGER NOT NULL,
  arabicTitle TEXT NOT NULL,
  englishTitle TEXT NOT NULL,
  part_id INTEGER
);
CREATE INDEX quarters_hizbNumber ON quarters(hizbNumber);
```

#### sections

```sql
CREATE TABLE sections (
  identifier INTEGER PRIMARY KEY
);
```

#### verse_highlights

```sql
CREATE TABLE verse_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_id INTEGER NOT NULL,
  layout_type INTEGER NOT NULL,
  line INTEGER NOT NULL,
  left_position REAL NOT NULL,
  right_position REAL NOT NULL
);
CREATE INDEX verse_highlights_verse_id ON verse_highlights(verse_id);
```

#### chapter_headers

```sql
CREATE TABLE chapter_headers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  layout_type INTEGER NOT NULL,
  chapter_id INTEGER,
  line INTEGER NOT NULL,
  centerX REAL NOT NULL,
  centerY REAL NOT NULL
);
```

#### page_headers

```sql
CREATE TABLE page_headers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  layout_type INTEGER NOT NULL,
  part_id INTEGER,
  quarter_id INTEGER
);
```

## Key Changes from Realm to SQLite

### 1. Embedded Objects Flattened

In Realm, embedded objects like `VerseMarker` were stored as nested objects within `Verse`. In SQLite, these have been flattened into the verses table:

| Realm Embedded Object | SQLite Column(s) |
|----------------------|------------------|
| `marker1441` | `marker1441_numberCodePoint`, `marker1441_line`, `marker1441_centerX`, `marker1441_centerY` |
| `marker1405` | `marker1405_numberCodePoint`, `marker1405_line`, `marker1405_centerX`, `marker1405_centerY` |
| `header1441` | `header1441_part_id`, `header1441_quarter_id` |
| `header1405` | `header1405_part_id`, `header1405_quarter_id` |

### 2. Relationships

Foreign key relationships have been established:

- `verses.chapter_id` → `chapters.identifier`
- `verses.part_id` → `parts.identifier`
- `verses.quarter_id` → `quarters.identifier`
- `verses.section_id` → `sections.identifier`
- `verses.page1441_id` → `pages.identifier`
- `verses.page1405_id` → `pages.identifier`
- `verse_highlights.verse_id` → `verses.verseID`

### 3. Layout Types

Two layout types are supported:

- **1441**: Standard page layout
- **1405**: Alternative page layout

This is used in `verse_highlights`, `chapter_headers`, and `page_headers` tables.

## Files Modified/Created

### New Files

- `src/services/SQLiteService.ts` - Database service layer
- `scripts/migrate-realm-to-sqlite.js` - Migration script
- `assets/quran.db` - Migrated SQLite database

### Modified Files

- `src/hooks/useQuranPage.ts` - Updated to use SQLite
- `src/screens/MushafScreen.tsx` - Updated to use SQLiteService
- `src/components/QuranPage.tsx` - Updated for SQLite data structure
- `package.json` - Removed Realm dependencies

### Deleted Files

- `src/services/RealmService.ts` - No longer needed
- `src/models/schema.ts` - No longer needed

## Usage

### Opening the Database

```typescript
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("quran.db");
```

### Query Examples

```typescript
// Get a page by number
db.transaction(tx => {
  tx.executeSql(
    "SELECT * FROM pages WHERE number = ?",
    [pageNumber],
    (_, result) => console.log(result.rows)
  );
});

// Get verses for a chapter
db.transaction(tx => {
  tx.executeSql(
    "SELECT * FROM verses WHERE chapter_id = ? ORDER BY number",
    [chapterId],
    (_, result) => console.log(result.rows)
  );
});

// Search verses
db.transaction(tx => {
  tx.executeSql(
    "SELECT * FROM verses WHERE searchableText LIKE ? LIMIT 50",
    [`%${query}%`],
    (_, result) => console.log(result.rows)
  );
});
```

## Migration Script

To re-run the migration (requires Realm):

```bash
node scripts/migrate-realm-to-sqlite.js
```

**Note:** The migration script requires:

- `realm` package (available in devDependencies)
- `better-sqlite3` package
- Source database at `assets/quran.realm`

## Performance Considerations

1. **WAL Mode**: The database uses Write-Ahead Logging (`PRAGMA journal_mode = WAL`) for better concurrent read performance.

2. **Indexes**: All Realm indexes have been recreated in SQLite for query optimization.

3. **Prepared Statements**: The migration script uses prepared statements with transactions for optimal insert performance.

## Verification

Run the verification to confirm data integrity:

```bash
node scripts/verify-migration.js
```

Expected counts:

- Chapters: 114
- Pages: 604
- Verses: 6,236
- Parts: 30
- Quarters: 240
- Sections: 1,325
- Verse Highlights: 27,039
- Chapter Headers: 228
- Page Headers: 1,208
