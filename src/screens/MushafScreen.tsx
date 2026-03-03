import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { QuranPage } from "../components/QuranPage";
import { SearchModal } from "../components/SearchModal";
import { databaseService } from "../services/SQLiteService";

const { height, width } = Dimensions.get("window");

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const flatListRef = useRef<FlatList<number>>(null);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);

  const navigateToPage = useCallback((pageNumber: number) => {
    const index = pageNumber - 1;
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

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
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
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
      <View style={{ height: 60 }}>
        {/* <AudioPlayerBar
          chapterNumber={currentChapter}
          onVerseChange={(verse) => setActiveVerse(verse)}
        /> */}
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setSearchVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="البحث في القرآن"
        accessibilityRole="button"
      >
        <Text style={styles.searchIcon}>&#x1F50D;</Text>
      </TouchableOpacity>
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectResult={navigateToPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  searchButton: {
    position: "absolute",
    top: 12,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 8,
  },
  searchIcon: {
    fontSize: 22,
  },
});
