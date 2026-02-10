# Quran View Component Documentation

## Overview

A reusable React Native Quran page rendering component for Expo apps. Displays Quran pages with:

- Page images (604 pages)
- Sura name bars (with press support)
- Verse markers (fasel) (with press support)
- Verse content areas (with press support)
- Verse highlights
- Popups for verse/chapter info

## Screenshots

![Quran View - Main Interface](../screenshots/quran-view-1.png)

![Quran View - Detailed View](../screenshots/quran-view-3.png)

## File Structure

```
src/
├── components/
│   └── quran/
│       ├── index.ts              # Main exports
│       ├── types.ts              # Type definitions
│       ├── constants.ts          # Default configuration
│       ├── useQuranData.ts       # Data fetching hook
│       ├── QuranView.tsx         # Main component
│       ├── VersePopup.tsx        # Verse info popup
│       ├── ChapterPopup.tsx      # Chapter info popup
│       ├── SuraNameBar.tsx       # Sura name bar component
│       └── VerseFasel.tsx        # Verse marker component
├── services/
│   └── SQLiteService.ts          # Database service
└── assets/
    ├── quran.db                  # SQLite database
    └── images/quran/             # Page images (604 folders)
```

## Dependencies

```bash
npm install expo-sqlite expo-asset react-native-svg
```

## Event Types

```typescript
interface VersePressEvent {
  verse: Verse;
  page: number;
  chapter: number;
  position: {
    x: number;
    y: number;
  } | null;
}

interface ChapterPressEvent {
  chapter: Chapter;
  page: number;
  position: {
    x: number;
    y: number;
  } | null;
}
```

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pageNumber` | `number` | Yes | - | Page number to display (1-604) |
| `layout` | `1441 \| 1405` | No | `1441` | Page layout type |
| `showSuraName` | `boolean` | No | `true` | Show sura name bars |
| `showVerseMarkers` | `boolean` | No | `true` | Show verse number markers |
| `showHighlights` | `boolean` | No | `true` | Show verse highlights |
| `highlightColor` | `string` | No | `"rgba(120, 120, 120, 0.3)"` | Highlight color (gray) |
| `activeChapter` | `number` | No | - | Currently selected chapter |
| `activeVerse` | `number` | No | - | Currently selected verse |
| `onVersePress` | `(event: VersePressEvent) => void` | No | - | Verse short press callback |
| `onVerseLongPress` | `(event: VersePressEvent) => void` | No | - | Verse long press callback |
| `onChapterPress` | `(event: ChapterPressEvent) => void` | No | - | Chapter short press callback |
| `onChapterLongPress` | `(event: ChapterPressEvent) => void` | No | - | Chapter long press callback |
| `onPageChange` | `(page: number) => void` | No | - | Page change callback |

## Usage Examples

### Basic Usage

```tsx
import { QuranView } from "./components/quran";

<QuranView pageNumber={1} />
```

### With Press Callbacks

```tsx
import { QuranView } from "./components/quran";

function MyScreen() {
  const handleVersePress = (event) => {
    console.log("Verse pressed:", event.verse.number);
    console.log("Chapter:", event.chapter);
    console.log("Page:", event.page);
  };

  const handleVerseLongPress = (event) => {
    console.log("Verse long pressed:", event.verse.number);
    // Show copy menu, bookmark, etc.
  };

  return (
    <QuranView
      pageNumber={1}
      onVersePress={handleVersePress}
      onVerseLongPress={handleVerseLongPress}
    />
  );
}
```

### With Chapter Callbacks

```tsx
<QuranView
  pageNumber={1}
  onChapterPress={(event) => {
    console.log("Chapter:", event.chapter.number);
  }}
  onChapterLongPress={(event) => {
    console.log("Chapter details:", event.chapter);
  }}
/>
```

### Custom Highlight Color

```tsx
<QuranView
  pageNumber={1}
  highlightColor="rgba(100, 100, 100, 0.4)"
/>
```

### Minimal (No Overlays)

```tsx
<QuranView
  pageNumber={1}
  showSuraName={false}
  showVerseMarkers={false}
  showHighlights={false}
/>
```

### With Built-in Popups

```tsx
import { QuranView, VersePopup, ChapterPopup } from "./components/quran";

function MyScreen() {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [versePopupVisible, setVersePopupVisible] = useState(false);

  return (
    <>
      <QuranView
        pageNumber={1}
        onVersePress={(event) => {
          setSelectedVerse(event.verse);
          setVersePopupVisible(true);
        }}
      />
      <VersePopup
        visible={versePopupVisible}
        verse={selectedVerse}
        onClose={() => setVersePopupVisible(false)}
      />
    </>
  );
}
```

### Paginated View (FlatList)

```tsx
import { FlatList, Dimensions } from "react-native";
import { QuranView } from "./components/quran";

const { width } = Dimensions.get("window");
const pages = Array.from({ length: 604 }, (_, i) => i + 1);

function PaginatedMushaf() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <FlatList
      data={pages}
      horizontal
      pagingEnabled
      inverted
      renderItem={({ item }) => (
        <QuranView
          pageNumber={item}
          onVersePress={(event) => console.log(event.verse)}
        />
      )}
      onMomentumScrollEnd={(e) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / width) + 1;
        setCurrentPage(page);
      }}
    />
  );
}
```

## Press Support

### What's Clickable

| Element | Short Press | Long Press |
|---------|-------------|------------|
| Verse marker (fasel) | Show popup | Custom action |
| Verse content area | Show popup | Custom action |
| Sura name bar | Show chapter info | Custom action |

### Multi-line Verses

The component automatically handles verses that span multiple lines:

- Highlight extends across all lines of the verse
- Pressing anywhere on the verse content triggers the callback
- The `VersePressEvent` includes the full verse data

### Multi-verse Per Line

When multiple verses appear on one line:

- Each verse has its own content area
- Press detection uses x-position to identify which verse was pressed
- Verses are sorted by position for accurate detection

## Hooks

### useQuranData

```typescript
import { useQuranData } from "./components/quran";

const { page, loading, error } = useQuranData(pageNumber);

if (loading) return <ActivityIndicator />;
if (error) return <Text>Error loading page</Text>;
if (!page) return <Text>Page not found</Text>;

// page structure:
// {
//   identifier: number,
//   number: number,
//   chapterHeaders1441: ChapterHeader[],
//   verses1441: Verse[],
//   ...
// }
```

## Database

The component uses `SQLiteService` for data access. The database must contain:

### Tables

| Table | Description |
|-------|-------------|
| `pages` | Page metadata (604 records) |
| `chapters` | Chapter metadata (114 records) |
| `verses` | Verse data with markers (6,236 records) |
| `chapter_headers` | Sura name positions (228 records) |
| `verse_highlights` | Highlight positions (27,039 records) |

### Database Methods

```typescript
// From SQLiteService
databaseService.getPageByNumber(pageNumber: number): Promise<Page | null>;
databaseService.getChapterByNumber(chapterNumber: number): Promise<Chapter | null>;
databaseService.getChapters(): Promise<Chapter[]>;
```

## Setup for Reuse

### 1. Copy Files

Copy the following to your project:

```
src/
├── components/
│   └── quran/
│       ├── index.ts
│       ├── types.ts
│       ├── constants.ts
│       ├── useQuranData.ts
│       ├── QuranView.tsx
│       ├── VersePopup.tsx
│       ├── ChapterPopup.tsx
│       ├── SuraNameBar.tsx
│       └── VerseFasel.tsx
└── services/
    └── SQLiteService.ts
```

### 2. Copy Assets

Copy to your `assets/` folder:

```
assets/
├── quran.db                    # SQLite database (~10MB)
└── images/quran/              # Page images (~604 folders)
    ├── 1/
    │   ├── 1.png
    │   ├── 2.png
    │   └── ...
    ├── 2/
    └── ...
```

### 3. Install Dependencies

```bash
npm install expo-sqlite expo-asset react-native-svg
```

### 4. Update Image Map

If using custom images, run or update `imageMap.ts`:

```bash
node scripts/generate-map.js
```

## Troubleshooting

### "no such table: chapters"

Ensure `assets/quran.db` exists and contains data. Run verification:

```bash
node scripts/check-db-data.js
```

### Page images not showing

Check that `src/constants/imageMap.ts` exists and has correct paths.

### Sura names not appearing

Verify `chapter_headers` table has data for the page.

### Verse markers not appearing

Check `verses` table has `marker1441_line`, `marker1441_centerX`, `marker1441_centerY` values.

### Press not working

Ensure `showHighlights` is `true` (required for content area detection).

### Multi-line verse not highlighting correctly

Check `verse_highlights` table has entries for all lines of the verse.

## Constants Reference

```typescript
// Default layout values
const LINE_ASPECT_RATIO = 1440 / 232;      // Image aspect ratio
const LINE_COUNT = 15;                     // Lines per page
const SURA_NAME_BAR_WIDTH_RATIO = 0.9;     // 90% of page width
const SURA_NAME_BAR_HEIGHT_RATIO = 0.8;    // 80% of line height
const VERSE_MARKER_BALANCE = 3.69;         // Marker sizing multiplier

// Highlight color (gray)
const DEFAULT_HIGHLIGHT_COLOR = "rgba(120, 120, 120, 0.3)";
```
