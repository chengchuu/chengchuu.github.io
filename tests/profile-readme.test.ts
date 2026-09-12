import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileDocument } from "../src/site/ProfileDocument";
import { projects } from "../src/config/projects";
import type { GeneratedProject, ProjectConfig } from "../src/types/project";
import { collectProject, fallbackProject } from "../scripts/generate-project-data";
import { validateProjects } from "../scripts/lib/validate-projects";
import { renderProfileReadme, validateProfileReadme } from "../scripts/lib/profile-readme";

const fixture: GeneratedProject = {
  slug: "fixture", name: "Fixture", category: "github", status: "active",
  repository: "owner/fixture", github: "https://github.com/owner/fixture",
  demo: "https://example.com/demo/", createdAt: "2020-01-01T00:00:00Z",
  latestReleaseAt: null, latestVersion: null, repositoryPushedAt: null,
  metadataFetchedAt: "2026-01-01T00:00:00Z", primaryLanguage: null,
  license: null, stars: 0, archived: false, metadataStatus: "fresh",
};

const rowNames = (readme: string) => readme.split("\n")
  .filter(line => line.startsWith("| ") && !line.startsWith("| Project |"))
  .map(line => line.split(" | ")[0]!.slice(2));

test("README visibility defaults to shown and retains visible order and resources", () => {
  const inputs = [
    fixture,
    { ...fixture, slug: "hidden", name: "Hidden", hideFromProfileReadme: true },
    { ...fixture, slug: "shown", name: "Shown", hideFromProfileReadme: false },
  ];
  const readme = renderProfileReadme(inputs);
  assert.deepEqual(rowNames(readme), ["Fixture", "Shown"]);
  assert.ok(readme.includes("[Demo](https://example.com/demo/) · [GitHub](https://github.com/owner/fixture)"));
  assert.deepEqual(validateProfileReadme(readme, inputs), []);
  assert.equal(inputs.length, 3);
});

test("empty categories are omitted and all-hidden output retains the introduction", () => {
  const hidden = { ...fixture, hideFromProfileReadme: true };
  const mixed = renderProfileReadme([
    hidden,
    { ...fixture, slug: "npm", name: "Npm", category: "npm", packageName: "fixture" },
  ]);
  assert.ok(mixed.includes("## npm"));
  assert.ok(!mixed.includes("## GitHub Projects"));
  const introduction = renderProfileReadme([]);
  const readme = renderProfileReadme([hidden]);
  assert.equal(readme, introduction);
  assert.ok(readme.includes("# Hi, I'm Cheng 👋"));
  assert.ok(readme.includes("Welcome to my profile!"));
  assert.ok(readme.includes("![Rock That Body](./images/rock-that-body.gif)"));
  assert.ok(!readme.includes("| Project |"));
  assert.deepEqual(validateProfileReadme(readme, [hidden]), []);
});

test("README validation rejects hidden rows, missing visible rows, and missing headers", () => {
  const hidden = { ...fixture, hideFromProfileReadme: true };
  assert.ok(validateProfileReadme(renderProfileReadme([fixture]), [hidden])
    .includes("Generated README contains hidden project: Fixture"));
  const errors = validateProfileReadme(renderProfileReadme([]), [fixture]);
  assert.ok(errors.includes("Generated README is missing configured project: Fixture"));
  assert.ok(errors.includes("Generated README does not use the required table columns."));
  assert.deepEqual(validateProfileReadme(renderProfileReadme([fixture]).replaceAll("\n", "\r\n"), [fixture]), []);
});

test("configuration accepts only boolean visibility values or omission", () => {
  for (const flag of [undefined, false, true]) {
    const project: ProjectConfig = { ...fixture };
    if (flag !== undefined) project.hideFromProfileReadme = flag;
    assert.deepEqual(validateProjects([...projects, project]), []);
  }
  for (const flag of ["true", "false", 0, 1, null, undefined]) {
    const invalid = { ...fixture, hideFromProfileReadme: flag } as unknown as ProjectConfig;
    assert.ok(validateProjects([...projects, invalid])
      .includes("fixture.hideFromProfileReadme must be a boolean."));
  }
});

test("README validation distinguishes projects with the same display name", () => {
  const visible = { ...fixture, name: "Shared | name" };
  const hidden = {
    ...visible,
    slug: "hidden",
    repository: "owner/hidden",
    github: "https://github.com/owner/hidden",
    hideFromProfileReadme: true,
  };
  const inputs = [visible, hidden];
  assert.deepEqual(validateProjects([...projects, ...inputs]), []);
  assert.deepEqual(validateProfileReadme(renderProfileReadme(inputs), inputs), []);

  const wrongRow = renderProfileReadme([{ ...hidden, hideFromProfileReadme: false }]);
  assert.deepEqual(validateProfileReadme(wrongRow, inputs), [
    "Generated README is missing configured project: Shared | name",
    "Generated README contains hidden project: Shared | name",
  ]);
});

test("collection and fallback use current visibility instead of cached flags", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 404 }));
  for (const cachedFlag of [true, false]) {
    const previous = { ...fixture, hideFromProfileReadme: cachedFlag };
    for (const flag of [undefined, false, true]) {
      const config: ProjectConfig = { ...fixture };
      if (flag !== undefined) config.hideFromProfileReadme = flag;
      for (const result of [
        await collectProject(config, previous, "now"),
        fallbackProject(config, previous, "now"),
      ]) {
        assert.equal(result.hideFromProfileReadme, flag);
        assert.equal("hideFromProfileReadme" in result, flag !== undefined);
        assert.equal(result.metadataStatus, "partial");
        assert.equal(result.slug, fixture.slug);
      }
    }
  }
  const uncached = fallbackProject({ ...fixture, hideFromProfileReadme: true }, undefined, "now");
  assert.equal(uncached.hideFromProfileReadme, true);
  assert.equal(uncached.metadataStatus, "unavailable");
});

test("successful metadata collection and homepage retain hidden projects", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string) => Response.json(
    String(url).includes("/releases?") ? [] : {
      created_at: "2020-01-01T00:00:00Z", pushed_at: null,
      language: "TypeScript", license: null, stargazers_count: 0, archived: false,
    },
  ));
  const hidden = await collectProject({ ...fixture, hideFromProfileReadme: true }, fixture, "now");
  assert.equal(hidden.metadataStatus, "fresh");
  assert.equal(hidden.hideFromProfileReadme, true);
  const html = renderToStaticMarkup(createElement(ProfileDocument, { projects: [hidden] }));
  assert.ok(html.includes('data-project-slug="fixture"'));
  assert.ok(html.includes('href="https://example.com/demo/"'));
  assert.deepEqual(rowNames(renderProfileReadme([hidden])), []);
});
