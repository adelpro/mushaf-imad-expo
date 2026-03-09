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

type ReciterMeta = { id: number; name: string; name_en: string };

const TIMING_METADATA: ReciterMeta[] = [
  { id: 1, name: 'إبراهيم الأخضر', name_en: 'Ibrahim Al-Akdar' },
  { id: 5, name: 'أحمد بن علي العجمي', name_en: 'Ahmad Al-Ajmy' },
  { id: 9, name: 'أحمد نعينع', name_en: 'Ahmad Nauina' },
  { id: 10, name: 'أكرم العلاقمي', name_en: 'Akram Alalaqmi' },
  { id: 31, name: 'سعود الشريم', name_en: 'Saud Al-Shuraim' },
  { id: 32, name: 'سهل ياسين', name_en: 'Sahl Yassin' },
  { id: 51, name: 'عبدالباسط عبدالصمد', name_en: 'Abdulbasit Abdulsamad' },
  { id: 53, name: 'عبدالباسط عبدالصمد', name_en: 'Abdulbasit Abdulsamad' },
  { id: 60, name: 'عبدالله بصفر', name_en: 'Abdullah Basfer' },
  { id: 62, name: 'عبدالله عواد الجهني', name_en: 'Abdullah Al-Johany' },
  { id: 67, name: 'عبدالمحسن القاسم', name_en: 'Abdulmohsen Al-Qasim' },
  { id: 74, name: 'علي بن عبدالرحمن الحذيفي', name_en: 'Ali Alhuthaifi' },
  { id: 78, name: 'عماد زهير حافظ', name_en: 'Emad Hafez' },
  { id: 106, name: 'محمد الطبلاوي', name_en: 'Mohammad Al-Tablaway' },
  { id: 112, name: 'محمد صديق المنشاوي', name_en: 'Mohammed Siddiq Al-Minshawi' },
  { id: 118, name: 'محمود خليل الحصري', name_en: 'Mahmoud Khalil Al-Hussary' },
  { id: 159, name: 'خالد المهنا', name_en: 'Khalid Almohana' },
  { id: 256, name: 'أحمد خليل شاهين', name_en: 'Ahmad Shaheen' },
];

export function getAvailableReciters(): ReciterMeta[] {
  return TIMING_METADATA;
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
