import { create } from "zustand";

type MushafState = {
  // Reading state
  currentChapter: number;
  activeVerse: number | null;
  currentPage: number;

  // Jump from Progress "Continue" to open mushaf at a specific page
  jumpToPage: number | null;

  // Playback state
  isPlaying: boolean;

  // Actions
  setCurrentChapter: (chapter: number) => void;
  setActiveVerse: (verse: number | null) => void;
  setCurrentPage: (page: number) => void;
  setJumpToPage: (page: number | null) => void;
  setIsPlaying: (playing: boolean) => void;
};

export const useMushafStore = create<MushafState>((set) => ({
  // Initial state
  currentChapter: 1,
  activeVerse: null,
  currentPage: 1,
  jumpToPage: null,
  isPlaying: false,

  // Actions
  setCurrentChapter: (chapter) =>
    set((state) =>
      state.currentChapter !== chapter ? { currentChapter: chapter } : state,
    ),
  setActiveVerse: (verse) => set({ activeVerse: verse }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setJumpToPage: (page) => set({ jumpToPage: page }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
