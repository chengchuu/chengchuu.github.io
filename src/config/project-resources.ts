export type ProjectResourceField =
  | "home"
  | "playground"
  | "examples"
  | "api"
  | "github"
  | "npm";

export const projectResourceFields = [
  ["home", "Home"],
  ["playground", "Playground"],
  ["examples", "Examples"],
  ["api", "API"],
  ["github", "GitHub"],
  ["npm", "npm"],
] as const satisfies ReadonlyArray<readonly [ProjectResourceField, string]>;
