import { resolveThemePreference } from "mazey";
import { siteConfig } from "../config/site";
import { applyResolvedTheme } from "./theme-dom";
import "../styles/theme.css";

const result = resolveThemePreference(siteConfig.theme.storageKey);
document.documentElement.dataset.themePreference = result.value;
applyResolvedTheme(result.value);
