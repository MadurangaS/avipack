# Bot System

Bots are optional plugin packages. They extend Avipack but should not be hardcoded into the CLI as one large behavior set.

## Why Separate Packages

Separate packages keep bot capabilities optional, auditable, and permission-scoped. Project owners decide which bots to install, enable, and run.

## Lifecycle

1. List known bots.
2. Add a bot to project-local config.
3. Enable the bot explicitly.
4. Run the bot manually.
5. Review output.
6. Accept or reject any suggested changes.

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

## Permission Model

Each bot declares read and write scopes in its manifest. The current MVP enforces report writing to `.avipack/reports/**` for bot run and audit reports. Broader write-scope enforcement remains a future bot implementation concern.

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

| Bot | Role | Writes To | Should Not Do |
| --- | ---- | --------- | ------------- |
| AviBrain | Requirements, scope, glossary, change requests | `.avipack/brain/**`, `.avipack/changes/**` | Directly write application code |
| AviArchitect | Architecture, ADRs, boundaries, impact analysis | `.avipack/decisions/**`, `.avipack/reports/**` | Implement features |
| AviBuilder | Implementation planning and future controlled code generation | Future scoped project paths | Silently change architecture |
| AviGuard | QA, tests, review, conflict reports | `.avipack/reports/**` | Silently rewrite source code |

## Rules

- Bots must not run silently.
- Bots must not modify files outside allowed write scope.
- Installing a bot must not make it run automatically.
- Enabling a bot must not make it run automatically.
- Manual CLI execution is the only foundation-stage execution model.
- No background daemon, scheduled process, Git hook execution, OpenAI/API call, or autonomous bot execution exists in this milestone.
- Optional Git hooks, CI, and VS Code commands may be added later.
