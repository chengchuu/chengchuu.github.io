import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/config/projects";
import { validateProjects } from "../scripts/lib/validate-projects";

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
