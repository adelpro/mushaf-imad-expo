import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { PageJumpInput } from "../components/page-jump-input";
import { databaseService } from "../services/sqlite-service";
import { QuranView } from "../components/quran";
import { colors } from "../theme";
import { useMushafStore } from "../store/mushaf-store";

const { height, width } = Dimensions.get("window");

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

type MushafScreenProps = {
  onContentTap?: () => void;
};

export function MushafScreen({ onContentTap }: MushafScreenProps) {
  const currentChapter = useMushafStore((s) => s.currentChapter);
  const setCurrentChapter = useMushafStore((s) => s.setCurrentChapter);
  const activeVerse = useMushafStore((s) => s.activeVerse);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef<FlatList<number>>(null);

  const handleContentTap = useCallback(() => {
    onContentTap?.();
  }, [onContentTap]);

  async function updateChapter(pageNumber: number) {
    try {
      const page = await databaseService.getPageByNumber(pageNumber);

      const chapterNum = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterNum) {
        const chapter = await databaseService.getChapterByNumber(chapterNum);
        if (chapter) {
          setCurrentChapter(chapter.number);
        }
      }
    } catch (error) {
      console.log("Error getting chapter", error);
    }
  }

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: ViewableItemsChangedInfo) => {
      const first = viewableItems[0];
      const pageNum =
        typeof first?.item === "number"
          ? first.item
          : Number.parseInt(first?.key ?? "", 10);

      if (Number.isFinite(pageNum)) {
        setCurrentPage(pageNum);
        void updateChapter(pageNum);
      }
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
      <View style={{ height: 60 }}>
        {/* <AudioPlayerBar /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
