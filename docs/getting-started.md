# Getting Started

## Installation Idea

The intended user entry point is:

```bash
npx avipack init
```

During local development, use pnpm:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js init --name demo-project
```

If `pnpm` is not installed directly, use Node.js Corepack:

```bash
corepack pnpm install
corepack pnpm build
```

## Local Development

Run type checks across packages:

```bash
pnpm typecheck
```

Build all packages:

```bash
pnpm build
```

## Initialize a Project

The first working MVP feature is `avipack init` with the `generic-brain-only` template.

```bash
node packages/cli/dist/index.js init --name demo-project
```

This copies the brain template into the current directory and creates:

```txt
.avipack/
avipack.config.yaml
README.md
```

Future published usage:

```bash
npx avipack init --name demo-project
```

npm publishing is future work.

The MVP template is bundled inside `@avipack/core`, which keeps local CLI behavior closer to future npm-installed behavior.

## Overwrite Behavior

By default, `avipack init` refuses to overwrite:

```txt
.avipack/
avipack.config.yaml
README.md
```

Use `--force` only when you intentionally want to replace Avipack-generated files:

```bash
node packages/cli/dist/index.js init --name demo-project --force
```

## Adopt an Existing Project

Use `avipack adopt` when a project already has source code, package files, docs, and a README.

```bash
node packages/cli/dist/index.js adopt
node packages/cli/dist/index.js adopt --name solar-monitoring-dashboard
node packages/cli/dist/index.js adopt --dry-run
```

This adds Avipack Brain files without changing the application framework:

```txt
.avipack/
avipack.config.yaml
.avipack/reports/adoption-report.md
```

If `README.md` already exists, adoption skips it and reports that it was not overwritten. If `.avipack/` or `avipack.config.yaml` already exists, adoption stops unless `--force` is passed. Force mode refreshes only Avipack-owned files and still preserves an existing README.

## Add Bots

Future behavior:

```bash
avipack bot add brain
avipack bot enable brain
avipack bot run brain
```

Bots remain manual by default.

## Run Brain Check

```bash
avipack brain check
```

The foundation-stage command checks for required `.avipack` paths. Future versions will validate YAML schemas and traceability.

## Example User Journey

1. Create or adopt a project.
2. Review `.avipack/brain/product-brief.md`.
3. Edit requirements and architecture files.
4. Record initial ADRs and change requests.
5. Run `avipack brain check`.
6. Add optional bots only when the owner wants manual assistance.
