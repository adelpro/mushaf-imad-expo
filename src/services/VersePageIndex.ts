import { databaseService } from "./SQLiteService";

type VerseKey = string;

class VersePageIndexService {
  private index: Map<VerseKey, number> | null = null;
  private buildPromise: Promise<Map<VerseKey, number>> | null = null;

  async getIndex(): Promise<Map<VerseKey, number>> {
    if (this.index) return this.index;
    if (this.buildPromise) return this.buildPromise;
    this.buildPromise = this.build()
      .then((map) => {
        this.index = map;
        return map;
      })
      .catch((err) => {
        this.buildPromise = null;
        throw err;
      });
    return this.buildPromise;
  }

  private async build(): Promise<Map<VerseKey, number>> {
    const db = await databaseService.getDb();
    const rows = await db.getAllAsync<{
      chapter_id: number;
      number: number;
      page1441_id: number;
    }>(
      "SELECT chapter_id, number, page1441_id FROM verses WHERE page1441_id IS NOT NULL",
    );

    const map = new Map<VerseKey, number>();
    for (const row of rows) {
      map.set(`${row.chapter_id}:${row.number}`, row.page1441_id);
    }
    return map;
  }

  async getPageForVerse(
    chapterId: number,
    verseNumber: number,
  ): Promise<number | null> {
    const index = await this.getIndex();
    return index.get(`${chapterId}:${verseNumber}`) ?? null;
  }
}

export const versePageIndex = new VersePageIndexService();
