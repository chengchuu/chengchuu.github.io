import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new TypeError(`Invalid color: ${hex}`);
  }

  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(left: string, right: string): number {
  const leftLuminance = luminance(left);
  const rightLuminance = luminance(right);
  return (
    (Math.max(leftLuminance, rightLuminance) + 0.05) /
    (Math.min(leftLuminance, rightLuminance) + 0.05)
  );
}

test("primary controls use the configured accessible foreground", async () => {
  const themeCss = await readFile(
    path.resolve("src/styles/theme.css"),
    "utf8",
  );
  const siteCss = await readFile(path.resolve("src/styles/site.css"), "utf8");

  const onPrimary = themeCss.match(
    /--profile-on-primary:\s*(#[0-9a-f]{6});/i,
  )?.[1];
  const primaryColors = Array.from(
    themeCss.matchAll(/--profile-primary:\s*(#[0-9a-f]{6});/gi),
    (match) => match[1],
  ).filter((color): color is string => color !== undefined);

  assert.ok(onPrimary);
  assert.equal(primaryColors.length, 2);
  for (const primary of primaryColors) {
    assert.ok(contrast(onPrimary, primary) >= 4.5);
  }

  assert.match(
    siteCss,
    /\.btn-primary\s*{[^}]*--bs-btn-bg: var\(--profile-primary\);/s,
  );
  for (const selector of [
    "skip-link",
    "filter-button",
    "project-link",
  ]) {
    assert.match(
      siteCss,
      new RegExp(
        `\\.${selector}[^\\{]*\\{[^}]*color: var\\(--profile-on-primary\\);`,
        "s",
      ),
    );
  }
});

test("theme toggle uses fixed circular sizing and accessible states", async () => {
  const siteCss = await readFile(path.resolve("src/styles/site.css"), "utf8");
  const toggleStyles = siteCss.match(/\.theme-toggle\s*{([^}]*)}/s)?.[1];

  assert.ok(toggleStyles);
  assert.match(toggleStyles, /box-sizing:\s*border-box;/);
  assert.match(toggleStyles, /width:\s*32px;/);
  assert.match(toggleStyles, /height:\s*32px;/);
  assert.match(toggleStyles, /border-radius:\s*50%;/);
  assert.match(toggleStyles, /align-items:\s*center;/);
  assert.match(toggleStyles, /justify-content:\s*center;/);
  assert.match(
    siteCss,
    /\.theme-toggle__icon\s*{[^}]*width:\s*16px;[^}]*height:\s*16px;/s,
  );
  assert.match(
    siteCss,
    /\.theme-toggle__icon\[hidden\]\s*{[^}]*display:\s*none;/s,
  );
  assert.match(siteCss, /\.theme-toggle:hover\s*{[^}]*background:/s);
  assert.match(siteCss, /\.theme-toggle:focus-visible\s*{[^}]*outline:/s);
});

test("profile portrait and outline use a circular shape", async () => {
  const siteCss = await readFile(path.resolve("src/styles/site.css"), "utf8");

  assert.match(
    siteCss,
    /\.portrait-frame::before\s*{[^}]*border-radius:\s*50%;/s,
  );
  assert.match(
    siteCss,
    /\.profile-photo\s*{[^}]*border-radius:\s*50%;/s,
  );
});
