import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useQuranPage } from "../hooks/useQuranPage";
import SuraNameBar from "../../assets/images/sura_name_bar.svg";
import { VerseFasel } from "./VerseFasel";
import { QuranImages } from "../constants/imageMap";

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
  const { page, loading } = useQuranPage(pageNumber);

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
      const markersWithData = page.verses1441.filter(
        (v) => v.marker1441 && v.marker1441.line !== null,
      );

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
  }, [page, pageNumber]);

  const renderSurahTitleBackgrounds = (lineIndex: number) => {
    if (!page) return null;

    const matchingHeaders = page.chapterHeaders1441.filter(
      (header) => header.line === lineIndex,
    );

    return matchingHeaders.map((header, i) => {
      const centerX = width * header.centerX;
      const centerY = LINE_HEIGHT * header.centerY;

      const left = centerX - SURA_NAME_BAR_WIDTH / 2;
      const top =
        centerY - SURA_NAME_BAR_HEIGHT / 2 + SURA_NAME_BAR_CENTER_Y_OFFSET;

      return (
        <View
          key={`surah-title-bg-${lineIndex}-${i}`}
          pointerEvents="none"
          style={{
            position: "absolute",
            left,
            top,
          }}
        >
          <SuraNameBar
            width={SURA_NAME_BAR_WIDTH}
            height={SURA_NAME_BAR_HEIGHT}
          />
        </View>
      );
    });
  };

  const renderVerseMarkers = (lineIndex: number) => {
    if (!page) return null;

    const markers = markersByLine.get(lineIndex) ?? [];

    const scaledImageHeight = width / LINE_ASPECT_RATIO;
    const cropOffset = (scaledImageHeight - LINE_HEIGHT) / 2;

    return markers.map((m) => {
      const x = width * m.centerX;
      const y = scaledImageHeight * m.centerY - cropOffset;

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
              backgroundColor: "rgba(88, 168, 105, 0.4)",
              borderRadius: 4,
            }}
          />
        );
      });
    });
  };

  const renderLines = () => {
    const lines: React.ReactNode[] = [];
    const lineCount = 15;

    for (let i = 0; i < lineCount; i++) {
      const lineImageSource = resolveLineImage(pageNumber, i);

      lines.push(
        <View key={i} style={{ width, height: LINE_HEIGHT }}>
          {lineImageSource && (
            <Image
              source={lineImageSource}
              style={{ width, height: LINE_HEIGHT }}
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

  return (
    <View style={styles.container}>
      <View style={styles.linesContainer}>{renderLines()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
  },
  linesContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
