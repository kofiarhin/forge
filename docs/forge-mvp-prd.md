# Forge MVP Product Requirements Document

**Product:** Forge  
**Owner:** Kofi Arhin  
**Status:** Approved  
**Approved by:** Kofi Arhin  
**Approval date:** 2026-07-21  
**Repository:** https://github.com/kofiarhin/forge

## Product Summary

Forge is an AI-powered software organization that transforms approved ideas into production-ready software through specialized AI teams coordinated by Zoro.

## Vision

Enable a single founder to operate with the capabilities of a complete software company.

## Mission

Transform ideas into production-ready software using:

- shared persistent memory;
- clear authority boundaries;
- human approval gates;
- independent verification;
- auditable evidence; and
- stop-on-failure workflows.

## MVP Goal

Prove that one approved feature can move through the complete Forge lifecycle without the founder manually coordinating every transition:

`Idea → Discovery → Architecture/Specification → Human Approval → Ready → Builder → Reviewer → QA → Legal when applicable → Release Decision → Marketing → SEO → Context API Update → Completed`

## Core Components

### Orchestration and Memory

- **Zoro** — Chief Orchestrator
- **Context API** — shared memory and system of record

### Engineering

- Architect
- Builder
- Reviewer
- QA

### Business

- Legal

### Growth

- Marketing
- SEO

## Module Contract Requirements

Every Forge module must define:

- purpose;
- responsibilities;
- inputs;
- outputs;
- permissions;
- prohibited actions;
- entry conditions;
- exit conditions;
- required evidence;
- failure behavior; and
- dependencies.

## Agent Responsibilities

### Architect

The Architect produces:

- approved specifications;
- architecture decisions;
- acceptance criteria;
- task breakdowns;
- risks; and
- dependencies.

### Builder

The Builder may execute only tasks marked `ready`.

The Builder must:

- work on one scoped task;
- use one owner, branch, and workflow per task;
- make minimal scoped changes;
- run tests; and
- produce commit and pull-request evidence.

The Builder may not:

- commit directly to `main` without explicit authorization;
- self-approve;
- self-merge;
- perform unrelated refactoring; or
- mark its own work completed.

### Reviewer

The Reviewer independently assesses:

- correctness;
- architecture compliance;
- maintainability;
- security; and
- test quality.

Material unresolved findings block approval.

### QA

QA independently verifies:

- acceptance criteria;
- automated and manual tests;
- regressions; and
- edge cases.

Unmet criteria fail the workflow.

### Legal

Legal performs first-pass review of:

- privacy;
- policies and terms;
- licensing;
- dependencies;
- copyright; and
- product and marketing claims.

Legal must label uncertainty and escalate matters requiring qualified counsel.

### Marketing

Marketing creates truthful launch assets only for capabilities that are:

- QA verified;
- released; or
- explicitly release-approved.

### SEO

SEO improves discoverability using truthful, approved content.

Misleading claims and keyword stuffing are prohibited.

## Status Model

Forge uses the following logical statuses:

- `proposed`
- `needs_discovery`
- `needs_spec`
- `needs_approval`
- `ready`
- `running`
- `verifying`
- `blocked`
- `completed`
- `failed`
- `skipped`

Only `ready` work may execute.

## Approval and Workflow Rules

- Human approval is required before implementation.
- The Builder cannot approve or complete its own work.
- The required engineering order is `Builder → Reviewer → QA → Completed`.
- A stage may be skipped only when the approved specification marks it not applicable or the user explicitly authorizes the skip.
- The reason for every skip must be recorded.
- Failures stop prohibited downstream work.
- Missing required evidence blocks transitions.
- Agents must retrieve current Context API state before acting.
- Agents must use minimum necessary permissions.
- Scope may not be expanded silently.
- Conflicts and uncertainty must be escalated.

## Definition of Done

Work is complete only when:

- scope is clear;
- the specification is approved;
- tasks are ready;
- implementation evidence exists;
- test evidence exists;
- commit and pull-request evidence exists;
- Reviewer approval exists;
- QA has passed;
- Legal review is complete when applicable;
- release status is recorded;
- product and marketing claims are verified;
- durable Context API updates are complete;
- remaining risks and follow-up work are documented; and
- completion status is successfully persisted.

## MVP Exclusions

The MVP excludes:

- Sales;
- Finance;
- Human resources;
- Customer support;
- multi-builder or distributed execution;
- automatic deployment;
- autonomous release;
- self-merging;
- cost optimization;
- advanced analytics;
- multi-project scheduling;
- multiple source-control providers;
- fully autonomous legal approval; and
- fully autonomous security approval.

## MVP Acceptance Criteria

The MVP is successful when one approved feature completes the governed lifecycle and produces traceable evidence for each applicable stage without manual coordination of every transition.

At minimum, the demonstration must prove:

1. current Context API state is retrieved before work begins;
2. an approved specification produces one or more `ready` tasks;
3. only a `ready` task is assigned to Builder;
4. Builder works on an isolated branch and produces implementation, test, commit, and pull-request evidence;
5. Reviewer independently approves or blocks the work;
6. QA independently verifies the acceptance criteria and regressions;
7. Legal is completed or explicitly recorded as not applicable;
8. a human-controlled release decision is recorded;
9. Marketing and SEO use only verified, approved claims;
10. durable Context API records are updated; and
11. the final `completed`, `failed`, `blocked`, or `skipped` outcome is persisted with evidence.

## Current Implementation State

Approval of this PRD does not authorize source-code implementation by itself.

Before implementation begins, Forge still requires:

- repository-local module contracts;
- an approved Context API data model for Forge records and relationships;
- task-transition and evidence schemas;
- agent authority and permission boundaries;
- an approved specification for the first end-to-end demonstration; and
- implementation tasks explicitly marked `ready`.

## Provenance

This repository-local PRD is based on the Forge project record stored in the Context API and the associated unavailable source-document reference:

`file:file_00000000427081f4bb6cc113d7bdc3b6`

The Context API database version was explicitly approved by Kofi Arhin on 2026-07-21. This document is the repository-local authority for the Forge MVP once merged.
