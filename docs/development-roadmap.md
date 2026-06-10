# Development Roadmap

## Phase 0 - Repository Foundation

- Documentation.
- Monorepo structure.
- CLI stubs.
- Brain templates.
- Bot manifests.

## Phase 1 - Working CLI MVP

- `avipack init` with `generic-brain-only` template: implemented.
- Core-bundled template resolution: implemented.
- Brain file generation: implemented for MVP template.
- Basic template variables: implemented for project name.
- Brain check: implemented for required files, YAML parse validation, structured governance checks, duplicate ID detection, trace warnings, strict mode, report writing, and JSON output.
- `avipack adopt`: implemented for safe brain-only adoption.
- Project-local bot lifecycle MVP: implemented for list/add/enable/disable/run reports.
- Change request generation: implemented.
- ADR generation: implemented.
- Node test runner coverage: implemented for core and CLI MVP behavior.
- Installable local CLI readiness: implemented for CLI metadata, version command, doctor command, clean/verify scripts, coordinated core+CLI tarballs, and release smoke install checks.
- Public npm publishing: pending.
- Advanced conflict engine: pending.
- Additional starter packs: pending.

## Phase 2 - Bot Plugin MVP

- Real package installation for optional bots.
- Scoped bot implementations beyond report-only MVP.
- Deeper bot permission validation.

## Phase 3 - Conflict Engine

- Deeper requirement validation beyond the current governance checks.
- Architecture mismatch detection.
- API/test mapping.
- Report generation.

## Phase 4 - Starter Pack Expansion

- Next.js starter.
- Node API starter.
- FastAPI starter.
- Template variables.

## Phase 5 - IDE and GitHub Integration

- VS Code extension concept.
- GitHub Actions checks.
- PR brain validation.
- Optional Git hooks.

## Phase 6 - Commercial/Product Layer

- Team dashboard.
- Hosted brain reports.
- Organization templates.
- Governance and audit trail.
