import { useState, useEffect, useCallback } from "react";
import { AppState } from "react-native";
import {
  bookmarkService,
  Bookmark,
  NewBookmark,
} from "../services/bookmark-service";

type BookmarkListener = () => void;
const bookmarkListeners = new Set<BookmarkListener>();

function notifyBookmarkChange() {
  for (const listener of bookmarkListeners) {
    listener();
  }
}

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
      notifyBookmarkChange();
      return added;
    },
    [refresh],
  );

  const remove = useCallback(
    async (verseID: number) => {
      await bookmarkService.removeBookmark(verseID);
      await refresh();
      notifyBookmarkChange();
    },
    [refresh],
  );

  const updateNote = useCallback(
    async (verseID: number, note: string) => {
      await bookmarkService.updateNote(verseID, note);
      await refresh();
      notifyBookmarkChange();
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

    const listener = () => setRefreshKey((k) => k + 1);
    bookmarkListeners.add(listener);

    return () => {
      subscription.remove();
      bookmarkListeners.delete(listener);
    };
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
