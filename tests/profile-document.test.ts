import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { displayVersion, ProfileDocument } from "../src/site/ProfileDocument";
import type { GeneratedProject } from "../src/types/project";

const projectFixture: GeneratedProject = {
  slug: "example",
  name: "Example",
  category: "go",
  repository: "chengchuu/example",
  status: "active",
  github: "https://github.com/chengchuu/example",
  createdAt: "2023-07-27T12:15:17Z",
  latestReleaseAt: "2026-08-01T07:13:20Z",
  repositoryPushedAt: "2026-08-01T07:18:03Z",
  metadataFetchedAt: "2026-08-08T00:00:00Z",
  latestVersion: "v1.2.0",
  primaryLanguage: "Go",
  license: "MIT",
  stars: 12,
  archived: false,
  metadataStatus: "fresh",
};

test("displayVersion does not duplicate an existing v prefix", () => {
  assert.equal(displayVersion("1.2.3"), "v1.2.3");
  assert.equal(displayVersion("v1.2.3"), "v1.2.3");
  assert.equal(displayVersion(null), null);
});

test("GitHub project cards render Demo before GitHub", () => {
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, {
      projects: [{
        ...projectFixture,
        category: "github",
        demo: "https://example.com/demo/",
      }],
    }),
  );
  assert.match(html, /href="https:\/\/example\.com\/demo\/"[^>]*>Demo<\/a>/);
  assert.ok(
    html.indexOf('href="https://example.com/demo/"') <
      html.indexOf('href="https://github.com/chengchuu/example"'),
  );
  assert.doesNotMatch(html, />Playground<\/a>|>Examples<\/a>/);
});

test("theme toggle and project filters expose accessible controls", () => {
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, { projects: [] }),
  );
  const themeToggle = html.match(
    /<button class="theme-toggle"[\s\S]*?<\/button>/,
  )?.[0];
  const iconPaths = ["sun-fill.svg", "moon-stars-fill.svg"].flatMap(
    (iconName) =>
      Array.from(
        readFileSync(
          path.join("node_modules", "bootstrap-icons", "icons", iconName),
          "utf8",
        ).matchAll(/d="([^"]+)"/g),
        (match) => match[1]!,
      ),
  );

  assert.ok(themeToggle);
  assert.equal(html.match(/class="theme-toggle"/g)?.length, 1);
  assert.match(
    html,
    /<html lang="en" data-bs-theme="light" data-theme-preference="light">/,
  );
  assert.match(themeToggle, /type="button"/);
  assert.match(
    themeToggle,
    /aria-label="Current theme: Light\. Switch to dark theme\."/,
  );
  assert.match(
    themeToggle,
    /class="theme-toggle__icon theme-toggle__icon--sun" width="16" height="16"[^>]*aria-hidden="true" focusable="false"/,
  );
  assert.match(
    themeToggle,
    /class="theme-toggle__icon theme-toggle__icon--moon" width="16" height="16"[^>]*aria-hidden="true" focusable="false" hidden=""/,
  );
  for (const iconPath of iconPaths) {
    assert.ok(themeToggle.includes(iconPath));
  }
  assert.doesNotMatch(themeToggle, /aria-pressed|data-theme-preference/);
  assert.doesNotMatch(html, /theme-switcher|theme-option/);
  assert.match(html, /aria-label="Cheng home">Cheng<\/a>/);
  assert.match(
    html,
    /class="filter-list" role="group" aria-label="Filter projects"/,
  );
  assert.match(html, /class="row align-items-center gy-5 gx-0 gx-sm-5"/);
});

test("project cards omit star counts and place dates on their own row", () => {
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, { projects: [projectFixture] }),
  );

  assert.doesNotMatch(html, />12 stars?</);
  assert.match(
    html,
    /<div class="project-meta-row"><span>v1\.2\.0<\/span><span>Go<\/span><\/div><div class="project-meta-row"><span>Created /,
  );
});

test("homepage projects are sorted by latest release without mutating input", () => {
  const projects = [
    {
      ...projectFixture,
      slug: "older",
      name: "Older",
      latestReleaseAt: "2025-08-01T07:13:20Z",
    },
    {
      ...projectFixture,
      slug: "missing",
      name: "Missing",
      latestReleaseAt: null,
    },
    {
      ...projectFixture,
      slug: "newer",
      name: "Newer",
      latestReleaseAt: "2026-08-01T07:13:20Z",
    },
    {
      ...projectFixture,
      slug: "invalid",
      name: "Invalid",
      latestReleaseAt: "not-a-date",
    },
  ];
  const originalOrder = projects.map((project) => project.slug);
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, { projects }),
  );
  const renderedSlugs = Array.from(
    html.matchAll(/data-project-slug="([^"]+)"/g),
    (match) => match[1],
  );

  assert.deepEqual(renderedSlugs, ["newer", "older", "missing", "invalid"]);
  assert.deepEqual(projects.map((project) => project.slug), originalOrder);
});
