import { useState, useEffect, useCallback, useRef } from "react";
import { databaseService } from "../services/SQLiteService";

export const TOTAL_PAGES = 604;
const SAVE_DEBOUNCE_MS = 1000;

export function useReadingProgress() {
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPageRef = useRef<number | null>(null);

  useEffect(() => {
    databaseService
      .getLastReadPage()
      .then((page) => {
        setLastReadPage(page);
      })
      .catch(() => {
        setLastReadPage(1);
      });

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (pendingPageRef.current !== null) {
        databaseService
          .saveLastReadPage(pendingPageRef.current)
          .catch(() => {});
      }
    };
  }, []);

  const saveProgress = useCallback((page: number) => {
    pendingPageRef.current = page;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      databaseService.saveLastReadPage(page).catch(() => {});
      pendingPageRef.current = null;
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const progressPercent =
    lastReadPage !== null
      ? Math.max(1, Math.round((lastReadPage / TOTAL_PAGES) * 100))
      : 0;

  return { lastReadPage, saveProgress, progressPercent, TOTAL_PAGES };
}
