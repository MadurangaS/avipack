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

Purpose: Validate brain structure and basic trace consistency.

Options:

- `--report`: write `.avipack/reports/brain-check.md`.
- `--strict`: fail when warnings are present.

Example:

```bash
avipack brain check
avipack brain check --report
avipack brain check --strict
```

Current MVP behavior: checks required paths, validates YAML parsing for brain/config YAML files, reports duplicate requirement IDs, reports duplicate architecture IDs, and warns when requirement traces reference unknown change requests, architecture IDs, or planned test IDs.

## `avipack doctor`

Purpose: Check local Avipack CLI and project health.

Options:

- `--json`: print machine-readable doctor output.

Examples:

```bash
avipack doctor
avipack doctor --json
```

Current MVP behavior: reports Node.js version, platform, current directory, whether the directory is an Avipack project, config status, brain file status, bot config validity, and report directory writability. Warnings do not fail; errors exit with code 1.

## `avipack version`

Purpose: Print the Avipack CLI version.

Examples:

```bash
avipack --version
avipack version
```

## `avipack bot list`

Purpose: List known bots and project-local state.

Current MVP behavior: prints each known bot with id, name, package name, installed state, enabled state, and description. If run outside an Avipack project, all bots show as not installed and not enabled.

## `avipack bot add <bot>`

Purpose: Record a known bot as installed for the current Avipack project.

Options:

- `--enable`: explicitly enable the bot after adding it.

Current MVP behavior: resolves bot input by short name, id, display name, or package name; updates `bots.installed` in `avipack.config.yaml`; writes an audit report under `.avipack/reports/bots/`; and exits successfully if the bot is already installed.

Important: this does not install npm packages and does not run the bot.

## `avipack bot enable <bot>`

Purpose: Enable a previously added bot for manual runs.

Current MVP behavior: requires the bot to be installed, updates `bots.enabled`, writes an audit report, and exits successfully if already enabled. Enabling a bot does not run it.

## `avipack bot disable <bot>`

Purpose: Disable a bot.

Current MVP behavior: removes the bot from `bots.enabled`, leaves it in `bots.installed`, writes an audit report, and exits successfully if already disabled.

## `avipack bot run <bot>`

Purpose: Run a bot manually.

Options:

- `--dry-run`: show what would happen without writing a report.
- `--allow-disabled`: allow a manual run even when the bot is disabled.

Current MVP behavior: requires the bot to be installed and enabled by default, then writes a manual execution report under `.avipack/reports/bots/`. It does not perform AI analysis, call external APIs, install packages, run in the background, or modify application source files.

There is no autonomous or background bot execution in this milestone.

## `avipack change new`

Purpose: Create a change request.

Options:

- `--title <title>`: title for the change request. Required unless provided as the first argument.
- `--summary <summary>`: optional summary.
- `--status <status>`: defaults to `proposed`.
- `--requirement <id>`: repeatable linked requirement id.
- `--dry-run`: print the next path without writing.

Example:

```bash
avipack change new --title "Add authentication flow" --requirement REQ-001
```

Current MVP behavior: creates the next numbered file under `.avipack/changes/`, such as `CR-0002-add-authentication-flow.md`, without overwriting existing files.

## `avipack adr new`

Purpose: Create an architecture decision record.

Options:

- `--title <title>`: title for the ADR. Required unless provided as the first argument.
- `--status <status>`: defaults to `proposed`.
- `--context <text>`: optional context.
- `--decision <text>`: optional decision.
- `--dry-run`: print the next path without writing.

Example:

```bash
avipack adr new --title "Use PostgreSQL for relational data"
```

Current MVP behavior: creates the next numbered file under `.avipack/decisions/`, such as `ADR-0002-use-postgresql-for-relational-data.md`, without overwriting existing files.
