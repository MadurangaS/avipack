# Bot System

Bots are optional controlled workflow-agent packages. They extend Avipack but should not be hardcoded into the CLI as one large behavior set.

Bots are intended to inspect project brain context, reason about maintenance needs, propose workflow steps, generate approved Avipack-managed artifacts, and help maintain project governance. They must remain explicit, permission-scoped, owner-controlled, auditable, and local-first.

## Why Separate Packages

Separate packages keep bot capabilities optional, auditable, and permission-scoped. Project owners decide which bots to install, enable, run, and eventually apply.

## Lifecycle

1. List known bots.
2. Add a bot to project-local config.
3. Enable the bot explicitly.
4. Run the bot manually.
5. Review output.
6. Accept or reject any suggested or generated Avipack-managed artifacts.

`avipack bot add <bot>` does not run the bot. `avipack bot enable <bot>` also does not run the bot. `avipack bot run <bot>` is the only manual execution command in this milestone.

The current MVP records known bots in `avipack.config.yaml`:

```yaml
bots:
  installed:
    - avipack.bot.brain
  enabled:
    - avipack.bot.brain
```

No npm package installation happens yet. The lifecycle is local project state plus audit reports under `.avipack/reports/bots/`.

## Current Implemented Behavior

Current foundation bots are manual and local. `avipack bot run <bot>` requires an installed and enabled bot by default, then runs through the shared workflow engine.

Current modes:

- Report mode: `avipack bot run <bot>` inspects local Avipack context and writes only a report under `.avipack/reports/bots/`.
- Dry-run mode: `avipack bot run <bot> --dry-run` inspects local Avipack context and writes nothing.
- Apply mode: `avipack bot run <bot> --apply` writes the report and approved generic `.avipack` workflow artifacts through safe-write validation.

Current bots do not perform bot-specific intelligence yet, call external AI providers, run in the background, install packages, or modify application source code. The current behavior is a foundation for controlled workflow agents, not the final bot product direction.

## Phase 2A Controlled Workflow Agents

Phase 2A bots may inspect local project and brain files, produce findings, plan actions, and create or update approved Avipack-managed artifacts under `.avipack/`. The shared engine and safe-write model are implemented; bot-specific AviBrain, AviArchitect, AviBuilder, and AviGuard workflows remain planned.

Approved Phase 2A artifact areas include:

- `.avipack/reports/bots/`
- `.avipack/tasks/`
- `.avipack/plans/`
- `.avipack/checklists/`
- `.avipack/drafts/`
- `.avipack/decisions/drafts/`
- `.avipack/changes/drafts/`
- `.avipack/brain/maintenance/`

Phase 2A bots must not modify application source code, tests, package scripts, public assets, docs, build configuration, dependency manifests, or any file outside approved `.avipack` paths. Application source-code modification remains blocked in Phase 2A.

## Future Possibilities

Future bot milestones may add richer AI-powered reasoning, source-aware recommendations, IDE adapters, CI integrations, or autonomous workflows. Those capabilities are not current behavior and must remain opt-in, permission-scoped, auditable, and documented before they are introduced.

## Permission Model

Each bot declares read and write scopes in its manifest. The current MVP enforces safe-write validation for approved `.avipack` artifact paths before workflow artifacts are written. Bot audit reports and run reports stay under `.avipack/reports/bots/`.

## Manifest Format

```ts
export const manifest = {
  id: "avipack.bot.brain",
  name: "AviBrain",
  packageName: "@avipack/bot-brain",
  version: "0.1.0",
  description: "Maintains project requirements, scope, glossary, and project memory.",
  permissions: {
    read: [".avipack/**", "docs/**"],
    write: [".avipack/brain/**", ".avipack/changes/**"]
  }
};
```

## Default Bots

| Bot | Role | Phase 2A Writes To | Should Not Do |
| --- | ---- | --------- | ------------- |
| AviBrain | Requirements, scope, glossary, change governance | `.avipack/brain/maintenance/**`, `.avipack/tasks/**`, `.avipack/checklists/**`, `.avipack/reports/bots/**` | Directly write application code |
| AviArchitect | Architecture, ADR readiness, boundaries, impact analysis | `.avipack/decisions/drafts/**`, `.avipack/plans/**`, `.avipack/checklists/**`, `.avipack/reports/bots/**` | Implement features or rewrite existing ADRs automatically |
| AviBuilder | Implementation planning aligned to brain context | `.avipack/plans/**`, `.avipack/tasks/**`, `.avipack/checklists/**`, `.avipack/reports/bots/**` | Create source code, tests, or package changes |
| AviGuard | QA, security governance, release risk, conflict warnings | `.avipack/checklists/**`, `.avipack/plans/**`, `.avipack/tasks/**`, `.avipack/reports/bots/**` | Modify tests, CI, or source code automatically |

## Rules

- Bots must not run silently.
- Bots must not modify files outside allowed write scope.
- Installing a bot must not make it run automatically.
- Enabling a bot must not make it run automatically.
- Manual CLI execution is the only foundation-stage execution model.
- Phase 2A bots may write only approved `.avipack` artifacts.
- Phase 2A bots must not modify application source code.
- No background daemon, scheduled process, Git hook execution, OpenAI/API call, or autonomous bot execution exists in this milestone.
- Optional Git hooks, CI, and VS Code commands may be added later.
