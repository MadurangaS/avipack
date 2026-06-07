# ADR-0001: Initial Architecture

## Status

Accepted

## Context

The project needs a durable source of truth that humans and coding agents can use before changing implementation details.

## Decision

Use `.avipack` as the project brain. Store requirements, architecture, domain model, testing strategy, security rules, glossary, change requests, ADRs, agent rules, schemas, reports, and lock data in that folder.

## Consequences

- Project context is inspectable and versionable.
- Agents have explicit rules and boundaries.
- Future validation can trace Requirement -> Architecture -> API/Module -> Test -> Change Request.
