import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Verse, Chapter } from "./types";

interface ShareVerseCardProps {
  verse: Verse;
  chapter: Chapter | null;
}

export const ShareVerseCard = forwardRef<View, ShareVerseCardProps>(function ShareVerseCard(
  { verse, chapter },
  ref
) {
  const surahName = chapter?.arabicTitle || "";

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      {/* Decorative top border accent */}
      <View style={styles.topAccent} />

      {/* Ornamental header */}
      <View style={styles.headerSection}>
        <View style={styles.ornamentLine}>
          <View style={styles.ornamentDash} />
          <Text style={styles.ornamentStar}>✦</Text>
          <View style={styles.ornamentDash} />
        </View>
        <Text style={styles.bismillah}>﷽</Text>
        <View style={styles.ornamentLine}>
          <View style={styles.ornamentDash} />
          <Text style={styles.ornamentDiamond}>◆</Text>
          <View style={styles.ornamentDash} />
        </View>
      </View>

      {/* Verse body */}
      <View style={styles.verseSection}>
        <Text style={styles.verseText}>
          <Text style={styles.bracket}> ﴿</Text>
          {verse.text}
          <Text style={styles.bracket}>﴾ </Text>
        </Text>
      </View>

      {/* Surah reference pill */}
      <View style={styles.referenceSection}>
        <View style={styles.referencePill}>
          <Text style={styles.referenceText}>سورة {surahName}</Text>
          <View style={styles.referenceDot} />
          <Text style={styles.referenceText}>الآية {verse.number}</Text>
        </View>
      </View>

      {/* Branding footer */}
      <View style={styles.brandingSection}>
        <View style={styles.brandingLine} />
        <Text style={styles.brandingText}>مصحف عماد</Text>
        <Text style={styles.brandingSubtext}>Mushaf Imad</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 620,
    backgroundColor: "#FFFDF5",
    borderRadius: 24,
    overflow: "hidden",
  },
  topAccent: {
    height: 6,
    backgroundColor: "#1B5E20",
  },

  headerSection: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 8,
  },
  bismillah: {
    fontSize: 36,
    color: "#1B5E20",
    marginVertical: 8,
  },
  ornamentLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ornamentDash: {
    width: 60,
    height: 1,
    backgroundColor: "#C5A55A",
  },
  ornamentStar: {
    fontSize: 12,
    color: "#C5A55A",
  },
  ornamentDiamond: {
    fontSize: 8,
    color: "#C5A55A",
  },

  verseSection: {
    marginHorizontal: 28,
    marginVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(27, 94, 32, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verseText: {
    fontSize: 30,
    lineHeight: 56,
    textAlign: "center",
    color: "#1B1B1B",
    fontFamily: "uthmanTn1Bold",
  },
  bracket: {
    fontSize: 32,
    color: "#C5A55A",
  },

  referenceSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  referencePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(27, 94, 32, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 10,
  },
  referenceText: {
    fontSize: 17,
    color: "#1B5E20",
    fontWeight: "600",
  },
  referenceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C5A55A",
  },
  brandingSection: {
    alignItems: "center",
    paddingBottom: 24,
    paddingTop: 4,
  },
  brandingLine: {
    width: 100,
    height: 1,
    backgroundColor: "rgba(27, 94, 32, 0.15)",
    marginBottom: 12,
  },
  brandingText: {
    fontSize: 16,
    color: "#1B5E20",
    fontWeight: "700",
    marginBottom: 2,
  },
  brandingSubtext: {
    fontSize: 11,
    color: "#999999",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
