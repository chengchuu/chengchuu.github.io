import assert from "node:assert/strict";
import test from "node:test";
import type { ResolvedTheme } from "mazey";
import { initializeThemeController } from "../src/client/theme-controller";
import {
  applyResolvedTheme,
  type ThemeDocument,
} from "../src/client/theme-dom";
import { siteConfig } from "../src/config/site";

test("theme controller initializes from persisted light and dark values", () => {
  for (const initialTheme of ["light", "dark"] as const) {
    let resolutions = 0;
    const appliedThemes: ResolvedTheme[] = [];
    const controller = initializeThemeController({
      resolveTheme: () => {
        resolutions += 1;
        return initialTheme;
      },
      persistTheme: () => true,
      applyTheme: (theme) => appliedThemes.push(theme),
    });

    assert.equal(resolutions, 1);
    assert.equal(controller.currentTheme(), initialTheme);
    assert.deepEqual(appliedThemes, [initialTheme]);
  }
});

test("one-time system fallback does not follow later operating-system changes", () => {
  let systemTheme: ResolvedTheme = "dark";
  let resolutions = 0;
  const appliedThemes: ResolvedTheme[] = [];
  const controller = initializeThemeController({
    resolveTheme: () => {
      resolutions += 1;
      return systemTheme;
    },
    persistTheme: () => true,
    applyTheme: (theme) => appliedThemes.push(theme),
  });

  systemTheme = "light";

  assert.equal(resolutions, 1);
  assert.equal(controller.currentTheme(), "dark");
  assert.deepEqual(appliedThemes, ["dark"]);
});

test("repeated toggles persist and apply each concrete theme", () => {
  const persistedThemes: ResolvedTheme[] = [];
  const appliedThemes: ResolvedTheme[] = [];
  const controller = initializeThemeController({
    resolveTheme: () => "light",
    persistTheme: (theme) => {
      persistedThemes.push(theme);
      return true;
    },
    applyTheme: (theme) => appliedThemes.push(theme),
  });

  assert.equal(controller.toggleTheme(), "dark");
  assert.equal(controller.toggleTheme(), "light");
  assert.equal(controller.toggleTheme(), "dark");
  assert.deepEqual(persistedThemes, ["dark", "light", "dark"]);
  assert.deepEqual(appliedThemes, ["light", "dark", "light", "dark"]);
});

test("failed persistence retains the selected theme for the session", () => {
  const events: string[] = [];
  const appliedThemes: ResolvedTheme[] = [];
  const controller = initializeThemeController({
    resolveTheme: () => "dark",
    persistTheme: (theme) => {
      events.push(`persist:${theme}`);
      return false;
    },
    applyTheme: (theme) => {
      events.push(`apply:${theme}`);
      appliedThemes.push(theme);
    },
  });

  assert.equal(controller.toggleTheme(), "light");
  assert.equal(controller.toggleTheme(), "dark");
  assert.equal(controller.currentTheme(), "dark");
  assert.deepEqual(appliedThemes, ["dark", "light", "dark"]);
  assert.deepEqual(events, [
    "apply:dark",
    "persist:light",
    "apply:light",
    "persist:dark",
    "apply:dark",
  ]);
});

class FakeElement {
  readonly attributes = new Map<string, string>();

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  toggleAttribute(name: string, force: boolean): void {
    if (force) {
      this.attributes.set(name, "");
    } else {
      this.attributes.delete(name);
    }
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }
}

class FakeToggle extends FakeElement {
  constructor(
    private readonly sunIcon: FakeElement,
    private readonly moonIcon: FakeElement,
  ) {
    super();
  }

  querySelector<T extends Element>(selector: string): T | null {
    if (selector === ".theme-toggle__icon--sun") {
      return this.sunIcon as unknown as T;
    }
    if (selector === ".theme-toggle__icon--moon") {
      return this.moonIcon as unknown as T;
    }
    return null;
  }
}

function createThemeDocument(withToggle: boolean): {
  document: ThemeDocument;
  root: FakeElement;
  meta: { content: string };
  toggle: FakeToggle | null;
  sunIcon: FakeElement;
  moonIcon: FakeElement;
} {
  const root = new FakeElement();
  const meta = { content: "#4d8ffb" };
  const sunIcon = new FakeElement();
  const moonIcon = new FakeElement();
  const toggle = withToggle ? new FakeToggle(sunIcon, moonIcon) : null;
  const themeDocument: ThemeDocument = {
    documentElement: root as unknown as HTMLElement,
    querySelector: (<T extends Element>(selector: string): T | null => {
      if (selector === 'meta[name="theme-color"]') {
        return meta as unknown as T;
      }
      if (selector === ".theme-toggle") {
        return toggle as unknown as T;
      }
      return null;
    }) as Document["querySelector"],
  };

  return {
    document: themeDocument,
    root,
    meta,
    toggle,
    sunIcon,
    moonIcon,
  };
}

test("DOM synchronization applies both concrete theme states", () => {
  const host = createThemeDocument(true);

  applyResolvedTheme("dark", host.document);
  assert.equal(host.root.attributes.get("data-bs-theme"), "dark");
  assert.equal(host.root.attributes.get("data-theme-preference"), "dark");
  assert.equal(host.meta.content, siteConfig.theme.darkThemeColor);
  assert.equal(
    host.toggle?.attributes.get("aria-label"),
    "Current theme: Dark. Switch to light theme.",
  );
  assert.equal(host.sunIcon.hasAttribute("hidden"), true);
  assert.equal(host.moonIcon.hasAttribute("hidden"), false);

  applyResolvedTheme("light", host.document);
  assert.equal(host.root.attributes.get("data-bs-theme"), "light");
  assert.equal(host.root.attributes.get("data-theme-preference"), "light");
  assert.equal(host.meta.content, siteConfig.theme.lightThemeColor);
  assert.equal(
    host.toggle?.attributes.get("aria-label"),
    "Current theme: Light. Switch to dark theme.",
  );
  assert.equal(host.sunIcon.hasAttribute("hidden"), false);
  assert.equal(host.moonIcon.hasAttribute("hidden"), true);
});

test("root and metadata synchronization remains safe without a toggle", () => {
  const host = createThemeDocument(false);

  applyResolvedTheme("dark", host.document);

  assert.equal(host.root.attributes.get("data-bs-theme"), "dark");
  assert.equal(host.root.attributes.get("data-theme-preference"), "dark");
  assert.equal(host.meta.content, siteConfig.theme.darkThemeColor);
});
