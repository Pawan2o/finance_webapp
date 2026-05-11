import { useEffect, useMemo, useState } from "react";

import {
  getResolvedThemeTokens,
  resolveThemeMode,
  type ResolvedTheme,
  type ThemeMode,
} from "./theme";

const STORAGE_KEY = "app-theme-mode";

function getStoredMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useAppTheme() {
  const [mode, setMode] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "system" : getStoredMode(),
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : resolveThemeMode(getStoredMode(), getSystemPrefersDark()),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (nextMode: ThemeMode) => {
      const nextResolvedTheme = resolveThemeMode(nextMode, mediaQuery.matches);
      setResolvedTheme(nextResolvedTheme);

      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      document.documentElement.dataset.theme = nextResolvedTheme;
    };

    applyTheme(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);

    const handleChange = () => {
      if (mode === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  const tokens = useMemo(() => getResolvedThemeTokens(resolvedTheme), [resolvedTheme]);

  return {
    mode,
    setMode,
    scheme: resolvedTheme,
    colors: tokens.colors,
    gradients: tokens.gradients,
    spacing: tokens.spacing,
    radius: tokens.radius,
    shadow: tokens.shadow,
    typography: tokens.typography,
  };
}
