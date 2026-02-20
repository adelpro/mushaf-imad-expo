import { useEffect, useState, useCallback } from "react";
import { databaseService, Page } from "../services/sqlite-service";

export const useQuranPage = (pageNumber: number) => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await databaseService.getPageByNumber(pageNumber);
      if (!pageData) {
        throw new Error("لم يتم العثور على بيانات لهذه الصفحة");
      }
      setPage(pageData);
    } catch (err) {
      console.error("Error loading page:", err);
      setError("حدث خطأ أثناء تحميل الصفحة من قاعدة البيانات");
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  return { page, loading, error, retry: loadPage };
};
