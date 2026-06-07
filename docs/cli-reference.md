# CLI Reference

All commands are owner-controlled and safe by default in the foundation stage.

## `avipack init`

Purpose: Create a new Avipack-ready project foundation.

Example:

```bash
avipack init --template generic-brain-only
```

Current MVP behavior: prints planned generation output.

Future behavior: copy starter files, apply template variables, and create config.

## `avipack adopt`

Purpose: Add Avipack Brain to an existing project.

Example:

```bash
avipack adopt
```

Current MVP behavior: prints planned adoption output.

Future behavior: detect project stack and add `.avipack` safely.

## `avipack brain check`

Purpose: Validate brain structure.

Example:

```bash
avipack brain check
```

Current MVP behavior: checks required paths.

Future behavior: validate schemas, traces, and conflicts.

## `avipack bot list`

Purpose: List known bots.

Current MVP behavior: prints built-in known bot metadata.

Future behavior: include installed and enabled state.

## `avipack bot add <bot>`

Purpose: Prepare or install a bot package.

Current MVP behavior: safe placeholder.

Future behavior: install package and record it in config or lock state.

## `avipack bot enable <bot>`

Purpose: Enable a previously added bot.

Current MVP behavior: safe placeholder.

Future behavior: update owner-controlled bot state.

## `avipack bot disable <bot>`

Purpose: Disable a bot.

Current MVP behavior: safe placeholder.

Future behavior: update owner-controlled bot state.

## `avipack bot run <bot>`

Purpose: Run a bot manually.

Current MVP behavior: safe placeholder.

Future behavior: invoke the bot after permission and enablement checks.

## `avipack change new`

Purpose: Create a change request.

Current MVP behavior: safe placeholder.

Future behavior: create numbered CR files from templates.

## `avipack adr new`

Purpose: Create an architecture decision record.

Current MVP behavior: safe placeholder.

Future behavior: create numbered ADR files from templates.
