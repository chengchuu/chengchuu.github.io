import {
  listenMediaQueryChanges,
  resolveThemePreference,
  setThemePreference,
} from "mazey";
import { siteConfig } from "../config/site";
import {
  applyResolvedTheme,
  preferenceFromLabel,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme-dom";
import "../styles/site.css";

let activePreference: ThemePreference = siteConfig.theme.defaultPreference;

function updateThemeButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-preference]").forEach(
    (button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themePreference === activePreference),
      );
    },
  );
}

function resolvedSystemTheme(media: MediaQueryList): ResolvedTheme {
  return media.matches ? "dark" : "light";
}

function initializeThemeControls(): void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = resolveThemePreference(siteConfig.theme.storageKey);
  activePreference = preferenceFromLabel(resolved.label);
  applyResolvedTheme(resolved.value);
  updateThemeButtons();

  document.querySelectorAll<HTMLButtonElement>("[data-theme-preference]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        const preference = button.dataset.themePreference as
          | ThemePreference
          | undefined;
        if (!preference) {
          return;
        }

        activePreference = preference;
        setThemePreference(siteConfig.theme.storageKey, preference);
        applyResolvedTheme(
          preference === "system" ? resolvedSystemTheme(media) : preference,
        );
        document.documentElement.dataset.themePreference = preference;
        updateThemeButtons();
      });
    },
  );

  listenMediaQueryChanges(media, (event) => {
    if (activePreference === "system") {
      applyResolvedTheme(event.matches ? "dark" : "light");
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
