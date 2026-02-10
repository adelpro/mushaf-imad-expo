import { useEffect, useState } from "react";
import { databaseService, Page } from "../services/SQLiteService";

export const useQuranPage = (pageNumber: number) => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const pageData = await databaseService.getPageByNumber(pageNumber);
        setPage(pageData);
      } catch (error) {
        console.error("Error loading page:", error);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageNumber]);

  return { page, loading };
};
