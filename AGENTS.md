# Personal website repository guidance

## Repository role

This repository is the implementation and configuration authority for Cheng's single-page portfolio and generated GitHub profile README. Use Node.js 22 and npm. Run `npm install`, commit `package-lock.json`, and do not introduce another package manager or npm caching.

## Project map

- `src/config/`: canonical site and project configuration.
- `src/generated/projects.json`: retained normalized metadata for fallback builds.
- `src/site/`: React static-document components.
- `src/client/`: browser-only theme, search, and filter behavior.
- `src/styles/`: Bootstrap overrides and shared light/dark palettes.
- `scripts/`: metadata, site, SEO, image, README, and validation tasks.
- `webpack/`: separate site and pre-paint theme bundles.
- `tests/`: Node test-runner regression coverage.
- `images/`: immutable source images copied to `dist/images/`.
- `.github/workflows/pages.yml`: Pages build and deployment.

## Architecture contracts

- Maintain every project only in `src/config/projects.ts`. Mazey and AsiaTZ are required presets, not the complete list.
- Render all configured projects on `/`. Do not create top-level `/projects/`, `/playground/`, or `/api/` pages.
- Keep important content in React-rendered static HTML. Limit browser JavaScript to interaction and theme behavior.
- Consume `CHENGCHUU_THEME` through `siteConfig.theme.storageKey` only.
- Call Mazey's verified `resolveThemePreference`, `setThemePreference`, and `listenMediaQueryChanges` APIs directly. Keep only DOM application and current-session fallback policy local.
- Copy the six listed images byte-for-byte. Treat `chengchuu-512x512.jpg` as Cheng's identifiable profile portrait; do not transform it.
- Do not commit `dist/`, `node_modules/`, coverage, caches, `.DS_Store`, or temporary files.

## Commands and side effects

```bash
npm install
npm run typecheck
npm test
npm run build
npm run check
```

`npm run build` fetches public GitHub, npm, and Go metadata, rewrites `src/generated/projects.json`, builds `dist/`, and regenerates `../chengchuu/README.md`. Preserve previous valid metadata when a source fails and mark incomplete data as `partial`.

## Change and test discipline

Use strict TypeScript, two-space indentation, double quotes, and semicolons. Add focused regression tests for confirmed generator, metadata, rendering, and theme defects. Avoid wrappers that only rename a dependency API.

Run `npm run check` for release-facing changes. It must pass type checking, tests, both Webpack builds, static generation, README generation, image-integrity checks, SEO validation, and distribution validation. Finish with `git diff --check` and inspect changes in both sibling repositories.
