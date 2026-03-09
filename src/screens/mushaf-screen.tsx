import React, { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayerBar } from "../components/audio-player-bar";
import { BookmarkListScreen } from "./bookmark-list-screen";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { PageJumpInput } from "../components/page-jump-input";
import { databaseService } from "../services/sqlite-service";
import { setLastRead } from "../services/last-read-service";
import { addReadPage } from "../services/read-pages-service";
import { QuranView } from "../components/quran";
import { colors } from "../theme";
import { useMushafStore } from "../store/mushaf-store";

const { height, width } = Dimensions.get("window");

/** Minimum time (ms) on a page before it counts as "read" for Continue Reading */
const MIN_DWELL_MS = 12_000;

/** Debounce (ms) before updating chapter highlight to reduce DB queries during fast scroll */
const CHAPTER_UPDATE_DEBOUNCE_MS = 250;

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

type MushafScreenProps = {
  onContentTap: () => void;
};

export function MushafScreen({ onContentTap }: MushafScreenProps) {
  const currentChapter = useMushafStore((s) => s.currentChapter);
  const setCurrentChapter = useMushafStore((s) => s.setCurrentChapter);
  const activeVerse = useMushafStore((s) => s.activeVerse);
  const jumpToPage = useMushafStore((s) => s.jumpToPage);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const storeCurrentPage = useMushafStore((s) => s.currentPage);
  const setStoreCurrentPage = useMushafStore((s) => s.setCurrentPage);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  const setActiveVerse = useMushafStore((s) => s.setActiveVerse);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const flatListRef = useRef<FlatList<number>>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDwellPageRef = useRef<number>(1);

  const initialScrollIndex = (() => {
    const target = jumpToPage ?? storeCurrentPage;
    if (target >= 1 && target <= 604) return target - 1;
    return 0;
  })();

  useEffect(() => {
    if (jumpToPage != null) {
      const page = jumpToPage;
      setJumpToPage(null);
      const index = page - 1;
      const id = requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [jumpToPage, setJumpToPage]);

  const handleVerseChange = useCallback(
    (verseNumber: number | null) => {
      setActiveVerse(verseNumber);
    },
    [setActiveVerse],
  );

  const handleContentTap = useCallback(() => {
    onContentTap();
    const pageToSave = currentDwellPageRef.current;
    if (Number.isFinite(pageToSave)) {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      void persistLastRead(pageToSave);
    }
  }, [onContentTap]);

  async function updateChapterHighlight(pageNumber: number) {
    try {
      const page = await databaseService.getPageByNumber(pageNumber);
      if (currentDwellPageRef.current !== pageNumber) return;
      const chapterRef = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterRef != null) {
        const chapter =
          (await databaseService.getChapterByNumber(chapterRef)) ??
          (await databaseService.getChapterByIdentifier(chapterRef));
        if (chapter && currentDwellPageRef.current === pageNumber) {
          setCurrentChapter(chapter.number);
        }
      }
    } catch (error) {
      console.log("Error getting chapter", error);
    }
  }

  async function persistLastRead(pageNumber: number) {
    try {
      const page = await databaseService.getPageByNumber(pageNumber);
      const chapterRef = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterRef != null) {
        const chapter =
          (await databaseService.getChapterByNumber(chapterRef)) ??
          (await databaseService.getChapterByIdentifier(chapterRef));
        if (chapter) {
          const firstVerse = page?.verses1441?.[0];
          const ayah = firstVerse?.number ?? 1;
          void setLastRead({
            page: pageNumber,
            chapterNumber: chapter.number,
            ayah,
          });
        }
      }
    } catch (error) {
      console.log("Error persisting last read", error);
    }
  }

  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }
      if (chapterUpdateTimerRef.current) {
        clearTimeout(chapterUpdateTimerRef.current);
      }
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: ViewableItemsChangedInfo) => {
      const first = viewableItems[0];
      const pageNum =
        typeof first?.item === "number"
          ? first.item
          : Number.parseInt(first?.key ?? "", 10);

      if (!Number.isFinite(pageNum)) return;

      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }

      setCurrentPage(pageNum);
      setStoreCurrentPage(pageNum);
      currentDwellPageRef.current = pageNum;

      if (chapterUpdateTimerRef.current) {
        clearTimeout(chapterUpdateTimerRef.current);
      }
      chapterUpdateTimerRef.current = setTimeout(() => {
        chapterUpdateTimerRef.current = null;
        void updateChapterHighlight(pageNum);
      }, CHAPTER_UPDATE_DEBOUNCE_MS);

      dwellTimerRef.current = setTimeout(() => {
        dwellTimerRef.current = null;
        void persistLastRead(pageNum);
        void addReadPage(pageNum);
      }, MIN_DWELL_MS);
    },
  ).current;

  const handleJumpToPage = useCallback(
    (page: number) => {
      const index = page - 1;
      flatListRef.current?.scrollToIndex({ index, animated: false });
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
        initialScrollIndex={initialScrollIndex}
        inverted
        keyExtractor={(item) => item.toString()}
        maxToRenderPerBatch={2}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ height, width }}>
            <QuranView
              activeChapter={currentChapter}
              activeVerse={activeVerse}
              onContentTap={handleContentTap}
              pageNumber={item}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        windowSize={3}
      />
      <PageJumpInput currentPage={currentPage} onJumpToPage={handleJumpToPage} />
      <AudioPlayerBar
        chapterNumber={currentChapter}
        onVerseChange={handleVerseChange}
      />
      <BookmarkListScreen
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        onNavigateToPage={handleJumpToPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
