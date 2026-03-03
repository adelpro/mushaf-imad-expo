import { useContext } from "react";
import {
  BookmarkContext,
  BookmarkContextValue,
} from "../contexts/BookmarkContext";

export function useBookmarks(): BookmarkContextValue {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
