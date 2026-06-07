# Installation

Avipack is currently a local CLI product. It is not published to npm yet.

## From Source

```bash
corepack enable
pnpm install
pnpm build
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js --version
node packages/cli/dist/index.js doctor
```

## Global Link During Development

Use the CLI workspace package name:

```bash
pnpm --filter avipack link --global
avipack --help
avipack --version
avipack doctor
```

To remove the link later:

```bash
pnpm --filter avipack unlink --global
```

## Local Package Tarball

Create a local CLI tarball:

```bash
pnpm build
pnpm pack:cli
```

The tarball is written from `packages/cli` and should be inspected before use:

```bash
tar -tzf packages/cli/avipack-0.1.0.tgz
```

Because this monorepo has not published `@avipack/core` to npm yet, a standalone global install of the CLI tarball is a release-readiness check, not the final public install path. The next publish milestone should either publish `@avipack/core` first or provide a coordinated local install workflow for both tarballs.

## Clean Install Test

Use a temporary folder:

```bash
mkdir -p /tmp/avipack-install-test
cd /tmp/avipack-install-test
node /path/to/avipack/packages/cli/dist/index.js init --name InstallTest
node /path/to/avipack/packages/cli/dist/index.js doctor
node /path/to/avipack/packages/cli/dist/index.js brain check
```

## Clean Source ZIP

Prefer Git archive:

```bash
git archive --format=zip --output avipack-source.zip HEAD
```

Or use ZIP excludes:

```bash
zip -r avipack-source.zip . -x "node_modules/*" "*/node_modules/*" "dist/*" "*/dist/*" ".pnpm-store/*" "__MACOSX/*" ".git/*"
```

## Not Included Yet

- No hosted service.
- No LLM provider integration.
- No autonomous bots.
- No background execution.
- No npm publishing yet.
