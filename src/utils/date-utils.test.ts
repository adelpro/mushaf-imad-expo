import { describe, expect, it } from "vitest";
import {
  arabicShortDate,
  bucketDailyCounts,
  computeStreaks,
  dateDaysBefore,
  fillDailyCounts,
  getLastDateKeys,
  toArabicDigits,
  toDateKey,
  weekdayLabel,
} from "./date-utils";

// Fixed "now": 2026-08-15 (a Saturday) local time.
const NOW = new Date(2026, 7, 15, 12, 0, 0);

describe("toDateKey", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 7, 3))).toBe("2026-08-03");
    expect(toDateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("getLastDateKeys", () => {
  it("returns the last N days ending today, oldest first", () => {
    const keys = getLastDateKeys(7, NOW);
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe("2026-08-09");
    expect(keys[keys.length - 1]).toBe("2026-08-15");
  });

  it("always includes today even for 1 day", () => {
    expect(getLastDateKeys(1, NOW)).toEqual(["2026-08-15"]);
  });
});

describe("fillDailyCounts", () => {
  it("fills missing days with 0", () => {
    const daily = fillDailyCounts({ "2026-08-15": 3, "2026-08-10": 2 }, 7, NOW);
    expect(daily).toEqual([
      { key: "2026-08-09", count: 0 },
      { key: "2026-08-10", count: 2 },
      { key: "2026-08-11", count: 0 },
      { key: "2026-08-12", count: 0 },
      { key: "2026-08-13", count: 0 },
      { key: "2026-08-14", count: 0 },
      { key: "2026-08-15", count: 3 },
    ]);
  });

  it("ignores non-positive and malformed values", () => {
    const daily = fillDailyCounts({ "2026-08-15": -5, "2026-08-14": 2.4 }, 3, NOW);
    expect(daily.map((d) => d.count)).toEqual([0, 2, 0]);
  });
});

describe("bucketDailyCounts", () => {
  it("groups daily counts into fixed-size buckets summing each", () => {
    const daily = fillDailyCounts(
      {
        "2026-08-09": 1,
        "2026-08-10": 2,
        "2026-08-11": 3,
        "2026-08-12": 4,
        "2026-08-13": 5,
        "2026-08-14": 6,
        "2026-08-15": 7,
      },
      7,
      NOW
    );
    const buckets = bucketDailyCounts(daily, 3);
    expect(buckets).toHaveLength(3);
    expect(buckets[0].count).toBe(6); // 1+2+3
    expect(buckets[1].count).toBe(15); // 4+5+6
    expect(buckets[2].count).toBe(7); // 7
  });

  it("labels buckets with Arabic end dates so ranges are readable", () => {
    const daily = fillDailyCounts({ "2026-08-15": 7 }, 7, NOW);
    const buckets = bucketDailyCounts(daily, 3);
    expect(buckets.map((b) => b.label)).toEqual(["١١ أغسطس", "١٤ أغسطس", "١٥ أغسطس"]);
  });

  it("returns empty for invalid bucket size", () => {
    expect(bucketDailyCounts([{ key: "x", count: 1 }], 0)).toEqual([]);
  });
});

describe("computeStreaks", () => {
  const d = (count: number) => ({ key: "2026-08-15", count });

  it("returns zero streaks for no reading", () => {
    expect(computeStreaks([d(0), d(0), d(0)])).toEqual({ current: 0, best: 0 });
  });

  it("counts a streak ending today", () => {
    expect(computeStreaks([d(0), d(1), d(2)])).toEqual({ current: 2, best: 2 });
  });

  it("tolerates a 0-today: current streak reaches back to yesterday", () => {
    // ..., yesterday read, today 0 → current streak is still alive (day in progress)
    expect(computeStreaks([d(0), d(1), d(1), d(0)])).toEqual({ current: 2, best: 2 });
  });

  it("keeps the best streak across a gap", () => {
    expect(computeStreaks([d(1), d(1), d(0), d(1), d(1), d(1)])).toEqual({
      current: 3,
      best: 3,
    });
    expect(computeStreaks([d(1), d(1), d(1), d(0), d(1), d(1)])).toEqual({
      current: 2,
      best: 3,
    });
  });
});

describe("dateDaysBefore (calendar-day arithmetic)", () => {
  it("returns the same calendar day even across a DST transition", () => {
    // 2026-10-25 is the EU DST fall-back (a 25-hour day); subtracting 1 day
    // must land on 2026-10-24, not 2026-10-23T23:00.
    const anchor = new Date(2026, 9, 25, 12, 0, 0);
    const d = dateDaysBefore(1, anchor);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(24);
  });
});

describe("toArabicDigits", () => {
  it("converts Western digits to Arabic-Indic digits", () => {
    expect(toArabicDigits(15)).toBe("١٥");
    expect(toArabicDigits("05")).toBe("٠٥");
    expect(toArabicDigits(604)).toBe("٦٠٤");
  });
});

describe("arabicShortDate", () => {
  it("formats a date key as day + Arabic month", () => {
    expect(arabicShortDate("2026-08-15")).toBe("١٥ أغسطس");
    expect(arabicShortDate("2026-01-03")).toBe("٣ يناير");
    expect(arabicShortDate("2026-12-31")).toBe("٣١ ديسمبر");
  });
});

describe("weekdayLabel", () => {
  it("returns Arabic weekday names", () => {
    expect(weekdayLabel("2026-08-15")).toBe("السبت");
    expect(weekdayLabel("2026-08-16")).toBe("الأحد");
    expect(weekdayLabel("2026-08-17")).toBe("الاثنين");
  });
});
