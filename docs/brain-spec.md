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
    sprint-lock.yaml
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
- `sprint-lock.yaml`: optional sprint scope lock metadata used by validation.
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
    title: "Maintain project brain"
    statement: "The project shall maintain a versioned project brain that acts as the source of truth for AI-assisted development."
    status: approved
    priority: high
    version: 1
    owner: "project-owner"
    traces:
      architecture:
        - ARCH-001
      tests:
        - TEST-001
      changes:
        - CR-0001
      decisions:
        - ADR-0001
```

IDs should not be reused after removal. Superseded requirements should remain traceable.

Requirement records must include `id`, `title`, `statement`, `status`, `priority`, `version`, and `traces`. Supported statuses are `proposed`, `approved`, `in_progress`, `done`, `rejected`, and `deferred`. Supported priorities are `low`, `medium`, `high`, and `critical`.

## Architecture Components

Architecture records use component IDs for traceability:

```yaml
architecture:
  components:
    - id: ARCH-001
      name: "Avipack Core Engine"
      type: package
      description: "Reusable engine for brain creation, validation, config loading, bot lifecycle, ADRs, and change requests."
      responsibilities:
        - "Create and validate project brain files"
      related_requirements:
        - REQ-001
```

Component IDs must be unique. Unknown related requirement IDs are warnings.

## Testing Strategy

Testing strategy records use test case IDs:

```yaml
testing:
  strategy: "Node.js built-in test runner for CLI and core package validation."
  test_cases:
    - id: TEST-001
      title: "Brain initialization creates required files"
      type: unit
      related_requirements:
        - REQ-001
      command: "pnpm test"
```

Test IDs must be unique. Unknown related requirement IDs are warnings.

## Sprint Lock

Sprint lock prepares Avipack for future scope-change enforcement without adding Git diff enforcement yet:

```yaml
sprint_lock:
  status: unlocked
  active_sprint: null
  locked_requirements: []
  locked_architecture: []
  locked_tests: []
  notes:
    - "When locked, Avipack should warn before changing approved scope without a change request."
```

`status` must be `locked` or `unlocked`. When locked, `active_sprint` is required. Locked requirement IDs must reference known requirements.

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
