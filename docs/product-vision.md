# Product Vision

Avipack is a local-first project starter, project-brain system, and controlled workflow-agent foundation for AI-assisted development. It keeps project context, scope, requirements, decisions, and future bot workflows controlled from day one.

## Problem

Software projects lose context quickly. Requirements drift, architecture decisions are forgotten, AI coding sessions lack durable memory, and change requests often arrive without impact analysis. Traditional starters help only at the first commit.

## Difference From Normal Project Starters

Normal starters generate an app skeleton. The current Avipack CLI generates and validates a local project brain: requirements, ADRs, change tracking, agent rules, schemas, and reports. Future milestones add controlled bot workflows, deeper conflict analysis, and broader starter packs.

## Difference From AI Prompt Files

Prompt files are usually informal and incomplete. Avipack treats project memory as structured, versioned project data. Requirements can be traced to architecture, modules, tests, and change requests.

## Human + AI Development Model

Avipack assumes humans own the project. Agents and bots may help, but they must act through explicit commands, respect permissions, and leave traceable output.

Avipack bots are intended to be controlled workflow agents, not passive report generators. They should eventually inspect, reason, propose, generate, and maintain Avipack-managed artifacts while staying local-first and owner-controlled.

## Core Value Proposition

Avipack lets teams and solo developers start with professional governance without introducing a hosted platform, database, cloud service, telemetry, or autonomous agent runtime.

## Target Users

- Developers starting new projects.
- Teams adopting AI coding assistants.
- Maintainers who need controlled project context.
- Consultants who need repeatable project foundations.
- Open-source maintainers who want durable contribution context.

## MVP Scope

The current MVP focuses on local CLI behavior, brain generation, structured validation, local release packaging, starter templates, manual bot lifecycle execution, and a safe bot workflow foundation with report, dry-run, and apply modes.

Phase 2A focuses on controlled bot workflow agents that may create or update approved artifacts under `.avipack/`. The shared workflow engine and safe-write model are implemented; bot-specific workflow intelligence remains planned. Phase 2A bots must not modify application source code, tests, package scripts, public assets, or other non-`.avipack` project files.

## Long-Term Direction

Future versions may add AI-powered assistance, autonomous or semi-autonomous workflows, a conflict engine, template variables, IDE commands, GitHub checks, team dashboards, hosted reports, organization templates, and audit trails. These are future possibilities, not current release-candidate behavior.
