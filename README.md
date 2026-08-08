# chengchuu.github.io

Source and build system for [Cheng's personal website](https://chengchuu.github.io/) and generated [GitHub profile README](https://github.com/chengchuu/chengchuu).

The repository keeps project configuration in one place, collects metadata from GitHub, npm, and the Go module proxy, then produces a statically rendered portfolio and Markdown project tables. React renders the important page content to HTML; browser JavaScript handles theme selection, search, and project filters.

## Requirements

- Node.js 22 or later
- npm
- The `chengchuu` profile repository in the sibling directory `../chengchuu/` when generating the default profile README

## Set up the project

Install the dependencies with npm:

```bash
npm install
```

Run the complete validation and production build:

```bash
npm run check
```

This command type-checks the project, runs the tests, fetches current project metadata, rebuilds `dist/`, validates the deployment artifact, and rewrites `../chengchuu/README.md`.

## Configure the site

Edit [`src/config/projects.ts`](src/config/projects.ts) to add or update projects. This file is the only maintained project inventory. Every configured project appears on the homepage and in the appropriate generated profile README table.

Edit [`src/config/site.ts`](src/config/site.ts) for the site title, description, origin, theme settings, and public image paths. Keep the theme storage key centralized as `siteConfig.theme.storageKey`.

The files in [`images/`](images/) are copied to `dist/images/` without transformation. `chengchuu-512x512.jpg` is Cheng's profile portrait; the remaining files are favicon, manifest, and Open Graph assets.

## Build outputs

The build creates or updates these artifacts:

| Output                                | Purpose                                                |
|:--------------------------------------|:-------------------------------------------------------|
| `dist/`                               | GitHub Pages artifact; generated locally and ignored   |
| `src/generated/projects.json`         | Retained project metadata used for fallback builds     |
| `../chengchuu/README.md`              | Generated GitHub profile README                        |

To write the profile README to another location, provide an explicit output path:

```bash
npm run generate:readme -- --output ../chengchuu/README.md
```

## Metadata collection

`npm run generate:data` retrieves repository metadata from GitHub and package release data from npm or the Go module proxy. Requests use bounded concurrency, timeouts, and retries for temporary failures.

Set the optional `GITHUB_TOKEN` environment variable to authenticate GitHub API requests. When a source is unavailable, the generator preserves valid values from `src/generated/projects.json`, marks the affected result as `partial` or `unavailable`, and continues when a safe fallback exists.

## Available commands

| Command                       | Purpose                                                        |
|:------------------------------|:---------------------------------------------------------------|
| `npm run typecheck`           | Check strict TypeScript types without emitting files           |
| `npm test`                    | Run the Node test-runner regression suite                      |
| `npm run validate:config`     | Validate project configuration and repository bootstrap files  |
| `npm run generate:data`       | Refresh normalized project metadata                            |
| `npm run build`               | Generate and validate all site and README outputs              |
| `npm run validate:dist`       | Validate the generated Pages artifact and profile README       |
| `npm run check`               | Run type checking, tests, and the complete production build    |

The complete build order is configuration validation, metadata collection, theme and site asset compilation, static HTML rendering, image copying, SEO generation, profile README generation, and distribution validation.

## Deployment

GitHub Actions runs `npm run check` with Node.js 22 and deploys only `dist/` to GitHub Pages. The workflow runs on pushes to `main`, manual dispatches, and the scheduled daily metadata refresh.
