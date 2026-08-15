/**
 * Reading-history service for the daily wird (goal) feature.
 *
 * Stores, per day, which pages were read that day (a deduped list under a
 * YYYY-MM-DD key in AsyncStorage), plus the user's configurable daily goal.
 * This powers: the daily wird ring, the weekly/monthly/90-day charts, the
 * reading streak, and the completion estimate on the progress screen.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  bucketDailyCounts,
  computeStreaks,
  fillDailyCounts,
  toDateKey,
  type DayCount,
} from "../utils/date-utils";

const READ_HISTORY_KEY = "mushaf_read_history";
const DAILY_GOAL_KEY = "mushaf_daily_goal";

/** Sensible default daily reading target (pages per day). */
export const DEFAULT_DAILY_GOAL = 5;

/** Min/max bounds for the configurable daily goal. */
export const MIN_DAILY_GOAL = 1;
export const MAX_DAILY_GOAL = 60;

/**
 * Reading history is stored as a map of `YYYY-MM-DD -> pages read that day`
 * (a deduped list per day). This lets the daily wird count pages that were
 * re-read on a new day, while still avoiding double-counting the same page
 * within a single day. Legacy values stored as plain numbers (daily totals)
 * are accepted as-is for backward compatibility.
 */
type RawHistory = Record<string, number | number[]>;

async function readRawHistory(): Promise<RawHistory> {
  try {
    const raw = await AsyncStorage.getItem(READ_HISTORY_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data as RawHistory;
  } catch {
    return {};
  }
}

/** Total pages read per day, supporting both new (array) and legacy (number) shapes. */
export async function getReadHistory(): Promise<Record<string, number>> {
  const raw = await readRawHistory();
  const cleaned: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      const unique = new Set(value.filter((p) => typeof p === "number" && p >= 1));
      if (unique.size > 0) cleaned[key] = unique.size;
    } else if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      cleaned[key] = Math.round(value);
    }
  }
  return cleaned;
}

/** Pages read today (deduped). */
async function getPagesForToday(): Promise<number[]> {
  const raw = await readRawHistory();
  const todayKey = toDateKey(new Date());
  const value = raw[todayKey];
  if (Array.isArray(value)) {
    return [...new Set(value.filter((p): p is number => typeof p === "number" && p >= 1))];
  }
  // Legacy number shape: we no longer know which pages, return empty so new
  // reads start counting correctly today.
  return [];
}

/**
 * Records `pages` as read today. Pages already recorded today are skipped, so
 * re-reading the same page within a day does not inflate the wird.
 */
export async function addPagesToReadHistory(pages: number[]): Promise<void> {
  const valid = pages.filter((p) => typeof p === "number" && p >= 1 && p <= 604);
  if (valid.length === 0) return;
  try {
    const raw = await readRawHistory();
    const todayKey = toDateKey(new Date());
    const existing = await getPagesForToday();
    const merged = new Set([...existing, ...valid]);
    // Preserve other days as-is (arrays stay arrays, legacy numbers stay).
    const next: RawHistory = { ...raw };
    next[todayKey] = [...merged].sort((a, b) => a - b);
    await AsyncStorage.setItem(READ_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Daily counts for the last `days` days, oldest first, missing days = 0. */
export async function getDailyReadCounts(days: number): Promise<DayCount[]> {
  const history = await getReadHistory();
  return fillDailyCounts(history, days);
}

/** Pages read today (the wird). */
export async function getPagesReadToday(): Promise<number> {
  const pages = await getPagesForToday();
  return pages.length;
}

/**
 * Weekly totals covering the last 90 days (bucketed by 7-day weeks; the last
 * bucket may be partial so it always ends today). Used by the 90-day chart.
 */
export async function getNinetyDayReadCounts(): Promise<Array<{ label: string; count: number }>> {
  const history = await getReadHistory();
  const daily = fillDailyCounts(history, 90);
  return bucketDailyCounts(daily, 7);
}

/** Current and best consecutive-day reading streaks over the last year. */
export async function getReadingStreaks(): Promise<{ current: number; best: number }> {
  const history = await getReadHistory();
  const daily = fillDailyCounts(history, 365);
  return computeStreaks(daily);
}

export async function getDailyGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_GOAL_KEY);
    if (raw == null) return DEFAULT_DAILY_GOAL;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return DEFAULT_DAILY_GOAL;
    return Math.min(MAX_DAILY_GOAL, Math.max(MIN_DAILY_GOAL, parsed));
  } catch {
    return DEFAULT_DAILY_GOAL;
  }
}

export async function setDailyGoal(goal: number): Promise<void> {
  try {
    const clamped = Math.min(MAX_DAILY_GOAL, Math.max(MIN_DAILY_GOAL, Math.round(goal)));
    await AsyncStorage.setItem(DAILY_GOAL_KEY, String(clamped));
  } catch {
    // ignore
  }
}

/** Clears the reading history only (does not touch the daily goal). */
export async function clearReadHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(READ_HISTORY_KEY);
  } catch {
    // ignore
  }
}
