import { create } from "zustand";

/** Delay (ms) before auto-hiding the footer after last user activity. */
export const FOOTER_AUTO_HIDE_DELAY_MS = 2500;

/** Min ms between activity updates to avoid excessive timer rescheduling on rapid taps. */
const ACTIVITY_DEBOUNCE_MS = 150;

type UiState = {
  footerVisible: boolean;
  /** Timestamp of last user activity; used by auto-hide timer to reset. */
  lastActivityAt: number;
  setFooterVisible: (visible: boolean) => void;
  toggleFooterVisible: () => void;
  /** Call when user interacts (e.g. tap). Shows footer and resets auto-hide timer. */
  reportUserActivity: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  footerVisible: true,
  lastActivityAt: 0,
  setFooterVisible: (visible) => set({ footerVisible: visible }),
  toggleFooterVisible: () => set((state) => ({ footerVisible: !state.footerVisible })),
  reportUserActivity: () =>
    set((state) => {
      const now = Date.now();
      if (state.footerVisible && now - state.lastActivityAt < ACTIVITY_DEBOUNCE_MS) {
        return state;
      }
      return state.footerVisible
        ? { lastActivityAt: now }
        : { footerVisible: true, lastActivityAt: now };
    }),
}));
