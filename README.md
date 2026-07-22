# Forge

Forge is an AI-powered software-organization concept for turning approved product ideas into verified software through specialized AI teams coordinated by Zoro.

## Repository status

This repository is currently a documentation scaffold. The audit performed on `main` found no application source, package manifest, tests, deployment configuration, API schema, or executable workflow. Nothing in this repository should therefore be described as implemented or production-ready yet.

## Intended operating model

Forge is expected to coordinate work across distinct stages:

1. approved idea and product context;
2. discovery and requirements clarification;
3. architecture and implementation planning;
4. isolated implementation by specialist agents;
5. automated and manual verification;
6. release preparation and durable context updates.

Zoro is the intended chief orchestrator. The exact runtime, persistence model, agent protocol, security boundary, and deployment topology remain design decisions rather than implemented capabilities.

## Documentation

- [Product requirements](docs/PRD.md)
- [Technical specification](docs/TECHNICAL_SPEC.md)

## Development

There is no runnable development environment yet. Before implementation begins, the project needs an approved technical stack, repository structure, data model, API contracts, authentication model, test strategy, and deployment target.

## Current limitations

- No code has been implemented.
- No commands, APIs, agents, queues, or integrations are executable.
- No CI or release workflow is configured.
- Product and technical decisions marked as open in the linked documents still require approval.

## Contribution rule

Do not treat proposed behavior as implemented. Changes should preserve Forge's approval-gated workflow and include verification evidence appropriate to the change.