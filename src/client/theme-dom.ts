import { siteConfig } from "../config/site";
import type { ResolvedTheme } from "mazey";

export interface ThemeDocument {
  documentElement: HTMLElement;
  querySelector: Document["querySelector"];
}

export function applyResolvedTheme(
  theme: ResolvedTheme,
  themeDocument: ThemeDocument = document,
): void {
  const root = themeDocument.documentElement;
  root.setAttribute("data-bs-theme", theme);
  root.setAttribute("data-theme-preference", theme);

  const meta = themeDocument.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );

  if (meta) {
    meta.content =
      theme === "dark"
        ? siteConfig.theme.darkThemeColor
        : siteConfig.theme.lightThemeColor;
  }

  const toggle = themeDocument.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!toggle) {
    return;
  }

  const isLight = theme === "light";
  toggle.setAttribute(
    "aria-label",
    isLight
      ? "Current theme: Light. Switch to dark theme."
      : "Current theme: Dark. Switch to light theme.",
  );
  toggle
    .querySelector<SVGElement>(".theme-toggle__icon--sun")!
    .toggleAttribute("hidden", !isLight);
  toggle
    .querySelector<SVGElement>(".theme-toggle__icon--moon")!
    .toggleAttribute("hidden", isLight);
}
