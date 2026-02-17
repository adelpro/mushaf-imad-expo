// Quran Component - Main Export

export { QuranView } from "./quran-view";
export { useQuranData } from "./use-quran-data";
export { VersePopup } from "./verse-popup";
export { ChapterPopup } from "./chapter-popup";

// Types
export type {
  VerseMarker,
  VerseHighlight,
  ChapterHeader,
  Verse,
  Page,
  Chapter,
  QuranConfig,
  QuranViewProps,
  SuraNameBarProps,
  VerseMarkerProps,
  VersePressEvent,
  ChapterPressEvent,
} from "./types";

// Constants
export { DEFAULT_CONFIG } from "./constants";
