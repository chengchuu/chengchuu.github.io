# Architecture simplification plan

Status: Plan only. Implementation requires separate approval. Creating this document does not authorize changes to application code, generated data, workflows, or the sibling profile repository.

## Goal

Simplify routine website builds by separating metadata refresh, website generation, and profile README generation. Preserve the existing static React rendering, Webpack build, browser behavior, and generated outputs.

The main problem is workflow coupling, not the number of source directories. Keep the existing `src/`, `scripts/`, and `webpack/` boundaries rather than reorganizing files for appearance alone.

## Current behavior

- `src/config/projects.ts` owns the maintained project inventory.
- `scripts/generate-project-data.ts` fetches GitHub, npm, and Go metadata and writes `src/generated/projects.json`.
- `GeneratedProject` extends `ProjectConfig`, so the generated snapshot includes copies of maintained names, descriptions, categories, and links as well as fetched metadata.
- The website and README generators read that snapshot. A configuration edit therefore needs data regeneration before it reaches those outputs.
- `npm run build` refreshes metadata, builds the website, generates the sibling README, and validates both artifacts.
- `npm run check` invokes the complete build after type checking and tests.
- `npm run build:pages` repeats the website build stages without refreshing metadata, generating the README, or validating the final artifact.
- `scripts/validate-dist.ts` validates both `dist/` and the default sibling README.

This coupling makes a presentation-only change trigger network requests, tracked metadata updates, and writes outside the website repository.

## Preserved contracts

- One generated homepage at `dist/index.html`; no new routes or framework migration.
- Static React rendering without client hydration.
- Existing theme initialization, filtering, section navigation, SEO, image bytes, and public asset paths.
- Independent pre-paint theme and normal-interaction browser outputs.
- Current project ordering, contribution presentation, resource ordering, and README table content.
- Bounded metadata concurrency, timeouts, retries, and valid cached values after upstream failures.
- Distinct handling of a successful empty release result and a failed release request.
- Current package-manager, lockfile, runtime, and dependency policies.
- Existing deployment triggers and automatic metadata refresh behavior.

## Stage 1: Separate command responsibilities

Implement this stage independently before changing the metadata schema.

### Define explicit operations

The proposed command contract is:

- `npm run generate:data`: refresh metadata and write the tracked snapshot only.
- `npm run build`: validate configuration, clean and generate the website from the existing snapshot, then validate the site artifact. Do not fetch metadata or write the sibling README.
- `npm run build:pages`: delegate to the same website pipeline instead of maintaining a duplicate sequence.
- `npm run generate:readme`: retain explicit README generation and its existing output-path option.
- `npm run validate:dist`: validate only the website artifact.
- `npm run validate:readme`: validate an existing README with an explicit output-path option and the current sibling path as its default.
- `npm run check`: type-check, run tests, and build and validate the website without live metadata requests or sibling writes.
- `npm run check:all`: explicitly refresh metadata, run the local checks, generate the sibling README, and validate it. Stop on a failed stage.

These are proposed semantics, not currently implemented commands. Document the changed behavior of `build` and `check` clearly. Stage 1 still uses copied configuration in the existing snapshot; stage 2 removes that limitation.

### Separate validation boundaries

Extract README validation from `scripts/validate-dist.ts` into its own command, reusing the existing README validation logic. Preserve all site checks, including required assets, project coverage, theme markup, image integrity, and forbidden routes.

The website build and its validator must work without a sibling profile checkout. A README command must inspect the same destination that generation used; it must not silently validate the default path after generating elsewhere.

Keep one shared website build sequence. Use existing npm script composition unless a small orchestrator is demonstrably needed; do not introduce a task framework.

### Preserve delivery behavior

Update the existing workflow to invoke the explicit aggregate operation so scheduled deployments still fetch fresh metadata and validate all required outputs. Preserve action versions, triggers, permissions, installation policy, and deployment steps unless a separate change is approved.

Do not add automatic commits or pushes of metadata or the sibling README. Generating a file does not publish it to either repository.

## Stage 2: Separate configuration from fetched metadata

Treat this as a separately reviewable data-model change after stage 1 passes validation.

### Define ownership

- `src/config/projects.ts` remains the authority for project identity, category, description, resource links, visibility, and explicit metadata overrides.
- `src/generated/projects.json` retains fetched metadata keyed by project slug, including refresh status and timestamp. It no longer duplicates maintained configuration.
- A focused resolver combines current configuration with cached metadata for both renderers. It adds real precedence and ownership rules rather than merely renaming a reader function.
- Keep `GeneratedProject`, or an equivalently focused resolved type, as the renderer-facing model where useful. Changing persistence does not require rewriting the components.

Resolve projects in canonical configuration order. Ignore cache entries for removed projects and use explicit unavailable metadata for a new project that has no cache entry. Unknown values must remain unknown, not become invented dates, versions, or zero counts.

Apply configured overrides at resolution time. Keep raw fetched values separate so removing an override does not expose a previously cached override as though it came from upstream.

### Migrate the snapshot safely

1. Preserve the current snapshot before conversion.
2. Convert only fields owned by metadata collection, retaining available values, statuses, and timestamps.
3. Handle legacy overridden fields explicitly: if their original upstream value is unavailable, refresh that field or mark it unknown instead of inventing provenance.
4. Update collection, fallback, resolution, generators, validators, and tests together.
5. Compare the website and README generated from fixed inputs before and after migration.

Use a migration or generation command for the tracked output; do not manually maintain the JSON as a second inventory. Avoid a permanent dual-schema compatibility layer for this unreleased project. Once converted, reject an unsupported cache shape with a clear diagnostic.

## Non-goals and alternatives

Do not replace React, Webpack, Bootstrap, or Mazey, introduce runtime APIs, remove regression tests, or add a generic source-provider architecture.

Keeping the current system is a valid lower-effort alternative, but retains network-dependent local checks and sibling writes. Completing stage 1 alone reduces those side effects while retaining the copied-configuration limitation.

Consolidating the two Webpack target files is optional future work, not part of these stages. They already share common configuration. Do not combine their browser execution timing merely to reduce file count.

## Risks and mitigations

- **Stale metadata:** offline builds intentionally use the snapshot. Make freshness visible in documentation and preserve explicit refreshes in the aggregate workflow.
- **Missing validation:** splitting commands can leave an artifact unchecked. Test the aggregate sequence and failure propagation.
- **Changed command expectations:** update README and AGENTS.md alongside implementation, distinguishing local checks from the network-dependent aggregate operation.
- **Metadata loss:** test failed-source fallback, successful empty releases, explicit overrides, new projects, and removed projects before migrating the snapshot.
- **Unrelated live changes:** compare generated diffs after network validation and restore unrelated refreshes without discarding pre-existing work.
- **False simplification:** do not remove meaningful boundaries or tests simply to reduce line or file counts.

## Validation after implementation approval

Add focused tests for:

- Website builds and validation without the sibling repository and without external metadata requests.
- README generation and validation using the same custom output destination.
- Aggregate command ordering and failure propagation.
- Both renderers receiving current configuration after description, link, category, visibility, or override edits without a metadata refresh after stage 2.
- Cached metadata retention on failures and authoritative clearing after successful empty release responses.
- Cache migration, malformed cache errors, newly added projects, and removed projects.
- Equivalent homepage and README content from fixed inputs before and after each stage.

After the proposed scripts exist, run:

```bash
npm run typecheck
npm test
npm run check
npm run check:all
git diff --check
git status --short
git -C ../chengchuu diff --check
git -C ../chengchuu status --short
```

Inspect both repositories after the aggregate check. Verify that local `check` leaves the snapshot and sibling README unchanged. Confirm the explicit aggregate check still generates and validates the full output set.

Check the rendered homepage for theme initialization, repeated toggles, project filtering, section links, contribution metadata, and unchanged image presentation. Report local, network, browser, and CI results separately; do not claim deployment verification from a local build.

## Acceptance and recovery

- Routine website work requires neither network metadata refresh nor sibling writes.
- The complete refresh-and-generation workflow remains available through one explicit command.
- Site and README validation have independent destinations and responsibilities.
- After stage 2, maintained configuration changes reach both renderers without refreshing fetched metadata.
- Existing visible output and failure-handling contracts remain intact.
- No unrelated dependencies, directory restructuring, or public behavior changes are introduced.

Implement and validate each stage separately. If a stage fails, restore only that stage's changes and its matching snapshot format, preserving unrelated work. Regenerate disposable output from the restored sources. No commit, push, workflow dispatch, or deployment is authorized by this plan.
