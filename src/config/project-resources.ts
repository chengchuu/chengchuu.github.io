export type ProjectResourceField =
  | "home"
  | "demo"
  | "playground"
  | "examples"
  | "api"
  | "github"
  | "npm";

export const projectResourceFields = [
  ["home", "Home"],
  ["demo", "Demo"],
  ["playground", "Playground"],
  ["examples", "Examples"],
  ["api", "API"],
  ["github", "GitHub"],
  ["npm", "npm"],
] as const satisfies ReadonlyArray<readonly [ProjectResourceField, string]>;
