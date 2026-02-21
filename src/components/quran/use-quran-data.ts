// Quran Component - Data Hook
import { useState, useEffect } from "react";
import { databaseService } from "../../services/sqlite-service";
import { Page } from "./types";

type QuranDataState = {
  page: Page | null;
  loading: boolean;
  error: Error | null;
};

const INITIAL_STATE: QuranDataState = { page: null, loading: true, error: null };

export function useQuranData(pageNumber: number): QuranDataState {
  const [state, setState] = useState<QuranDataState>(INITIAL_STATE);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      setState(INITIAL_STATE);
      try {
        const pageData = await databaseService.getPageByNumber(pageNumber);
        if (mounted) {
          setState({ page: pageData, loading: false, error: null });
        }
      } catch (err) {
        if (mounted) {
          setState({
            page: null,
            loading: false,
            error: err instanceof Error ? err : new Error("Unknown error"),
          });
        }
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
  }, [pageNumber]);

  return state;
}
