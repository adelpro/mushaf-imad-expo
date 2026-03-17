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
 * Call this only when the user has met the minimum reading time on the page.
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
  } catch {
    // ignore
  }
}

/**
 * Marks all pages from 1 up to (and including) the given page as read.
 * Used when the user saves progress at a specific verse — all prior pages
 * are considered read.
 */
export async function addReadPagesUpTo(page: number): Promise<void> {
  if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1 || page > TOTAL_PAGES) {
    return;
  }
  try {
    const existing = await getReadPages();
    const set = new Set(existing);
    for (let p = 1; p <= page; p++) {
      set.add(p);
    }
    await AsyncStorage.setItem(READ_PAGES_KEY, JSON.stringify([...set].sort((a, b) => a - b)));
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
