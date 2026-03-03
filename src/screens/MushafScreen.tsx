import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuranPage } from "../components/QuranPage";
import { databaseService } from "../services/SQLiteService";

const BOTTOM_BAR_HEIGHT = 60;

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
};

export function MushafScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageHeight = Math.max(0, height - insets.top - insets.bottom - BOTTOM_BAR_HEIGHT);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const pages = useMemo(() => Array.from({ length: 604 }, (_, i) => i + 1), []);

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
      console.error("Error getting chapter", error);
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

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      index,
      length: width,
      offset: width * index,
    }),
    [width],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <FlatList
        data={pages}
        getItemLayout={getItemLayout}
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
