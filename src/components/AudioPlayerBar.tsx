import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRecitationPlayer } from "../hooks/useRecitationPlayer";

interface Props {
  chapterNumber: number;
  onVerseChange: (verseNumber: number | null) => void;
}

export function AudioPlayerBar({ chapterNumber, onVerseChange }: Props) {
  const {
    isPlaying,
    isLoaded,
    activeVerse,
    currentTimeMs,
    durationMs,
    progress,
    hasEnded,
    toggle,
  } = useRecitationPlayer(chapterNumber);

  useEffect(() => {
    onVerseChange(activeVerse);
  }, [activeVerse, onVerseChange]);

  const formatTime = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const buttonLabel = hasEnded ? "↻" : isPlaying ? "⏸" : "▶";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={toggle}
        disabled={!isLoaded}
        accessibilityLabel={
          hasEnded ? "إعادة التشغيل" : isPlaying ? "إيقاف مؤقت" : "تشغيل"
        }
        accessibilityRole="button"
      >
        <Text style={[styles.playIcon, !isLoaded && styles.disabled]}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTimeMs)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playIcon: {
    fontSize: 18,
    color: "#fff",
  },
  disabled: {
    opacity: 0.4,
  },
  progressSection: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#A5D6A7",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
});
