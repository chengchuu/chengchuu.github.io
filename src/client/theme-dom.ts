import { siteConfig } from "../config/site";

export type ResolvedTheme = "light" | "dark";

interface MatchMediaHost {
  matchMedia?: (query: string) => MediaQueryList;
}

export function getColorSchemeMedia(host: MatchMediaHost): MediaQueryList | null {
  if (typeof host.matchMedia !== "function") {
    return null;
  }

  try {
    return host.matchMedia("(prefers-color-scheme: dark)");
  } catch {
    return null;
  }
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
