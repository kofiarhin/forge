import assert from 'node:assert/strict';
import test from 'node:test';
import { ForgeService } from '../src/forge.js';
import { MemoryStore } from '../src/store.js';
import { createServer } from '../src/server.js';

const fixture = async () => {
  const service = new ForgeService(new MemoryStore());
  const project = await service.createProject({
    id: 'forge',
    name: 'Forge',
    repository: 'kofiarhin/forge',
    sourceRevision: 'abc123',
    authorityDocuments: ['docs/PRD.md', 'docs/TECHNICAL_SPEC.md']
  });
  return { service, project };
};

test('only approved ready work may run and completion requires passed verification', async () => {
  const { service, project } = await fixture();
  const work = await service.createWorkItem(project.id, {
    stableKey: 'forge:mvp',
    title: 'Implement MVP',
    status: 'ready',
    acceptanceCriteria: ['tests pass']
  });

  await assert.rejects(
    service.transitionWorkItem(work.id, { to: 'running', expectedSourceRevision: 'abc123' }),
    /Only approved ready tasks/
  );

  await service.approveWorkItem(work.id, {
    approvedBy: 'Kofi Arhin',
    authority: 'product owner',
    reason: 'Implement the approved Forge specification'
  });
  await service.transitionWorkItem(work.id, { to: 'running', expectedSourceRevision: 'abc123' });
  await service.transitionWorkItem(work.id, { to: 'verifying' });

  await assert.rejects(service.transitionWorkItem(work.id, { to: 'completed' }), /requires passed verification/);
  await service.addEvidence(work.id, { type: 'verification', outcome: 'passed', reference: 'node --test', command: 'npm test' });
  const completed = await service.transitionWorkItem(work.id, { to: 'completed' });
  assert.equal(completed.status, 'completed');
});

test('stable keys prevent duplicate active work and idempotency replays safely', async () => {
  const { service, project } = await fixture();
  const first = await service.createWorkItem(project.id, { stableKey: 'same', title: 'First' }, 'request-1');
  const replay = await service.createWorkItem(project.id, { stableKey: 'same', title: 'Ignored replay' }, 'request-1');
  assert.equal(replay.id, first.id);
  await assert.rejects(service.createWorkItem(project.id, { stableKey: 'same', title: 'Duplicate' }), /active work item/);
});

test('dependencies and source revisions are revalidated before execution', async () => {
  const { service, project } = await fixture();
  const dependency = await service.createWorkItem(project.id, { stableKey: 'dep', title: 'Dependency', status: 'ready', approved: true, approvedBy: 'Kofi' });
  const work = await service.createWorkItem(project.id, { stableKey: 'next', title: 'Next', status: 'ready', approved: true, approvedBy: 'Kofi', dependencies: [dependency.id] });

  await assert.rejects(service.transitionWorkItem(work.id, { to: 'running', expectedSourceRevision: 'wrong' }), /source revision/);
  await assert.rejects(service.transitionWorkItem(work.id, { to: 'running', expectedSourceRevision: 'abc123' }), /Incomplete dependencies/);
});

test('HTTP API exposes health and creates durable domain records', async (t) => {
  const service = new ForgeService(new MemoryStore());
  const server = createServer({ service });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const health = await fetch(`${base}/health`).then((response) => response.json());
  assert.equal(health.status, 'ok');

  const response = await fetch(`${base}/v1/projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': 'project-create' },
    body: JSON.stringify({ name: 'Forge', repository: 'kofiarhin/forge', sourceRevision: 'abc123' })
  });
  assert.equal(response.status, 201);
  const project = await response.json();
  assert.equal(project.repository, 'kofiarhin/forge');
});
