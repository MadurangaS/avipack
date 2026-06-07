# Architecture

Avipack is a local-first TypeScript monorepo with a CLI package, core package, optional bot packages, and starter templates.

```mermaid
flowchart TD
  User[Developer] --> CLI[Avipack CLI]
  CLI --> Core[Avipack Core]
  Core --> Brain[Avipack Brain]
  Core --> Templates[Starter Packs]
  Core --> Bots[Optional Bot Plugins]
  Bots --> Reports[Reports and Suggested Changes]
```

## CLI Layer

`packages/cli` owns command registration, command help, argument parsing, and user-facing output. It should not hold deep bot logic or template implementation details.

## Core Layer

`packages/core` owns reusable primitives:

- Config loading.
- Brain creation/checking.
- Bot manifest types and registry helpers.
- Starter template registry.
- YAML validation.

## Template Layer

The MVP generic template is bundled inside `@avipack/core` under `packages/core/templates`. This lets the installed core package resolve the working `generic-brain-only` template without depending on the monorepo root.

`packages/templates` remains a workspace area for future starter-pack documentation and expansion. Future starter packs may become separate packages once template packaging and versioning need to scale.

## Bot Plugin Layer

Bots live in separate packages. Each bot exports a manifest and a `run()` function. The CLI can discover and invoke bots later, but bot behavior should remain permission-scoped and explicit.

## Brain Files

The brain stores project state and control documents:

- Requirements.
- Architecture.
- Domain model.
- Testing strategy.
- Security rules.
- Glossary.
- ADRs.
- Change requests.
- Agent rules.
- Reports.

## Extension Points

- Template variable substitution.
- Bot installation and enablement state.
- Permission validation.
- Conflict reports.
- CI and IDE integrations.
