# Personal website repository guidance

## Repository role

This repository is the source and build authority for Cheng's single-page developer profile, project portfolio, and generated GitHub profile README. It is a private Node.js 22 application, not a publishable npm package. Use npm only.

The sibling `../chengchuu/` repository owns the generated profile README. Do not add a second project configuration there.

## Source map

- `src/config/site.ts`: canonical site identity, URLs, assets, and theme settings.
- `src/config/projects.ts`: only source of truth for the complete project inventory.
- `src/generated/projects.json`: retained normalized metadata used for fallback builds.
- `src/site/ProfileDocument.tsx`: React server-rendered homepage document.
- `src/client/theme-runtime.ts`: pre-paint theme resolution.
- `src/client/site.ts`: light/dark controls, project search, and filtering.
- `src/styles/`: Bootstrap integration, shared palette, and responsive styling.
- `scripts/`: configuration validation, metadata collection, static generation, README generation, and output validation.
- `webpack/`: separate Webpack 5 builds for the theme runtime and site assets.
- `tests/`: Node test-runner regression coverage.
- `images/`: six immutable source images copied byte-for-byte to `dist/images/`.
- `.github/workflows/pages.yml`: scheduled and push-triggered GitHub Pages deployment.

## Architecture contracts

- Keep every project in `src/config/projects.ts`. Mazey and AsiaTZ are required presets, but all configured projects must appear on the homepage and in the appropriate README table.
- Render the portfolio on `/`. Never generate top-level `/projects/`, `/playground/`, or `/api/` pages.
- Render important content to static HTML with React. Keep browser JavaScript limited to theme behavior, search, and filtering.
- The visible theme selector has only light and dark choices. System preference supplies the initial resolution until the visitor explicitly selects a theme.
- Use Mazey's theme APIs directly and access the storage key only through `siteConfig.theme.storageKey`. Theme changes must update `data-bs-theme`, `theme-color`, and control state.
- Treat `images/chengchuu-512x512.jpg` as Cheng's identifiable portrait. Do not crop, resize, re-encode, rename, or otherwise transform any source image.
- Preserve strict TypeScript with `module` and `moduleResolution` set to `NodeNext`.
- Keep `package.json` private and preserve the required dependency ranges checked by `scripts/validate-config.ts`.
- Do not commit `dist/`, `node_modules/`, `package-lock.json`, coverage, caches, temporary files, `.DS_Store`, or other generated output. This multi-developer repository intentionally does not maintain an npm lockfile.

## Commands and side effects

```bash
npm install
npm run typecheck
npm test
npm run build
npm run preview
npm run check
```

`npm run build` cleans `dist/`, validates configuration, fetches GitHub, npm, and Go metadata, rewrites `src/generated/projects.json`, builds the static site, copies images, generates SEO files, regenerates `../chengchuu/README.md`, and validates the output. Metadata requests use bounded concurrency, timeouts, retries, and retained valid fallback data; incomplete results must be marked `partial`.

Run `npm run preview` after a successful build to serve `dist/` at `http://localhost:4173` with Python 3. Run `npm run check` before release-facing changes; it performs type checking, tests, and the complete production build.

## Change discipline

Follow the existing TypeScript style: two-space indentation, double quotes, semicolons, and focused modules. Preserve user-authored profile content and avoid speculative restructuring. Add targeted regression tests for confirmed defects in configuration, metadata fallback, rendering, styles, or theme behavior.

Finish with `git diff --check` and inspect `git status --short` in both this repository and `../chengchuu/`, because a build can modify files in both checkouts.
