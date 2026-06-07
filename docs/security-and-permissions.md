# Security and Permissions

Avipack is local-first and owner-controlled.

## No Secrets in Brain Files

Brain files must not store API keys, passwords, tokens, certificates, production credentials, or private customer data.

## No Telemetry in MVP

The MVP should not collect telemetry or call hosted services.

## Bot Permission Boundaries

Bots declare read and write scopes. Future versions should validate attempted writes against the manifest.

## Manual Execution Model

Bots run only when the owner explicitly invokes a command. No background daemon is included in the foundation.

## Future CI/CD and Git Hook Safety

CI workflows and Git hooks may be added later, but they must be opt-in and documented.

## Generated Project Safety

Generated projects should use examples and placeholders only. Credentials belong in environment-specific secret stores, not in Avipack Brain.
