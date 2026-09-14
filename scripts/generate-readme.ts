import path from "node:path";
import { isProfileReadmeVisible, renderProfileReadme } from "./lib/profile-readme";
import { writeText } from "./lib/files";
import { defaultReadmePath } from "./lib/paths";
import { readGeneratedProjects } from "./lib/project-data";

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

async function main(): Promise<void> {
  const projects = await readGeneratedProjects();
  const outputPath = outputPathFromArgs();
  await writeText(outputPath, renderProfileReadme(projects));
  const visibleCount = projects.filter(isProfileReadmeVisible).length;
  console.log(`Generated ${outputPath} with ${visibleCount} visible projects.`);
}

void main();
