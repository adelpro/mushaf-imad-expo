import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock AsyncStorage before importing the service.
const store = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  },
}));

// The history service builds date keys from `new Date()`. Freeze time so
// tests are deterministic.
vi.useFakeTimers();
vi.setSystemTime(new Date(2026, 7, 15, 10, 0, 0)); // 2026-08-15

import {
  addPagesToReadHistory,
  clearReadHistory,
  getDailyReadCounts,
  getNinetyDayReadCounts,
  getPagesReadToday,
} from "./read-history-service";

describe("read-history-service", () => {
  beforeEach(() => {
    store.clear();
  });

  afterEach(() => {
    store.clear();
  });

  it("counts pages read today", async () => {
    await addPagesToReadHistory([1, 2, 3]);
    expect(await getPagesReadToday()).toBe(3);
  });

  it("dedupes pages re-read within the same day", async () => {
    await addPagesToReadHistory([1, 2]);
    await addPagesToReadHistory([2, 3]);
    expect(await getPagesReadToday()).toBe(3); // {1,2,3}
  });

  it("records re-reads of previously read pages as today's reading", async () => {
    // Simulate a legacy/new day: page 1 was read yesterday.
    const yesterday = "2026-08-14";
    store.set("mushaf_read_history", JSON.stringify({ [yesterday]: [1] }));
    // Reading page 1 again today counts toward today's wird.
    await addPagesToReadHistory([1]);
    expect(await getPagesReadToday()).toBe(1);
    const daily = await getDailyReadCounts(2);
    expect(daily.find((d) => d.key === yesterday)?.count).toBe(1);
    expect(daily.find((d) => d.key === "2026-08-15")?.count).toBe(1);
  });

  it("ignores invalid page numbers", async () => {
    await addPagesToReadHistory([0, -5, 999, 604, 605]);
    expect(await getPagesReadToday()).toBe(1); // only 604
  });

  it("returns 0 when no history exists", async () => {
    expect(await getPagesReadToday()).toBe(0);
    expect(await getDailyReadCounts(7)).toHaveLength(7);
  });

  it("supports legacy numeric totals", async () => {
    store.set("mushaf_read_history", JSON.stringify({ "2026-08-10": 4 }));
    const daily = await getDailyReadCounts(7);
    expect(daily.find((d) => d.key === "2026-08-10")?.count).toBe(4);
  });

  it("builds ~13 weekly buckets for the 90-day chart", async () => {
    store.set("mushaf_read_history", JSON.stringify({ "2026-08-10": 2, "2026-08-15": 3 }));
    const buckets = await getNinetyDayReadCounts();
    expect(buckets.length).toBeGreaterThanOrEqual(12);
    expect(buckets.length).toBeLessThanOrEqual(13);
    expect(buckets.reduce((acc, b) => acc + b.count, 0)).toBe(5);
  });

  it("clears history", async () => {
    await addPagesToReadHistory([1]);
    await clearReadHistory();
    expect(await getPagesReadToday()).toBe(0);
  });
});
