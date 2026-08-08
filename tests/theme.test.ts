import assert from "node:assert/strict";
import test from "node:test";
import { preferenceFromLabel } from "../src/client/theme-dom";

test("theme labels preserve the selected preference", () => {
  assert.equal(preferenceFromLabel("System"), "system");
  assert.equal(preferenceFromLabel("Light"), "light");
  assert.equal(preferenceFromLabel("Dark"), "dark");
  assert.equal(preferenceFromLabel("Unknown"), "system");
});
