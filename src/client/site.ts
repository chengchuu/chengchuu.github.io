import { resolveThemePreference, setThemePreference } from "mazey";
import { siteConfig } from "../config/site";
import { initializeThemeController } from "./theme-controller";
import { applyResolvedTheme } from "./theme-dom";
import "../styles/site.css";

function initializeThemeControls(): void {
  const controller = initializeThemeController({
    resolveTheme: () =>
      resolveThemePreference(siteConfig.theme.storageKey).value,
    persistTheme: (theme) =>
      setThemePreference(siteConfig.theme.storageKey, theme),
    applyTheme: applyResolvedTheme,
  });

  document
    .querySelector<HTMLButtonElement>(".theme-toggle")
    ?.addEventListener("click", controller.toggleTheme);
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
