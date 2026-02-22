// Quran Component - Main View with Content Press Support
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { useQuranData } from "./use-quran-data";
import { DEFAULT_CONFIG } from "./constants";
import {
  QuranViewProps,
  Verse,
  Chapter,
  VersePressEvent,
  ChapterPressEvent,
  VerseHighlight,
  ChapterHeader,
} from "./types";
import SuraNameBar from "../../../assets/images/sura_name_bar.svg";
import { VerseFasel } from "../verse-fasel";
import { QuranImages } from "../../constants/image-map";
import { VersePopup } from "./verse-popup";
import { ChapterPopup } from "./chapter-popup";
import { colors } from "../../theme";

const { width } = Dimensions.get("window");

export function QuranView({
  pageNumber,
  layout = 1441,
  showSuraName = true,
  showVerseMarkers = true,
  showHighlights = true,
  highlightColor = colors.state.textSelection,
  onVersePress,
  onVerseLongPress,
  onChapterPress,
  onChapterLongPress,
}: QuranViewProps) {
  const { page, loading, error } = useQuranData(pageNumber);

  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [versePopupVisible, setVersePopupVisible] = useState(false);
  const [chapterPopupVisible, setChapterPopupVisible] = useState(false);

  const config = DEFAULT_CONFIG;
  const lineHeight = width / config.lineAspectRatio;
  const lineScale = width / 1440;

  const suraNameBarWidth = width * config.suraNameBarWidthRatio;
  const suraNameBarHeight = lineHeight * config.suraNameBarHeightRatio;
  const suraNameBarCenterYOffset = config.suraNameBarCenterYOffset * lineScale;

  const faselBalance = config.verseMarkerBalance;
  const faselWidth = 21 * faselBalance * lineScale;
  const faselHeight = 27 * faselBalance * lineScale;
  const faselCenterYOffset = config.verseMarkerCenterYOffset * lineScale;

  const resolveLineImage = useCallback(
    (lineIndex: number) => {
      const pageImages = QuranImages[pageNumber];
      if (!pageImages) return undefined;
      return pageImages[lineIndex];
    },
    [pageNumber],
  );

  const markersByLine = useMemo(() => {
    const map = new Map<
      number,
      Array<{
        verse: Verse;
        centerX: number;
        centerY: number;
      }>
    >();

    if (!page) return map;

    const verses = layout === 1441 ? page.verses1441 : page.verses1405;

    verses.forEach((verse: Verse) => {
      const marker = layout === 1441 ? verse.marker1441 : verse.marker1405;
      if (
        !marker ||
        marker.line === null ||
        marker.centerX === null ||
        marker.centerY === null
      )
        return;

      const list = map.get(marker.line) ?? [];
      list.push({
        verse,
        centerX: marker.centerX,
        centerY: marker.centerY,
      });
      map.set(marker.line, list);
    });

    for (const list of map.values()) {
      list.sort(
        (a, b) => a.centerX - b.centerX || a.verse.number - b.verse.number,
      );
    }

    return map;
  }, [page, layout]);

  const handleVersePress = useCallback(
    (verse: Verse, x: number, y: number) => {
      console.log("[QuranView] onVersePress:", {
        verseNumber: verse.number,
        chapterId: verse.chapter_id,
        pageNumber,
        position: { x, y },
      });
      setSelectedVerse(verse);
      setVersePopupVisible(true);

      const event: VersePressEvent = {
        verse,
        page: pageNumber,
        chapter: verse.chapter_id || 0,
        position: { x, y },
      };
      onVersePress?.(event);
    },
    [pageNumber, onVersePress],
  );

  const handleVerseLongPress = useCallback(
    (verse: Verse, x: number, y: number) => {
      console.log("[QuranView] onVerseLongPress:", {
        verseNumber: verse.number,
        chapterId: verse.chapter_id,
        pageNumber,
        position: { x, y },
      });
      setSelectedVerse(verse);
      setVersePopupVisible(true);
      const event: VersePressEvent = {
        verse,
        page: pageNumber,
        chapter: verse.chapter_id || 0,
        position: { x, y },
      };
      onVerseLongPress?.(event);
    },
    [pageNumber, onVerseLongPress],
  );

  const handleChapterPress = useCallback(
    (chapter: Chapter, x: number, y: number) => {
      console.log("[QuranView] onChapterPress:", {
        chapterNumber: chapter.number,
        pageNumber,
        position: { x, y },
      });
      setSelectedChapter(chapter);
      setChapterPopupVisible(true);

      const event: ChapterPressEvent = {
        chapter,
        page: pageNumber,
        position: { x, y },
      };
      onChapterPress?.(event);
    },
    [pageNumber, onChapterPress],
  );

  const handleChapterLongPress = useCallback(
    (chapter: Chapter, x: number, y: number) => {
      console.log("[QuranView] onChapterLongPress:", {
        chapterNumber: chapter.number,
        pageNumber,
        position: { x, y },
      });
      const event: ChapterPressEvent = {
        chapter,
        page: pageNumber,
        position: { x, y },
      };
      onChapterLongPress?.(event);
    },
    [pageNumber, onChapterLongPress],
  );

  const renderSuraNameBars = (lineIndex: number) => {
    if (!page || !showSuraName) return null;

    const headers =
      layout === 1441 ? page.chapterHeaders1441 : page.chapterHeaders1405;
    const matchingHeaders = headers.filter(
      (header: ChapterHeader) => header.line === lineIndex,
    );

    return matchingHeaders.map((header: ChapterHeader, i: number) => {
      const centerX = width * header.centerX;
      const centerY = lineHeight * header.centerY;
      const left = centerX - suraNameBarWidth / 2;
      const top = centerY - suraNameBarHeight / 2 + suraNameBarCenterYOffset;

      return (
        <TouchableOpacity
          key={`surah-title-${lineIndex}-${i}`}
          style={{
            position: "absolute",
            left,
            top,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() =>
            handleChapterPress(
              createChapter(header.chapter_id),
              centerX,
              centerY,
            )
          }
          onLongPress={() =>
            handleChapterLongPress(
              createChapter(header.chapter_id),
              centerX,
              centerY,
            )
          }
        >
          <SuraNameBar width={suraNameBarWidth} height={suraNameBarHeight} />
        </TouchableOpacity>
      );
    });
  };

  const renderVerseMarkers = (lineIndex: number) => {
    if (!page || !showVerseMarkers) return null;

    const markers = markersByLine.get(lineIndex) ?? [];
    const scaledImageHeight = width / config.lineAspectRatio;
    const cropOffset = (scaledImageHeight - lineHeight) / 2;

    return markers.map((m) => {
      const x = width * m.centerX;
      const y = scaledImageHeight * m.centerY - cropOffset;

      return (
        <TouchableOpacity
          key={`fasel-${m.verse.verseID}`}
          style={{
            position: "absolute",
            left: x - faselWidth / 2,
            top: y - faselHeight / 2 + faselCenterYOffset,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handleVersePress(m.verse, x, y)}
          onLongPress={() => handleVerseLongPress(m.verse, x, y)}
        >
          <VerseFasel number={m.verse.number} scale={lineScale} />
        </TouchableOpacity>
      );
    });
  };

  const renderVerseHighlights = (lineIndex: number) => {
    if (!page || !showHighlights || !selectedVerse) return null;

    const verses = layout === 1441 ? page.verses1441 : page.verses1405;
    const highlightsKey = layout === 1441 ? "highlights1441" : "highlights1405";

    const versesToHighlight = verses.filter(
      (v: Verse) => v.verseID === selectedVerse.verseID,
    );

    return versesToHighlight.map((v: Verse) => {
      const highlights = (v[highlightsKey] as VerseHighlight[]) || [];
      const lineHighlights = highlights.filter((h) => h.line === lineIndex);

      return lineHighlights.map((h, i) => {
        const left = width * h.left_position;
        const w = width * (h.right_position - h.left_position);

        return (
          <View
            key={`${v.verseID}-highlight-${i}`}
            style={{
              position: "absolute",
              left,
              width: w,
              height: "100%",
              backgroundColor: highlightColor,
              borderRadius: 4,
            }}
          />
        );
      });
    });
  };

  // Whenever a line is clicked, we search for a verse that has a highlight on that line number,
  // and check whether the X position of the click falls between the start and end positions of that verse’s highlight.
  const onLineClicked = useCallback(
    (lineIndex: number, locationX: number) => {
      const xIndex = locationX / width;

      if (!page) return;

      const verses = layout === 1441 ? page.verses1441 : page.verses1405;
      const highlightsKey =
        layout === 1441 ? "highlights1441" : "highlights1405";

      const targetVerse = verses.findLast((v) => {
        const highlights = v[highlightsKey] as VerseHighlight[];
        return highlights.some(
          (h) =>
            h.line === lineIndex &&
            h.left_position <= xIndex &&
            h.right_position >= xIndex,
        );
      });

      if (!targetVerse) return;

      setSelectedVerse(targetVerse);
      setVersePopupVisible(true);
    },
    [width, page, layout, setSelectedVerse, setVersePopupVisible],
  );

  const renderLines = () => {
    const lines: React.ReactNode[] = [];

    for (let i = 0; i < config.lineCount; i++) {
      const lineImageSource = resolveLineImage(i);

      lines.push(
        <Pressable
          key={i}
          style={{
            width,
            height: lineHeight,
            backgroundColor: "transparent",
            marginBottom: 4,
          }}
          onPress={(e) => {
            onLineClicked(i, e.nativeEvent.locationX);
          }}
          onLongPress={(e) => {
            onLineClicked(i, e.nativeEvent.locationX);
          }}
        >
          <View style={{ width, height: lineHeight, position: "absolute" }}>
            {lineImageSource && (
              <Image
                source={lineImageSource}
                style={{ width, height: lineHeight }}
                resizeMode="stretch"
              />
            )}
          </View>
          <View
            style={{ width, height: lineHeight, position: "absolute" }}
            pointerEvents="box-none"
          >
            {renderSuraNameBars(i)}
            {renderVerseMarkers(i)}
            {renderVerseHighlights(i)}
          </View>
        </Pressable>,
      );
    }

    return lines;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.default} />
      </View>
    );
  }

  if (error || !page) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error?.message || "Page not found"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.linesContainer}>{renderLines()}</View>

      <VersePopup
        visible={versePopupVisible}
        verse={selectedVerse}
        chapter={selectedChapter as Chapter | null}
        onClose={() => setVersePopupVisible(false)}
      />

      <ChapterPopup
        visible={chapterPopupVisible}
        chapter={selectedChapter}
        pageNumber={pageNumber}
        onClose={() => setChapterPopupVisible(false)}
      />
    </View>
  );
}

function createChapter(id: number | null): Chapter {
  return {
    identifier: 0,
    number: id || 0,
    isMeccan: 0,
    title: "",
    arabicTitle: "",
    englishTitle: "",
    titleCodePoint: "",
    searchableText: null,
    searchableKeywords: null,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEFAULT_CONFIG.backgroundColor,
    justifyContent: "center",
  },
  linesContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.text.error,
    fontSize: 16,
  },
});
