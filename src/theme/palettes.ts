import type { ThemeColorMap } from "./types";

export const lightTheme: ThemeColorMap = {
  pageBackground: "#FFF8E1",
  highlightColor: "rgba(88, 168, 105, 0.4)",

  modalBackground: "#FFFFFF",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  modalBorder: "#E0E0E0",
  modalShadow: "#000000",

  primaryText: "#1B1B1B",
  accentText: "#1B5E20",
  secondaryText: "#666666",
  tertiaryText: "#888888",

  primaryButton: "#1B5E20",
  primaryButtonText: "#FFFFFF",
  secondaryButtonText: "#666666",

  faselText: "#000000",

  loadingIndicator: "#8B4513",
  errorText: "#D32F2F",
  retryButton: "#8B4513",
  retryButtonText: "#FFFFFF",
};

export const darkTheme: ThemeColorMap = {
  pageBackground: "#1A1A1A",
  highlightColor: "rgba(88, 168, 105, 0.35)",

  modalBackground: "#2C2C2C",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  modalBorder: "#444444",
  modalShadow: "#000000",

  primaryText: "#E8E8E8",
  accentText: "#66BB6A",
  secondaryText: "#AAAAAA",
  tertiaryText: "#9E9E9E",

  primaryButton: "#2E7D32",
  primaryButtonText: "#FFFFFF",
  secondaryButtonText: "#AAAAAA",

  faselText: "#E8E8E8",

  loadingIndicator: "#A0522D",
  errorText: "#EF5350",
  retryButton: "#A0522D",
  retryButtonText: "#FFFFFF",
};
