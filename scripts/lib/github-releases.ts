import { fetchJson } from "./fetch";
import type { SourceMetadata } from "./metadata";

export async function fetchGitHubReleases(
  repository: string,
  headers: HeadersInit,
): Promise<SourceMetadata> {
  let latest: { date: string; tag: string; timestamp: number } | undefined;

  for (let page = 1; ; page += 1) {
    const releases = await fetchJson<unknown>(
      `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`,
      { headers },
    );
    if (!Array.isArray(releases)) {
      throw new TypeError("GitHub releases response must be an array.");
    }

    for (const release of releases) {
      if (
        !release || typeof release !== "object" ||
        typeof release.draft !== "boolean" ||
        typeof release.prerelease !== "boolean" ||
        typeof release.tag_name !== "string" ||
        !(release.published_at === null || typeof release.published_at === "string")
      ) {
        throw new TypeError("Malformed GitHub release.");
      }
      if (release.draft || release.prerelease || !release.tag_name.trim()) {
        continue;
      }
      const date = release.published_at;
      const timestamp = date ? Date.parse(date) : Number.NaN;
      if (!Number.isFinite(timestamp)) {
        continue;
      }
      if (!latest || timestamp > latest.timestamp) {
        latest = { date, tag: release.tag_name, timestamp };
      }
    }

    if (releases.length < 100) {
      return {
        complete: true,
        releaseResolved: true,
        latestReleaseAt: latest?.date ?? null,
        latestVersion: latest?.tag ?? null,
      };
    }
  }
}
