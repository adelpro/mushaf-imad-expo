export interface AyahTiming {
  ayah: number;
  start_time: number;
  end_time: number;
}

export interface ChapterTiming {
  id: number;
  name: string;
  aya_timing: AyahTiming[];
}

export interface ReciterTiming {
  id: number;
  name: string;
  name_en: string;
  rewaya: string;
  folder_url: string;
  chapters: ChapterTiming[];
}

const TIMING_FILES: Record<number, () => ReciterTiming> = {
  1: () => require("../../assets/ayah_timing/read_1.json"),
  5: () => require("../../assets/ayah_timing/read_5.json"),
  9: () => require("../../assets/ayah_timing/read_9.json"),
  10: () => require("../../assets/ayah_timing/read_10.json"),
  31: () => require("../../assets/ayah_timing/read_31.json"),
  32: () => require("../../assets/ayah_timing/read_32.json"),
  51: () => require("../../assets/ayah_timing/read_51.json"),
  53: () => require("../../assets/ayah_timing/read_53.json"),
  60: () => require("../../assets/ayah_timing/read_60.json"),
  62: () => require("../../assets/ayah_timing/read_62.json"),
  67: () => require("../../assets/ayah_timing/read_67.json"),
  74: () => require("../../assets/ayah_timing/read_74.json"),
  78: () => require("../../assets/ayah_timing/read_78.json"),
  106: () => require("../../assets/ayah_timing/read_106.json"),
  112: () => require("../../assets/ayah_timing/read_112.json"),
  118: () => require("../../assets/ayah_timing/read_118.json"),
  159: () => require("../../assets/ayah_timing/read_159.json"),
  256: () => require("../../assets/ayah_timing/read_256.json"),
};

const timingCache = new Map<number, ReciterTiming>();

export function loadTiming(reciterId: number): ReciterTiming | null {
  const cached = timingCache.get(reciterId);
  if (cached) return cached;
  const loader = TIMING_FILES[reciterId];
  if (!loader) return null;
  try {
    const timing = loader();
    timingCache.set(reciterId, timing);
    return timing;
  } catch {
    return null;
  }
}

export function getChapterTiming(
  reciterId: number,
  chapterId: number,
): ChapterTiming | null {
  const reciter = loadTiming(reciterId);
  if (!reciter) return null;
  return reciter.chapters.find((c) => c.id === chapterId) ?? null;
}

export function getAudioUrl(reciterId: number, chapterId: number): string {
  const reciter = loadTiming(reciterId);
  if (!reciter) return "";
  const paddedChapter = chapterId.toString().padStart(3, "0");
  return `${reciter.folder_url}${paddedChapter}.mp3`;
}
