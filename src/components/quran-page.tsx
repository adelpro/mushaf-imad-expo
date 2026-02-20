import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useQuranPage } from "../hooks/use-quran-page";
import SuraNameBar from "../../assets/images/sura_name_bar.svg";
import { VerseFasel } from "./verse-fasel";
import { QuranImages } from "../constants/image-map";
import { colors } from "../theme";

const LINE_ASPECT_RATIO = 1440 / 232;
const FASEL_BALANCE = 3.69;
const SURA_NAME_BAR_CENTER_Y_OFFSET_FACTOR = 6;
const FASEL_CENTER_Y_OFFSET_FACTOR = 8;

const resolveLineImage = (
  pageNumber: number,
  lineIndex: number,
): number | undefined => {
  const pageImages = QuranImages[pageNumber];
  if (!pageImages) return undefined;
  return pageImages[lineIndex];
};

interface Props {
  pageNumber: number;
  activeChapter?: number;
  activeVerse?: number | null;
}

export const QuranPage: React.FC<Props> = ({
  pageNumber,
  activeChapter,
  activeVerse,
}) => {
  const { width } = useWindowDimensions();
  const { page, loading, error, retry } = useQuranPage(pageNumber);

  const lineHeight = width / LINE_ASPECT_RATIO;
  const lineScale = width / 1440;
  const suraNameBarWidth = width * 0.9;
  const suraNameBarHeight = lineHeight * 0.8;
  const suraNameBarCenterYOffset = SURA_NAME_BAR_CENTER_Y_OFFSET_FACTOR * lineScale;
  const faselWidth = 21 * FASEL_BALANCE * lineScale;
  const faselHeight = 27 * FASEL_BALANCE * lineScale;
  const faselCenterYOffset = FASEL_CENTER_Y_OFFSET_FACTOR * lineScale;

  const markersByLine = React.useMemo(() => {
    const map = new Map<
      number,
      Array<{
        verseID: number;
        number: number;
        centerX: number;
        centerY: number;
      }>
    >();
    if (page) {
      page.verses1441.forEach((verse) => {
        const marker = verse.marker1441;
        if (
          !marker ||
          marker.line === null ||
          marker.centerX === null ||
          marker.centerY === null
        )
          return;
        const list = map.get(marker.line) ?? [];
        list.push({
          verseID: verse.verseID,
          number: verse.number,
          centerX: marker.centerX,
          centerY: marker.centerY,
        });
        map.set(marker.line, list);
      });
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.centerX - b.centerX || a.number - b.number);
    }
    return map;
  }, [page]);

  const renderSurahTitleBackgrounds = (lineIndex: number) => {
    if (!page) return null;
    const matchingHeaders = page.chapterHeaders1441.filter(
      (header) => header.line === lineIndex,
    );
    return matchingHeaders.map((header, i) => {
      const centerX = width * header.centerX;
      const centerY = lineHeight * header.centerY;
      const left = centerX - suraNameBarWidth / 2;
      const top =
        centerY - suraNameBarHeight / 2 + suraNameBarCenterYOffset;
      return (
        <View
          key={`surah-title-bg-${lineIndex}-${i}`}
          pointerEvents="none"
          style={{ position: "absolute", left, top }}
        >
          <SuraNameBar
            width={suraNameBarWidth}
            height={suraNameBarHeight}
          />
        </View>
      );
    });
  };

  const renderVerseMarkers = (lineIndex: number) => {
    if (!page) return null;
    const markers = markersByLine.get(lineIndex) ?? [];
    const scaledImageHeight = width / LINE_ASPECT_RATIO;
    const cropOffset = (scaledImageHeight - lineHeight) / 2;
    return markers.map((m) => {
      const x = width * m.centerX;
      const y = scaledImageHeight * m.centerY - cropOffset;
      return (
        <View
          key={`fasel-${m.verseID}`}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: x - faselWidth / 2,
            top: y - faselHeight / 2 + faselCenterYOffset,
          }}
        >
          <VerseFasel number={m.number} scale={lineScale} />
        </View>
      );
    });
  };

  const renderHighlights = (lineIndex: number) => {
    if (!page || !activeVerse || !activeChapter) return null;
    const versesToHighlight = page.verses1441.filter(
      (v) => v.chapter_id === activeChapter && v.number === activeVerse,
    );
    return versesToHighlight.map((v) => {
      const highlights = v.highlights1441.filter((h) => h.line === lineIndex);
      return highlights.map((h, i) => {
        const left = width * h.left_position;
        const w = width * (h.right_position - h.left_position);
        return (
          <View
            key={`${v.verseID}-${i}`}
            style={{
              position: "absolute",
              left: left,
              width: w,
              height: "100%",
              backgroundColor: colors.brand.highlight,
              borderRadius: 4,
            }}
          />
        );
      });
    });
  };

  const renderLines = () => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i < 15; i++) {
      const lineImageSource = resolveLineImage(pageNumber, i);
      lines.push(
        <View key={i} style={{ width, height: lineHeight }}>
          {lineImageSource && (
            <Image
              source={lineImageSource}
              style={{ width, height: lineHeight }}
              resizeMode="stretch"
            />
          )}
          {renderSurahTitleBackgrounds(i)}
          {renderVerseMarkers(i)}
          {renderHighlights(i)}
        </View>,
      );
    }
    return lines;
  };

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
      <View style={styles.linesContainer}>{renderLines()}</View>
    </View>
  );
};

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
