import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";
import { toArabicDigits } from "../utils/date-utils";
import { colors } from "../theme";

export type BarDatum = {
  label: string;
  count: number;
};

type ReadingBarChartProps = {
  title: string;
  /** Optional icon name (Feather) shown next to the title. */
  icon?: React.ComponentProps<typeof Feather>["name"];
  data: BarDatum[];
  /** Show a label under every Nth bar (default: every bar). */
  labelEvery?: number;
  /** Bar color; defaults to the brand green. */
  barColor?: string;
  /** Unit word appended to the max value, e.g. "صفحة". */
  unit?: string;
  /** Highlight the most recent bar (e.g. today) with a distinct color. */
  highlightLast?: boolean;
  /** Best entry callout shown under the chart, e.g. the peak reading day. */
  best?: { label: string; count: number } | null;
  /** Title of the best entry, e.g. "أفضل يوم" or "أفضل أسبوع". */
  bestTitle?: string;
  /** Optional goal value drawn as a dashed line (e.g. the daily goal). */
  goalLine?: number;
  /** Label for the goal line, e.g. "الهدف". */
  goalLabel?: string;
};

const CHART_HEIGHT = 130;
const MAX_BARS = 31;
const BASELINE_Y = CHART_HEIGHT - 26;
const LABELS_GAP = 4;

let gradientCounter = 0;

/**
 * Lightweight bar chart rendered with react-native-svg (no extra chart
 * dependency). Handles RTL by rendering oldest data on the right, mirroring
 * the app's RTL layout. Bar labels are plain React Native <Text> nodes (not
 * SvgText) so Arabic is shaped and ordered correctly on Android.
 */
export function ReadingBarChart({
  title,
  icon = "bar-chart-2",
  data,
  labelEvery = 1,
  barColor = colors.brand.default,
  unit,
  highlightLast = false,
  best = null,
  bestTitle = "أفضل يوم",
  goalLine,
  goalLabel = "الهدف",
}: ReadingBarChartProps) {
  // Unique gradient id per mounted instance (avoid duplicate SVG ids when
  // several charts with the same title are rendered on one screen).
  const gradientId = useRef(`barGrad-${++gradientCounter}`).current;

  // Keep charts readable: if there are too many bars, aggregate consecutive
  // entries into at most MAX_BARS buckets (the last bucket stays as-is).
  // `bucketize` takes the number of buckets, not a group size.
  const bars = data.length > MAX_BARS ? bucketize(data, MAX_BARS) : data;

  if (bars.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <Feather name={icon} size={13} color={colors.brand.default} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>لا توجد بيانات بعد</Text>
      </View>
    );
  }

  const maxValue = Math.max(1, ...bars.map((b) => b.count));
  const barGap = 1.5;
  const slotWidth = 100 / bars.length;
  const barWidth = Math.max(3, slotWidth - barGap);
  const totalCount = bars.reduce((acc, b) => acc + b.count, 0);

  // A period with zero reading is more useful as a clear hint than empty bars.
  if (totalCount === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <Feather name={icon} size={13} color={colors.brand.default} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{toArabicDigits(0)}</Text>
            {unit ? <Text style={styles.summaryUnit}>{unit}</Text> : null}
          </View>
        </View>
        <Text style={styles.emptyText}>لا توجد قراءات في هذه الفترة</Text>
      </View>
    );
  }

  // Value labels above bars only when slots are wide enough to be readable.
  const showValues = slotWidth >= 6;

  // Size the label font from the longest text so full weekday names (e.g.
  // "الاثنين") stay inside their slot without overlapping neighbours.
  // Labels are plain RN <Text> in pixel space (not SVG viewBox units), so we
  // estimate from character count: ~64px budget per label line.
  const longestLabel = Math.max(0, ...bars.map((b) => b.label.length));
  const labelFontSize = Math.max(8, Math.min(11, Math.round(64 / Math.max(3, longestLabel))));

  const gridlines = [0.25, 0.5, 0.75].map((f) => ({
    y: BASELINE_Y - (BASELINE_Y - 4) * f,
  }));

  // Dashed goal line (e.g. today's target) drawn at the goal height.
  const goalY =
    goalLine != null && goalLine > 0
      ? BASELINE_Y - Math.min(goalLine / maxValue, 1) * (BASELINE_Y - 4)
      : null;

  const barFill = (i: number) => {
    if (highlightLast && i === bars.length - 1) return "#F59E0B";
    return `url(#${gradientId})`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Feather name={icon} size={13} color={colors.brand.default} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{toArabicDigits(totalCount)}</Text>
          {unit ? <Text style={styles.summaryUnit}>{unit}</Text> : null}
        </View>
      </View>

      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 100 ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={barColor} />
            <Stop offset="100%" stopColor={shade(barColor)} />
          </LinearGradient>
        </Defs>
        {/* Baseline */}
        <Rect x={0} y={BASELINE_Y} width={100} height={1} fill="rgba(0,0,0,0.08)" />
        {/* Horizontal gridlines */}
        {gridlines.map((g) => (
          <Rect key={g.y} x={0} y={g.y} width={100} height={0.5} fill="rgba(0,0,0,0.05)" />
        ))}
        {/* Goal line (dashed) */}
        {goalY != null ? (
          <>
            <Rect x={0} y={goalY} width={100} height={1} fill="#F59E0B" opacity={0.55} />
            <SvgText
              x={2}
              y={Math.max(goalY - 3, 8)}
              fontSize={3.6}
              fill="#B45309"
              fontWeight="600"
            >
              {goalLabel}
            </SvgText>
          </>
        ) : null}
        {bars.map((bar, i) => {
          const barHeight = maxValue > 0 ? (bar.count / maxValue) * (BASELINE_Y - 4) : 0;
          // RTL: render from right to left so the most recent day is on the left
          const x = 100 - (i + 1) * slotWidth;
          const y = BASELINE_Y - barHeight;
          return (
            <React.Fragment key={`${bar.label}-${i}`}>
              {bar.count > 0 ? (
                <>
                  <Rect x={x} y={y} width={barWidth} height={barHeight} rx={2} fill={barFill(i)} />
                  {/* Highlight cap */}
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.min(2.5, barHeight)}
                    rx={1.5}
                    fill="rgba(255,255,255,0.45)"
                  />
                  {showValues ? (
                    <SvgText
                      x={x + barWidth / 2}
                      y={Math.max(y - 4, 8)}
                      fontSize={4.2}
                      fontWeight="700"
                      fill="rgba(0,0,0,0.6)"
                      textAnchor="middle"
                    >
                      {toArabicDigits(bar.count)}
                    </SvgText>
                  ) : null}
                </>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Labels row — plain RN <Text> for correct Arabic shaping/order.
          flexDirection row-reverse mirrors the SVG (oldest bar on the right).
          Sparse labels (labelEvery > 1) span the slots up to the next label
          so long Arabic dates ("١٥ أغسطس") are not clipped by a single
          narrow slot; the right margin re-centers the text over its own bar. */}
      <View style={styles.labelsRow}>
        {bars.map((bar, i) => {
          const showLabel = i % labelEvery === 0 || i === bars.length - 1;
          // How many bar slots this label may occupy (clamped at the row end).
          const span = showLabel ? Math.min(labelEvery, bars.length - i) : 1;
          // RTL nudge: pull the centered text back toward its own bar.
          const alignShift = showLabel && span > 1 ? ((span - 1) / span) * 50 : 0;
          return (
            <View
              key={`${bar.label}-${i}`}
              style={[styles.labelSlot, showLabel && span > 1 && { flex: span }]}
            >
              {showLabel ? (
                <Text
                  style={[
                    styles.label,
                    { fontSize: labelFontSize },
                    alignShift > 0 && { marginRight: `${alignShift}%` },
                  ]}
                  numberOfLines={span > 1 ? 1 : undefined}
                  allowFontScaling={false}
                >
                  {bar.label}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Best entry callout */}
      {best && best.count > 0 ? (
        <View style={styles.bestRow}>
          <Feather name="star" size={11} color="#F59E0B" />
          <Text style={styles.bestText}>
            {bestTitle}: {best.label} · {toArabicDigits(best.count)} {unit ?? ""}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Darkens or lightens a hex color slightly for the gradient end. */
function shade(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const factor = 0.72;
  const parts = [1, 2, 3].map((i) => {
    const v = Number.parseInt(m[i], 16);
    return Math.round(v * factor)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${parts.join("")}`;
}

/** Aggregates bars into `n` buckets of roughly equal size (for long ranges). */
function bucketize(data: BarDatum[], n: number): BarDatum[] {
  const buckets: BarDatum[] = [];
  const size = Math.ceil(data.length / n);
  for (let i = 0; i < data.length; i += size) {
    const slice = data.slice(i, i + size);
    buckets.push({
      label: slice[0]?.label ?? "",
      count: slice.reduce((acc, d) => acc + d.count, 0),
    });
  }
  return buckets;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.background.surface,
    padding: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(27, 94, 32, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    writingDirection: "rtl",
  },
  summaryBox: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 3,
    backgroundColor: "rgba(27, 94, 32, 0.07)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.brand.default,
  },
  summaryUnit: {
    fontSize: 10,
    color: colors.text.secondary,
    writingDirection: "rtl",
  },
  labelsRow: {
    flexDirection: "row-reverse",
    marginTop: LABELS_GAP,
  },
  labelSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  label: {
    color: "rgba(0,0,0,0.55)",
    textAlign: "center",
    writingDirection: "rtl",
    includeFontPadding: false,
  },
  bestRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "stretch",
  },
  bestText: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "600",
    writingDirection: "rtl",
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    paddingVertical: 20,
  },
});
