# Agent Instructions

Before making non-trivial changes in this repository:

1. Read `README.md`.
2. Read `docs/product-vision.md`.
3. Read `docs/architecture.md`.
4. Read `docs/brain-spec.md`.
5. Do not make large architectural changes without updating docs.
6. Keep bot logic plugin-based.
7. Do not hardcode all bots into the CLI.
8. Do not add external AI API calls yet.
9. Do not add secrets.
10. Prefer small, reviewable changes.
11. Update relevant docs when changing behavior.
12. Keep Avipack owner-controlled and manual by default.

## Current Product Stage

Avipack is in foundation mode. Favor clear scaffolding and documented extension points over complex runtime behavior.

## Safety Rules

- No telemetry.
- No background daemon.
- No autonomous bot execution.
- No hidden file modifications.
- No credentials in templates or docs.
