import { projects } from "../../src/config/projects";
import type { ProjectConfig } from "../../src/types/project";

const allowedProtocols = new Set(["http:", "https:"]);

const presetContracts = {
  mazey: {
    name: "Mazey",
    category: "npm",
    repository: "chengchuu/mazey",
    packageName: "mazey",
    status: "active",
    home: "https://chengchuu.github.io/mazey/",
    playground: "https://chengchuu.github.io/mazey/playground/",
    github: "https://github.com/chengchuu/mazey",
    npm: "https://www.npmjs.com/package/mazey",
    api: "https://chengchuu.github.io/mazey/api/",
  },
  asiatz: {
    name: "AsiaTZ",
    category: "go",
    repository: "chengchuu/asiatz",
    modulePath: "github.com/chengchuu/asiatz",
    status: "active",
    home: "https://chengchuu.github.io/asiatz/",
    examples: "https://chengchuu.github.io/asiatz/examples/",
    github: "https://github.com/chengchuu/asiatz",
    api: "https://chengchuu.github.io/asiatz/api/",
  },
} as const;

const linkFields = [
  "home",
  "playground",
  "examples",
  "github",
  "npm",
  "api",
] as const satisfies readonly (keyof ProjectConfig)[];

export function validateProjects(
  candidateProjects: readonly ProjectConfig[] = projects,
): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const repositories = new Set<string>();

  for (const project of candidateProjects) {
    if ("relationship" in project) {
      errors.push(`${project.slug} contains unsupported relationship metadata.`);
    }

    if (slugs.has(project.slug)) {
      errors.push(`Duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);

    if (repositories.has(project.repository)) {
      errors.push(`Duplicate project repository: ${project.repository}`);
    }
    repositories.add(project.repository);

    if (project.category === "npm" && !project.packageName) {
      errors.push(`${project.slug} is missing packageName.`);
    }

    if (project.category === "go" && !project.modulePath) {
      errors.push(`${project.slug} is missing modulePath.`);
    }

    for (const field of linkFields) {
      const value = project[field];
      if (typeof value !== "string") {
        continue;
      }

      try {
        if (!allowedProtocols.has(new URL(value).protocol)) {
          errors.push(`${project.slug}.${field} uses an unsupported protocol.`);
        }
      } catch {
        errors.push(`${project.slug}.${field} is not a valid URL.`);
      }
    }
  }

  for (const [slug, expected] of Object.entries(presetContracts)) {
    const project = candidateProjects.find((candidate) => candidate.slug === slug);
    if (!project) {
      errors.push(`Required preset is missing: ${slug}`);
      continue;
    }

    for (const [field, value] of Object.entries(expected)) {
      if ((project as unknown as Record<string, unknown>)[field] !== value) {
        errors.push(`Required preset value was modified: ${slug}.${field}`);
      }
    }
  }

  return errors;
}
