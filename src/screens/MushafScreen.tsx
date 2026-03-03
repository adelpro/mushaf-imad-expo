import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { AudioPlayerBar } from "../components/AudioPlayerBar";
import { QuranPage } from "../components/QuranPage";
import { BookmarksListModal } from "../components/BookmarksListModal";
import { databaseService } from "../services/SQLiteService";

const { height, width } = Dimensions.get("window");

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
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
        void updateChapter(pageNum);
      }
    },
  ).current;

  const handleNavigateToPage = (pageNumber: number) => {
    const index = pageNumber - 1;
    if (index < 0 || index > 603) return;
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const onScrollToIndexFailed = useRef(
    (info: { index: number; averageItemLength: number }) => {
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
    },
  ).current;

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
        onScrollToIndexFailed={onScrollToIndexFailed}
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
      <View style={{ height: 60 }}>
        {/* <AudioPlayerBar
          chapterNumber={currentChapter}
          onVerseChange={(verse) => setActiveVerse(verse)}
        /> */}
      </View>

      <TouchableOpacity
        style={styles.bookmarkFab}
        onPress={() => setBookmarksVisible(true)}
        accessibilityLabel="العلامات المرجعية"
        accessibilityRole="button"
      >
        <Text style={styles.bookmarkFabText}>🔖</Text>
      </TouchableOpacity>

      <BookmarksListModal
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        onNavigateToPage={handleNavigateToPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  bookmarkFab: {
    position: "absolute",
    bottom: 70,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bookmarkFabText: {
    fontSize: 22,
  },
});
