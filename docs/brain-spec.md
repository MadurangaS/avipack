# Brain Specification

Avipack Brain is the `.avipack` folder. It is the versioned source of truth for project scope, requirements, architecture, decisions, changes, tests, security, and agent behavior.

## Folder Structure

```txt
.avipack/
  brain/
    project.yaml
    product-brief.md
    requirements.yaml
    architecture.yaml
    domain-model.yaml
    testing-strategy.yaml
    security-rules.yaml
    glossary.yaml
  decisions/
  changes/
  agents/
  schemas/
  reports/
  avipack.lock
```

## File Responsibility

- `project.yaml`: project metadata and governance settings.
- `product-brief.md`: human-readable product intent.
- `requirements.yaml`: stable requirement records.
- `architecture.yaml`: system structure and boundaries.
- `domain-model.yaml`: core entities and relationships.
- `testing-strategy.yaml`: planned validation model.
- `security-rules.yaml`: local safety and permission rules.
- `glossary.yaml`: shared vocabulary.
- `decisions/`: ADRs.
- `changes/`: change requests.
- `agents/`: instructions for agents.
- `schemas/`: JSON Schemas for validation.
- `reports/`: generated review and conflict reports.

## Requirement IDs

Requirements use stable IDs:

```yaml
requirements:
  - id: REQ-001
    title: Bots must run only by explicit command
    status: accepted
```

IDs should not be reused after removal. Superseded requirements should remain traceable.

## ADR Strategy

ADRs use monotonic filenames:

```txt
ADR-0001-initial-architecture.md
```

Each ADR should include status, context, decision, and consequences.

`avipack adr new` creates the next numbered ADR file under `.avipack/decisions/` and does not overwrite existing files.

## Change Request Strategy

Change requests use monotonic filenames:

```txt
CR-0002-add-authentication.md
```

Each CR should explain scope, linked requirements, impact, and validation expectations.

`avipack change new` creates the next numbered CR file under `.avipack/changes/` and does not overwrite existing files.

## Test Mapping Strategy

Every major feature should be traceable:

```txt
Requirement -> Architecture -> API/Module -> Test -> Change Request
```

Future conflict checks will report missing links and mismatches.

## Conflict Detection Concept

The conflict engine will compare structured brain data with code and tests. Examples:

- Requirement exists with no planned test.
- ADR says one database, implementation uses another.
- Change request modifies scope without requirement updates.
- Bot proposes writes outside its permission scope.
