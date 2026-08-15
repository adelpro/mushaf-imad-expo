import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { TOTAL_PAGES, TOTAL_VERSES } from "../constants/mushaf";
import { toArabicDigits } from "../utils/date-utils";
import { colors } from "../theme";

// Ring diameter is capped so it always fits inside the card on narrow
// screens (card width ≈ screen − 40px page padding − 44px card padding),
// while a floor keeps it usable on ultra-narrow devices.
const SIZE = Math.min(210, Math.max(160, Dimensions.get("window").width - 84));
const OUTER_STROKE_WIDTH = 16;
const INNER_STROKE_WIDTH = 11;
const OUTER_RADIUS = (SIZE - OUTER_STROKE_WIDTH) / 2;
const INNER_RADIUS = (SIZE - OUTER_STROKE_WIDTH * 2 - INNER_STROKE_WIDTH) / 2;
const OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS;
const INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;

const whiteGlass = "rgba(255,255,255,0.08)";
const whiteFaint = "rgba(255,255,255,0.12)";

/**
 * The main "ختم القرآن الكريم" card on the progress screen.
 *
 * Shows two concentric progress rings (outer = khatma completion, inner =
 * today's wird vs the daily goal), a legend with live percentages, an
 * editable daily-goal stepper (+/−), a wird progress bar, the classic stats
 * row (pages / verses / remaining), and a completion estimate based on the
 * reader's average pace over the last 90 days. All numbers render as
 * Arabic-Indic digits for a native Arabic look.
 */
type OverallProgressProps = {
  readCount: number;
  /** Actual verse count for read pages from DB; if omitted, uses estimate */
  verseCount?: number;
  /** Pages read today (the wird / daily goal ring). */
  wirdCount?: number;
  /** Configurable daily reading target in pages. */
  dailyGoal?: number;
  /** Average pages/day over the last 90 days (for completion estimate). */
  avgPagesPerDay?: number;
  /** Called when the user changes the daily goal (e.g. +1 / -1). */
  onDailyGoalChange?: (goal: number) => void;
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
      {/* All numbers render as Arabic-Indic digits (٠١٢٣…) to match the
          rest of the Arabic UI. */}
      <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
        {total !== undefined ? (
          <>
            {toArabicDigits(value)}
            <Text style={styles.statTotal}> / {toArabicDigits(total)}</Text>
          </>
        ) : (
          toArabicDigits(value)
        )}
        {unit != null && unit !== "" ? <Text style={styles.statUnitInline}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

/** Circular progress ring with a solid accent stroke (gradient strokes on
 * dashed circles are unreliable on Android, so solid colors are used). */
function ProgressRing({
  radius,
  strokeWidth,
  circumference,
  progress,
  color,
}: {
  radius: number;
  strokeWidth: number;
  circumference: number;
  progress: number; // 0..1
  color: string;
}) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference - clamped * circumference;
  return (
    <>
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </>
  );
}

export function OverallProgress({
  readCount,
  verseCount,
  wirdCount = 0,
  dailyGoal = 5,
  avgPagesPerDay = 0,
  onDailyGoalChange,
}: OverallProgressProps) {
  const pct = readCount / TOTAL_PAGES;
  const clampedPct = Math.min(Math.max(pct, 0), 1);
  const wirdPct = dailyGoal > 0 ? wirdCount / dailyGoal : 0;
  const clampedWirdPct = Math.min(Math.max(wirdPct, 0), 1);

  const goalMinusDisabled = dailyGoal <= 1;
  const goalPlusDisabled = dailyGoal >= 60;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>ختم القرآن الكريم</Text>
          <Text style={styles.subtitle}>كل آية تقربك من الله</Text>
        </View>
        <View style={styles.khatmaBadge}>
          <Text style={styles.khatmaBadgeText}>ختمة</Text>
        </View>
      </View>

      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          {/* Khatma ring (outer) */}
          <ProgressRing
            radius={OUTER_RADIUS}
            strokeWidth={OUTER_STROKE_WIDTH}
            circumference={OUTER_CIRCUMFERENCE}
            progress={clampedPct}
            color="#81C784"
          />
          {/* Wird ring (inner) */}
          <ProgressRing
            radius={INNER_RADIUS}
            strokeWidth={INNER_STROKE_WIDTH}
            circumference={INNER_CIRCUMFERENCE}
            progress={clampedWirdPct}
            color="#FFEE58"
          />
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.percentText}>{toArabicDigits(Math.round(pct * 100))}%</Text>
          <Text style={styles.completeLabel}>مكتمل</Text>
          <View style={styles.ringDivider} />
          <Text style={styles.wirdCenterLabel}>الورد اليومي</Text>
          <Text style={styles.wirdCenterValue}>
            {toArabicDigits(wirdCount)}
            <Text style={styles.wirdCenterTotal}> / {toArabicDigits(dailyGoal)}</Text>
          </Text>
        </View>
      </View>

      {/* Legend with live percentages */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#66BB6A" }]} />
          <Text style={styles.legendText}>
            الختمة {toArabicDigits(Math.round(clampedPct * 100))}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FFEE58" }]} />
          <Text style={styles.legendText}>
            الورد {toArabicDigits(Math.round(clampedWirdPct * 100))}%
          </Text>
        </View>
      </View>

      {/* Wird (daily goal) row */}
      <View style={styles.wirdRow}>
        <View style={styles.wirdInfo}>
          <Text style={styles.wirdTitle}>هدف اليوم</Text>
          <Text style={styles.wirdSubtitle}>
            {wirdCount >= dailyGoal && dailyGoal > 0
              ? "🎉 أكملت وردك اليومي!"
              : `باقي ${toArabicDigits(Math.max(dailyGoal - wirdCount, 0))} صفحة لإكمال وردك`}
          </Text>
        </View>
        {onDailyGoalChange && (
          <View style={styles.goalStepper}>
            <Pressable
              style={[styles.goalButton, goalMinusDisabled && styles.goalButtonDisabled]}
              onPress={() => onDailyGoalChange(dailyGoal - 1)}
              disabled={goalMinusDisabled}
              accessibilityRole="button"
              accessibilityLabel="تقليل الهدف اليومي"
            >
              <Text style={styles.goalButtonText}>−</Text>
            </Pressable>
            <View style={styles.goalValueWrap}>
              <Text style={styles.goalValue}>{toArabicDigits(dailyGoal)}</Text>
              <Text style={styles.goalUnit}>صفحة</Text>
            </View>
            <Pressable
              style={[styles.goalButton, goalPlusDisabled && styles.goalButtonDisabled]}
              onPress={() => onDailyGoalChange(dailyGoal + 1)}
              disabled={goalPlusDisabled}
              accessibilityRole="button"
              accessibilityLabel="زيادة الهدف اليومي"
            >
              <Text style={styles.goalButtonText}>+</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Wird progress bar (today's goal) */}
      <View style={styles.wirdBarTrack}>
        <View style={[styles.wirdBarFill, { width: `${clampedWirdPct * 100}%` }]} />
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
        <StatItem label="المتبقي" value={Math.max(TOTAL_PAGES - readCount, 0)} unit="صفحة" />
      </View>

      {/* Completion estimate based on average reading pace. Only shown when
          the average is at least 1 page/day — with lower averages the number
          of days becomes absurdly large and demotivating, so a gentle hint is
          shown instead. */}
      {avgPagesPerDay >= 1 && readCount > 0 ? (
        <View style={styles.estimateRow}>
          <Text style={styles.estimateText}>
            بمعدل {toArabicDigits(avgPagesPerDay.toFixed(1)).replace(".", "٫")} صفحة/يوم، متبقٍ لك ~
            {toArabicDigits(Math.max(Math.ceil((TOTAL_PAGES - readCount) / avgPagesPerDay), 1))}{" "}
            يومًا لإتمام الختمة
          </Text>
        </View>
      ) : (
        <View style={styles.estimateRow}>
          <Text style={styles.estimateText}>اقرأ بانتظام لتحصل على تقدير موعد ختمتك</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.brand.default,
    padding: 22,
    alignItems: "center",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text.inverse,
    writingDirection: "rtl",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
    writingDirection: "rtl",
  },
  khatmaBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  khatmaBadgeText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  ringWrapper: {
    position: "relative",
    marginBottom: 12,
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
    fontSize: 32,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  completeLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    writingDirection: "rtl",
  },
  ringDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 8,
  },
  wirdCenterLabel: {
    fontSize: 11,
    color: "rgba(255, 235, 59, 0.85)",
    writingDirection: "rtl",
  },
  wirdCenterValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.inverse,
    marginTop: 2,
  },
  wirdCenterTotal: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  legendRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 18,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    writingDirection: "rtl",
  },
  wirdRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    backgroundColor: whiteGlass,
    borderWidth: 1,
    borderColor: whiteFaint,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  wirdInfo: {
    flex: 1,
  },
  wirdTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
    writingDirection: "rtl",
  },
  wirdSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 2,
    writingDirection: "rtl",
  },
  goalStepper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  goalButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  goalButtonDisabled: {
    opacity: 0.4,
  },
  goalButtonText: {
    color: colors.text.inverse,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
  },
  goalValueWrap: {
    alignItems: "center",
    minWidth: 44,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  goalUnit: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    writingDirection: "rtl",
  },
  wirdBarTrack: {
    alignSelf: "stretch",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    marginBottom: 12,
  },
  wirdBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#FFEE58",
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
  estimateRow: {
    alignSelf: "stretch",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  estimateText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 16,
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
  statUnitInline: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
});
