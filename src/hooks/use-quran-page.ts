import { useEffect, useState, useCallback } from "react";
import { databaseService, Page } from "../services/sqlite-service";

type PageState = {
  page: Page | null;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: PageState = { page: null, loading: true, error: null };

export const useQuranPage = (pageNumber: number) => {
  const [state, setState] = useState<PageState>(INITIAL_STATE);

  const loadPage = useCallback(async () => {
    setState(INITIAL_STATE);
    try {
      const pageData = await databaseService.getPageByNumber(pageNumber);
      if (!pageData) {
        throw new Error("لم يتم العثور على بيانات لهذه الصفحة");
      }
      setState({ page: pageData, loading: false, error: null });
    } catch (err) {
      console.error("Error loading page:", err);
      setState({
        page: null,
        loading: false,
        error: "حدث خطأ أثناء تحميل الصفحة من قاعدة البيانات",
      });
    }
  }, [pageNumber]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  return { ...state, retry: loadPage };
};
