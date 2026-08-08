import { rm } from "node:fs/promises";
import { distDir } from "./lib/paths";

async function main(): Promise<void> {
  await rm(distDir, { force: true, recursive: true });
  console.log("Cleaned dist/.");
}

void main();
