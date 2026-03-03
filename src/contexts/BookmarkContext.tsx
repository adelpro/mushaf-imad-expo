import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Bookmark, CreateBookmarkInput } from "../types/Bookmark";
import { bookmarkService } from "../services/BookmarkService";

export interface BookmarkContextValue {
  bookmarkedVerseIds: Set<number>;
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (input: CreateBookmarkInput) => Promise<Bookmark>;
  updateNote: (id: number, note: string) => Promise<void>;
  removeBookmark: (id: number) => Promise<void>;
  getBookmarkForVerse: (verseId: number) => Bookmark | undefined;
  refreshBookmarks: () => Promise<void>;
}

const EMPTY_SET = new Set<number>();
const EMPTY_MAP = new Map<number, Bookmark>();

export const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedVerseIds, setBookmarkedVerseIds] =
    useState<Set<number>>(EMPTY_SET);
  const [bookmarksByVerseId, setBookmarksByVerseId] =
    useState<Map<number, Bookmark>>(EMPTY_MAP);
  const [loading, setLoading] = useState(true);

  const refreshBookmarks = useCallback(async () => {
    try {
      const all = await bookmarkService.getAllBookmarks();
      setBookmarks(all);
      setBookmarkedVerseIds(new Set(all.map((b) => b.verse_id)));
      setBookmarksByVerseId(new Map(all.map((b) => [b.verse_id, b])));
    } catch (error) {
      console.log("Error loading bookmarks:", error);
    }
  }, []);

  useEffect(() => {
    refreshBookmarks().finally(() => setLoading(false));
  }, [refreshBookmarks]);

  const addBookmark = useCallback(
    async (input: CreateBookmarkInput) => {
      const bookmark = await bookmarkService.addBookmark(input);
      await refreshBookmarks();
      return bookmark;
    },
    [refreshBookmarks],
  );

  const updateNote = useCallback(
    async (id: number, note: string) => {
      await bookmarkService.updateBookmarkNote(id, note);
      await refreshBookmarks();
    },
    [refreshBookmarks],
  );

  const removeBookmark = useCallback(
    async (id: number) => {
      await bookmarkService.deleteBookmark(id);
      await refreshBookmarks();
    },
    [refreshBookmarks],
  );

  const getBookmarkForVerse = useCallback(
    (verseId: number) => bookmarksByVerseId.get(verseId),
    [bookmarksByVerseId],
  );

  const value = useMemo(
    () => ({
      bookmarkedVerseIds,
      bookmarks,
      loading,
      addBookmark,
      updateNote,
      removeBookmark,
      getBookmarkForVerse,
      refreshBookmarks,
    }),
    [
      bookmarkedVerseIds,
      bookmarks,
      loading,
      addBookmark,
      updateNote,
      removeBookmark,
      getBookmarkForVerse,
      refreshBookmarks,
    ],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}
