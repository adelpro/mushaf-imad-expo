import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useQuranPage } from "../hooks/use-quran-page";
import SuraNameBar from "../../assets/images/sura_name_bar.svg";
import { VerseFasel } from "./verse-fasel";
import { QuranImages } from "../constants/image-map";
import { colors } from "../theme";

const { width } = Dimensions.get("window");
const LINE_ASPECT_RATIO = 1440 / 232;
const LINE_HEIGHT = width / LINE_ASPECT_RATIO;
const SURA_NAME_BAR_WIDTH = width * 0.9;
const SURA_NAME_BAR_HEIGHT = LINE_HEIGHT * 0.8;
const LINE_SCALE = width / 1440;
const FASEL_BALANCE = 3.69;
const FASEL_WIDTH = 21 * FASEL_BALANCE * LINE_SCALE;
const FASEL_HEIGHT = 27 * FASEL_BALANCE * LINE_SCALE;
const SURA_NAME_BAR_CENTER_Y_OFFSET = 6 * LINE_SCALE;
const FASEL_CENTER_Y_OFFSET = 8 * LINE_SCALE;
const SCALED_IMAGE_HEIGHT = width / LINE_ASPECT_RATIO;
const CROP_OFFSET = (SCALED_IMAGE_HEIGHT - LINE_HEIGHT) / 2;

const resolveLineImage = (
  pageNumber: number,
  lineIndex: number,
): number | undefined => {
  const pageImages = QuranImages[pageNumber];
  if (!pageImages) return undefined;
  return pageImages[lineIndex];
};

// ---------------------------------------------------------------------------
// Memoized layer components — only re-render when their own props change
// ---------------------------------------------------------------------------

type SurahHeader = {
  line: number;
  centerX: number;
  centerY: number;
  chapter_id: number | null;
};

const SurahTitlesLayer = React.memo(function SurahTitlesLayer({
  headers,
  lineIndex,
}: {
  headers: SurahHeader[];
  lineIndex: number;
}) {
  const matching = headers.filter((h) => h.line === lineIndex);
  if (matching.length === 0) return null;

  return (
    <>
      {matching.map((header, i) => {
        const cx = width * header.centerX;
        const cy = LINE_HEIGHT * header.centerY;
        return (
          <View
            key={`surah-title-bg-${lineIndex}-${i}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: cx - SURA_NAME_BAR_WIDTH / 2,
              top: cy - SURA_NAME_BAR_HEIGHT / 2 + SURA_NAME_BAR_CENTER_Y_OFFSET,
            }}
          >
            <SuraNameBar
              width={SURA_NAME_BAR_WIDTH}
              height={SURA_NAME_BAR_HEIGHT}
            />
          </View>
        );
      })}
    </>
  );
});

type MarkerEntry = {
  verseID: number;
  number: number;
  centerX: number;
  centerY: number;
};

const VerseMarkersLayer = React.memo(function VerseMarkersLayer({
  markers,
}: {
  markers: MarkerEntry[];
}) {
  if (markers.length === 0) return null;

  return (
    <>
      {markers.map((m) => {
        const x = width * m.centerX;
        const y = SCALED_IMAGE_HEIGHT * m.centerY - CROP_OFFSET;
        return (
          <View
            key={`fasel-${m.verseID}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: x - FASEL_WIDTH / 2,
              top: y - FASEL_HEIGHT / 2 + FASEL_CENTER_Y_OFFSET,
            }}
          >
            <VerseFasel number={m.number} scale={LINE_SCALE} />
          </View>
        );
      })}
    </>
  );
});

type HighlightEntry = {
  verseID: number;
  left_position: number;
  right_position: number;
  line: number;
};

const HighlightsLayer = React.memo(function HighlightsLayer({
  highlights,
  lineIndex,
}: {
  highlights: HighlightEntry[];
  lineIndex: number;
}) {
  const lineHighlights = highlights.filter((h) => h.line === lineIndex);
  if (lineHighlights.length === 0) return null;

  return (
    <>
      {lineHighlights.map((h, i) => {
        const left = width * h.left_position;
        const w = width * (h.right_position - h.left_position);
        return (
          <View
            key={`${h.verseID}-${i}`}
            style={{
              position: "absolute",
              left,
              width: w,
              height: "100%",
              backgroundColor: colors.brand.highlight,
              borderRadius: 4,
            }}
          />
        );
      })}
    </>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  pageNumber: number;
  activeChapter?: number;
  activeVerse?: number | null;
}

export const QuranPage = React.memo<Props>(function QuranPage({
  pageNumber,
  activeChapter,
  activeVerse,
}) {
  const { page, loading, error, retry } = useQuranPage(pageNumber);

  const markersByLine = React.useMemo(() => {
    const map = new Map<number, MarkerEntry[]>();
    if (!page) return map;

    for (const verse of page.verses1441) {
      const marker = verse.marker1441;
      if (
        !marker ||
        marker.line === null ||
        marker.centerX === null ||
        marker.centerY === null
      )
        continue;
      const list = map.get(marker.line) ?? [];
      list.push({
        verseID: verse.verseID,
        number: verse.number,
        centerX: marker.centerX,
        centerY: marker.centerY,
      });
      map.set(marker.line, list);
    }

    for (const list of map.values()) {
      list.sort((a, b) => a.centerX - b.centerX || a.number - b.number);
    }
    return map;
  }, [page]);

  const activeHighlights = React.useMemo<HighlightEntry[]>(() => {
    if (!page || !activeVerse || !activeChapter) return [];
    return page.verses1441
      .filter((v) => v.chapter_id === activeChapter && v.number === activeVerse)
      .flatMap((v) =>
        v.highlights1441.map((h) => ({ ...h, verseID: v.verseID })),
      );
  }, [page, activeChapter, activeVerse]);

  const lines = React.useMemo(() => {
    const result: React.ReactNode[] = [];
    const headers = page?.chapterHeaders1441 ?? [];

    for (let i = 0; i < 15; i++) {
      const lineImageSource = resolveLineImage(pageNumber, i);
      const markers = markersByLine.get(i) ?? [];

      result.push(
        <View key={i} style={{ width, height: LINE_HEIGHT }}>
          {lineImageSource && (
            <Image
              source={lineImageSource}
              style={{ width, height: LINE_HEIGHT }}
              resizeMode="stretch"
            />
          )}
          <SurahTitlesLayer headers={headers} lineIndex={i} />
          <VerseMarkersLayer markers={markers} />
          <HighlightsLayer highlights={activeHighlights} lineIndex={i} />
        </View>,
      );
    }
    return result;
  }, [pageNumber, page, markersByLine, activeHighlights]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.brand.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { padding: 20 }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.linesContainer}>{lines}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default, justifyContent: "center" },
  linesContainer: { flexDirection: "column", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  errorText: {
    color: colors.text.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "System",
  },
  retryButton: {
    backgroundColor: colors.brand.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: colors.text.inverse, fontWeight: "bold" },
});
