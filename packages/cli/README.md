# avipack

Command-line interface for Avipack.

The publishable CLI package exposes the `avipack` executable and delegates reusable project brain behavior to `@avipack/core`.

Implemented local MVP commands include:

- `avipack init`
- `avipack adopt`
- `avipack brain check`
- `avipack bot list`
- `avipack bot add <bot>`
- `avipack bot enable <bot>`
- `avipack bot disable <bot>`
- `avipack bot run <bot>`
- `avipack change new`
- `avipack adr new`
- `avipack doctor`
- `avipack version`

Bots are owner-controlled. Adding or enabling a bot does not run it, and the current run command writes a project-local report only.

Local checks:

```bash
node dist/index.js --help
node dist/index.js --version
node dist/index.js doctor
```
