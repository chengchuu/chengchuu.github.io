import type { MetadataStatus } from "../../src/types/project";

export interface SourceMetadata {
  complete: boolean;
  createdAt?: string | null;
  latestReleaseAt?: string | null;
  repositoryPushedAt?: string | null;
  latestVersion?: string | null;
  primaryLanguage?: string | null;
  license?: string | null;
  stars?: number | null;
  archived?: boolean | null;
}

const metadataFields = [
  "createdAt",
  "latestReleaseAt",
  "repositoryPushedAt",
  "latestVersion",
  "primaryLanguage",
  "license",
  "stars",
  "archived",
] as const satisfies readonly (keyof SourceMetadata)[];

export function mergeSourceMetadata(
  sources: readonly SourceMetadata[],
): SourceMetadata {
  const merged: SourceMetadata = {
    complete: sources.every((source) => source.complete),
  };

  for (const source of sources) {
    for (const field of metadataFields) {
      const value = source[field];
      if (value !== null && value !== undefined) {
        (merged as unknown as Record<string, unknown>)[field] = value;
      }
    }
  }

  return merged;
}

export function resolveMetadataStatus(
  results: readonly PromiseSettledResult<SourceMetadata>[],
  hasPrevious: boolean,
): MetadataStatus {
  const successful = results.filter(
    (result): result is PromiseFulfilledResult<SourceMetadata> =>
      result.status === "fulfilled",
  );

  if (
    results.length > 0 &&
    successful.length === results.length &&
    successful.every((result) => result.value.complete)
  ) {
    return "fresh";
  }

  return successful.length > 0 || hasPrevious ? "partial" : "unavailable";
}
