import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/config/projects";
import { validateProjects } from "../scripts/lib/validate-projects";
import type { ProjectConfig } from "../src/types/project";

test("canonical project configuration is valid", () => {
  assert.deepEqual(validateProjects(), []);
});

test("all project identities are unique", () => {
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length);
  assert.equal(
    new Set(projects.map((project) => project.repository)).size,
    projects.length,
  );
});

test("required presets reject category and status changes", () => {
  const changedProjects: ProjectConfig[] = projects.map((project) =>
    project.slug === "mazey"
      ? { ...project, category: "github", status: "archived" }
      : project,
  );
  const errors = validateProjects(changedProjects);

  assert.ok(errors.includes("Required preset value was modified: mazey.category"));
  assert.ok(errors.includes("Required preset value was modified: mazey.status"));
});
