import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { TOTAL_PAGES, TOTAL_VERSES } from "../constants/mushaf";
import { colors } from "../theme";

const SIZE = 160;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const whiteGlass = "rgba(255,255,255,0.07)";
const whiteFaint = "rgba(255,255,255,0.1)";

type OverallProgressProps = {
  readCount: number;
  /** Actual verse count for read pages from DB; if omitted, uses estimate */
  verseCount?: number;
};

type StatItemProps = {
  label: string;
  value: number;
  total?: number;
  unit?: string;
};

function StatItem({ label, value, total, unit }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
        {total !== undefined ? (
          <>
            {value}
            <Text style={styles.statTotal}> / {total}</Text>
          </>
        ) : (
          value
        )}
        {unit != null && unit !== "" ? <Text style={styles.statUnitInline}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function OverallProgress({ readCount, verseCount }: OverallProgressProps) {
  const pct = Math.round((readCount / TOTAL_PAGES) * 100);
  const clampedPct = Math.min(pct, 100);
  const offset = CIRCUMFERENCE - (clampedPct / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>ختم القرآن الكريم</Text>
      <Text style={styles.subtitle}>استمر في رحلتك، كل آية تقربك من الله</Text>

      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={STROKE_WIDTH}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={colors.background.default}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.percentText}>{pct}%</Text>
          <Text style={styles.completeLabel}>مكتمل</Text>
        </View>
      </View>

      <View style={styles.statsBar}>
        <StatItem label="الصفحات المقروءة" value={readCount} total={TOTAL_PAGES} />
        <View style={styles.statDivider} />
        <StatItem
          label="الآيات"
          value={verseCount ?? Math.round(readCount * (TOTAL_VERSES / TOTAL_PAGES))}
          total={TOTAL_VERSES}
        />
        <View style={styles.statDivider} />
        <StatItem label="المتبقي" value={TOTAL_PAGES - readCount} unit="صفحة" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: colors.brand.default,
    padding: 24,
    alignItems: "center",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.inverse,
    marginBottom: 4,
    writingDirection: "rtl",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    writingDirection: "rtl",
  },
  ringWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  completeLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    writingDirection: "rtl",
  },
  statsBar: {
    flexDirection: "row-reverse",
    alignSelf: "stretch",
    backgroundColor: whiteGlass,
    borderWidth: 1,
    borderColor: whiteFaint,
    borderRadius: 16,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  statDivider: {
    width: 1,
    marginVertical: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.inverse,
    textAlign: "center",
  },
  statTotal: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
  statUnit: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 1,
    textAlign: "center",
  },
  statUnitInline: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
});
