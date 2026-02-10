// Quran Component - Data Hook
import { useState, useEffect } from "react";
import { databaseService } from "../../services/SQLiteService";
import { Page } from "./types";

interface UseQuranDataResult {
  page: Page | null;
  loading: boolean;
  error: Error | null;
}

export function useQuranData(pageNumber: number): UseQuranDataResult {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const pageData = await databaseService.getPageByNumber(pageNumber);
        if (mounted) {
          setPage(pageData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
  }, [pageNumber]);

  return { page, loading, error };
}
