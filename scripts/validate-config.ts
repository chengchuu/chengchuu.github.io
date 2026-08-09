import { readFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { validateProjects } from "./lib/validate-projects";
import { rootDir } from "./lib/paths";

async function main(): Promise<void> {
const errors = validateProjects();
const packageJson = JSON.parse(
  await readFile(path.join(rootDir, "package.json"), "utf8"),
) as {
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const requiredDependencies = {
  bootstrap: "^5.3.8",
  mazey: "^5.6.7",
  react: "^19.2.8",
  "react-dom": "^19.2.8",
} as const;

if (packageJson.private !== true) {
  errors.push("package.json must set private to true.");
}

for (const [name, version] of Object.entries(requiredDependencies)) {
  if (packageJson.dependencies?.[name] !== version) {
    errors.push(`package.json must declare ${name} as ${version}.`);
  }
}

if (packageJson.devDependencies?.["lint-staged"] !== "^16.4.0") {
  errors.push("package.json must declare lint-staged as ^16.4.0.");
}

const requiredPaths = [
  ".gitignore",
  "tsconfig.json",
  "src",
  "scripts",
  "webpack",
  "tests",
  ".github/workflows",
];

for (const requiredPath of requiredPaths) {
  try {
    await readFile(path.join(rootDir, requiredPath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EISDIR") {
      continue;
    }
    errors.push(`Required bootstrap path is missing: ${requiredPath}`);
  }
}

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  cwd: rootDir,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const forbiddenTracked = trackedFiles.filter((file) =>
  /(^|\/)(node_modules|dist|coverage|\.cache|\.tmp|tmp)(\/|$)|(^|\/)\.DS_Store$/.test(
    file,
  ),
);

if (forbiddenTracked.length > 0) {
  errors.push(`Forbidden generated files are tracked: ${forbiddenTracked.join(", ")}`);
}

if (errors.length > 0) {
  throw new Error(`Configuration validation failed:\n- ${errors.join("\n- ")}`);
}

console.log("Configuration is valid.");
}

void main();
