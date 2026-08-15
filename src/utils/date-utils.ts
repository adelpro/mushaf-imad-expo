/**
 * Pure date helpers for the reading-history (wird) feature.
 *
 * Everything here is intentionally free of storage/React so it can be
 * unit-tested easily. It covers:
 *  - local date keys (YYYY-MM-DD) and day ranges
 *  - filling daily counts, bucketing long ranges (the 90-day chart)
 *  - reading streaks (consecutive-day runs)
 *  - Arabic formatting: Arabic-Indic digits and Arabic month names, so the
 *    charts show dates the way an Arabic UI should (e.g. "١٥ أغسطس").
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Local date key in YYYY-MM-DD form, e.g. "2026-08-15". */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD key back into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Yesterday's local date at midnight. */
export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** The date `daysBefore` days before `anchor` (inclusive), at midnight. */
export function dateDaysBefore(daysBefore: number, anchor: Date = new Date()): Date {
  const start = startOfToday(anchor);
  // Use calendar-day arithmetic (setDate) rather than subtracting a fixed
  // number of milliseconds: on DST transitions a day is 23/25 hours long and
  // millisecond math would duplicate or skip date keys.
  const result = new Date(start);
  result.setDate(start.getDate() - daysBefore);
  return result;
}

/**
 * Returns the list of date keys for the last `days` days ending today,
 * oldest first. Always includes today.
 */
export function getLastDateKeys(days: number, now: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(toDateKey(dateDaysBefore(i, now)));
  }
  return keys;
}

export type DayCount = {
  /** YYYY-MM-DD local date key */
  key: string;
  /** Number of pages read that day (0 if none). */
  count: number;
};

/**
 * Maps a raw history record (`dateKey -> pages read`) onto the last `days`
 * days, filling missing days with 0. Oldest first.
 */
export function fillDailyCounts(
  history: Record<string, number>,
  days: number,
  now: Date = new Date()
): DayCount[] {
  return getLastDateKeys(days, now).map((key) => ({
    key,
    count: Math.max(0, Math.round(history[key] ?? 0)),
  }));
}

/**
 * Groups daily counts into `bucketSize`-day buckets, summing each bucket.
 * Used e.g. for the 90-day chart (7-day buckets). Returns one entry per
 * bucket; a partial first bucket is allowed so the last bucket always ends
 * today.
 */
export function bucketDailyCounts(
  daily: DayCount[],
  bucketSize: number
): Array<{ label: string; count: number }> {
  if (bucketSize <= 0) return [];
  const buckets: Array<{ label: string; count: number }> = [];
  for (let i = 0; i < daily.length; i += bucketSize) {
    const slice = daily.slice(i, i + bucketSize);
    const sum = slice.reduce((acc, d) => acc + d.count, 0);
    // Arabic date of the bucket end (the most recent day of that week), e.g.
    // "١٥ أغسطس" — clear and native for an Arabic UI.
    const lastKey = slice[slice.length - 1]?.key ?? "";
    const label = arabicShortDate(lastKey);
    buckets.push({ label, count: sum });
  }
  return buckets;
}

/** Total pages read over the given daily counts. */
export function sumCounts(daily: DayCount[]): number {
  return daily.reduce((acc, d) => acc + d.count, 0);
}

/** Arabic weekday short label for a date key, e.g. "السبت". */
export function weekdayLabel(key: string): string {
  const day = fromDateKey(key).getDay();
  const names = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return names[day] ?? "";
}

/** Gregorian month names in Arabic. */
export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** Converts Western digits to Arabic-Indic digits: "15" -> "١٥". */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** Short Arabic date like "١٥ أغسطس" from a YYYY-MM-DD key. */
export function arabicShortDate(key: string): string {
  const d = fromDateKey(key);
  return `${toArabicDigits(d.getDate())} ${ARABIC_MONTHS[d.getMonth()] ?? ""}`;
}

/**
 * Current and best consecutive-day reading streaks, computed from oldest-first
 * daily counts ending today. A day counts if `count > 0`. The current streak
 * tolerates a 0-today (the day isn't over yet), so it measures up to yesterday
 * when today has no reading yet.
 */
export function computeStreaks(daily: DayCount[]): { current: number; best: number } {
  let best = 0;
  let run = 0;
  for (const d of daily) {
    if (d.count > 0) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  let current = 0;
  let started = false;
  for (let i = daily.length - 1; i >= 0; i--) {
    const d = daily[i];
    if (d.count > 0) {
      started = true;
      current += 1;
    } else if (!started && i === daily.length - 1) {
      continue; // today with 0 pages — the streak isn't broken yet
    } else {
      break;
    }
  }
  return { current, best };
}
