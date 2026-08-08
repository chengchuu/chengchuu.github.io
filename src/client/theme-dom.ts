import { siteConfig } from "../config/site";

export type ResolvedTheme = "light" | "dark";
export type ThemePreference = "system" | ResolvedTheme;

export function preferenceFromLabel(label: string): ThemePreference {
  const normalized = label.toLowerCase();
  return normalized === "light" || normalized === "dark" ? normalized : "system";
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.setAttribute("data-bs-theme", theme);
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );

  if (meta) {
    meta.content =
      theme === "dark"
        ? siteConfig.theme.darkThemeColor
        : siteConfig.theme.lightThemeColor;
  }
}
