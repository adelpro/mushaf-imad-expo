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

## Database Initialization

The `SQLiteService.ts` implements a robust database initialization strategy:

### Asset Copy Process

1. Check if database already exists in the app's document directory
2. If exists, verify it contains data (check `chapters` table count)
3. If empty or invalid, delete and copy from `assets/quran.db`
4. Use `expo-asset` to ensure the asset is fully downloaded before copying
5. Re-open database connection after copy to avoid stale references

### Key Implementation Details

```typescript
private async initDatabase(): Promise<SQLiteDb> {
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

  // Check existing database
  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  if (dbInfo.exists) {
    const existingDb = await SQLite.openDatabaseAsync(DB_NAME);
    const chapterCount = await existingDb.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM chapters"
    );

    if (chapterCount && chapterCount.count > 0) {
      return existingDb;
    }

    // Empty database - delete and re-copy
    await existingDb.closeAsync().catch(() => {});
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
  }

  // Copy from assets
  const asset = Asset.Asset.fromModule(require("../../assets/quran.db"));
  await asset.downloadAsync();

  if (asset.localUri) {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
    await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });
    return SQLite.openDatabaseAsync(DB_NAME);
  }
}
```

## Troubleshooting

### Common Issues

#### "no such table: chapters" or "no such table: pages"

**Cause**: Database initialization failed or tables weren't created.

**Solution**: Ensure `initializeDatabase()` is called in `initDatabase()`. The database copy from assets should include pre-populated tables.

#### Sura Name Bar and Verse Fasel Not Showing

**Cause**: Database copy failed silently, app uses empty database.

**Solution**:

1. Check database file size after copy (should be ~10MB)
2. Verify `assets/quran.db` exists and contains data
3. Run `node scripts/check-db.js` to verify database integrity
4. Use `databaseService.resetForTesting()` during development to force re-copy

#### Stale Database Reference After Copy

**Cause**: Database connection opened before copy completes.

**Solution**: Always re-open database connection after copying from assets using `SQLite.openDatabaseAsync(DB_NAME)`.

### Verification Scripts

Several scripts are available for debugging:

- `scripts/check-db-data.js` - Verify database record counts and sample data
- `scripts/check-pages-schema.js` - Verify pages table schema
- `scripts/check-page-numbering.js` - Verify page/chapter relationships
- `scripts/check-markers.js` - Verify verse marker data
- `scripts/migrate-realm-to-sqlite.js` - Main migration script (reference only)

Run any script with:

```bash
node scripts/<script-name>.js
```

## Migration Script Reference

The `scripts/migrate-realm-to-sqlite.js` script performs the complete migration from Realm to SQLite. It is kept for reference and documentation purposes.

### Purpose

Converts the Realm database (`assets/quran.realm`) to SQLite format (`assets/quran.db`), preserving all data relationships and creating appropriate indexes for performance.

### Prerequisites

- Node.js with `realm` and `better-sqlite3` packages installed
- Source Realm database at `assets/quran.realm`
- Destination directory `assets/` must be writable

### Usage

```bash
node scripts/migrate-realm-to-sqlite.js
```

### What It Does

1. Opens the Realm database from `assets/quran.realm`
2. Creates a new SQLite database at `assets/quran.db`
3. Creates all table schemas with proper indexes
4. Migrates data in this order:
   - Parts (30 records)
   - Quarters (240 records)
   - Chapters (114 records)
   - Pages (604 records)
   - Sections (1,325 records)
   - Verses (6,236 records)
   - Verse Highlights (27,039 records)
   - Chapter Headers (228 records)
   - Page Headers (1,208 records)
5. Verifies migration by printing final counts
6. Closes both databases

### Key Implementation Details

- Uses `better-sqlite3` for SQLite operations
- Uses prepared statements for efficient inserts
- Wraps bulk inserts in transactions for performance
- Sets `PRAGMA journal_mode = WAL` for concurrent read performance
- Preserves foreign key relationships

### Output

After successful migration, prints:

```
=== Migration Complete ===

Verifying migration...

Final counts:
  Chapters: 114
  Pages: 604
  Verses: 6236
  Parts: 30
  Quarters: 240
  Sections: 1325
  Verse Highlights: 27039
  Chapter Headers: 228
  Page Headers: 1208
```

### When to Re-run

This script should only be re-run when:

- Starting with a new Realm database source
- Schema changes require full re-migration
- The source `quran.realm` file has been updated

For normal development, use the pre-migrated `assets/quran.db` file.

## Image Map Generation

The `scripts/generate-map.js` script generates the `src/constants/imageMap.ts` file which maps page numbers to their corresponding line images.

### Purpose

Expo requires image assets to be explicitly imported using `require()`. This script scans the `assets/images/quran/` directory structure and generates a TypeScript file with all the required imports for each page's line images.

### Usage

```bash
node scripts/generate-map.js
```

### Output

Generates `src/constants/imageMap.ts`:

```typescript
export const QuranImages: Record<number, any[]> = {
  1: [
    require('../../assets/images/quran/1/1.png'),
    require('../../assets/images/quran/1/2.png'),
    // ...
  ],
  2: [
    // ...
  ],
  // ... pages 1-604
};
```

### When to Re-run

Run this script when:

- Adding new page images to `assets/images/quran/`
- Modifying the directory structure of quran images
- After updating the number of lines per page
