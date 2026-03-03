export type ThemeMode = "light" | "dark";

export interface ThemeColorMap {
  pageBackground: string;
  highlightColor: string;

  modalBackground: string;
  modalOverlay: string;
  modalBorder: string;
  modalShadow: string;

  primaryText: string;
  accentText: string;
  secondaryText: string;
  tertiaryText: string;

  primaryButton: string;
  primaryButtonText: string;
  secondaryButtonText: string;

  faselText: string;

  loadingIndicator: string;
  errorText: string;
  retryButton: string;
  retryButtonText: string;
}
