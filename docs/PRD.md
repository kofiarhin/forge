# Forge Product Requirements

## Status

Draft derived from the repository's stated product direction. This document describes intended outcomes; it is not evidence of implementation.

## Product summary

Forge is intended to operate as an approval-gated AI software organization. It should transform approved ideas into implementation-ready plans and verified software while preserving human authority over scope, security-sensitive decisions, migrations, releases, and other material changes.

## Problem

AI-assisted software delivery often loses context between discovery, planning, implementation, and verification. Work can begin without approval, duplicate existing work, mix unrelated repositories, or report completion without durable evidence.

## Goals

- Maintain a traceable path from approved intent to verified output.
- Coordinate specialist agents without removing human approval gates.
- Keep repositories, tasks, decisions, evidence, and project context isolated and auditable.
- Prevent proposed work from being represented as implemented.
- Preserve resumable execution state across tools and sessions.

## Primary users

- Product owner approving goals and material decisions.
- Orchestrator coordinating discovery and execution.
- Specialist agents performing architecture, implementation, testing, security review, and release preparation.
- Reviewer validating evidence and deciding whether work may progress.

## Core capabilities

1. Ingest an approved project or work request.
2. Resolve project context and source-of-truth documents.
3. Produce a shared-understanding handoff when requirements are incomplete.
4. Build a durable dependency-ordered task queue.
5. Enforce task status and approval gates.
6. Execute eligible work in isolated repositories and branches unless direct-main work is explicitly authorized.
7. Capture verification evidence, commits, pull requests, risks, and remaining work.
8. Update durable project context only after verification.

## Non-goals for the first implementation

- Fully autonomous approval of product scope or security decisions.
- Unrestricted production deployment.
- Silent migrations or breaking changes.
- Cross-project commits or branches.
- Treating generated plans as proof that functionality exists.

## Functional requirements

- Every task has a stable identity, project association, status, dependencies, approval state, and verification requirements.
- Only approved, ready tasks may enter implementation.
- Source revisions are revalidated before execution.
- Execution records changed files, commands, outcomes, risks, and evidence.
- Failed, blocked, skipped, and approval-gated work remains explicit and resumable.
- Human decisions are recorded without being inferred from code or agent output.

## Quality requirements

- Deterministic state transitions.
- Idempotent task processing where practical.
- Least-privilege credentials and secret redaction.
- Repository isolation.
- Auditable event history.
- Recovery after interrupted runs.

## Success criteria

An initial release is successful when one approved project can move from discovery through an isolated verified change, with every decision, task transition, repository revision, test result, and context update traceable from a durable run record.

## Open decisions

- Runtime and language.
- Persistence and event model.
- Agent communication protocol.
- Queue and concurrency model.
- Authentication and authorization.
- Supported repository providers and deployment targets.
- Relationship between Forge, Zoro, Architect, Ideas Hub, and Context API.
