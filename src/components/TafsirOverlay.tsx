
import React from "react";
import { View, TouchableOpacity, useWindowDimensions, StyleSheet } from "react-native";
import { useQuranPage } from "../hooks/useQuranPage";
import { Verse } from "../services/SQLiteService";

interface TafsirOverlayProps {
  pageNumber: number;
  onVerseLongPress: (verse: Verse, pageNumber: number) => void;
}

const LINE_ASPECT_RATIO = 1440 / 232;

export const TafsirOverlay = React.memo(({ pageNumber, onVerseLongPress }: TafsirOverlayProps) => {
  const { width } = useWindowDimensions();
  const { page } = useQuranPage(pageNumber);

  const LINE_HEIGHT = width / LINE_ASPECT_RATIO;

  if (!page) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {page.verses1441.map((verse) => (
        <React.Fragment key={verse.verseID}>
          {verse.highlights1441.map((highlight, index) => {
            const top = highlight.line * LINE_HEIGHT;
            const left = width * highlight.left_position;
            const w = width * (highlight.right_position - highlight.left_position);
            const height = LINE_HEIGHT;

            return (
              <TouchableOpacity
                key={`${verse.verseID}-${index}`}
                style={{
                  position: "absolute",
                  top,
                  left,
                  width: w,
                  height,
                  // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Debugging
                }}
                onLongPress={() => onVerseLongPress(verse, pageNumber)}
                delayLongPress={500}
              />
            );
          })}
        </React.Fragment>
      ))}
    </View>
  );
});
