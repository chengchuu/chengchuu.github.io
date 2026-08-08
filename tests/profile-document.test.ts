import assert from "node:assert/strict";
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

test("theme and project filters expose accessible group names", () => {
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, { projects: [] }),
  );

  assert.match(
    html,
    /class="theme-switcher" role="group" aria-label="Theme preference"/,
  );
  assert.match(
    html,
    /data-theme-preference="light"[^>]*aria-pressed="true"/,
  );
  assert.match(
    html,
    /data-theme-preference="dark"[^>]*aria-pressed="false"/,
  );
  assert.doesNotMatch(html, /data-theme-preference="system"/);
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
