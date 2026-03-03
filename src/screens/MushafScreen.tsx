import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { AudioPlayerBar } from "../components/AudioPlayerBar";
import { QuranPage } from "../components/QuranPage";
import { databaseService } from "../services/SQLiteService";
import { versePageIndex } from "../services/VersePageIndex";

const { height, width } = Dimensions.get("window");

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const currentChapterRef = useRef(1);
  const currentPageRef = useRef(1);
  const flatListRef = useRef<FlatList<number>>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTargetRef = useRef<number | null>(null);
  const updateGenRef = useRef(0);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const updateChapter = useCallback(async (pageNumber: number) => {
    const gen = ++updateGenRef.current;
    try {
      const page = await databaseService.getPageByNumber(pageNumber);
      if (gen !== updateGenRef.current) return;

      const chapterNum = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterNum) {
        const chapter = await databaseService.getChapterByNumber(chapterNum);
        if (gen !== updateGenRef.current) return;
        if (chapter) {
          currentChapterRef.current = chapter.number;
          setCurrentChapter(chapter.number);
        }
      }
    } catch {
      // Non-critical chapter lookup failure
    }
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: ViewableItemsChangedInfo) => {
      const first = viewableItems[0];
      const pageNum =
        typeof first?.item === "number"
          ? first.item
          : Number.parseInt(first?.key ?? "", 10);

      if (Number.isFinite(pageNum)) {
        currentPageRef.current = pageNum;
        void updateChapter(pageNum);
      }
    },
  ).current;

  const handleVerseChange = useCallback(
    (verseNumber: number | null) => {
      setActiveVerse(verseNumber);
      if (verseNumber === null || verseNumber === 0) return;

      const chapter = currentChapterRef.current;
      const page = currentPageRef.current;
      versePageIndex
        .getPageForVerse(chapter, verseNumber)
        .then((targetPage) => {
          if (!targetPage || targetPage === page) return;
          const index = targetPage - 1;
          lastScrollTargetRef.current = index;
          flatListRef.current?.scrollToIndex({ index, animated: true });
        })
        .catch(() => {});
    },
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        getItemLayout={(_, index) => ({
          index,
          length: width,
          offset: width * index,
        })}
        horizontal
        initialNumToRender={1}
        inverted
        keyExtractor={(item) => item.toString()}
        maxToRenderPerBatch={2}
        onScrollToIndexFailed={({ index }) => {
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            if (lastScrollTargetRef.current === index) {
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }
          }, 500);
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ height: height - 60, width }}>
            <QuranPage
              activeChapter={currentChapter}
              activeVerse={activeVerse}
              pageNumber={item}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        windowSize={3}
      />
      <AudioPlayerBar
        chapterNumber={currentChapter}
        onVerseChange={handleVerseChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
});
