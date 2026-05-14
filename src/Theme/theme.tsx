import { appFonts } from "./fonts";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const common = {
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  shadow: {
    sm: "0 2px 8px rgba(15, 23, 42, 0.06)",
    md: "0 10px 30px rgba(15, 23, 42, 0.08)",
    lg: "0 20px 50px rgba(15, 23, 42, 0.12)",
  },
  typography: {
    fontFamily: appFonts.body,
  },
};

export const themeTokens = {
  light: {
    colors: {
      bgBase: "#F8FAFC",
      bgSubtle: "#F1F5F9",
      bgCanvas: "#E8EEF8",
      surface1: "#FFFFFF",
      surface2: "#F8FAFC",
      surface3: "#F1F5F9",
      brand: "#1E3A8A",
      brandMid: "#2448AC",
      brandLight: "#2D55CC",
      textHeading: "#0F172A",
      textBody: "#475569",
      textSecondary: "#64748B",
      textMuted: "#94A3B8",
      textInverse: "#FFFFFF",
      success: "#10B981",
      danger: "#EF4444",
      warning: "#F59E0B",
      purple: "#7C3AED",
      border: "#D7E1F0",
      input: "#D7E1F0",
      ring: "#2448AC",
    },
    gradients: {
      brand: "linear-gradient(135deg, #1E3A8A 0%, #2D55CC 100%)",
      success: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      danger: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
      warning: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
      purple: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)",
      hero: "linear-gradient(180deg, #F8FAFC 0%, #E8EEF8 100%)",
    },
    ...common,
  },
  dark: {
    colors: {
      bgBase: "#080E1D",
      bgSubtle: "#0C1426",
      bgCanvas: "#050B17",
      surface1: "#101929",
      surface2: "#141F32",
      surface3: "#1A2740",
      brand: "#4268E0",
      brandMid: "#5178EE",
      brandLight: "#6690F7",
      textHeading: "#EEF2FF",
      textBody: "#94A8C8",
      textSecondary: "#5A7498",
      textMuted: "#334158",
      textInverse: "#FFFFFF",
      success: "#10B981",
      danger: "#F87171",
      warning: "#FBBF24",
      purple: "#A78BFA",
      border: "#21314D",
      input: "#21314D",
      ring: "#6690F7",
    },
    gradients: {
      brand: "linear-gradient(135deg, #4268E0 0%, #6690F7 100%)",
      success: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      danger: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
      purple: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
      hero: "linear-gradient(180deg, #080E1D 0%, #050B17 100%)",
    },
    ...common,
  },
} as const;

export function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}

export function getResolvedThemeTokens(theme: ResolvedTheme) {
  return themeTokens[theme];
}
