const palette = {
  blue: "#4F8EF7",
  blueLight: "#a9c7f5",
  blueLighter: "#e8f0fe",
  blueDarker: "#2c6ecb",

  textDark: "#22223b",
  textMedium: "#495057",
  textLight: "#6c757d",
  textLighter: "#adb5bd",

  background: "#f8fafc",
  white: "#fff",

  borderLight: "#f1f1f1",
  border: "#e9ecef",

  success: "#2a9d8f",
  successLight: "#e0f2f1",
  successMedium: "#00796b",
  successDark: "#004d40",
  successBorder: "#b2dfdb",
  favorite: "#FFD700",
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#FFD700",
  goldLeague: "#EEB609",
  platinum: "#7f8c8d",
  diamond: "#4EE2EC",
  master: "#4a148c",
  legendary: "#bf360c",
  xpFeedback: "rgba(255, 204, 0, 0.9)",
  challenge: "#f4a261",
  danger: "#e76f51",
  dangerLight: "#ffe8e1",
  dangerDark: "#d11a2a",

  // New category colors
  purple: "#9b59b6",
  purpleLighter: "#f4ecf7",
  purpleDarker: "#7d3c98",

  orangeLighter: "#fef5ee",
  orangeDarker: "#c57d3d",

  dark: "#22223B",
  grey: "#ced4da",
  greyLighter: "#f1f3f5",
  placeholder: "#9e9e9e",
};

export const colors = {
  primary: palette.blue,
  primaryLight: palette.blueLight,
  primaryLighter: palette.blueLighter,
  primaryDarker: palette.blueDarker,
  background: palette.background,
  surface: palette.white,
  backgroundGradient: [palette.blueLighter, palette.white],

  text: palette.textDark,
  textMedium: palette.textMedium,
  textSecondary: palette.textLight,
  textMuted: palette.textLighter,
  placeholder: palette.placeholder,

  success: palette.success,
  successLight: palette.successLight,
  successMedium: palette.successMedium,
  successDark: palette.successDark,
  successBorder: palette.successBorder,
  favorite: palette.favorite,
  bronze: palette.bronze,
  silver: palette.silver,
  gold: palette.gold,
  goldLeague: palette.goldLeague,
  platinum: palette.platinum,
  diamond: palette.diamond,
  master: palette.master,
  legendary: palette.legendary,
  xpFeedback: palette.xpFeedback,
  challenge: palette.challenge,
  danger: palette.danger,
  dangerLight: palette.dangerLight,
  dangerDark: palette.dangerDark,

  purple: palette.purple,
  purpleLighter: palette.purpleLighter,
  purpleDarker: palette.purpleDarker,

  border: palette.border,
  borderLight: palette.borderLight,

  icon: palette.textLight,
  iconMuted: palette.grey,

  dark: palette.dark,

  disabled: palette.blueLight,

  overlay: "rgba(0,0,0,0.4)",

  mastery: {
    new: palette.textLighter,
    learning: palette.challenge,
    mastered: palette.success,
  },

  // Centralized colors for word categories
  category: {
    Nome: palette.blue,
    Verbo: palette.challenge,
    Adjetivo: palette.success,
    Advérbio: palette.purple,
    Outro: palette.textMedium,
  },
  categoryLighter: {
    Nome: palette.blueLighter,
    Verbo: palette.orangeLighter,
    Adjetivo: palette.successLight,
    Advérbio: palette.purpleLighter,
    Outro: palette.greyLighter,
  },
  categoryDarker: {
    Nome: palette.blueDarker,
    Verbo: palette.orangeDarker,
    Adjetivo: palette.successDark,
    Advérbio: palette.purpleDarker,
    Outro: palette.textDark,
  },
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 18,
  xl: 20,
  xxl: 22,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 36,
};

export const fonts = {
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
  bold: "Satoshi-Bold",
};

export const theme = {
  colors,
  fontSizes,
  fonts,
};
