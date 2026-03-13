import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOTAL_PAGES } from "../constants/mushaf";

const READ_PAGES_KEY = "mushaf_read_pages";

/**
 * Returns the set of page numbers the user has "read" (met minimum dwell time, no duplicates).
 */
export async function getReadPages(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(READ_PAGES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const pages = data.filter(
      (p): p is number =>
        typeof p === "number" &&
        Number.isInteger(p) &&
        p >= 1 &&
        p <= TOTAL_PAGES,
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
 * Call this only when the user has met the minimum reading time on the page.
 */
export async function addReadPage(page: number): Promise<void> {
  if (
    !Number.isFinite(page) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > TOTAL_PAGES
  ) {
    return;
  }
  try {
    const existing = await getReadPages();
    const set = new Set(existing);
    set.add(page);
    await AsyncStorage.setItem(
      READ_PAGES_KEY,
      JSON.stringify([...set].sort((a, b) => a - b)),
    );
  } catch {
    // ignore
  }
}
