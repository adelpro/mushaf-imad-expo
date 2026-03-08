import { useState, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import {
  bookmarkService,
  Bookmark,
  NewBookmark,
} from "../services/BookmarkService";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const all = await bookmarkService.getAllBookmarks();
      setBookmarks(all);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (data: NewBookmark): Promise<boolean> => {
      const added = await bookmarkService.toggleBookmark(data);
      await refresh();
      return added;
    },
    [refresh],
  );

  const remove = useCallback(
    async (verseID: number) => {
      await bookmarkService.removeBookmark(verseID);
      await refresh();
    },
    [refresh],
  );

  const updateNote = useCallback(
    async (verseID: number, note: string) => {
      await bookmarkService.updateNote(verseID, note);
      await refresh();
    },
    [refresh],
  );

  return { bookmarks, loading, toggle, remove, updateNote, refresh };
}

export function useIsBookmarked(verseID: number | null) {
  const [bookmarked, setBookmarked] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setRefreshKey((k) => k + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (verseID === null) {
      setBookmarked(false);
      return;
    }
    bookmarkService.isBookmarked(verseID).then(setBookmarked).catch(() => {});
  }, [verseID, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { bookmarked, refresh };
}
