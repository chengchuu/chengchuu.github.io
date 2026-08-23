import assert from "node:assert/strict";
import test from "node:test";
import { hasLightThemeRoot } from "../scripts/lib/theme-markup";

test("light theme root validation is independent of attribute order", () => {
  assert.equal(
    hasLightThemeRoot(
      '<html data-theme-preference="light" lang="en" data-bs-theme="light">',
    ),
    true,
  );
});

test("light theme attributes must belong to the root element", () => {
  assert.equal(
    hasLightThemeRoot(
      '<html lang="en"><body data-bs-theme="light" data-theme-preference="light">',
    ),
    false,
  );
});
