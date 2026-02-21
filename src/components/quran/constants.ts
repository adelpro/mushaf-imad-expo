// Quran Component - Constants
import { colors } from "../../theme";
import { QuranConfig } from "./types";

export const DEFAULT_CONFIG: QuranConfig = {
  lineCount: 15,
  lineAspectRatio: 1440 / 232,
  suraNameBarWidthRatio: 0.9,
  suraNameBarHeightRatio: 0.8,
  suraNameBarCenterYOffset: 6,
  verseMarkerBalance: 3.69,
  verseMarkerCenterYOffset: 8,
  backgroundColor: colors.background.default,
  highlightColor: colors.brand.highlight,
  defaultLayout: 1441,
};

export const LAYOUT_TYPE = {
  STANDARD: 1441,
  ALTERNATIVE: 1405,
} as const;
