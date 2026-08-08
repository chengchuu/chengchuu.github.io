export type ProjectCategory = "npm" | "go" | "github";

export type ProjectStatus =
  | "active"
  | "maintained"
  | "completed"
  | "archived";

export type MetadataStatus = "fresh" | "partial" | "unavailable";

export interface ProjectConfig {
  slug: string;
  name: string;
  category: ProjectCategory;
  repository: string;
  packageName?: string;
  modulePath?: string;
  description?: string;
  status: ProjectStatus;
  featured?: boolean;
  home?: string;
  playground?: string;
  examples?: string;
  github: string;
  npm?: string;
  api?: string;
  createdAtOverride?: string;
  latestReleaseAtOverride?: string;
  updatedAtOverride?: string;
}

export interface GeneratedProject extends ProjectConfig {
  createdAt: string | null;
  latestReleaseAt: string | null;
  repositoryPushedAt: string | null;
  metadataFetchedAt: string;
  latestVersion: string | null;
  primaryLanguage: string | null;
  license: string | null;
  stars: number | null;
  archived: boolean | null;
  metadataStatus: MetadataStatus;
}

export interface ProjectMetadata {
  createdAt: string | null;
  latestReleaseAt: string | null;
  repositoryPushedAt: string | null;
  latestVersion: string | null;
  primaryLanguage: string | null;
  license: string | null;
  stars: number | null;
  archived: boolean | null;
}
