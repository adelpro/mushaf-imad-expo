import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";
import type { ThemeColorMap, ThemeMode } from "./types";
import { lightTheme, darkTheme } from "./palettes";

const THEME_KEY = "theme_mode";
const SETTINGS_TABLE = "app_settings";
const SETTINGS_DB = "app_settings.db";

export interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColorMap;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
  colorOverrides?: Partial<ThemeColorMap>;
}

export function ThemeProvider({
  children,
  initialMode,
  colorOverrides,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode ?? "light");
  const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);
  const dbInitialized = useRef(false);
  const initialLoadDone = useRef(!!initialMode);

  // Open DB and load persisted theme preference
  useEffect(() => {
    if (initialMode) return;
    let active = true;
    (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(SETTINGS_DB);
        if (!active) return;
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
        );
        if (!active) return;
        // Only assign dbRef after table creation succeeds
        dbRef.current = db;
        dbInitialized.current = true;
        const row = await db.getFirstAsync<{ value: string }>(
          `SELECT value FROM ${SETTINGS_TABLE} WHERE key = ?`,
          [THEME_KEY],
        );
        if (
          active &&
          row &&
          (row.value === "light" || row.value === "dark")
        ) {
          setModeState(row.value);
        }
        initialLoadDone.current = true;
      } catch (e) {
        console.warn("[ThemeProvider] Could not load theme preference:", e);
        initialLoadDone.current = true;
      }
    })();
    return () => {
      active = false;
      if (dbRef.current) {
        dbRef.current.closeAsync().catch(() => {});
        dbRef.current = null;
        dbInitialized.current = false;
      }
    };
  }, [initialMode]);

  // Persist mode changes to DB (separate effect — no side effects in setState)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (!dbInitialized.current || !dbRef.current) return;
    const db = dbRef.current;
    db.runAsync(
      `INSERT OR REPLACE INTO ${SETTINGS_TABLE} (key, value) VALUES (?, ?)`,
      [THEME_KEY, mode],
    ).catch((e) =>
      console.warn("[ThemeProvider] Could not persist theme preference:", e),
    );
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const colors = useMemo<ThemeColorMap>(() => {
    const base = mode === "dark" ? darkTheme : lightTheme;
    return colorOverrides ? { ...base, ...colorOverrides } : base;
  }, [mode, colorOverrides]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors, toggleTheme, setMode }),
    [mode, colors, toggleTheme, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
