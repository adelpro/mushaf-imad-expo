import { useEffect, useRef, useState } from "react";
import { databaseService, SearchResult } from "../services/SQLiteService";

const DEBOUNCE_MS = 300;

export function useVerseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      generationRef.current++;
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const gen = ++generationRef.current;
      if (!mountedRef.current) return;
      setLoading(true);
      setError(null);

      try {
        const data = await databaseService.searchVerses(trimmed);
        if (gen !== generationRef.current || !mountedRef.current) return;
        setResults(data);
      } catch {
        if (gen !== generationRef.current || !mountedRef.current) return;
        setError("حدث خطأ أثناء البحث");
        setResults([]);
      } finally {
        if (gen === generationRef.current && mountedRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { query, setQuery, results, loading, error };
}
