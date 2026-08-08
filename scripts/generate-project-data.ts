import { projects } from "../src/config/projects";
import type {
  GeneratedProject,
  ProjectConfig,
  ProjectMetadata,
} from "../src/types/project";
import { fetchJson, fetchText, settleInBatches } from "./lib/fetch";
import { readJsonIfExists, writeJson } from "./lib/files";
import {
  mergeSourceMetadata,
  resolveMetadataStatus,
  type SourceMetadata,
} from "./lib/metadata";
import { generatedDataPath } from "./lib/paths";

interface GitHubRepositoryResponse {
  created_at: string;
  pushed_at: string | null;
  language: string | null;
  license: { spdx_id?: string } | null;
  stargazers_count: number;
  archived: boolean;
}

interface NpmPackageResponse {
  "dist-tags"?: { latest?: string };
  time?: Record<string, string>;
}

interface GoVersionResponse {
  Version: string;
  Time: string;
}

const emptyMetadata: ProjectMetadata = {
  createdAt: null,
  latestReleaseAt: null,
  repositoryPushedAt: null,
  latestVersion: null,
  primaryLanguage: null,
  license: null,
  stars: null,
  archived: null,
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "chengchuu-profile-generator",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubMetadata(
  project: ProjectConfig,
): Promise<SourceMetadata> {
  const response = await fetchJson<GitHubRepositoryResponse>(
    `https://api.github.com/repos/${project.repository}`,
    { headers: githubHeaders() },
  );

  return {
    complete:
      Boolean(response.created_at) &&
      Number.isFinite(response.stargazers_count) &&
      typeof response.archived === "boolean",
    createdAt: response.created_at,
    repositoryPushedAt: response.pushed_at,
    primaryLanguage: response.language,
    license: response.license?.spdx_id ?? null,
    stars: response.stargazers_count,
    archived: response.archived,
  };
}

async function fetchNpmMetadata(packageName: string): Promise<SourceMetadata> {
  const response = await fetchJson<NpmPackageResponse>(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
  );
  const version = response["dist-tags"]?.latest ?? null;
  const publicationDates = Object.entries(response.time ?? {})
    .filter(([key]) => key !== "created" && key !== "modified")
    .map(([, value]) => value)
    .sort();

  return {
    complete:
      Boolean(response.time?.created ?? publicationDates[0]) &&
      Boolean(
        (version ? response.time?.[version] : undefined) ??
          publicationDates.at(-1),
      ) &&
      Boolean(version),
    createdAt: response.time?.created ?? publicationDates[0] ?? null,
    latestReleaseAt:
      (version ? response.time?.[version] : undefined) ??
      publicationDates.at(-1) ??
      null,
    latestVersion: version,
  };
}

function escapeGoModulePath(modulePath: string): string {
  return modulePath.replace(/[A-Z]/g, (letter) => `!${letter.toLowerCase()}`);
}

async function fetchGoMetadata(modulePath: string): Promise<SourceMetadata> {
  const escapedModule = escapeGoModulePath(modulePath);
  const baseUrl = `https://proxy.golang.org/${escapedModule}`;
  const versions = (await fetchText(`${baseUrl}/@v/list`))
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (versions.length === 0) {
    return { complete: false };
  }

  const results = await settleInBatches(
    versions.map(
      (version) => () =>
        fetchJson<GoVersionResponse>(
          `${baseUrl}/@v/${encodeURIComponent(version)}.info`,
        ),
    ),
    6,
  );
  const releases = results
    .filter(
      (result): result is PromiseFulfilledResult<GoVersionResponse> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .sort((left, right) => Date.parse(left.Time) - Date.parse(right.Time));
  const first = releases[0];
  const latest = releases.at(-1);

  return {
    complete:
      releases.length === versions.length &&
      Boolean(first?.Time && latest?.Time && latest.Version),
    createdAt: first?.Time ?? null,
    latestReleaseAt: latest?.Time ?? null,
    latestVersion: latest?.Version ?? null,
  };
}

function preferCurrent(
  current: string | number | boolean | null | undefined,
  previous: string | number | boolean | null | undefined,
): string | number | boolean | null {
  return current ?? previous ?? null;
}

async function collectProject(
  project: ProjectConfig,
  previous: GeneratedProject | undefined,
  metadataFetchedAt: string,
): Promise<GeneratedProject> {
  const tasks: (() => Promise<SourceMetadata>)[] = [
    () => fetchGitHubMetadata(project),
  ];

  if (project.category === "npm" && project.packageName) {
    tasks.push(() => fetchNpmMetadata(project.packageName!));
  } else if (project.category === "go" && project.modulePath) {
    tasks.push(() => fetchGoMetadata(project.modulePath!));
  }

  const results = await Promise.allSettled(tasks.map((task) => task()));
  const successful = results.filter(
    (result): result is PromiseFulfilledResult<SourceMetadata> =>
      result.status === "fulfilled",
  );
  const merged = mergeSourceMetadata(
    successful.map((result) => result.value),
  );
  const hasPrevious = previous !== undefined;
  const metadataStatus = resolveMetadataStatus(results, hasPrevious);

  return {
    ...project,
    createdAt:
      project.createdAtOverride ??
      (preferCurrent(merged.createdAt, previous?.createdAt) as string | null),
    latestReleaseAt:
      project.latestReleaseAtOverride ??
      (preferCurrent(
        merged.latestReleaseAt,
        previous?.latestReleaseAt,
      ) as string | null),
    repositoryPushedAt:
      project.updatedAtOverride ??
      (preferCurrent(
        merged.repositoryPushedAt,
        previous?.repositoryPushedAt,
      ) as string | null),
    metadataFetchedAt,
    latestVersion: preferCurrent(
      merged.latestVersion,
      previous?.latestVersion,
    ) as string | null,
    primaryLanguage: preferCurrent(
      merged.primaryLanguage,
      previous?.primaryLanguage,
    ) as string | null,
    license: preferCurrent(merged.license, previous?.license) as string | null,
    stars: preferCurrent(merged.stars, previous?.stars) as number | null,
    archived: preferCurrent(
      merged.archived,
      previous?.archived,
    ) as boolean | null,
    metadataStatus,
  };
}

async function main(): Promise<void> {
  const previousProjects = await readJsonIfExists<GeneratedProject[]>(
    generatedDataPath,
    [],
  );
  const previousBySlug = new Map(
    previousProjects.map((project) => [project.slug, project]),
  );
  const metadataFetchedAt = new Date().toISOString();
  const results = await settleInBatches(
    projects.map(
      (project) => () =>
        collectProject(project, previousBySlug.get(project.slug), metadataFetchedAt),
    ),
    4,
  );

  const generatedProjects = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const project = projects[index];
    if (!project) {
      throw result.reason;
    }

    const previous = previousBySlug.get(project.slug);
    return {
      ...(previous ?? emptyMetadata),
      ...project,
      metadataFetchedAt,
      metadataStatus: previous ? "partial" : "unavailable",
    } satisfies GeneratedProject;
  });

  await writeJson(generatedDataPath, generatedProjects);

  const summary = generatedProjects.reduce<Record<string, number>>(
    (counts, project) => {
      counts[project.metadataStatus] = (counts[project.metadataStatus] ?? 0) + 1;
      return counts;
    },
    {},
  );
  console.log(`Generated metadata for ${generatedProjects.length} projects.`, summary);
}

void main();
