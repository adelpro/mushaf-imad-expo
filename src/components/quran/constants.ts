// Quran Component - Constants
import { QuranConfig } from "./types";

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

export const LAYOUT_TYPE = {
  STANDARD: 1441,
  ALTERNATIVE: 1405,
} as const;
