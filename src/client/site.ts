import {
  listenMediaQueryChanges,
  resolveThemePreference,
  setThemePreference,
} from "mazey";
import { siteConfig } from "../config/site";
import {
  applyResolvedTheme,
  getColorSchemeMedia,
  type ResolvedTheme,
} from "./theme-dom";
import "../styles/site.css";

let activeTheme: ResolvedTheme = "light";
let followsSystemTheme = false;

function updateThemeButtons(): void {
  document
    .querySelectorAll<HTMLButtonElement>("button[data-theme-preference]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themePreference === activeTheme),
      );
    });
}

function initializeThemeControls(): void {
  const media = getColorSchemeMedia(window);
  const resolved = resolveThemePreference(siteConfig.theme.storageKey);
  activeTheme = resolved.value;
  followsSystemTheme = resolved.label === "System";
  applyResolvedTheme(activeTheme);
  document.documentElement.dataset.themePreference = activeTheme;
  updateThemeButtons();

  for (const theme of ["light", "dark"] as const) {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-theme-preference="${theme}"]`,
    );
    button?.addEventListener("click", () => {
      activeTheme = theme;
      followsSystemTheme = false;
      setThemePreference(siteConfig.theme.storageKey, theme);
      applyResolvedTheme(activeTheme);
      document.documentElement.dataset.themePreference = activeTheme;
      updateThemeButtons();
    });
  }

  listenMediaQueryChanges(media, (event) => {
    if (followsSystemTheme) {
      activeTheme = event.matches ? "dark" : "light";
      applyResolvedTheme(activeTheme);
      document.documentElement.dataset.themePreference = activeTheme;
      updateThemeButtons();
    }
  });
}

function initializeProjectFilters(): void {
  const search = document.querySelector<HTMLInputElement>("[data-project-search]");
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>("[data-project-card]"),
  );
  const emptyState = document.querySelector<HTMLElement>("[data-empty-state]");
  let category = "all";

  const applyFilters = (): void => {
    const query = search?.value.trim().toLocaleLowerCase() ?? "";
    let visible = 0;

    for (const card of cards) {
      const categoryMatches =
        category === "all" || card.dataset.projectCategory === category;
      const searchMatches =
        query.length === 0 ||
        (card.dataset.projectSearch ?? "").includes(query);
      card.hidden = !(categoryMatches && searchMatches);
      if (!card.hidden) {
        visible += 1;
      }
    }

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };

  search?.addEventListener("input", applyFilters);
  document.querySelectorAll<HTMLButtonElement>("[data-project-filter]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        category = button.dataset.projectFilter ?? "all";
        document
          .querySelectorAll<HTMLButtonElement>("[data-project-filter]")
          .forEach((candidate) => {
            candidate.setAttribute(
              "aria-pressed",
              String(candidate === button),
            );
          });
        applyFilters();
      });
    },
  );
}

initializeThemeControls();
initializeProjectFilters();
