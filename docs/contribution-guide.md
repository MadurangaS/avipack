# Contribution Guide

## Setup

```bash
pnpm install
pnpm typecheck
pnpm build
```

If the direct `pnpm` command is unavailable, use:

```bash
corepack pnpm install
corepack pnpm -r typecheck
corepack pnpm -r build
```

## Coding Style

- Use TypeScript.
- Keep packages ESM.
- Prefer small, reviewable changes.
- Keep CLI code thin and user-facing.
- Put reusable logic in `@avipack/core`.

## Package Structure

- `packages/cli`: command definitions.
- `packages/core`: reusable project brain, config, template, and bot primitives.
- `packages/bot-*`: optional bot packages.
- `packages/templates`: starter pack files.

## Add a Command

1. Create a file in `packages/cli/src/commands`.
2. Export a `registerXCommand` function.
3. Register it in `packages/cli/src/index.ts`.
4. Put reusable behavior in `@avipack/core`.
5. Update `docs/cli-reference.md`.

## Add a Bot

1. Create `packages/bot-name`.
2. Export `manifest` and `run()`.
3. Add manifest metadata to the core registry when it is a known default bot.
4. Document permissions in `docs/bot-system.md`.

## Add a Starter Pack

1. Create a folder under `packages/templates`.
2. Add a README.
3. Add template files under `template/` when scaffolded.
4. Register it in `templateRegistry.ts`.
5. Update `docs/starter-packs.md`.

## Documentation Expectations

Behavior changes should update the README or docs in the same change. Architecture changes should include ADR updates when Avipack Brain is active.
