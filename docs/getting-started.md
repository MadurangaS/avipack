# Getting Started

## Installation Idea

The intended user entry point is:

```bash
npx avipack init
```

During local development, use pnpm:

```bash
pnpm install
pnpm build
```

If `pnpm` is not installed directly, use Node.js Corepack:

```bash
corepack pnpm install
corepack pnpm -r build
```

## Local Development

Run type checks across packages:

```bash
pnpm typecheck
```

Build all packages:

```bash
pnpm build
```

## Initialize a Project

Future behavior:

```bash
avipack init --template generic-brain-only
```

This will copy the brain template into the target project and create `avipack.config.yaml`.

## Adopt an Existing Project

Future behavior:

```bash
avipack adopt
```

This will add only the Avipack Brain files without changing the application framework.

## Add Bots

Future behavior:

```bash
avipack bot add brain
avipack bot enable brain
avipack bot run brain
```

Bots remain manual by default.

## Run Brain Check

```bash
avipack brain check
```

The foundation-stage command checks for required `.avipack` paths. Future versions will validate YAML schemas and traceability.

## Example User Journey

1. Create or adopt a project.
2. Review `.avipack/brain/product-brief.md`.
3. Edit requirements and architecture files.
4. Record initial ADRs and change requests.
5. Run `avipack brain check`.
6. Add optional bots only when the owner wants manual assistance.
