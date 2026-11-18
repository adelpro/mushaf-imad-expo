/**
 * Read-pages service — the khatma (whole-Quran completion) counter.
 *
 * Stores the set of page numbers the user has actually read. Pages are added
 * only through real reading actions (tapping a verse, swiping to the next
 * page, or leaving the mushaf on a page) — never by merely viewing or
 * jumping. Each page read also counts toward today's wird via
 * read-history-service, so the daily goal and charts stay in sync.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOTAL_PAGES } from "../constants/mushaf";
import { addPagesToReadHistory, clearReadHistory } from "./read-history-service";

const READ_PAGES_KEY = "mushaf_read_pages";

/**
 * Returns the set of unique page numbers the user has read (no duplicates).
 */
export async function getReadPages(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(READ_PAGES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const pages = data.filter(
      (p): p is number => typeof p === "number" && Number.isInteger(p) && p >= 1 && p <= TOTAL_PAGES
    );
    return [...new Set(pages)];
  } catch {
    return [];
  }
}

/**
 * Returns the number of unique pages read.
 */
export async function getReadPagesCount(): Promise<number> {
  const pages = await getReadPages();
  return pages.length;
}

/**
 * Marks a page as read and persists. Idempotent (no duplicate counting).
 * Call this when the user actually engages with the page: taps a verse,
 * swipes away from it after reading, or leaves the mushaf on it.
 */
export async function addReadPage(page: number): Promise<void> {
  if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1 || page > TOTAL_PAGES) {
    return;
  }
  try {
    const existing = await getReadPages();
    const set = new Set(existing);
    set.add(page);
    await AsyncStorage.setItem(READ_PAGES_KEY, JSON.stringify([...set].sort((a, b) => a - b)));
    // Count toward today's wird. The history service dedupes within a day,
    // so re-reading a page already read today (or in previous days) still
    // counts as today's reading exactly once.
    await addPagesToReadHistory([page]);
  } catch {
    // ignore
  }
}

/**
 * Clears all read pages progress, resetting it to 0.
 */
export async function clearReadPages(): Promise<void> {
  try {
    await AsyncStorage.removeItem(READ_PAGES_KEY);
  } catch {
    // ignore
  }
}

/**
 * Clears read pages and their daily reading history (used by "reset progress").
 */
export async function clearAllReadProgress(): Promise<void> {
  await Promise.all([clearReadPages(), clearReadHistory()]);
}
