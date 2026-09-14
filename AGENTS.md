# Personal website repository guidance

## Repository role

This repository is the source and build authority for Cheng's single-page developer profile, project portfolio, generated GitHub profile README, and GitHub Pages deployment. It is a private Node.js 22 application, not a publishable package.

The sibling `../chengchuu/` repository owns the generated profile `README.md` and its profile-specific assets. Do not initialize another JavaScript project or maintain a second project inventory there.

## Package tooling

- Use the npm commands defined in `package.json` for local checks and GitHub Actions. The build script currently composes its stages with `npm run`.
- Keep `package.json` private. `scripts/validate-config.ts` enforces the required dependency declarations and exact ranges except for Mazey, which must be present but is not version-pinned by validation.
- `package-lock.json` is intentionally ignored. The repository retains `pnpm-lock.yaml`, and `pnpm-workspace.yaml` contains pnpm build-policy settings. Keep those pnpm files aligned with intentional dependency changes, but do not switch the documented commands or CI package manager unless the task explicitly includes that migration.
- Do not add an `engines` declaration or a `packageManager` field unless the task explicitly requires one. Node.js 22 remains the documented and CI runtime.

## Source ownership

- `src/config/projects.ts` is the only maintained project inventory. Mazey and AsiaTZ are required presets, and every configured project must appear on the generated homepage. Projects appear in the profile README unless `hideFromProfileReadme` is `true` in `src/config/projects.ts`.
- `src/config/project-resources.ts` defines the shared resource labels and order: Home, Demo, Playground, Examples, API, GitHub, then npm. The homepage, generated README, and `guides/PROJECT_LINK_CHECKLIST.md` must use that order and omit unavailable resources.
- `src/config/site.ts` owns the site identity, canonical origin, public asset paths, and theme settings. Access the storage key only through `siteConfig.theme.storageKey`.
- `src/generated/projects.json` is tracked normalized metadata and the fallback for temporary upstream failures. Do not hand-maintain it as a second project list.
- `guides/PROJECT_LINK_CHECKLIST.md` mirrors known links from the canonical project configuration. Format each entry with a plain project heading followed by `- Slug: <slug>`.

## Site architecture

- `src/site/ProfileDocument.tsx` server-renders the complete homepage with React. Render every project on `/`; never generate standalone top-level `/projects/`, `/playground/`, or `/api/` pages.
- The homepage sorts project cards by descending `latestReleaseAt`, places missing or invalid dates last, and preserves configuration order for ties. This is a presentation-only sort; do not reorder the canonical configuration or generated README for it.
- Browser JavaScript is limited to pre-paint theme resolution, light/dark selection, project search, and category filters. Keep important profile and project content in generated HTML.
- The visible theme control is a two-state light/dark toggle with inline Bootstrap Icons. Mazey resolves the initial URL, stored, or one-time system preference and persists explicit selections; theme updates must keep `data-bs-theme`, `data-theme-preference`, `theme-color`, the accessible label, and icon visibility synchronized without following later operating-system changes.
- `src/styles/theme.css` owns shared theme variables. `src/styles/site.css` owns Bootstrap integration, layout, responsive styles, and component presentation.
- Webpack has two production browser targets: `webpack.theme.ts` emits the pre-paint theme runtime and CSS, and `webpack.site.ts` emits the interactive site runtime and CSS. The static-site script writes the HTML document separately.

## Images and public metadata

- `images/` contains six required source images copied byte-for-byte to `dist/images/`. Do not copy `.DS_Store` or other filesystem metadata.
- Treat `images/chengchuu-512x512.jpg` as Cheng's identifiable portrait. Do not crop, resize, re-encode, rename, regenerate, or substitute it. Keep its configured path, `alt="Portrait of Cheng"`, intrinsic 512×512 dimensions, and absolute `Person.image` URL intact.
- Keep the existing logo files for favicons, the web app manifest, and Open Graph metadata.
- `scripts/generate-seo.ts` owns `robots.txt`, `sitemap.xml`, and `site.webmanifest`. The homepage owns its canonical URL, description, Open Graph and Twitter metadata, and Person JSON-LD.

## Generated outputs and build effects

The main generated artifacts are:

```text
dist/
src/generated/projects.json
../chengchuu/README.md
```

`dist/` is disposable and ignored. The metadata JSON and sibling README are tracked outputs. A complete build performs these stages in order:

```text
Clean dist
→ validate configuration
→ fetch GitHub, npm, and Go metadata
→ build theme assets
→ build site assets
→ render static HTML
→ copy images
→ generate SEO files
→ generate the profile README
→ validate dist and README coverage
```

Metadata requests use timeouts, retries, bounded batches, and `Promise.allSettled()`-style isolation. Preserve valid previous values when an upstream source fails, and mark incomplete results as `partial` or `unavailable` instead of dropping configured projects.

## Commands

Run commands from this repository:

```bash
npm install
npm run typecheck
npm test
npm run validate:config
npm run build
npm run preview
npm run check
```

`npm run preview` serves an existing `dist/` directory at `http://localhost:4173` with Python 3. `npm run check` runs type checking, the Node test-runner suite, and the complete network-dependent production build.

The build fetches live metadata and rewrites `src/generated/projects.json` and `../chengchuu/README.md`. Inspect those diffs and restore unrelated refreshes when metadata changes are outside the task.

## Deployment

`.github/workflows/pages.yml` runs on pushes to `main`, manual dispatches, and a daily schedule. It uses Node.js 22, runs `npm install` without npm caching, executes `npm run check`, and uploads only `dist/` to GitHub Pages.

## Change discipline

- Follow the existing TypeScript style: two-space indentation, double quotes, semicolons, strict types, and focused modules. Keep `module` and `moduleResolution` set to `NodeNext`.
- Preserve the profile introduction, sibling `images/rock-that-body.gif`, source images, canonical project inventory, and unrelated worktree changes unless the task explicitly includes them.
- Add focused regression tests for confirmed defects in configuration, metadata fallback, resource ordering, rendering, styles, or theme behavior. Avoid speculative refactors.
- Do not track `dist/`, `node_modules/`, `package-lock.json`, coverage, caches, temporary files, or `.DS_Store`.
- Do not stage, commit, push, or deploy unless the user requests it.

For implementation changes, run `npm run check`. For documentation-only changes, run the narrowest relevant checks. Always finish with `git diff --check` and inspect `git status --short` in this repository and `../chengchuu/`. Report network-dependent failures separately.
