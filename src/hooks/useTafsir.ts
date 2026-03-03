import { useCallback, useEffect, useRef, useState } from "react";
import { tafsirService, TafsirEntry } from "../services/TafsirService";

interface UseTafsirResult {
  tafsir: TafsirEntry | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useTafsir(
  chapterId: number | null,
  verseNumber: number | null,
): UseTafsirResult {
  const [tafsir, setTafsir] = useState<TafsirEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef(0);

  const loadTafsir = useCallback(async () => {
    if (chapterId === null || verseNumber === null) {
      setTafsir(null);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++activeRequest.current;
    setTafsir(null);
    setLoading(true);
    setError(null);

    try {
      const result = await tafsirService.getTafsir(chapterId, verseNumber);

      if (requestId !== activeRequest.current) return;

      if (result) {
        setTafsir(result);
      } else {
        setError("لم يتم العثور على التفسير");
      }
    } catch {
      if (requestId !== activeRequest.current) return;
      setError("حدث خطأ أثناء تحميل التفسير");
    } finally {
      if (requestId === activeRequest.current) {
        setLoading(false);
      }
    }
  }, [chapterId, verseNumber]);

  useEffect(() => {
    loadTafsir();
  }, [loadTafsir]);

  return { tafsir, loading, error, retry: loadTafsir };
}
