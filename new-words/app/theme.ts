const palette = {
  blue: "#4F8EF7",
  blueLight: "#a9c7f5",
  blueLighter: "#e8f0fe",

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
  warning: "#e9c46a",
  challenge: "#f4a261",
  danger: "#e76f51",
  dangerLight: "#ffe8e1",
  dangerDark: "#d11a2a",

  grey: "#ced4da",
  placeholder: "#9e9e9e",
};

export const colors = {
  primary: palette.blue,
  primaryLight: palette.blueLight,
  primaryLighter: palette.blueLighter,
  background: palette.background,
  surface: palette.white,

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
  warning: palette.warning,
  challenge: palette.challenge,
  danger: palette.danger,
  dangerLight: palette.dangerLight,
  dangerDark: palette.dangerDark,

  border: palette.border,
  borderLight: palette.borderLight,

  icon: palette.textLight,
  iconMuted: palette.grey,

  disabled: palette.blueLight,

  overlay: "rgba(0,0,0,0.4)",

  mastery: {
    new: palette.textLighter,
    learning: palette.challenge,
    mastered: palette.success,
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
