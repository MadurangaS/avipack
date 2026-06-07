# Change Management

Avipack treats scope changes as first-class project events.

## Why Change Requests Exist

Requirements and architecture drift when changes are made informally. Change requests make the proposed change, impact, and validation plan explicit.

## Requirement Changes

When a requirement changes, the CR should state:

- Which requirement IDs are affected.
- Whether the change adds, modifies, or supersedes behavior.
- Which tests need updates.
- Whether an ADR is required.

## Impact Analysis

Future AviArchitect and AviGuard workflows will help identify impacted modules, tests, APIs, and docs.

## Example

```md
# CR-0002: Add User Authentication

## Status

Proposed

## Summary

Add username and password authentication for the web application.

## Linked Requirements

- REQ-010
- REQ-011

## Impact

Requires architecture review for session storage, security rules for password handling, and tests for login/logout behavior.
```
