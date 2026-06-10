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

Create local release tarballs:

```bash
pnpm release:pack
```

This writes coordinated tarballs under `.release/`:

```bash
tar -tzf .release/avipack-core-0.1.0.tgz
tar -tzf .release/avipack-0.1.0.tgz
```

The CLI source package uses `@avipack/core: workspace:*` for pnpm development. The release pack workflow stages the CLI package with a normal exact dependency on the local `@avipack/core` version, so the packed CLI artifact is installable by npm and does not expose `workspace:*`.

Because Avipack is not published to npm yet, install both local tarballs together when testing from a clean environment:

```bash
mkdir -p /tmp/avipack-local-install
npm install --prefix /tmp/avipack-local-install \
  /path/to/avipack/.release/avipack-core-0.1.0.tgz \
  /path/to/avipack/.release/avipack-0.1.0.tgz
/tmp/avipack-local-install/node_modules/.bin/avipack --help
```

## Clean Install Test

Run the automated release smoke test:

```bash
pnpm release:smoke
```

The smoke test builds and packs the local release artifacts, installs both tarballs into a clean temporary npm prefix, runs `avipack --help`, initializes a clean project with `avipack init --name InstallSmoke`, then runs `avipack doctor` and `avipack brain check`.

## Clean Source ZIP

Prefer Git archive:

```bash
git archive --format=zip --output avipack-source.zip HEAD
```

Or use ZIP excludes:

```bash
zip -r avipack-source.zip . -x "node_modules/*" "*/node_modules/*" "dist/*" "*/dist/*" ".pnpm-store/*" ".release/*" "__MACOSX/*" ".git/*" "*.tgz" ".DS_Store"
```

## Not Included Yet

- No hosted service.
- No LLM provider integration.
- No autonomous bots.
- No background execution.
- No npm publishing yet.
