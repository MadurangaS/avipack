# Avipack

Avipack is a local CLI project starter and project-brain system for controlled human and AI-assisted software development.

The current release candidate creates or adopts projects with a versioned project brain, structured requirements, ADRs, change requests, agent rules, manual bot state, governance validation, and local reports. Controlled bot workflow agents, deeper conflict checking between requirements, architecture, APIs, tests, and implementation, and source-aware planning are planned for future milestones.

## Why Avipack Exists

Normal project starters generate files and then disappear. AI coding prompts often explain intent once and then get lost as the project changes. Avipack is designed to keep the operating context of a project visible and versioned from day one.

The core idea is simple: the project should carry its own memory. Humans and AI agents should be able to read the same requirements, decisions, constraints, and change history before modifying code.

## Key Concepts

- **Avipack CLI**: the owner-controlled command line interface.
- **Avipack Brain**: the `.avipack` folder that stores requirements, architecture, change requests, ADRs, security rules, testing strategy, and agent rules.
- **Starter Packs**: templates for creating new projects or adding only the brain to existing projects.
- **Bots**: optional controlled workflow-agent packages that are manual, permission-scoped, owner-controlled, and local-first.
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

Current package-style usage after release tarballs are created:

```bash
pnpm release:pack
pnpm release:smoke
```

Current local CLI usage after building:

```bash
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js --version
node packages/cli/dist/index.js version
node packages/cli/dist/index.js doctor
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
avipack doctor
avipack version
```

`avipack init` and `avipack adopt` are implemented for the `generic-brain-only` template. Bot lifecycle commands, structured governance brain checks, change request generation, ADR generation, local release packing, and release smoke installation now have local MVP behavior.

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

Bots are separate packages and are intended to become controlled project workflow agents. They should eventually inspect, reason about, propose, generate, and maintain Avipack-managed artifacts while staying explicit, permission-scoped, owner-controlled, and local-first.

In the current MVP, `avipack bot add <bot>` records the known bot in the project-local `avipack.config.yaml`; it does not install npm packages and does not run the bot. `avipack bot enable <bot>` only updates owner-controlled enabled state. `avipack bot run <bot>` is manual and supports report, dry-run, and apply modes without AI provider calls or application source changes.

The Phase 2A foundation now includes a shared workflow engine and safe-write model. Default bot runs write only execution reports under `.avipack/reports/bots/`; dry-runs write nothing; apply mode can write approved Avipack-managed artifacts under `.avipack/`, such as drafts and reports. Bot-specific maintenance intelligence is still planned for later Phase 2A steps. Phase 2A bots must not modify application source code, tests, package scripts, public assets, or other non-`.avipack` project files.

Future AI-powered or autonomous capabilities are not part of the current release candidate or Phase 2A. Any future automation must remain opt-in, permission-scoped, auditable, and documented.

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
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm verify
```

This is a TypeScript, ESM, pnpm workspace monorepo.

If `pnpm` is not available but Node.js Corepack is installed, enable pnpm first or run commands through Corepack:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm build
```

Useful local CLI checks after building:

```bash
node packages/cli/dist/index.js --help
mkdir -p /tmp/avipack-demo
cd /tmp/avipack-demo
node /path/to/avipack/packages/cli/dist/index.js init --name DemoProduct
node /path/to/avipack/packages/cli/dist/index.js brain check --report
node /path/to/avipack/packages/cli/dist/index.js bot list
node /path/to/avipack/packages/cli/dist/index.js bot add brain
node /path/to/avipack/packages/cli/dist/index.js bot enable brain
node /path/to/avipack/packages/cli/dist/index.js bot run brain
node /path/to/avipack/packages/cli/dist/index.js change new --title "Add authentication flow"
node /path/to/avipack/packages/cli/dist/index.js adr new --title "Use PostgreSQL for relational data"
```

Local release packaging checks:

```bash
pnpm clean
pnpm release:pack
pnpm release:smoke
tar -tzf .release/avipack-0.1.0.tgz
tar -tzf .release/avipack-core-0.1.0.tgz
```

`release:pack` creates installable local tarballs for both `@avipack/core` and `avipack`. The CLI release tarball is staged with a normal `@avipack/core` version range so it does not expose `workspace:*` dependencies.

Avipack is not published to npm yet. There is no hosted service, LLM provider integration, autonomous bot execution, background daemon, scheduler, Git hook execution, source-code-modifying bot, or sprint diff enforcement in this milestone.

## Clean Source ZIP

Prefer `git archive` when sharing source so ignored generated folders are excluded automatically:

```bash
git archive --format=zip --output avipack-source.zip HEAD
```

If creating a ZIP directly from the working tree, exclude generated and local-only folders:

```bash
zip -r avipack-source.zip . -x "node_modules/*" "*/node_modules/*" "dist/*" "*/dist/*" ".pnpm-store/*" ".release/*" "__MACOSX/*" ".git/*" "*.tgz" ".DS_Store"
```

## Roadmap Summary

- Phase 0: repository foundation, docs, CLI stubs, templates, bot manifests.
- Phase 1: CLI foundation, brain generation, governance validation, bot lifecycle state, and local release packaging.
- Phase 2A: controlled bot workflow engine for approved `.avipack` artifacts only.
- Phase 2B: conflict engine.
- Phase 3: starter pack expansion.
- Phase 4: Codex, Cursor, and IDE adapters.
- Phase 5: npm publishing and installers.

## Current Status

Avipack is in release-candidate foundation stage. The repository establishes local CLI behavior, documentation, command design, templates, structured brain validation, manual bot lifecycle state, local install packaging, and a Phase 2A safe bot workflow foundation. Bot-specific workflow intelligence is planned for later Phase 2A steps.
