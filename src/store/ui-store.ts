import { create } from "zustand";

type UiState = {
  footerVisible: boolean;
  setFooterVisible: (visible: boolean) => void;
  toggleFooterVisible: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  footerVisible: false,
  setFooterVisible: (visible) => set({ footerVisible: visible }),
  toggleFooterVisible: () => set((state) => ({ footerVisible: !state.footerVisible })),
}));
