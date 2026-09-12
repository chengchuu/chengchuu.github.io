import { projectResourceFields } from "../../src/config/project-resources";
import type { GeneratedProject, ProjectConfig } from "../../src/types/project";
import { escapeMarkdown, formatDate } from "./format";

export function isProfileReadmeVisible(project: ProjectConfig): boolean {
  return project.hideFromProfileReadme !== true;
}

function linksFor(project: GeneratedProject): string {
  return projectResourceFields
    .flatMap(([field, label]) => {
      const href = project[field];
      return href ? [`[${label}](${href})`] : [];
    })
    .join(" · ");
}

function table(projects: GeneratedProject[]): string {
  return [
    "| Project | Links | Created | Latest release |",
    "|:---|:---|:---|:---|",
    ...projects.map(
      (project) =>
        `| ${escapeMarkdown(project.name)} | ${linksFor(project)} | ${formatDate(project.createdAt)} | ${formatDate(project.latestReleaseAt)} |`,
    ),
  ].join("\n");
}

export function renderProfileReadme(projects: GeneratedProject[]): string {
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
  projects: readonly ProjectConfig[],
): string[] {
  const errors: string[] = [];
  const lines = readme.split(/\r?\n/);
  if (projects.some(isProfileReadmeVisible) && (
    !lines.includes("| Project | Links | Created | Latest release |") ||
    !lines.includes("|:---|:---|:---|:---|")
  )) {
    errors.push("Generated README does not use the required table columns.");
  }
  if (readme.includes("| Status |") || readme.includes("| Relationship |")) {
    errors.push("Generated README contains an unsupported table column.");
  }
  for (const project of projects) {
    const present = lines.some(line =>
      line.startsWith(`| ${escapeMarkdown(project.name)} |`) &&
      line.includes(`[GitHub](${project.github})`),
    );
    if (isProfileReadmeVisible(project) && !present) {
      errors.push(`Generated README is missing configured project: ${project.name}`);
    } else if (!isProfileReadmeVisible(project) && present) {
      errors.push(`Generated README contains hidden project: ${project.name}`);
    }
  }
  return errors;
}
