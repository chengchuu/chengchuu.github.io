import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { fetchGitHubReleases } from "../scripts/lib/github-releases";
import { collectProject } from "../scripts/generate-project-data";
import type { GeneratedProject, ProjectConfig } from "../src/types/project";

const release = (tag: string, date: string | null) => ({
  tag_name: tag, published_at: date, draft: false, prerelease: false,
});
const project: ProjectConfig = {
  slug: "fixture", name: "Fixture", category: "github", status: "active",
  repository: "owner/fixture", github: "https://github.com/owner/fixture",
};
const previous: GeneratedProject = {
  ...project, createdAt: "2020-01-01T00:00:00Z",
  latestReleaseAt: "2025-01-01T00:00:00Z", latestVersion: "old-tag",
  repositoryPushedAt: null, metadataFetchedAt: "2025-01-01T00:00:00Z",
  primaryLanguage: null, license: null, stars: 0, archived: false,
  metadataStatus: "fresh",
};
const repository = {
  created_at: "2020-01-01T00:00:00Z", pushed_at: "2026-09-01T00:00:00Z",
  language: "TypeScript", license: null, stargazers_count: 1, archived: false,
};

function mockFetch(t: TestContext, handler: typeof fetch): void {
  t.mock.method(globalThis, "fetch", handler);
}

test("selects latest valid stable publication across all pages and preserves tag and ties", async (t) => {
  const calls: string[] = [];
  const pages = [
    Array.from({ length: 100 }, () => release("older", "2024-01-01T00:00:00Z")),
    [
      { ...release("draft", "2030-01-01T00:00:00Z"), draft: true },
      { ...release("preview", "2030-01-01T00:00:00Z"), prerelease: true },
      release("invalid", "not-a-date"), release("unpublished", null),
      release("  ", "2030-01-01T00:00:00Z"),
      release("Release-2", "2026-07-07T07:59:10Z"),
      release("tied", "2026-07-07T07:59:10Z"),
      release("last-but-older", "2025-01-01T00:00:00Z"),
    ],
  ];
  mockFetch(t, async (url, init) => {
    calls.push(String(url));
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer fixture");
    return Response.json(pages[calls.length - 1]);
  });
  assert.deepEqual(await fetchGitHubReleases("owner/fixture", { Authorization: "Bearer fixture" }), {
    complete: true, releaseResolved: true,
    latestReleaseAt: "2026-07-07T07:59:10Z", latestVersion: "Release-2",
  });
  assert.deepEqual(calls, [1, 2].map(page =>
    `https://api.github.com/repos/owner/fixture/releases?per_page=100&page=${page}`));
});

test("requests another page after exactly 100 releases", async (t) => {
  let calls = 0;
  mockFetch(t, async () => Response.json(++calls === 1
    ? Array.from({ length: 100 }, () => release("tag", "2026-01-01T00:00:00Z")) : []));
  assert.equal((await fetchGitHubReleases("owner/fixture", {})).latestVersion, "tag");
  assert.equal(calls, 2);
});

test("successful absence clears cached release pair and keeps explicit date overrides", async (t) => {
  mockFetch(t, async url => Response.json(String(url).includes("/releases?") ? [] : repository));
  const result = await collectProject(project, previous, "now");
  assert.equal(result.latestReleaseAt, null);
  assert.equal(result.latestVersion, null);
  assert.equal(result.metadataStatus, "fresh");
  const overridden = await collectProject({ ...project, latestReleaseAtOverride: "2022-01-01T00:00:00Z" }, previous, "now");
  assert.equal(overridden.latestReleaseAt, "2022-01-01T00:00:00Z");
  assert.equal(overridden.latestVersion, null);
});

test("only excluded releases also count as successful absence", async (t) => {
  mockFetch(t, async () => Response.json([
    { ...release("preview", "2026-01-01T00:00:00Z"), prerelease: true },
    release("invalid", "invalid"), release("", "2026-01-01T00:00:00Z"),
  ]));
  const result = await fetchGitHubReleases("owner/fixture", {});
  assert.equal(result.latestReleaseAt, null);
  assert.equal(result.latestVersion, null);
  assert.equal(result.complete, true);
});

test("later page failure preserves the cached pair rather than partial results", async (t) => {
  mockFetch(t, async url => {
    if (!String(url).includes("/releases?")) return Response.json(repository);
    if (String(url).endsWith("page=1")) return Response.json(
      Array.from({ length: 100 }, () => release("new-tag", "2026-01-01T00:00:00Z")));
    return new Response("missing", { status: 404 });
  });
  const result = await collectProject(project, previous, "now");
  assert.equal(result.latestReleaseAt, previous.latestReleaseAt);
  assert.equal(result.latestVersion, previous.latestVersion);
  assert.equal(result.metadataStatus, "partial");
  const uncached = await collectProject(project, undefined, "now");
  assert.equal(uncached.latestReleaseAt, null);
  assert.equal(uncached.latestVersion, null);
  assert.equal(uncached.metadataStatus, "partial");
});

test("malformed responses preserve cached releases", async (t) => {
  for (const body of [{ message: "unexpected" }, [null], [{ tag_name: "missing-fields" }]]) {
    mockFetch(t, async url => Response.json(String(url).includes("/releases?") ? body : repository));
    const result = await collectProject(project, previous, "now");
    assert.equal(result.latestVersion, "old-tag");
    assert.equal(result.latestReleaseAt, previous.latestReleaseAt);
    assert.equal(result.metadataStatus, "partial");
  }
});

test("npm and Go categories keep their existing release sources", async (t) => {
  const urls: string[] = [];
  mockFetch(t, async url => {
    urls.push(String(url));
    assert.ok(!String(url).includes("/releases?"));
    if (String(url).includes("registry.npmjs.org")) return Response.json({
      "dist-tags": { latest: "3.0.0" }, time: { created: "2020-01-01T00:00:00Z", "3.0.0": "2026-02-01T00:00:00Z" },
    });
    if (String(url).endsWith("/@v/list")) return new Response("v4.0.0\n");
    if (String(url).endsWith(".info")) return Response.json({ Version: "v4.0.0", Time: "2026-03-01T00:00:00Z" });
    return Response.json(repository);
  });
  const npm = await collectProject({ ...project, category: "npm", packageName: "fixture" }, previous, "now");
  const go = await collectProject({ ...project, category: "go", modulePath: "example.com/fixture" }, previous, "now");
  assert.equal(npm.latestVersion, "3.0.0");
  assert.equal(npm.latestReleaseAt, "2026-02-01T00:00:00Z");
  assert.equal(go.latestVersion, "v4.0.0");
  assert.equal(go.latestReleaseAt, "2026-03-01T00:00:00Z");
  assert.equal(urls.length, 5);
});

test("successful releases keep their tag while explicit dates take precedence", async (t) => {
  mockFetch(t, async url => Response.json(String(url).includes("/releases?")
    ? [release("release-2", "2026-07-07T07:59:10Z")] : repository));
  const result = await collectProject({
    ...project,
    latestReleaseAtOverride: "2026-08-01T00:00:00Z",
  }, previous, "now");
  assert.equal(result.latestReleaseAt, "2026-08-01T00:00:00Z");
  assert.equal(result.latestVersion, "release-2");
  assert.equal(result.metadataStatus, "fresh");
  assert.equal("releaseResolved" in result, false);
});

test("total HTTP failure is unavailable without cache and partial with cache", async (t) => {
  mockFetch(t, async () => new Response("missing", { status: 404 }));
  const empty = await collectProject(project, undefined, "now");
  assert.equal(empty.metadataStatus, "unavailable");
  assert.equal(empty.latestReleaseAt, null);
  assert.equal(empty.latestVersion, null);
  const cached = await collectProject(project, previous, "now");
  assert.equal(cached.metadataStatus, "partial");
  assert.equal(cached.latestReleaseAt, previous.latestReleaseAt);
  assert.equal(cached.latestVersion, previous.latestVersion);
});
