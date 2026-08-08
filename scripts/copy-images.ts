import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { distDir, requiredImageNames, sourceImagesDir } from "./lib/paths";

async function main(): Promise<void> {
  const destinationDir = path.join(distDir, "images");
  await rm(destinationDir, { force: true, recursive: true });
  await mkdir(destinationDir, { recursive: true });

  for (const imageName of requiredImageNames) {
    await copyFile(
      path.join(sourceImagesDir, imageName),
      path.join(destinationDir, imageName),
    );
  }

  console.log(`Copied ${requiredImageNames.length} images without transformation.`);
}

void main();
