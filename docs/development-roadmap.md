# Development Roadmap

## Phase 0 - Repository Foundation

- Documentation.
- Monorepo structure.
- CLI stubs.
- Brain templates.
- Bot manifests.

## Phase 1 - CLI Foundation and Release Packaging

- `avipack init` with `generic-brain-only` template: implemented.
- Core-bundled template resolution: implemented.
- Brain file generation: implemented for MVP template.
- Basic template variables: implemented for project name.
- Brain check: implemented for required files, YAML parse validation, structured governance checks, duplicate ID detection, trace warnings, strict mode, report writing, and JSON output.
- `avipack adopt`: implemented for safe brain-only adoption.
- Project-local bot lifecycle MVP: implemented for list/add/enable/disable/manual run reports.
- Change request generation: implemented.
- ADR generation: implemented.
- Node test runner coverage: implemented for core and CLI MVP behavior.
- Installable local CLI readiness: implemented for CLI metadata, version command, doctor command, clean/verify scripts, coordinated core+CLI tarballs, and release smoke install checks.
- Release packaging: implemented for local two-tarball install workflow.

## Phase 2A - Controlled Bot Workflow Engine

- Shared local bot workflow engine: implemented foundation.
- Manual report, dry-run, and apply modes: implemented foundation.
- Safe-write validation for approved `.avipack` artifacts: implemented foundation.
- AviBrain, AviArchitect, AviBuilder, and AviGuard workflow artifacts.
- Block bot writes to application source code, tests, package scripts, public assets, docs, and paths outside approved `.avipack` locations.
- No external AI provider calls, background daemons, autonomous execution, or package installation during bot runs.

## Phase 2B - Conflict Engine

- Deeper requirement validation beyond the current governance checks.
- Architecture mismatch detection.
- API/test mapping.
- Report generation.

## Phase 3 - Starter Pack Expansion

- Next.js starter.
- Node API starter.
- FastAPI starter.
- Template variables.

## Phase 4 - Codex, Cursor, and IDE Adapters

- Codex adapter concepts.
- Cursor adapter concepts.
- VS Code extension concept.
- Local IDE commands that read Avipack Brain and respect permission boundaries.

## Phase 5 - npm Publish and Installers

- Public npm publish flow.
- Installer documentation.
- Clean install checks from public packages.
- GitHub Actions checks.
- PR brain validation.
- Optional Git hooks.
