export const palette = {
    white: "#FFFFFF",
    black: "#000000",
    cream: "#FFF8E1",
    grey100: "#eeeeee",
    grey200: "#E0E0E0",
    grey600: "#888888",
    grey700: "#666666",
    grey900: "#1B1B1B",
    greenDark: "#1B5E20",
    greenHighlight: "rgba(88, 168, 105, 0.4)",
    brown: "#8B4513",
    redError: "#D32F2F",
    overlay: "rgba(0, 0, 0, 0.5)",
    transparent: "transparent"
};

export const colors = {
    transparent: palette.transparent,

    background: {
        default: palette.cream,
        surface: palette.white,
        subtle: palette.grey100,
        overlay: palette.overlay,
    },

    text: {
        primary: palette.grey900,
        secondary: palette.grey700,
        tertiary: palette.grey600,
        inverse: palette.white,
        error: palette.redError,
    },

    brand: {
        default: palette.greenDark,
        highlight: palette.greenHighlight,
        accent: palette.brown,
    },

    border: {
        default: palette.grey200,
    },
} as const;

export type ColorTheme = typeof colors;
