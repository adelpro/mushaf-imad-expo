import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../theme";

export type ContinueReadingCardData = {
  surahArabicName: string;
  ayah: number;
  page: number;
};

type ContinueReadingCardProps = {
  data: ContinueReadingCardData;
  onContinue: () => void;
};

export function ContinueReadingCard({ data, onContinue }: ContinueReadingCardProps) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.decorativePattern}>
          <Svg width="128" height="128" viewBox="0 0 100 100">
            <Circle
              cx="20"
              cy="20"
              r="40"
              fill={colors.text.inverse}
              opacity={0.15}
            />
            <Circle
              cx="10"
              cy="50"
              r="25"
              fill={colors.text.inverse}
              opacity={0.1}
            />
          </Svg>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Feather
                name="book-open"
                size={14}
                color={colors.text.inverse}
              />
            </View>
            <Text style={styles.continueLabel}>أكمل القراءة</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardText}>
              <Text style={styles.surahArabicName}>
                {data.surahArabicName}
              </Text>
              <Text style={styles.position}>
                الآية {data.ayah} • صفحة {data.page}
              </Text>
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
              <Feather
                name="play"
                size={14}
                color={colors.text.primary}
                style={styles.playIcon}
              />
              <Text style={styles.continueButtonText}>أكمل</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.brand.default,
    overflow: "hidden",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  decorativePattern: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 128,
    height: 128,
    opacity: 0.6,
  },
  cardContent: {
    position: "relative",
    zIndex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    writingDirection: "rtl",
  },
  cardBody: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  cardText: {
    flex: 1,
  },
  surahArabicName: {
    fontSize: 22,
    fontFamily: "uthmanTn1Bold",
    color: colors.text.inverse,
    marginBottom: 8,
    writingDirection: "rtl",
    textAlign: "right",
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  playIcon: {
    marginRight: 8,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: "Amiri_400Regular",
    color: colors.text.primary,
    writingDirection: "rtl",
    lineHeight: 20,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
});
