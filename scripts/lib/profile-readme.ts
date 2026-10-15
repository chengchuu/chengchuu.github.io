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

export function renderProfileReadme(projects: readonly ReadmeProject[]): string {
  const visibleProjects = projects.filter(isProfileReadmeVisible);
  const sections = [
    "# Hi, I'm Cheng 👋",
    "",
    "Welcome to my profile!",
    "",
    "![Rock That Body](./images/rock-that-body.gif)",
    "",
    "<!-- This file is generated. Edit project data in chengchuu.github.io/src/config/projects.ts. -->",
  ];

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

  return `${sections.join("\n")}\n`;
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
  const lines = readme.split(/\r?\n/);
  if (configuredProjects.some(isProfileReadmeVisible) && (
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
  const isTableLine = (line: string) => line.startsWith("## ") || line.startsWith("|");
  const actual = lines.filter(isTableLine);
  const expected = renderProfileReadme(expectedProjects).split("\n").filter(isTableLine);
  if (actual.length !== expected.length || actual.some((line, index) => line !== expected[index])) {
    errors.push("Generated README tables do not match the expected categories and ordered project rows.");
  }
  return errors;
}
