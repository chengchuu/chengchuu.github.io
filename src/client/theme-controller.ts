import type { ResolvedTheme } from "mazey";

interface ThemeControllerDependencies {
  resolveTheme: () => ResolvedTheme;
  persistTheme: (theme: ResolvedTheme) => boolean;
  applyTheme: (theme: ResolvedTheme) => void;
}

export interface ThemeController {
  currentTheme: () => ResolvedTheme;
  toggleTheme: () => ResolvedTheme;
}

export function initializeThemeController({
  resolveTheme,
  persistTheme,
  applyTheme,
}: ThemeControllerDependencies): ThemeController {
  let currentTheme = resolveTheme();
  applyTheme(currentTheme);

  return {
    currentTheme: () => currentTheme,
    toggleTheme: () => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      persistTheme(nextTheme);
      currentTheme = nextTheme;
      applyTheme(currentTheme);
      return currentTheme;
    },
  };
}
