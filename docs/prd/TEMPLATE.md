# PRD: <Feature Name>

## Problem Statement

The problem that the user is facing, from the user's perspective.

_What is the pain? Who experiences it? When does it happen?_

## Solution

The solution to the problem, from the user's perspective.

_How does this solve the problem? What does the user get?_

## User Stories

A comprehensive, numbered list of user stories. Each story must follow this format:

```
1. As a [who], I want to [what], so that [why]
```

### Examples

1. As a mobile bank customer, I want to see my account balance at a glance, so that I can make better-informed spending decisions
2. As a mobile bank customer, I want to receive push notifications for large transactions, so that I can detect fraud quickly
3. As a bank security team, I want to flag suspicious transactions automatically, so that we can prevent fraud before it completes

_Rules:_
- Write from the user's perspective, not the system's
- Be specific — "account balance" not just "data"
- Include the "why" — it drives priorities
- Cover happy paths AND edge cases
- Include error and recovery scenarios

## Implementation Decisions

Technical decisions made during planning:

### Modules

- [Module 1] — what it does, why it exists
- [Module 2] — what it does, why it exists

### Interfaces

- [Interface 1] — public API surface
- [Interface 2] — public API surface

### Data / Schema

- [Schema changes, if any]
- [Database migrations, if any]

### API Contracts

- `POST /api/resource` — description
- `GET /api/resource/:id` — description

### Architecture Decisions

- [Decision 1] — rationale
- [Decision 2] — rationale

_Notes:_
- Do NOT include specific file paths
- Do NOT include code snippets
- Focus on "what" and "why", not "how"

## Testing Decisions

### What Makes a Good Test

Tests should verify behavior through public interfaces, not implementation details.

- Test external behavior, not internal structure
- Tests survive refactors if they describe "what" not "how"
- Integration-style tests are preferred over unit tests for complex flows

### Modules to Test

- [Module 1] — what behaviors to verify
- [Module 2] — what behaviors to verify

### Prior Art

- Similar tests in `src/lib/feature-x/` — use as reference
- Similar tests in `src/components/feature-y/` — use as reference

## Out of Scope

Things explicitly NOT included in this PRD:

- [Item 1]
- [Item 2]

_Be specific. If it's ambiguous whether something is in scope, decide and document it here._

## Further Notes

Any additional context, constraints, or considerations:

- [Note 1]
- [Note 2]

---

_Generated from: `docs/prd/TEMPLATE.md`_
