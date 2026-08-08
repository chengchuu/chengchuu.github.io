import path from "node:path";

export const rootDir = process.cwd();
export const distDir = path.join(rootDir, "dist");
export const generatedDataPath = path.join(
  rootDir,
  "src",
  "generated",
  "projects.json",
);
export const defaultReadmePath = path.resolve(rootDir, "../chengchuu/README.md");
export const sourceImagesDir = path.join(rootDir, "images");

export const requiredImageNames = [
  "chengchuu-512x512.jpg",
  "logo-32x32.png",
  "logo-192x192.png",
  "logo-512x512.png",
  "logo-maskable-512x512.png",
  "logo-open-graph-1200x630.png",
] as const;
