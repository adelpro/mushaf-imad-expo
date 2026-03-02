import React, { useRef, useState, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { QuranPage } from "../components/QuranPage";
import { PageJumpHeader } from "../components/PageJumpHeader";
import { databaseService } from "../services/SQLiteService";

const { height, width } = Dimensions.get("window");

const HEADER_HEIGHT = 44;
const BOTTOM_BAR_HEIGHT = 60;

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);

  async function updateChapter(pageNumber: number) {
    try {
      const page = await databaseService.getPageByNumber(pageNumber);

      const chapterNum = page?.verses1441?.[0]?.chapter_id ?? null;
      if (chapterNum) {
        const chapter = await databaseService.getChapterByNumber(chapterNum);
        if (chapter) {
          setCurrentChapter((prev) =>
            chapter.number !== prev ? chapter.number : prev,
          );
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
      if (page < 1 || page > 604) return;
      // FlatList is inverted, so index 0 = page 1 (rightmost).
      // pages array is [1,2,...,604], so index = page - 1.
      const index = page - 1;
      flatListRef.current?.scrollToIndex({ index, animated: false });
    },
    [],
  );

  const pageHeight = height - HEADER_HEIGHT - BOTTOM_BAR_HEIGHT;

  return (
    <View style={styles.container}>
      <PageJumpHeader
        currentPage={currentPage}
        onJumpToPage={handleJumpToPage}
      />
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
          <View style={{ height: pageHeight, width }}>
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
      <View style={{ height: BOTTOM_BAR_HEIGHT }}>
        {/* <AudioPlayerBar
          chapterNumber={currentChapter}
          onVerseChange={(verse) => setActiveVerse(verse)}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
});
