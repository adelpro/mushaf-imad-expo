import React, { useEffect } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { loadTiming } from "../services/ayah-timing-service";
import { colors } from "../theme";
import { useMushafStore } from "../store/mushaf-store";

export const AudioPlayerBar: React.FC = () => {
  const currentChapter = useMushafStore((s) => s.currentChapter);
  const setActiveVerse = useMushafStore((s) => s.setActiveVerse);
  const isPlaying = useMushafStore((s) => s.isPlaying);
  const setIsPlaying = useMushafStore((s) => s.setIsPlaying);

  const paddedChapter = currentChapter.toString().padStart(3, "0");
  const url = `https://server6.mp3quran.net/akdr/${paddedChapter}.mp3`;

  const player = useAudioPlayer(url);

  useEffect(() => {
    let timingData: any = null;

    loadTiming(1).then((data) => {
      if (data) {
        timingData = data.chapters.find(
          (c: any) => c.id === currentChapter,
        );
      }
    });

    const interval = setInterval(() => {
      const playing = player.playing;
      if (playing !== isPlaying) {
        setIsPlaying(playing);
      }

      if (playing && timingData) {
        const timeMs = player.currentTime * 1000;
        const verse = timingData.aya_timing.find(
          (t: any) => timeMs >= t.start_time && timeMs < t.end_time,
        );
        if (verse) {
          setActiveVerse(verse.ayah);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player, currentChapter, isPlaying, setActiveVerse, setIsPlaying]);

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
