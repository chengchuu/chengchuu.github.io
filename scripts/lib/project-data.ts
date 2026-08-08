import type { GeneratedProject } from "../../src/types/project";
import { readJson } from "./files";
import { generatedDataPath } from "./paths";

export async function readGeneratedProjects(): Promise<GeneratedProject[]> {
  const projects = await readJson<GeneratedProject[]>(generatedDataPath);

  if (!Array.isArray(projects)) {
    throw new TypeError("Generated project data must be an array.");
  }

  return projects;
}
