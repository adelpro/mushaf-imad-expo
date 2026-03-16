export type AyahTiming = {
  ayah: number;
  start_time: number;
  end_time: number;
};

export type Chapter = {
  id: number;
  name: string;
  aya_timing: AyahTiming[];
};

export type TimingData = {
  id: number;
  name: string;
  name_en: string;
  rewaya: string;
  folder_url: string;
  chapters: Chapter[];
};

export const loadTiming = async (reciterId: number): Promise<TimingData | null> => {
  if (reciterId === 1) {
    return require("../../assets/ayah_timing/read_1.json");
  }
  return null;
};
