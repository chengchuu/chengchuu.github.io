import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileDocument } from "../src/site/ProfileDocument";
import { projects } from "../src/config/projects";
import type { GeneratedProject, ProjectConfig } from "../src/types/project";
import { collectProject, fallbackProject } from "../scripts/generate-project-data";
import { validateProjects } from "../scripts/lib/validate-projects";
import { profileReadmeMarker, renderProfileReadme, validateProfileReadme } from "../scripts/lib/profile-readme";

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
  assert.ok(readme.includes("| [Demo](https://example.com/demo/) |"));
  assert.deepEqual(validateProfileReadme(readme, inputs), []);
  assert.equal(inputs.length, 3);
});

test("README excludes GitHub and npm resources without changing homepage links", () => {
  const project = {
    ...fixture,
    home: "https://example.com/",
    playground: "https://example.com/playground/",
    examples: "https://github.com/owner/fixture/tree/main/examples",
    api: "https://example.com/api/",
    npm: "https://www.npmjs.com/package/fixture",
  };
  const readme = renderProfileReadme([project]);
  assert.ok(readme.includes([
    `[Home](${project.home})`, `[Demo](${project.demo})`,
    `[Playground](${project.playground})`, `[Examples](${project.examples})`,
    `[API](${project.api})`,
  ].join(" · ")));
  assert.ok(!readme.includes("[GitHub]("));
  assert.ok(!readme.includes("[npm]("));
  assert.deepEqual(validateProfileReadme(readme, [project]), []);
  const html = renderToStaticMarkup(createElement(ProfileDocument, { projects: [project] }));
  assert.ok(html.includes(`href="${project.github}"`));
  assert.ok(html.includes(`href="${project.npm}"`));
  for (const resource of ["GitHub", "npm"]) {
    const invalid = readme.replace("| [Home]", `| [${resource}](https://example.com/) · [Home]`);
    assert.ok(validateProfileReadme(invalid, [project])
      .includes("Generated README contains excluded GitHub or npm resource links."));
  }
});

test("projects without remaining resources retain an empty Links cell without comments", () => {
  const project = { ...fixture };
  delete project.demo;
  const readme = renderProfileReadme([project]);
  assert.ok(readme.includes("| Fixture |  | 2020-01-01 | — |\n"));
  assert.ok(!readme.includes("<!-- project:"));
  assert.deepEqual(validateProfileReadme(readme, [project]), []);
});

test("contributions render a description table before npm without dates", () => {
  const first: GeneratedProject = { ...fixture, category: "contributions", name: "React", repository: "react/react", github: "https://github.com/react/react", description: "UI library" };
  const second = { ...first, slug: "go101", name: "Go 101", repository: "go101/go101", github: "https://github.com/go101/go101", description: "Learn Go | examples" };
  const inputs = [first, second];
  const readme = renderProfileReadme(inputs);
  const firstRow = "| React | [react/react](https://github.com/react/react) | UI library |\n";
  const rows = firstRow + "| Go 101 | [go101/go101](https://github.com/go101/go101) | Learn Go \\| examples |\n";
  assert.ok(readme.endsWith("## Contributions\n\n| Project | Links | Description |\n|:---|:---|:---|\n" + rows));
  assert.ok(!readme.includes("Created"));
  assert.ok(!readme.includes("Latest release"));
  assert.ok(!readme.includes("2020-01-01"));
  assert.deepEqual(validateProfileReadme(readme, inputs), []);
  for (const invalid of [
    readme.replace(firstRow, ""),
    readme + firstRow,
    readme.replace("https://github.com/react/react", "https://github.com/other/react"),
    readme.replace(rows, rows.trimEnd().split("\n").reverse().join("\n") + "\n"),
    readme.replace("UI library", "Wrong description"),
    readme.replace("| Project | Links | Description |", "| Project | Description | Links |"),
    readme.replace("| React |", "| [React](https://github.com/react/react) |"),
  ]) assert.ok(validateProfileReadme(invalid, inputs).length > 0);
  const npm: GeneratedProject = { ...fixture, category: "npm", packageName: "fixture" };
  const mixed = renderProfileReadme([first, npm, second]);
  assert.ok(mixed.indexOf("## Contributions") < mixed.indexOf("## npm"));
  assert.ok(mixed.endsWith(renderProfileReadme([npm]).split("## npm")[1]!));
  assert.deepEqual(validateProfileReadme(mixed, [first, npm, second]), []);
  assert.ok(!renderProfileReadme([{ ...first, hideFromProfileReadme: true }]).includes("## Contributions"));
});

test("contributions collect repository and stable release metadata without registry requests", async (t) => {
  const urls: string[] = [];
  let releaseResponse: "found" | "empty" | "failed" = "found";
  t.mock.method(globalThis, "fetch", async (url: string) => {
    urls.push(String(url));
    if (String(url).includes("/releases?")) {
      if (releaseResponse === "failed") return new Response("unavailable", { status: 404 });
      return Response.json(releaseResponse === "empty" ? [] : [
        { draft: false, prerelease: true, tag_name: "v3.0.0-rc", published_at: "2026-02-01T00:00:00Z" },
        { draft: false, prerelease: false, tag_name: "v2.0.0", published_at: "2026-01-01T00:00:00Z" },
      ]);
    }
    return Response.json({
      created_at: "2020-01-01T00:00:00Z", pushed_at: null,
      language: "TypeScript", license: null, stargazers_count: 0, archived: false,
    });
  });
  const config: ProjectConfig = { ...fixture, category: "contributions" };
  const result = await collectProject(config, undefined, "now");
  assert.deepEqual(urls, ["https://api.github.com/repos/owner/fixture", "https://api.github.com/repos/owner/fixture/releases?per_page=100&page=1"]);
  assert.equal(result.metadataStatus, "fresh");
  assert.equal(result.latestReleaseAt, "2026-01-01T00:00:00Z");
  assert.equal(result.latestVersion, "v2.0.0");
  releaseResponse = "failed";
  const retained = await collectProject(config, result, "later");
  assert.equal(retained.latestVersion, result.latestVersion);
  assert.equal(retained.latestReleaseAt, result.latestReleaseAt);
  assert.equal(retained.metadataStatus, "partial");
  releaseResponse = "empty";
  const empty = await collectProject(config, result, "later");
  assert.equal(empty.latestVersion, null);
  assert.equal(empty.latestReleaseAt, null);
  assert.equal(fallbackProject(config, result, "later").category, "contributions");
  assert.deepEqual(validateProjects([...projects, config]), []);
  assert.ok(validateProjects([...projects, { ...config, category: "invalid" } as unknown as ProjectConfig])
    .includes("fixture has an unsupported category."));
});

test("empty categories are omitted and new all-hidden output contains only the marker", () => {
  const hidden = { ...fixture, hideFromProfileReadme: true };
  const mixed = renderProfileReadme([
    hidden,
    { ...fixture, slug: "npm", name: "Npm", category: "npm", packageName: "fixture" },
  ]);
  assert.ok(mixed.includes("## npm"));
  assert.ok(!mixed.includes("## GitHub Projects"));
  const empty = renderProfileReadme([]);
  const readme = renderProfileReadme([hidden]);
  assert.equal(readme, empty);
  assert.equal(readme, `${profileReadmeMarker}\n`);
  assert.ok(!readme.includes("| Project |"));
  assert.deepEqual(validateProfileReadme(readme, [hidden]), []);
});

test("README validation rejects hidden rows, missing visible rows, and missing headers", () => {
  const hidden = { ...fixture, hideFromProfileReadme: true };
  assert.ok(validateProfileReadme(renderProfileReadme([fixture]), [hidden])
    .some(error => error.includes("ordered project rows")));
  const errors = validateProfileReadme(renderProfileReadme([]), [fixture]);
  assert.ok(errors.some(error => error.includes("ordered project rows")));
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
    demo: "https://example.com/hidden/",
    hideFromProfileReadme: true,
  };
  const inputs = [visible, hidden];
  assert.deepEqual(validateProjects([...projects, ...inputs]), []);
  assert.deepEqual(validateProfileReadme(renderProfileReadme(inputs), inputs), []);

  const wrongRow = renderProfileReadme([{ ...hidden, hideFromProfileReadme: false }]);
  assert.ok(validateProfileReadme(wrongRow, inputs).some(error => error.includes("ordered project rows")));
});

test("literal tables preserve content and reject row and category corruption", () => {
  const second = { ...fixture, slug: "second", name: "Second" };
  const inputs = [fixture, second];
  const firstRow = "| Fixture | [Demo](https://example.com/demo/) | 2020-01-01 | — |";
  const secondRow = "| Second | [Demo](https://example.com/demo/) | 2020-01-01 | — |";
  const table = [
    "## GitHub Projects", "",
    "| Project | Links | Created | Latest release |",
    "|:---|:---|:---|:---|", firstRow, secondRow, "",
  ].join("\n");
  assert.ok(renderProfileReadme(inputs).endsWith(table));
  assert.deepEqual(validateProfileReadme(profileReadmeMarker + "\n" + table, inputs), []);
  for (const invalid of [
    table.replace(firstRow + "\n", ""),
    table + secondRow + "\n",
    table.replace(firstRow, secondRow),
    table.replace(firstRow + "\n" + secondRow, secondRow + "\n" + firstRow),
    table.replace("## GitHub Projects", "## npm"),
    table.replace("2020-01-01", "2021-01-01"),
    table.replace("—", "2026-01-01"),
    table.replace("https://example.com/demo/", "https://example.com/wrong/"),
    table.replace(firstRow, firstRow.replace(" | — |", " | — <!-- project:fixture --> |")),
  ]) {
    assert.ok(validateProfileReadme(profileReadmeMarker + "\n" + invalid, inputs).length > 0, invalid);
  }
  const identical = { ...fixture, slug: "identical" };
  const repeated = renderProfileReadme([fixture, identical]);
  assert.deepEqual(validateProfileReadme(repeated, [fixture, identical]), []);
  assert.ok(validateProfileReadme(repeated.replace(firstRow + "\n", ""), [fixture, identical]).length > 0);
});

test("README validation uses canonical configuration rather than stale cached presentation", () => {
  const readme = renderProfileReadme([fixture]);
  const changed: ProjectConfig[] = [
    { ...fixture, hideFromProfileReadme: true },
    { ...fixture, name: "Renamed" },
    { ...fixture, category: "go" },
    { ...fixture, demo: "https://example.com/new/" },
  ];
  const withoutDemo = { ...fixture };
  delete withoutDemo.demo;
  changed.push(withoutDemo);
  for (const config of changed) {
    assert.ok(validateProfileReadme(readme, [fixture], [config]).length > 0);
  }
  const hiddenCache = { ...fixture, hideFromProfileReadme: true };
  assert.ok(validateProfileReadme(renderProfileReadme([hiddenCache]), [hiddenCache], [fixture]).length > 0);
  assert.deepEqual(validateProfileReadme(readme, [hiddenCache], [fixture]), []);
  assert.ok(validateProfileReadme(readme, [fixture], []).length > 0);
  assert.ok(validateProfileReadme(readme, [], [fixture])
    .includes("Generated metadata is missing configured project: fixture"));
  const second = { ...fixture, slug: "second", name: "Second" };
  assert.ok(validateProfileReadme(renderProfileReadme([fixture, second]),
    [fixture, second], [second, fixture]).length > 0);
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


test("regeneration preserves the custom introduction and validates only generated content", () => {
  const intro = '# Hi, I\'m Cheng 👋\r\n\r\nI live with my cat, Dudu.\r\n'
    + '<img src="./images/dudu-225x159-tiny.png" alt="Dudu" width="229" height="165">\r\n'
    + '## About me\r\n- [GitHub](https://github.com/chengchuu)\r\n| Personal | table |\r\n\r\n';
  const existing = intro + profileReadmeMarker + "\r\n\r\nOutdated projects\r\n";
  const rendered = renderProfileReadme([fixture], existing);
  assert.ok(rendered.startsWith(intro + profileReadmeMarker));
  assert.ok(!rendered.includes("Outdated projects"));
  assert.deepEqual(validateProfileReadme(rendered, [fixture]), []);
  assert.equal(renderProfileReadme([fixture], rendered), rendered);
  assert.equal(renderProfileReadme([], existing), intro + profileReadmeMarker + "\n");
  assert.ok(validateProfileReadme(rendered.replace("| Fixture |", "| Wrong |"), [fixture]).length > 0);
});

test("existing README without a unique marker is not overwritten", () => {
  for (const existing of ["", "My personal README", profileReadmeMarker + "\n" + profileReadmeMarker]) {
    assert.throws(() => renderProfileReadme([fixture], existing), /exactly one/);
  }
});

test("README CLI preserves custom content, handles new output, and refuses missing markers", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "profile-readme-"));
  const output = path.join(directory, "README.md");
  const args = ["--import", "tsx", "scripts/generate-readme.ts", "--output", output];
  try {
    execFileSync(process.execPath, args);
    assert.ok(readFileSync(output, "utf8").startsWith(profileReadmeMarker + "\n"));
    const intro = "# My profile\n\nMy own introduction and image.\n\n";
    writeFileSync(output, intro + profileReadmeMarker + "\nOld content\n");
    execFileSync(process.execPath, args);
    assert.ok(readFileSync(output, "utf8").startsWith(intro + profileReadmeMarker));
    assert.ok(!readFileSync(output, "utf8").includes("Old content"));
    writeFileSync(output, "Unmarked personal content\n");
    assert.throws(() => execFileSync(process.execPath, args, { stdio: "pipe" }));
    assert.equal(readFileSync(output, "utf8"), "Unmarked personal content\n");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});


test("README validation requires exactly one complete generated marker", () => {
  for (const inputs of [[], [fixture]]) {
    const readme = renderProfileReadme(inputs);
    for (const invalid of [
      readme.replace(profileReadmeMarker, ""),
      readme.replace(profileReadmeMarker, "<!-- Generated projects -->"),
      readme + profileReadmeMarker + "\n",
    ]) {
      assert.ok(validateProfileReadme(invalid, inputs).some(error => error.includes("exactly one")));
      assert.throws(() => renderProfileReadme(inputs, invalid), /exactly one/);
    }
  }
});
