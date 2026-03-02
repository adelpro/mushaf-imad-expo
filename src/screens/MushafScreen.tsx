import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { AudioPlayerBar } from "../components/AudioPlayerBar";
import { QuranPage } from "../components/QuranPage";
import { databaseService } from "../services/SQLiteService";

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const { height, width } = useWindowDimensions();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
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

  return (
    <View style={styles.container}>
      <FlatList
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
});