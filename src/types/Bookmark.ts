export interface Bookmark {
  id: number;
  verse_id: number;
  chapter_id: number;
  verse_number: number;
  page_number: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export type CreateBookmarkInput = Omit<
  Bookmark,
  "id" | "created_at" | "updated_at"
>;
