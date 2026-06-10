# Release Checklist

This checklist prepares Avipack for local release testing. Do not publish to npm yet.

## Pre-Release Checks

```bash
pnpm clean
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm release:pack
pnpm release:smoke
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
pnpm release:pack
tar -tzf .release/avipack-core-0.1.0.tgz
tar -tzf .release/avipack-0.1.0.tgz
tar -xOf .release/avipack-0.1.0.tgz package/package.json
```

Confirm the core package contains `dist/`, `templates/`, `package.json`, and `README.md`.

Confirm the CLI package contains `dist/`, `package.json`, and `README.md`.

Confirm the packed CLI package uses a normal `@avipack/core` version range, not `workspace:*`.

## Release Smoke Test

```bash
pnpm release:smoke
```

The smoke test installs both local tarballs into a clean temporary npm prefix and runs:

- `avipack --help`
- `avipack init --name InstallSmoke`
- `avipack doctor`
- `avipack brain check`

Confirm it does not contain generated or local-only folders:

- `node_modules`
- unrelated package `dist` folders
- `.pnpm-store`
- `coverage`
- `.release`
- `__MACOSX`
- `.DS_Store`
- `*.tgz`
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
- `.release`
- `__MACOSX`
- `.DS_Store`
- `*.tgz`

## Future npm Publish Checklist

Before publishing publicly:

1. Finalize license, author, and repository metadata.
2. Publish `@avipack/core` before `avipack`, or keep using the coordinated two-tarball local workflow.
3. Verify `npm install -g avipack` from a clean environment after public publishing exists.
4. Inspect tarball contents.
5. Run manual CLI checks from a separate folder.
6. Confirm no AI provider, background service, or autonomous bot behavior was added unintentionally.
