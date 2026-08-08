import { resolveThemePreference } from "mazey";
import { siteConfig } from "../config/site";
import { applyResolvedTheme, preferenceFromLabel } from "./theme-dom";
import "../styles/theme.css";

const result = resolveThemePreference(siteConfig.theme.storageKey);
document.documentElement.dataset.themePreference = preferenceFromLabel(
  result.label,
);
applyResolvedTheme(result.value);
