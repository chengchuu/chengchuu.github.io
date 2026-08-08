import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, escapeMarkdown, formatDate } from "../scripts/lib/format";

test("formatDate emits stable UTC calendar dates", () => {
  assert.equal(formatDate("2026-08-08T23:59:59.000Z"), "2026-08-08");
  assert.equal(formatDate(null), "—");
  assert.equal(formatDate("invalid"), "—");
});

test("absoluteUrl resolves root-relative assets without duplicate slashes", () => {
  assert.equal(
    absoluteUrl("https://chengchuu.github.io", "/images/photo.jpg"),
    "https://chengchuu.github.io/images/photo.jpg",
  );
});

test("escapeMarkdown protects table delimiters", () => {
  assert.equal(escapeMarkdown("A | B"), "A \\| B");
});
