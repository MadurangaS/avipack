# Release Checklist

This checklist prepares Avipack for local release testing. Do not publish to npm yet.

## Pre-Release Checks

```bash
pnpm clean
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm verify
```

## Manual CLI Checks

```bash
avipack --help
avipack --version
avipack version
avipack doctor
avipack init --name ReleaseCheck
avipack brain check
avipack bot list
avipack change new --title "Release checklist change"
avipack adr new --title "Release checklist decision"
```

## Packaging Checks

```bash
pnpm pack:cli
tar -tzf packages/cli/avipack-0.1.0.tgz
```

Confirm the package contains the CLI `dist/`, `package.json`, and `README.md`.

Confirm it does not contain generated or local-only folders:

- `node_modules`
- unrelated package `dist` folders
- `.pnpm-store`
- `coverage`
- `__MACOSX`
- `.DS_Store`
- test temp files

## Git Hygiene

Before committing:

```bash
git status --short
git status --ignored --short
```

Do not commit:

- `node_modules`
- `dist`
- `.pnpm-store`
- `coverage`
- `__MACOSX`
- `.DS_Store`
- `*.tgz`

## Future npm Publish Checklist

Before publishing publicly:

1. Finalize license, author, and repository metadata.
2. Publish or otherwise package `@avipack/core`.
3. Verify `npm install -g avipack` from a clean environment.
4. Inspect tarball contents.
5. Run manual CLI checks from a separate folder.
6. Confirm no AI provider, background service, or autonomous bot behavior was added unintentionally.
