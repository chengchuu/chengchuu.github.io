import { projectResourceFields } from "../../src/config/project-resources";
import type { GeneratedProject, ProjectConfig } from "../../src/types/project";
import { escapeMarkdown, formatDate } from "./format";

type ReadmeProject = ProjectConfig & Pick<GeneratedProject, "createdAt" | "latestReleaseAt">;

export function isProfileReadmeVisible(project: ProjectConfig): boolean {
  return project.hideFromProfileReadme !== true;
}

function linksFor(project: ProjectConfig): string {
  return projectResourceFields
    .filter(([field]) => field !== "github" && field !== "npm")
    .flatMap(([field, label]) => {
      const href = project[field];
      return href ? [`[${label}](${href})`] : [];
    })
    .join(" · ");
}

function table(projects: ReadmeProject[]): string {
  return [
    "| Project | Links | Created | Latest release |",
    "|:---|:---|:---|:---|",
    ...projects.map(
      (project) =>
        `| ${escapeMarkdown(project.name)} | ${linksFor(project)} | ${formatDate(project.createdAt)} | ${formatDate(project.latestReleaseAt)} |`,
    ),
  ].join("\n");
}

export const profileReadmeMarker = "<!-- This file is generated. Edit project data in chengchuu.github.io/src/config/projects.ts. -->";

function generatedSectionStart(readme: string): number {
  const markers = [...readme.matchAll(/^<!-- This file is generated\. Edit project data in chengchuu\.github\.io\/src\/config\/projects\.ts\. -->\r?$/gm)];
  if (markers.length !== 1) {
    throw new Error("Existing README must contain exactly one generated-content marker; refusing to overwrite it.");
  }
  return markers[0]!.index!;
}

export function renderProfileReadme(
  projects: readonly ReadmeProject[],
  existingReadme?: string,
): string {
  const visibleProjects = projects.filter(isProfileReadmeVisible);
  const sections = [profileReadmeMarker];

  const contributions = visibleProjects.filter(project => project.category === "contributions");
  if (contributions.length > 0) {
    sections.push("", "## Contributions", "", "| Project | Links | Description |", "|:---|:---|:---|",
      ...contributions.map(project => `| ${escapeMarkdown(project.name)} | [${escapeMarkdown(project.repository)}](${project.github}) | ${escapeMarkdown(project.description ?? "")} |`));
  }

  const categories = [
    ["npm", "npm"],
    ["go", "Go Packages"],
    ["github", "GitHub Projects"],
  ] as const;

  for (const [category, heading] of categories) {
    const categoryProjects = visibleProjects.filter(
      (project) => project.category === category,
    );
    if (categoryProjects.length === 0) {
      continue;
    }

    sections.push("", `## ${heading}`, "", table(categoryProjects));
  }

  const rendered = `${sections.join("\n")}\n`;
  if (existingReadme === undefined) return rendered;
  return existingReadme.slice(0, generatedSectionStart(existingReadme))
    + rendered;
}

export function validateProfileReadme(
  readme: string,
  projects: readonly GeneratedProject[],
  configuredProjects: readonly ProjectConfig[] = projects,
): string[] {
  const errors: string[] = [];
  const metadataBySlug = new Map(projects.map(project => [project.slug, project]));
  const expectedProjects = configuredProjects.flatMap(project => {
    const metadata = metadataBySlug.get(project.slug);
    if (!metadata) {
      errors.push(`Generated metadata is missing configured project: ${project.slug}`);
      return [];
    }
    return [{ ...project, createdAt: metadata.createdAt, latestReleaseAt: metadata.latestReleaseAt }];
  });
  try {
    readme = readme.slice(generatedSectionStart(readme));
  } catch (error) {
    return [...errors, (error as Error).message];
  }
  const lines = readme.split(/\r?\n/);
  if (configuredProjects.some(project => isProfileReadmeVisible(project) && project.category !== "contributions") && (
    !lines.includes("| Project | Links | Created | Latest release |") ||
    !lines.includes("|:---|:---|:---|:---|")
  )) {
    errors.push("Generated README does not use the required table columns.");
  }
  if (readme.includes("| Status |") || readme.includes("| Relationship |")) {
    errors.push("Generated README contains an unsupported table column.");
  }
  if (/\[(?:GitHub|npm)\]\(/.test(readme)) {
    errors.push("Generated README contains excluded GitHub or npm resource links.");
  }
  // Compare the generated table contract, not the introduction or line endings.
  const isTableLine = (line: string) => line.startsWith("## ") || line.startsWith("|") || line.startsWith("- ");
  const actual = lines.filter(isTableLine);
  const expected = renderProfileReadme(expectedProjects).split("\n").filter(isTableLine);
  if (actual.length !== expected.length || actual.some((line, index) => line !== expected[index])) {
    errors.push("Generated README tables do not match the expected categories and ordered project rows.");
  }
  return errors;
}
