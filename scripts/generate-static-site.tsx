import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileDocument } from "../src/site/ProfileDocument";
import { writeText } from "./lib/files";
import { readGeneratedProjects } from "./lib/project-data";
import { distDir } from "./lib/paths";

async function main(): Promise<void> {
  const projects = await readGeneratedProjects();
  const html = `<!doctype html>${renderToStaticMarkup(
    <ProfileDocument projects={projects} />,
  )}`;

  await writeText(path.join(distDir, "index.html"), `${html}\n`);
  console.log(`Generated homepage with ${projects.length} projects.`);
}

void main();
