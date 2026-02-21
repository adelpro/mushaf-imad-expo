import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { loadTiming } from "../services/ayah-timing-service";
import { colors } from "../theme";

interface Props {
  chapterNumber: number;
  onVerseChange: (verseNumber: number) => void;
}

export const AudioPlayerBar: React.FC<Props> = ({
  chapterNumber,
  onVerseChange,
}) => {
  const paddedChapter = chapterNumber.toString().padStart(3, "0");
  const url = `https://server6.mp3quran.net/akdr/${paddedChapter}.mp3`;

  const player = useAudioPlayer(url);
  const [timing, setTiming] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadTiming(1).then((data) => {
      if (data) {
        const chapterData = data.chapters.find(
          (c: any) => c.id === chapterNumber,
        );
        setTiming(chapterData);
      }
    });
  }, [chapterNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Check if player is playing. Note: player.playing might be a getter.
      // We assume player object is stable but its properties change.
      // However, hooks usually trigger re-render on change if they are stateful.
      // If useAudioPlayer returns a plain object ref, we need to poll.

      const playing = player.playing;
      if (playing !== isPlaying) {
        setIsPlaying(playing);
      }

      if (playing && timing) {
        const timeMs = player.currentTime * 1000;
        const verse = timing.aya_timing.find(
          (t: any) => timeMs >= t.start_time && timeMs < t.end_time,
        );
        if (verse) {
          onVerseChange(verse.ayah);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player, timing, isPlaying, onVerseChange]);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlay} />
      <Text>{isPlaying ? "Playing" : "Paused"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: colors.background.subtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
