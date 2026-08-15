import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../theme";

export type ContinueReadingCardData = {
  surahArabicName: string;
  ayah: number;
  page: number;
};

/**
 * "أكمل القراءة" card — shows the reader's last position (surah, ayah,
 * page) with a prominent continue button that jumps back into the mushaf at
 * that page. Styled to match the app's green brand cards with a subtle
 * decorative circle pattern and glassy badges.
 */
type ContinueReadingCardProps = {
  data: ContinueReadingCardData;
  onContinue: () => void;
};

export function ContinueReadingCard({ data, onContinue }: ContinueReadingCardProps) {
  return (
    <View style={styles.card}>
      {/* Decorative background pattern */}
      <Svg width="160" height="160" viewBox="0 0 160 160" style={styles.pattern}>
        <Circle cx="130" cy="20" r="60" fill={colors.text.inverse} opacity={0.08} />
        <Circle cx="150" cy="50" r="35" fill={colors.text.inverse} opacity={0.05} />
        <Circle cx="20" cy="140" r="45" fill={colors.text.inverse} opacity={0.06} />
      </Svg>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Feather name="book-open" size={15} color={colors.text.inverse} />
          </View>
          <Text style={styles.continueLabel}>أكمل القراءة</Text>
          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>صفحة {data.page}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardText}>
            <Text style={styles.surahArabicName}>{data.surahArabicName}</Text>
            <View style={styles.positionRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.65)" />
              <Text style={styles.position}>الآية {data.ayah}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="أَكْمِل الْقِرَاءَة"
          >
            <Feather name="play" size={15} color={colors.brand.default} style={styles.playIcon} />
            <Text style={styles.continueButtonText}>أكمل</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.brand.default,
    overflow: "hidden",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  pattern: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.8,
  },
  cardContent: {
    position: "relative",
    zIndex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  continueLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    writingDirection: "rtl",
  },
  pageBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pageBadgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  cardBody: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  cardText: {
    flex: 1,
  },
  surahArabicName: {
    fontSize: 24,
    fontFamily: "uthmanTn1Bold",
    color: colors.text.inverse,
    marginBottom: 8,
    writingDirection: "rtl",
    textAlign: "right",
  },
  positionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  position: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    writingDirection: "rtl",
    textAlign: "right",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text.inverse,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  playIcon: {
    marginLeft: 0,
    marginRight: 0,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: "Amiri_400Regular",
    color: colors.brand.default,
    fontWeight: "700",
    writingDirection: "rtl",
    lineHeight: 20,
    marginLeft: 8,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
});
