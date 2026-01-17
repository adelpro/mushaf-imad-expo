import React, { useState, useRef } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { QuranPage } from "../components/QuranPage";
import { AudioPlayerBar } from "../components/AudioPlayerBar";
import { RealmService } from "../services/RealmService";
import { Page } from "../models/schema";

const { width, height } = Dimensions.get("window");

export const MushafScreen = () => {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const pageNum = parseInt(viewableItems[0].key);
      updateChapter(pageNum);
    }
  }).current;

  const updateChapter = async (pageNumber: number) => {
    try {
      const realm = await RealmService.getRealm();
      const page = realm
        .objects<Page>("Page")
        .filtered("number == $0", pageNumber)[0];
      if (page && page.verses1441.length > 0) {
        const chapterNum = page.verses1441[0].chapter?.number;
        if (chapterNum && chapterNum !== currentChapter) {
          setCurrentChapter(chapterNum);
        }
      }
    } catch (e) {
      console.log("Error getting chapter", e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        inverted
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width, height: height - 60 }}>
            <QuranPage
              pageNumber={item}
              activeChapter={currentChapter}
              activeVerse={activeVerse}
            />
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />
      <View style={{ height: 60 }}>
        <AudioPlayerBar
          chapterNumber={currentChapter}
          onVerseChange={(verse) => setActiveVerse(verse)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
});
