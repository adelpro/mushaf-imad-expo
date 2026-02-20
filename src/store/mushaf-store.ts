import { create } from "zustand";

type MushafState = {
  // Reading state
  currentChapter: number;
  activeVerse: number | null;
  currentPage: number;

  // Playback state
  isPlaying: boolean;

  // Actions
  setCurrentChapter: (chapter: number) => void;
  setActiveVerse: (verse: number | null) => void;
  setCurrentPage: (page: number) => void;
  setIsPlaying: (playing: boolean) => void;
};

export const useMushafStore = create<MushafState>((set) => ({
  // Initial state
  currentChapter: 1,
  activeVerse: null,
  currentPage: 1,
  isPlaying: false,

  // Actions
  setCurrentChapter: (chapter) =>
    set((state) =>
      state.currentChapter !== chapter ? { currentChapter: chapter } : state,
    ),
  setActiveVerse: (verse) => set({ activeVerse: verse }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
