import { create } from "zustand";

type MushafState = {
  currentChapter: number;
  activeVerse: number | null;
  currentPage: number;
  jumpToPage: number | null;
  readCount: number;
  isPlaying: boolean;

  setCurrentChapter: (chapter: number) => void;
  setActiveVerse: (verse: number | null) => void;
  setCurrentPage: (page: number) => void;
  setJumpToPage: (page: number | null) => void;
  setReadCount: (count: number) => void;
  setIsPlaying: (playing: boolean) => void;
};

export const useMushafStore = create<MushafState>((set) => ({
  currentChapter: 1,
  activeVerse: null,
  currentPage: 1,
  jumpToPage: null,
  readCount: 0,
  isPlaying: false,

  setCurrentChapter: (chapter) =>
    set((state) => (state.currentChapter !== chapter ? { currentChapter: chapter } : state)),
  setActiveVerse: (verse) => set({ activeVerse: verse }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setJumpToPage: (page) => set({ jumpToPage: page }),
  setReadCount: (count) => set({ readCount: count }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
