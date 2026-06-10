# Security and Permissions

Avipack is local-first and owner-controlled.

## No Secrets in Brain Files

Brain files must not store API keys, passwords, tokens, certificates, production credentials, or private customer data.

## No Telemetry in MVP

The MVP should not collect telemetry or call hosted services.

## Bot Permission Boundaries

Bots declare read and write scopes. Current foundation bots are manual and local. Bot report mode writes reports under `.avipack/reports/bots/`, dry-run mode writes nothing, and apply mode uses safe-write validation before writing approved `.avipack` artifacts.

Phase 2A bots are controlled workflow agents. They may create or update only approved Avipack-managed artifacts under `.avipack/`, such as reports, tasks, plans, checklists, drafts, and brain maintenance notes. Phase 2A bots must not modify application source code, tests, package scripts, public assets, docs, dependency manifests, or any path outside approved `.avipack` locations.

Future versions should validate attempted writes against the manifest and safe-write rules before any bot-generated artifact is written.

## Manual Execution Model

Bots run only when the owner explicitly invokes a command. No background daemon is included in the foundation.

Installing or enabling a bot must never cause it to run. Phase 2A apply-style behavior must remain an explicit owner action.

## Future CI/CD and Git Hook Safety

CI workflows and Git hooks may be added later, but they must be opt-in and documented.

## Generated Project Safety

Generated projects should use examples and placeholders only. Credentials belong in environment-specific secret stores, not in Avipack Brain.
