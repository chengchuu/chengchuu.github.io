import path from "node:path";
import type { GeneratedProject } from "../src/types/project";
import { escapeMarkdown, formatDate } from "./lib/format";
import { writeText } from "./lib/files";
import { defaultReadmePath } from "./lib/paths";
import { readGeneratedProjects } from "./lib/project-data";

const resourceFields = [
  ["home", "Home"],
  ["playground", "Playground"],
  ["examples", "Examples"],
  ["github", "GitHub"],
  ["npm", "npm"],
  ["api", "API"],
] as const;

function outputPathFromArgs(): string {
  const outputIndex = process.argv.indexOf("--output");
  if (outputIndex === -1) {
    return defaultReadmePath;
  }

  const value = process.argv[outputIndex + 1];
  if (!value) {
    throw new Error("--output requires a file path.");
  }

  return path.resolve(process.cwd(), value);
}

function linksFor(project: GeneratedProject): string {
  return resourceFields
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

async function main(): Promise<void> {
  const projects = await readGeneratedProjects();
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
    const categoryProjects = projects.filter(
      (project) => project.category === category,
    );
    if (categoryProjects.length === 0) {
      continue;
    }

    sections.push("", `## ${heading}`, "", table(categoryProjects));
  }

  const outputPath = outputPathFromArgs();
  await writeText(outputPath, `${sections.join("\n")}\n`);
  console.log(`Generated ${outputPath} with ${projects.length} projects.`);
}

void main();
