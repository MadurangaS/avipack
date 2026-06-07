# CLI Reference

All commands are owner-controlled and safe by default in the foundation stage.

## `avipack init`

Purpose: Create a new Avipack-ready project foundation.

Options:

- `--template <template>`: starter template to use. Defaults to `generic-brain-only`.
- `--name <name>`: project name to write into generated brain files. Defaults to the current folder name.
- `--force`: overwrite known Avipack-generated targets.

Examples:

```bash
avipack init
avipack init --name solar-monitoring-system
avipack init --template generic-brain-only --name solar-monitoring-system
avipack init --force --name solar-monitoring-system
```

Overwrite behavior: without `--force`, the command refuses to continue if `.avipack`, `avipack.config.yaml`, or `README.md` already exists. With `--force`, the MVP replaces only those known Avipack-generated top-level targets.

Current MVP behavior: copies the `generic-brain-only` template into the current directory, updates project metadata, runs a basic brain check, and prints a success summary.

Generated files include `.avipack/`, `avipack.config.yaml`, and `README.md`. The generated config distinguishes the Avipack root from the brain file directory:

```yaml
brain:
  root: .avipack
  path: .avipack/brain
```

Future behavior: support additional starter packs, richer template variables, stricter validation, and safer adoption flows for existing projects.

## `avipack adopt`

Purpose: Add Avipack Brain to an existing project.

Options:

- `--template <template>`: starter template to use. Defaults to `generic-brain-only`.
- `--name <name>`: project name to write into generated brain files. Defaults to the current folder name.
- `--force`: overwrite existing Avipack-owned files, limited to `.avipack/` and `avipack.config.yaml`.
- `--dry-run`: show what would be created, skipped, or overwritten without writing files.

Examples:

```bash
avipack adopt
avipack adopt --name solar-monitoring-dashboard
avipack adopt --dry-run
avipack adopt --force
```

Current MVP behavior: detects a simple project stack, creates `.avipack/`, creates `avipack.config.yaml`, writes `.avipack/reports/adoption-report.md`, updates adopted project metadata, runs a basic brain check, and prints created/skipped/overwritten paths.

Safety behavior: adoption does not overwrite application source code, does not delete user files, and does not overwrite an existing `README.md`. If `.avipack/` or `avipack.config.yaml` exists, adoption stops unless `--force` is passed. With `--force`, Avipack may refresh only `.avipack/` and `avipack.config.yaml`.

The generated adopted config uses:

```yaml
project:
  name: solar-monitoring-dashboard
  mode: adopt

brain:
  root: .avipack
  path: .avipack/brain
```

## `avipack brain check`

Purpose: Validate brain structure.

Example:

```bash
avipack brain check
```

Current MVP behavior: checks required paths.

Future behavior: validate schemas, traces, and conflicts.

## `avipack bot list`

Purpose: List known bots.

Current MVP behavior: prints built-in known bot metadata.

Future behavior: include installed and enabled state.

## `avipack bot add <bot>`

Purpose: Prepare or install a bot package.

Current MVP behavior: safe placeholder.

Future behavior: install package and record it in config or lock state.

## `avipack bot enable <bot>`

Purpose: Enable a previously added bot.

Current MVP behavior: safe placeholder.

Future behavior: update owner-controlled bot state.

## `avipack bot disable <bot>`

Purpose: Disable a bot.

Current MVP behavior: safe placeholder.

Future behavior: update owner-controlled bot state.

## `avipack bot run <bot>`

Purpose: Run a bot manually.

Current MVP behavior: safe placeholder.

Future behavior: invoke the bot after permission and enablement checks.

## `avipack change new`

Purpose: Create a change request.

Current MVP behavior: safe placeholder.

Future behavior: create numbered CR files from templates.

## `avipack adr new`

Purpose: Create an architecture decision record.

Current MVP behavior: safe placeholder.

Future behavior: create numbered ADR files from templates.
