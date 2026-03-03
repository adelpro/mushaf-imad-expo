import { useState, useEffect, useCallback, useRef } from "react";
import { databaseService } from "../services/SQLiteService";

type DbInitState = {
  loading: boolean;
  error: string | null;
  retry: () => void;
};

function toUserMessage(err: unknown): string {
  if (!(err instanceof Error)) return "فشل في تهيئة قاعدة البيانات";
  const msg = err.message.toLowerCase();
  if (msg.includes("network") || msg.includes("fetch"))
    return "تعذر تحميل قاعدة البيانات. تحقق من الاتصال بالإنترنت";
  if (msg.includes("enoent") || msg.includes("no such file"))
    return "خطأ في نظام الملفات. حاول إعادة تثبيت التطبيق";
  if (msg.includes("enospc") || msg.includes("disk") || msg.includes("space"))
    return "مساحة التخزين غير كافية";
  return "فشل في تهيئة قاعدة البيانات";
}

export function useDbInit(): DbInitState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const runInit = useCallback(() => {
    setLoading(true);
    setError(null);
    databaseService
      .initialize()
      .then(() => {
        if (mountedRef.current) setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        if (
          err instanceof Error &&
          err.message === "DB init cancelled by reset"
        )
          return;
        setError(toUserMessage(err));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    runInit();
    return () => {
      mountedRef.current = false;
    };
  }, [runInit]);

  const retry = useCallback(() => {
    databaseService.reset();
    runInit();
  }, [runInit]);

  return { loading, error, retry };
}
