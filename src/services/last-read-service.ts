import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_READ_KEY = "mushaf_last_read";

export type LastRead = {
  page: number;
  chapterNumber: number;
  ayah: number;
};

export async function getLastRead(): Promise<LastRead | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "page" in data &&
      "chapterNumber" in data &&
      "ayah" in data &&
      typeof (data as LastRead).page === "number" &&
      typeof (data as LastRead).chapterNumber === "number" &&
      typeof (data as LastRead).ayah === "number"
    ) {
      return data as LastRead;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastRead(value: LastRead): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}
