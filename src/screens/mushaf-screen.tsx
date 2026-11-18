import React, { useCallback, useEffect, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, View, ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { databaseService } from "../services/sqlite-service";
import { getLastRead, setLastRead } from "../services/last-read-service";
import { addReadPage, getReadPagesCount } from "../services/read-pages-service";
import { QuranView, VersePressEvent } from "../components/quran";
import { colors } from "../theme";
import { useMushafStore } from "../store/mushaf-store";

const { height, width } = Dimensions.get("window");

const TOTAL_MUSHAF_PAGES = 604;
// Position tracking only (not a reading-count signal): how long to wait after
// the reader lands on a page before persisting it as the "continue" position.
const LAST_READ_DEBOUNCE_MS = 500;
const CHAPTER_UPDATE_DEBOUNCE_MS = 250;

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

type MushafScreenProps = {
  onContentTap: () => void;
};

export function MushafScreen({ onContentTap }: MushafScreenProps) {
  const insets = useSafeAreaInsets();
  const currentChapter = useMushafStore((s) => s.currentChapter);
  const setCurrentChapter = useMushafStore((s) => s.setCurrentChapter);
  const activeVerse = useMushafStore((s) => s.activeVerse);
  const jumpToPage = useMushafStore((s) => s.jumpToPage);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const storeCurrentPage = useMushafStore((s) => s.currentPage);
  const setReadCount = useMushafStore((s) => s.setReadCount);

  const pages = Array.from({ length: TOTAL_MUSHAF_PAGES }, (_, i) => i + 1);

  // Where the reader starts (a jump target or the saved position). Used both
  // for the initial scroll and as the "previous page" seed so the first
  // viewability event never counts pages the reader skipped via a jump.
  const initialTarget = (() => {
    const target = jumpToPage ?? storeCurrentPage;
    return target >= 1 && target <= TOTAL_MUSHAF_PAGES ? target : 1;
  })();

  const flatListRef = useRef<FlatList<number>>(null);
  const lastReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentViewablePageRef = useRef<number>(initialTarget);
  const sessionStartedRef = useRef(false);

  // Practical reading count — a page counts as read through real actions:
  //  1. Tapping a verse on the page (instant, strongest signal).
  //  2. Leaving the page (swiping to another page) — the reader moved on.
  //  3. Leaving the mushaf screen — the page being read counts on exit.
  const markPageRead = useCallback((page: number) => {
    if (!Number.isFinite(page) || page < 1 || page > TOTAL_MUSHAF_PAGES) return;
    void addReadPage(page).then(() => {
      void getReadPagesCount().then((c) => useMushafStore.getState().setReadCount(c));
    });
  }, []);

  useEffect(() => {
    void getReadPagesCount().then(setReadCount);
  }, [setReadCount]);

  const initialScrollIndex = initialTarget - 1;

  useEffect(() => {
    if (jumpToPage != null) {
      flatListRef.current?.scrollToIndex({
        index: jumpToPage - 1,
        animated: false,
      });
      setJumpToPage(null);
    }
  }, [jumpToPage, setJumpToPage]);

  // Leaving the mushaf counts the page the reader was on last.
  useEffect(() => {
    return () => {
      if (lastReadTimerRef.current) clearTimeout(lastReadTimerRef.current);
      if (chapterUpdateTimerRef.current) clearTimeout(chapterUpdateTimerRef.current);
      if (sessionStartedRef.current) {
        markPageRead(currentViewablePageRef.current);
      }
    };
  }, [markPageRead]);

  const handleContentTap = useCallback(() => {
    onContentTap();
    const pageToSave = currentViewablePageRef.current;
    if (Number.isFinite(pageToSave)) {
      if (lastReadTimerRef.current) {
        clearTimeout(lastReadTimerRef.current);
        lastReadTimerRef.current = null;
      }
      void persistLastRead(pageToSave);
    }
  }, [onContentTap]);

  // Tapping a verse means the reader is engaging with the page — count it now.
  const handleVersePress = useCallback(
    (event: VersePressEvent) => markPageRead(event.page),
    [markPageRead]
  );

  async function updateChapterHighlight(pageNumber: number) {
    try {
      const page = await databaseService.getPageByNumber(pageNumber);
      if (currentViewablePageRef.current !== pageNumber) return;
      const chapterRef = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterRef != null) {
        const chapter = await databaseService.getChapterByIdentifier(chapterRef);
        if (chapter && currentViewablePageRef.current === pageNumber) {
          setCurrentChapter(chapter.number);
        }
      }
    } catch (error) {
      console.log("Error getting chapter", error);
    }
  }

  async function persistLastRead(pageNumber: number) {
    try {
      // Don't override a manual save on the same page or a later page
      const existing = await getLastRead();
      if (existing?.source === "manual" && existing.page >= pageNumber) {
        return;
      }

      const page = await databaseService.getPageByNumber(pageNumber);
      const chapterRef = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterRef != null) {
        const chapter = await databaseService.getChapterByIdentifier(chapterRef);
        if (chapter) {
          const firstVerse = page?.verses1441?.[0];
          const ayah = firstVerse?.number ?? 1;
          void setLastRead({
            page: pageNumber,
            chapterNumber: chapter.number,
            ayah,
            source: "auto",
          });
        }
      }
    } catch (error) {
      console.log("Error persisting last read", error);
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChangedInfo) => {
    const first = viewableItems[0];
    const pageNum =
      typeof first?.item === "number" ? first.item : Number.parseInt(first?.key ?? "", 10);

    if (!Number.isFinite(pageNum)) return;

    // The page the reader just left counts as read (they moved on).
    const previousPage = currentViewablePageRef.current;
    if (
      sessionStartedRef.current &&
      previousPage !== pageNum &&
      previousPage >= 1 &&
      previousPage <= TOTAL_MUSHAF_PAGES
    ) {
      markPageRead(previousPage);
    }
    sessionStartedRef.current = true;

    useMushafStore.getState().setCurrentPage(pageNum);
    currentViewablePageRef.current = pageNum;

    if (chapterUpdateTimerRef.current) {
      clearTimeout(chapterUpdateTimerRef.current);
    }
    chapterUpdateTimerRef.current = setTimeout(() => {
      chapterUpdateTimerRef.current = null;
      void updateChapterHighlight(pageNum);
    }, CHAPTER_UPDATE_DEBOUNCE_MS);

    // Keep the "continue reading" position in sync (position only, debounced
    // so fast flipping doesn't spam SQLite).
    if (lastReadTimerRef.current) {
      clearTimeout(lastReadTimerRef.current);
    }
    lastReadTimerRef.current = setTimeout(() => {
      lastReadTimerRef.current = null;
      void persistLastRead(pageNum);
    }, LAST_READ_DEBOUNCE_MS);
  }).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
          <View style={{ height: height - insets.top - insets.bottom, width }}>
            <QuranView
              activeChapter={currentChapter}
              activeVerse={activeVerse}
              isViewable={storeCurrentPage === item}
              onContentTap={handleContentTap}
              onVersePress={handleVersePress}
              pageNumber={item}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        windowSize={3}
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
