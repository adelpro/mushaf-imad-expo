import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { QuranImages } from "../constants/imageMap";
import { useQuranPage } from "../hooks/useQuranPage";
import SuraNameBar from "../../assets/images/sura_name_bar.svg";
import { VerseFasel } from "./VerseFasel";

const { width } = Dimensions.get("window");
// Aspect ratio 1440 / 232 = 6.206
const LINE_ASPECT_RATIO = 1440 / 232;
const LINE_HEIGHT = width / LINE_ASPECT_RATIO;
const SURA_NAME_BAR_WIDTH = width * 0.9;
const SURA_NAME_BAR_HEIGHT = LINE_HEIGHT * 0.8;
const LINE_SCALE = width / 1440;
const FASEL_BALANCE = 3.69;
const FASEL_WIDTH = 21 * FASEL_BALANCE * LINE_SCALE;
const FASEL_HEIGHT = 27 * FASEL_BALANCE * LINE_SCALE;

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
  const images = QuranImages[pageNumber];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!images) {
    return <View style={styles.container} />;
  }

  const markersByLine = React.useMemo(() => {
    const map = new Map<
      number,
      { verseID: number; number: number; centerX: number; centerY: number }[]
    >();

    if (!page) return map;

    page.verses1441.forEach((v) => {
      const marker = v.marker1441;
      if (!marker) return;

      const list = map.get(marker.line) ?? [];
      list.push({
        verseID: v.verseID,
        number: v.number,
        centerX: marker.centerX,
        centerY: marker.centerY,
      });
      map.set(marker.line, list);
    });

    for (const list of map.values()) {
      list.sort((a, b) => a.centerX - b.centerX || a.number - b.number);
    }

    return map;
  }, [page]);

  const renderSurahTitleBackgrounds = (lineIndex: number) => {
    if (!page) return null;

    return Array.from(page.chapterHeaders1441)
      .filter((header) => header.line === lineIndex)
      .map((header, i) => {
        const centerX = width * (1.0 - header.centerX);
        const centerY = LINE_HEIGHT * header.centerY;

        const left = centerX - SURA_NAME_BAR_WIDTH / 2;
        const top = centerY - SURA_NAME_BAR_HEIGHT / 2 + 8;

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
      const x = width * (1.0 - m.centerX);
      const y = scaledImageHeight * m.centerY - cropOffset;

      return (
        <View
          key={`fasel-${m.verseID}`}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: x - FASEL_WIDTH / 2 - 2,
            top: y - FASEL_HEIGHT / 2 + 10 - 4,
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
      (v) => v.chapter?.number === activeChapter && v.number === activeVerse
    );

    return versesToHighlight.map((v) => {
      const highlights = v.highlights1441.filter((h) => h.line === lineIndex);
      return highlights.map((h, i) => {
        const left = width * (1.0 - h.right);
        const w = width * (h.right - h.left);

        return (
          <View
            key={`${v.verseID}-${i}`}
            style={{
              position: "absolute",
              left: left,
              width: w,
              height: "100%",
              backgroundColor: "rgba(88, 168, 105, 0.4)", // Quran green highlight
              borderRadius: 4,
            }}
          />
        );
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.linesContainer}>
        {images.map((source, index) => (
          <View key={index} style={{ width, height: LINE_HEIGHT }}>
            {renderSurahTitleBackgrounds(index)}
            {renderVerseMarkers(index)}
            <Image
              source={source}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
            {renderHighlights(index)}
          </View>
        ))}
      </View>
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
  },
});
