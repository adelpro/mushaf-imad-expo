import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  percent: number;
  currentPage: number;
  totalPages: number;
}

export function ProgressBar({ percent, currentPage, totalPages }: Props) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedPercent}%` }]} />
      </View>
      <Text style={styles.label}>
        {`${currentPage} / ${totalPages} · ${clampedPercent}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: "#D7CCC8",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#8B4513",
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    color: "#5D4037",
    minWidth: 80,
    textAlign: "right",
  },
});
