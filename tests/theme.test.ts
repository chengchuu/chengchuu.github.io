import assert from "node:assert/strict";
import test from "node:test";
import { getColorSchemeMedia } from "../src/client/theme-dom";

test("color-scheme media acquisition tolerates unavailable browser APIs", () => {
  assert.equal(getColorSchemeMedia({}), null);
  assert.equal(
    getColorSchemeMedia({
      matchMedia: () => {
        throw new Error("blocked");
      },
    }),
    null,
  );
});

test("color-scheme media acquisition uses the expected query", () => {
  const media = { matches: true } as MediaQueryList;
  let receivedQuery = "";

  assert.equal(
    getColorSchemeMedia({
      matchMedia: (query) => {
        receivedQuery = query;
        return media;
      },
    }),
    media,
  );
  assert.equal(receivedQuery, "(prefers-color-scheme: dark)");
});
