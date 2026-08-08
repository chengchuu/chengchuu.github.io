import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function readJsonIfExists<T>(
  filePath: string,
  fallback: T,
): Promise<T> {
  try {
    return await readJson<T>(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

export async function writeText(
  filePath: string,
  contents: string,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
}

export async function writeJson(
  filePath: string,
  value: unknown,
): Promise<void> {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
