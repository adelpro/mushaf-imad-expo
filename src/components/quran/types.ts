// Quran Component - Types

// Page Types
export interface VerseMarker {
  numberCodePoint: string | null;
  line: number | null;
  centerX: number | null;
  centerY: number | null;
}

export interface VerseHighlight {
  line: number;
  left_position: number;
  right_position: number;
}

export interface ChapterHeader {
  id: number;
  chapter_id: number | null;
  line: number;
  centerX: number;
  centerY: number;
}

export interface Verse {
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
}

export interface Page {
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
  chapterHeaders1441: ChapterHeader[];
  chapterHeaders1405: ChapterHeader[];
  verses1441: Verse[];
  verses1405: Verse[];
}

export interface Chapter {
  identifier: number;
  number: number;
  isMeccan: number;
  title: string;
  arabicTitle: string;
  englishTitle: string;
  titleCodePoint: string;
  searchableText: string | null;
  searchableKeywords: string | null;
}

// Configuration Types
export interface QuranConfig {
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

  // Data
  defaultLayout: 1441 | 1405;
}

export const DEFAULT_CONFIG: QuranConfig = {
  lineCount: 15,
  lineAspectRatio: 1440 / 232,
  suraNameBarWidthRatio: 0.9,
  suraNameBarHeightRatio: 0.8,
  suraNameBarCenterYOffset: 6,
  verseMarkerBalance: 3.69,
  verseMarkerCenterYOffset: 8,
  backgroundColor: "#FFF8E1",
  highlightColor: "rgba(88, 168, 105, 0.4)",
  defaultLayout: 1441,
};

// Event Types
export interface VersePressEvent {
  verse: Verse;
  page: number;
  chapter: number;
  position: {
    x: number;
    y: number;
  } | null;
}

export interface ChapterPressEvent {
  chapter: Chapter;
  page: number;
  position: {
    x: number;
    y: number;
  } | null;
}

// Props Types
export interface QuranViewProps {
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
  onVersePress?: (event: VersePressEvent) => void;
  onVerseLongPress?: (event: VersePressEvent) => void;
  onChapterPress?: (event: ChapterPressEvent) => void;
  onChapterLongPress?: (event: ChapterPressEvent) => void;
  onPageChange?: (page: number) => void;

  // Custom Rendering
  renderSuraNameBar?: (props: SuraNameBarProps) => React.ReactNode;
  renderVerseMarker?: (props: VerseMarkerProps) => React.ReactNode;
}

export interface SuraNameBarProps {
  chapterNumber: number;
  chapterName: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface VerseMarkerProps {
  verseNumber: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}
