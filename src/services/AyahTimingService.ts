export type AyahTiming = {
  ayah: number;
  start_time: number;
  end_time: number;
};

export type ChapterTiming = {
  id: number;
  name: string;
  aya_timing: AyahTiming[];
};

export type ReciterData = {
  id: number;
  name: string;
  name_en: string;
  rewaya: string;
  folder_url: string;
  chapters: ChapterTiming[];
};

const TIMING_FILES: Record<number, () => ReciterData> = {
  1: () => require('../../assets/ayah_timing/read_1.json'),
  5: () => require('../../assets/ayah_timing/read_5.json'),
  9: () => require('../../assets/ayah_timing/read_9.json'),
  10: () => require('../../assets/ayah_timing/read_10.json'),
  31: () => require('../../assets/ayah_timing/read_31.json'),
  32: () => require('../../assets/ayah_timing/read_32.json'),
  51: () => require('../../assets/ayah_timing/read_51.json'),
  53: () => require('../../assets/ayah_timing/read_53.json'),
  60: () => require('../../assets/ayah_timing/read_60.json'),
  62: () => require('../../assets/ayah_timing/read_62.json'),
  67: () => require('../../assets/ayah_timing/read_67.json'),
  74: () => require('../../assets/ayah_timing/read_74.json'),
  78: () => require('../../assets/ayah_timing/read_78.json'),
  106: () => require('../../assets/ayah_timing/read_106.json'),
  112: () => require('../../assets/ayah_timing/read_112.json'),
  118: () => require('../../assets/ayah_timing/read_118.json'),
  159: () => require('../../assets/ayah_timing/read_159.json'),
  256: () => require('../../assets/ayah_timing/read_256.json'),
};

const cache = new Map<number, ReciterData>();

export function getAvailableReciters(): Array<{ id: number; name: string; name_en: string }> {
  return Object.keys(TIMING_FILES).map((key) => {
    const id = Number(key);
    const data = loadTimingSync(id);
    return { id, name: data?.name ?? '', name_en: data?.name_en ?? '' };
  });
}

function loadTimingSync(reciterId: number): ReciterData | null {
  if (cache.has(reciterId)) {
    return cache.get(reciterId)!;
  }
  const loader = TIMING_FILES[reciterId];
  if (!loader) return null;
  const data = loader();
  cache.set(reciterId, data);
  return data;
}

export function loadTiming(reciterId: number): ReciterData | null {
  return loadTimingSync(reciterId);
}

export function getChapterTiming(
  reciterId: number,
  chapterNumber: number,
): ChapterTiming | null {
  const data = loadTiming(reciterId);
  if (!data) return null;
  return data.chapters.find((c) => c.id === chapterNumber) ?? null;
}

export function getAudioUrl(reciterId: number, chapterNumber: number): string | null {
  const data = loadTiming(reciterId);
  if (!data) return null;
  const paddedChapter = chapterNumber.toString().padStart(3, '0');
  return `${data.folder_url}${paddedChapter}.mp3`;
}
