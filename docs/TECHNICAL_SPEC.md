# Forge Technical Specification

## Status

Proposed architecture. The repository currently contains documentation only; none of the components below are implemented.

## Architectural principles

- Human approval for material decisions.
- Durable state over chat-only memory.
- Explicit separation of discovery, planning, execution, verification, and context maintenance.
- One project and repository scope per implementation unit.
- Evidence-backed completion.
- Least-privilege integration access.

## Proposed components

### Orchestrator

Receives approved work, resolves context, selects the next eligible task, delegates to specialists, and enforces transition rules. Zoro is the intended user-facing orchestrator, but the runtime integration is undecided.

### Project registry

Stores repository links, authority documents, approved decisions, current revisions, lifecycle, and reconciliation status.

### Run engine

Creates resumable runs containing audits, tasks, approvals, execution logs, verification evidence, and reports.

### Task state machine

Suggested states:

`proposed`, `ready`, `needs_discovery`, `needs_spec`, `needs_approval`, `blocked`, `running`, `verifying`, `completed`, `failed`, and `skipped`.

Only `ready` tasks may move into implementation. Completion requires verification evidence.

### Agent adapters

Provide constrained interfaces to architecture, coding, testing, documentation, security, and release agents. Each adapter should declare capabilities, required inputs, write scope, and expected evidence.

### Integration gateway

Wraps GitHub, Context API, Ideas Hub, deployment providers, and future tools. Credentials must be scoped and unavailable to prompts or logs.

### Evidence store

Records immutable or append-only events for transitions, source revisions, commands, test results, commits, pull requests, approvals, and context updates.

## Proposed data entities

- `Project`
- `AuthorityDocument`
- `Requirement`
- `WorkItem`
- `Run`
- `Task`
- `Approval`
- `ExecutionAttempt`
- `VerificationResult`
- `RepositoryChange`
- `ContextUpdate`

Every work item should have a stable key so separate runs cannot silently recreate the same active work.

## Execution flow

1. Resolve the project and repository revision.
2. Reconcile authority documents, implementation, open work, and prior runs.
3. Create or reuse stable work items.
4. Obtain missing discovery, specification, or approval.
5. Execute one eligible task in an isolated scope.
6. Verify against explicit acceptance criteria.
7. Persist evidence and update project context.
8. Advance only when dependencies and gates permit.

## Security requirements

- Secrets stored outside prompts, repositories, and logs.
- Per-integration and per-repository authorization.
- No force pushes or destructive production operations by default.
- Explicit approval for migrations, security-sensitive changes, direct-main commits, and releases.
- Input and output validation at every tool boundary.
- Audit trail for all mutations.

## Reliability requirements

- Idempotency keys for mutation requests.
- Optimistic concurrency for repository and state updates.
- Resumable interrupted runs.
- Retry only safe transient failures.
- Dead-letter or blocked state for failures requiring intervention.
- No completion state without required verification.

## Initial implementation slice

A practical first slice should support one GitHub repository, one durable project record, sequential tasks, explicit approvals, branch-and-PR execution, command/test evidence, and a final report. Multi-agent concurrency and production deployment should follow only after the state and security model is proven.

## Verification strategy

The future implementation should include state-machine unit tests, integration tests for repository mutations, authorization tests, interruption/recovery tests, duplicate-work tests, and an end-to-end controlled repository exercise.
