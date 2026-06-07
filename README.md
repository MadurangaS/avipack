# Avipack

Avipack is a CLI-based project starter and project-brain system for controlled human and AI software development.

It creates or adopts projects with a clean starter structure, a versioned project brain, structured requirements, ADRs, change requests, agent rules, optional bot packages, and future conflict checking between requirements, architecture, APIs, tests, and implementation.

## Why Avipack Exists

Normal project starters generate files and then disappear. AI coding prompts often explain intent once and then get lost as the project changes. Avipack is designed to keep the operating context of a project visible and versioned from day one.

The core idea is simple: the project should carry its own memory. Humans and AI agents should be able to read the same requirements, decisions, constraints, and change history before modifying code.

## Key Concepts

- **Avipack CLI**: the owner-controlled command line interface.
- **Avipack Brain**: the `.avipack` folder that stores requirements, architecture, change requests, ADRs, security rules, testing strategy, and agent rules.
- **Starter Packs**: templates for creating new projects or adding only the brain to existing projects.
- **Bots**: optional plugin packages that perform manual, scoped workflows.
- **Conflict Checks**: planned validation between requirements, architecture, APIs, tests, and implementation.

## First Working MVP Feature

`avipack init` can now generate a generic Avipack Brain in the current directory.

`avipack init` now uses the core-bundled `generic-brain-only` template from `@avipack/core`. This is a stabilization step toward npm-installable usage because the working template no longer depends on the monorepo-level starter workspace.

After building the CLI locally:

```bash
node packages/cli/dist/index.js init --name my-project
```

This creates:

```txt
.avipack/
avipack.config.yaml
README.md
```

By default, Avipack refuses to overwrite an existing `.avipack`, `avipack.config.yaml`, or `README.md`. Use `--force` only when you intentionally want to replace Avipack-generated files.

## Quick Start

After dependencies are installed, the local workflow is:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js init --name demo-project
```

Future user-facing usage:

```bash
npx avipack init --name demo-project
npx avipack adopt
npx avipack brain check
```

## Adopt an Existing Project

Use `avipack adopt` to add Avipack Brain to an existing project without overwriting application code.

```bash
node packages/cli/dist/index.js adopt
node packages/cli/dist/index.js adopt --name solar-monitoring-dashboard
node packages/cli/dist/index.js adopt --dry-run
```

Adoption creates `.avipack/`, `avipack.config.yaml`, and `.avipack/reports/adoption-report.md`. If `README.md` already exists, it is skipped and reported instead of overwritten. Use `--force` only to refresh existing Avipack-owned files such as `.avipack/` and `avipack.config.yaml`.

## CLI Command Overview

Planned command surface:

```bash
avipack init
avipack adopt
avipack brain check
avipack bot list
avipack bot add <bot>
avipack bot enable <bot>
avipack bot disable <bot>
avipack bot run <bot>
avipack change new
avipack adr new
```

`avipack init` and `avipack adopt` are implemented for the `generic-brain-only` template. Other commands remain safe placeholders until their milestones.

## Brain Folder Overview

The generated brain lives under `.avipack`:

```txt
.avipack/
  brain/
  decisions/
  changes/
  agents/
  schemas/
  reports/
  avipack.lock
```

The brain is the source of truth for project intent, requirements, architecture, testing strategy, security rules, glossary, change history, and agent behavior.

## Bot Overview

Bots are separate packages and must be installed, enabled, and run under owner control. Installing a bot must not make it run automatically.

Initial planned bots:

- `@avipack/bot-brain`
- `@avipack/bot-architect`
- `@avipack/bot-builder`
- `@avipack/bot-guard`

## Repository Structure

```txt
packages/
  cli/
  core/
  bot-brain/
  bot-architect/
  bot-builder/
  bot-guard/
  templates/
docs/
examples/
```

## Development Setup

```bash
pnpm install
pnpm typecheck
pnpm build
```

This is a TypeScript, ESM, pnpm workspace monorepo.

If `pnpm` is not available but Node.js Corepack is installed, enable pnpm first or run commands through Corepack:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm build
```

## Roadmap Summary

- Phase 0: repository foundation, docs, CLI stubs, templates, bot manifests.
- Phase 1: working CLI MVP started with `avipack init`, brain generation, and basic checks.
- Phase 2: bot plugin lifecycle.
- Phase 3: conflict engine.
- Phase 4: starter pack expansion.
- Phase 5: IDE and GitHub integration.
- Phase 6: commercial and hosted product layer.

## Current Status

Avipack is in early MVP stage. The repository establishes structure, documentation, command design, templates, safe TypeScript stubs, and a working `avipack init` flow for the generic brain-only template.
