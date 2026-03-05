import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Verse, Chapter } from "./types";
import { colors } from "../../theme";

interface ShareVerseCardProps {
  verse: Verse;
  chapter: Chapter | null;
}

export const ShareVerseCard = forwardRef<View, ShareVerseCardProps>(
  ({ verse, chapter }, ref) => {
    const surahName = chapter?.arabicTitle || "";

    return (
      <View
        ref={ref}
        collapsable={false}
        style={styles.card}
      >
        <View style={styles.ornamentTop}>
          <Text style={styles.ornamentText}>﷽</Text>
        </View>

        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            ﴿{verse.text}﴾
          </Text>
        </View>

        <View style={styles.referenceContainer}>
          <Text style={styles.referenceText}>
            سورة {surahName} — الآية {verse.number}
          </Text>
        </View>

        <View style={styles.brandingContainer}>
          <View style={styles.divider} />
          <Text style={styles.brandingText}>Powered By Mushaf Imad</Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: 600,
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    padding: 32,
    borderWidth: 3,
    borderColor: "#1B5E20",
  },
  ornamentTop: {
    alignItems: "center",
    marginBottom: 16,
  },
  ornamentText: {
    fontSize: 32,
    color: "#1B5E20",
  },
  verseContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  verseText: {
    fontSize: 28,
    lineHeight: 52,
    textAlign: "center",
    color: "#1B1B1B",
    fontFamily: "uthmanTn1Bold",
  },
  referenceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  referenceText: {
    fontSize: 18,
    color: "#1B5E20",
    fontWeight: "600",
  },
  brandingContainer: {
    alignItems: "center",
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "#1B5E20",
    opacity: 0.3,
    marginBottom: 10,
  },
  brandingText: {
    fontSize: 14,
    color: "#888888",
    fontWeight: "500",
    letterSpacing: 1,
  },
});
