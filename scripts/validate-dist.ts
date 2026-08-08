import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { projects } from "../src/config/projects";
import { siteConfig } from "../src/config/site";
import { escapeMarkdown } from "./lib/format";
import { defaultReadmePath, distDir, requiredImageNames, rootDir, sourceImagesDir } from "./lib/paths";

async function main(): Promise<void> {
const errors: string[] = [];
const requiredOutput = [
  "index.html",
  "assets/index.css",
  "assets/index.js",
  "assets/theme.css",
  "assets/theme-runtime.js",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  ...requiredImageNames.map((image) => `images/${image}`),
];

for (const relativePath of requiredOutput) {
  try {
    const outputStat = await stat(path.join(distDir, relativePath));
    if (!outputStat.isFile() || outputStat.size === 0) {
      errors.push(`Output is missing or empty: ${relativePath}`);
    }
  } catch {
    errors.push(`Output is missing: ${relativePath}`);
  }
}

const html = await readFile(path.join(distDir, "index.html"), "utf8");
const canonicalUrl = `${siteConfig.origin}${siteConfig.basePath}`;
const profilePhotoUrl = new URL(
  siteConfig.assets.profilePhoto,
  `${siteConfig.origin}/`,
).toString();

const requiredHtml = [
  `<title>${siteConfig.title}</title>`,
  `name="description" content="${siteConfig.description}"`,
  `rel="canonical" href="${canonicalUrl}"`,
  `property="og:image" content="${siteConfig.origin}${siteConfig.assets.openGraph}"`,
  `data-bs-theme="light"`,
  `src="${siteConfig.assets.profilePhoto}"`,
  `alt="Portrait of Cheng"`,
  `width="512" height="512"`,
  `"image":"${profilePhotoUrl}"`,
  `/assets/theme-runtime.js`,
];

for (const fragment of requiredHtml) {
  if (!html.includes(fragment)) {
    errors.push(`Homepage is missing required content: ${fragment}`);
  }
}

for (const forbiddenPath of ["projects", "playground", "api"]) {
  const publicPaths = [
    `href="/${forbiddenPath}/"`,
    `href="${siteConfig.origin}/${forbiddenPath}/"`,
    `content="${siteConfig.origin}/${forbiddenPath}/"`,
  ];
  if (publicPaths.some((publicPath) => html.includes(publicPath))) {
    errors.push(`Homepage points to forbidden top-level path: /${forbiddenPath}/`);
  }
}

if (/file:\/\/|\/Users\/|[A-Za-z]:\\/.test(html)) {
  errors.push("Homepage contains a filesystem path.");
}

if (/https?:\/\/[^/\s"'<>]+\/\//.test(html)) {
  errors.push("Homepage contains duplicated slashes after an origin.");
}

for (const project of projects) {
  if (!html.includes(`data-project-slug="${project.slug}"`)) {
    errors.push(`Homepage is missing configured project: ${project.slug}`);
  }
}

for (const forbiddenPage of ["projects", "playground", "api"]) {
  try {
    await stat(path.join(distDir, forbiddenPage, "index.html"));
    errors.push(`Forbidden standalone page was generated: /${forbiddenPage}/`);
  } catch {
    // Expected: these top-level pages must not exist.
  }
}

const distImageNames = await readdir(path.join(distDir, "images"));
if (
  distImageNames.length !== requiredImageNames.length ||
  requiredImageNames.some((image) => !distImageNames.includes(image))
) {
  errors.push("dist/images contains missing or unexpected files.");
}

async function sha256(filePath: string): Promise<string> {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

for (const imageName of requiredImageNames) {
  const sourceHash = await sha256(path.join(sourceImagesDir, imageName));
  const outputHash = await sha256(path.join(distDir, "images", imageName));
  if (sourceHash !== outputHash) {
    errors.push(`Copied image differs from its source: ${imageName}`);
  }
}

const readme = await readFile(defaultReadmePath, "utf8");
if (
  !readme.includes("| Project | Links | Created | Latest release |") ||
  !readme.includes("|:---|:---|:---|:---|")
) {
  errors.push("Generated README does not use the required table columns.");
}
if (readme.includes("| Status |") || readme.includes("| Relationship |")) {
  errors.push("Generated README contains an unsupported table column.");
}

for (const project of projects) {
  if (!readme.includes(`| ${escapeMarkdown(project.name)} |`)) {
    errors.push(`Generated README is missing configured project: ${project.name}`);
  }
}

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  cwd: rootDir,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
if (trackedFiles.some((file) => file === ".DS_Store" || file.startsWith("dist/"))) {
  errors.push("Generated output or filesystem metadata is tracked by Git.");
}

if (errors.length > 0) {
  throw new Error(`Distribution validation failed:\n- ${errors.join("\n- ")}`);
}

console.log(`Validated dist/index.html and ${projects.length} migrated projects.`);
}

void main();
