# Quran View Component Documentation

## Overview

A reusable React Native Quran page rendering component for Expo apps. Displays Quran pages with:

- Page images (604 pages)
- Sura name bars
- Verse markers (fasel)
- Verse highlights

## File Structure

```
src/
├── components/
│   └── quran/
│       ├── index.ts              # Main exports
│       ├── types.ts              # Type definitions
│       ├── constants.ts          # Default configuration
│       ├── useQuranData.ts      # Data fetching hook
│       ├── QuranView.tsx         # Main component
│       ├── QuranPage.tsx         # Page renderer
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

## Types

### Page Types

```typescript
// Page types
interface VerseMarker {
  line: number | null;
  centerX: number | null;
  centerY: number | null;
}

interface VerseHighlight {
  line: number;
  left_position: number;
  right_position: number;
}

interface ChapterHeader {
  id: number;
  chapter_id: number | null;
  line: number;
  centerX: number;
  centerY: number;
}

interface Verse {
  verseID: number;
  number: number;
  chapter_id: number | null;
  marker1441: VerseMarker | null;
  highlights1441: VerseHighlight[];
}

interface Page {
  identifier: number;
  number: number;
  isRight: boolean;
  chapterHeaders1441: ChapterHeader[];
  verses1441: Verse[];
  chapterHeaders1405: ChapterHeader[];
  verses1405: Verse[];
}
```

### Configuration Types

```typescript
interface QuranConfig {
  // Layout
  lineCount: number;
  lineAspectRatio: number;

  // Sura Name Bar
  suraNameBarWidthRatio: number;
  suraNameBarHeightRatio: number;
  suraNameBarCenterYOffset: number;

  // Verse Marker
  verseMarkerBalance: number;
  verseMarkerCenterYOffset: number;

  // Theme
  backgroundColor: string;
  highlightColor: string;
}

const DEFAULT_CONFIG: QuranConfig = {
  lineCount: 15,
  lineAspectRatio: 1440 / 232,
  suraNameBarWidthRatio: 0.9,
  suraNameBarHeightRatio: 0.8,
  suraNameBarCenterYOffset: 6,
  verseMarkerBalance: 3.69,
  verseMarkerCenterYOffset: 8,
  backgroundColor: "#FFF8E1",
  highlightColor: "rgba(88, 168, 105, 0.4)",
};
```

### Props Types

```typescript
interface QuranViewProps {
  // Required
  pageNumber: number;

  // Layout
  layout?: 1441 | 1405;

  // Display Options
  showSuraName?: boolean;
  showVerseMarkers?: boolean;
  showHighlights?: boolean;

  // Theme
  backgroundColor?: string;
  highlightColor?: string;

  // Selection
  activeChapter?: number;
  activeVerse?: number | null;

  // Callbacks
  onVersePress?: (verse: Verse) => void;
  onChapterPress?: (chapter: number) => void;
  onPageChange?: (page: number) => void;

  // Custom Rendering
  renderSuraNameBar?: (props: SuraNameBarProps) => React.ReactNode;
  renderVerseMarker?: (props: VerseMarkerProps) => React.ReactNode;
}

interface SuraNameBarProps {
  chapterNumber: number;
  chapterName: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

interface VerseMarkerProps {
  verseNumber: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
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
| `backgroundColor` | `string` | No | `"#FFF8E1"` | Page background color |
| `highlightColor` | `string` | No | `"rgba(88, 168, 105, 0.4)"` | Highlight overlay color |
| `activeChapter` | `number` | No | - | Currently selected chapter |
| `activeVerse` | `number` | No | - | Currently selected verse |
| `onVersePress` | `(verse: Verse) => void` | No | - | Verse press callback |
| `onChapterPress` | `(chapter: number) => void` | No | - | Chapter name press callback |
| `onPageChange` | `(page: number) => void` | No | - | Page change callback |
| `renderSuraNameBar` | `(props) => ReactNode` | No | - | Custom sura name bar |
| `renderVerseMarker` | `(props) => ReactNode` | No | - | Custom verse marker |

## Usage Examples

### Basic Usage

```tsx
import { QuranView } from "./components/quran";

<QuranView pageNumber={1} />
```

### With Interactivity

```tsx
import { QuranView } from "./components/quran";

function MyScreen() {
  const [page, setPage] = useState(1);
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState<number | null>(null);

  return (
    <QuranView
      pageNumber={page}
      activeChapter={chapter}
      activeVerse={verse}
      highlightColor="rgba(255, 0, 0, 0.3)"
      onVersePress={(v) => setVerse(v.number)}
      onChapterPress={(c) => setChapter(c)}
      onPageChange={(p) => setPage(p)}
    />
  );
}
```

### With Custom Theme

```tsx
<QuranView
  pageNumber={1}
  backgroundColor="#FFFFFF"
  highlightColor="rgba(255, 200, 0, 0.3)"
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

### Custom Renderers

```tsx
<QuranView
  pageNumber={1}
  renderSuraNameBar={({ chapterNumber, centerX, centerY, width, height }) => (
    <View
      style={{
        position: "absolute",
        left: width * centerX - width / 2,
        top: height * centerY - height / 2 + 6,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            سورة {chapterNumber}
      </Text>
    </View>
  )}
  renderVerseMarker={({ verseNumber, centerX, centerY, width, height }) => (
    <View
      style={{
        position: "absolute",
        left: width * centerX - width / 2,
        top: height * centerY - height / 2 + 8,
      }}
    >
      <Text style={{ fontSize: 12 }}>{verseNumber}</Text>
    </View>
  )}
/>
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
          activeChapter={currentChapter}
          activeVerse={activeVerse}
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
│       ├── QuranPage.tsx
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

## Constants Reference

```typescript
// Default layout values
const LINE_ASPECT_RATIO = 1440 / 232;      // Image aspect ratio
const LINE_COUNT = 15;                     // Lines per page
const SURA_NAME_BAR_WIDTH_RATIO = 0.9;     // 90% of page width
const SURA_NAME_BAR_HEIGHT_RATIO = 0.8;    // 80% of line height
const VERSE_MARKER_BALANCE = 3.69;         // Marker sizing multiplier
```
