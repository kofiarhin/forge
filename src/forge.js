import { randomUUID } from 'node:crypto';
import { assertTransition } from './state-machine.js';

export class ForgeError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'ForgeError';
    this.code = code;
    this.status = status;
  }
}

const requiredString = (value, name) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ForgeError('invalid_request', `${name} is required`);
  }
  return value.trim();
};

const now = () => new Date().toISOString();
const appendEvent = (state, event) => {
  state.events.push({ id: randomUUID(), occurredAt: now(), ...event });
};

export class ForgeService {
  constructor(store) {
    this.store = store;
  }

  async snapshot() {
    return this.store.read();
  }

  async createProject(input, idempotencyKey) {
    return this.store.transaction((state) => {
      if (idempotencyKey && state.idempotency[idempotencyKey]) {
        return state.projects[state.idempotency[idempotencyKey]];
      }
      const repository = requiredString(input.repository, 'repository');
      const name = requiredString(input.name, 'name');
      const id = input.id ?? randomUUID();
      if (state.projects[id]) throw new ForgeError('conflict', 'Project already exists', 409);
      const project = {
        id,
        name,
        repository,
        sourceRevision: requiredString(input.sourceRevision, 'sourceRevision'),
        authorityDocuments: Array.isArray(input.authorityDocuments) ? input.authorityDocuments : [],
        lifecycle: 'active',
        createdAt: now(),
        updatedAt: now()
      };
      state.projects[id] = project;
      if (idempotencyKey) state.idempotency[idempotencyKey] = id;
      appendEvent(state, { type: 'project.created', projectId: id, evidence: { repository, sourceRevision: project.sourceRevision } });
      return project;
    });
  }

  async createWorkItem(projectId, input, idempotencyKey) {
    return this.store.transaction((state) => {
      const project = state.projects[projectId];
      if (!project) throw new ForgeError('not_found', 'Project not found', 404);
      if (idempotencyKey && state.idempotency[idempotencyKey]) {
        return state.workItems[state.idempotency[idempotencyKey]];
      }
      const stableKey = requiredString(input.stableKey, 'stableKey');
      const duplicate = Object.values(state.workItems).find((item) => item.projectId === projectId && item.stableKey === stableKey && !['completed', 'skipped'].includes(item.status));
      if (duplicate) throw new ForgeError('duplicate_work', 'An active work item already uses this stable key', 409);
      const id = randomUUID();
      const workItem = {
        id,
        projectId,
        stableKey,
        title: requiredString(input.title, 'title'),
        description: input.description ?? '',
        status: input.status ?? 'proposed',
        approved: input.approved === true,
        approval: input.approved === true ? { approvedBy: requiredString(input.approvedBy, 'approvedBy'), approvedAt: now() } : null,
        dependencies: Array.isArray(input.dependencies) ? input.dependencies : [],
        acceptanceCriteria: Array.isArray(input.acceptanceCriteria) ? input.acceptanceCriteria : [],
        sourceRevision: project.sourceRevision,
        attempts: [],
        evidence: [],
        createdAt: now(),
        updatedAt: now()
      };
      state.workItems[id] = workItem;
      if (idempotencyKey) state.idempotency[idempotencyKey] = id;
      appendEvent(state, { type: 'work_item.created', projectId, workItemId: id, evidence: { stableKey, status: workItem.status } });
      return workItem;
    });
  }

  async transitionWorkItem(id, input) {
    return this.store.transaction((state) => {
      const item = state.workItems[id];
      if (!item) throw new ForgeError('not_found', 'Work item not found', 404);
      const project = state.projects[item.projectId];
      if (input.expectedSourceRevision && input.expectedSourceRevision !== project.sourceRevision) {
        throw new ForgeError('source_revision_changed', 'Project source revision no longer matches', 409);
      }
      const unmet = item.dependencies.filter((dependencyId) => state.workItems[dependencyId]?.status !== 'completed');
      if (input.to === 'running' && unmet.length > 0) {
        throw new ForgeError('dependencies_incomplete', `Incomplete dependencies: ${unmet.join(', ')}`, 409);
      }
      assertTransition({ task: item, to: input.to, evidence: item.evidence });
      const from = item.status;
      item.status = input.to;
      item.updatedAt = now();
      appendEvent(state, { type: 'work_item.transitioned', projectId: item.projectId, workItemId: id, evidence: { from, to: input.to, reason: input.reason ?? null } });
      return item;
    });
  }

  async approveWorkItem(id, input) {
    return this.store.transaction((state) => {
      const item = state.workItems[id];
      if (!item) throw new ForgeError('not_found', 'Work item not found', 404);
      item.approved = true;
      item.approval = { approvedBy: requiredString(input.approvedBy, 'approvedBy'), authority: requiredString(input.authority, 'authority'), reason: requiredString(input.reason, 'reason'), approvedAt: now() };
      item.updatedAt = now();
      appendEvent(state, { type: 'work_item.approved', projectId: item.projectId, workItemId: id, evidence: item.approval });
      return item;
    });
  }

  async addEvidence(id, input) {
    return this.store.transaction((state) => {
      const item = state.workItems[id];
      if (!item) throw new ForgeError('not_found', 'Work item not found', 404);
      const evidence = {
        id: randomUUID(),
        type: requiredString(input.type, 'type'),
        outcome: input.outcome ?? null,
        reference: requiredString(input.reference, 'reference'),
        command: input.command ?? null,
        details: input.details ?? null,
        recordedAt: now()
      };
      item.evidence.push(evidence);
      item.updatedAt = now();
      appendEvent(state, { type: 'evidence.recorded', projectId: item.projectId, workItemId: id, evidence });
      return evidence;
    });
  }

  async createRun(projectId, input) {
    return this.store.transaction((state) => {
      const project = state.projects[projectId];
      if (!project) throw new ForgeError('not_found', 'Project not found', 404);
      const taskIds = Array.isArray(input.taskIds) ? input.taskIds : [];
      const invalid = taskIds.filter((id) => state.workItems[id]?.projectId !== projectId);
      if (invalid.length) throw new ForgeError('invalid_task_scope', 'Every run task must belong to the project');
      const id = randomUUID();
      const run = { id, projectId, status: 'created', sourceRevision: project.sourceRevision, taskIds, createdAt: now(), updatedAt: now(), report: null };
      state.runs[id] = run;
      appendEvent(state, { type: 'run.created', projectId, runId: id, evidence: { taskIds, sourceRevision: run.sourceRevision } });
      return run;
    });
  }

  async reportRun(id) {
    return this.store.transaction((state) => {
      const run = state.runs[id];
      if (!run) throw new ForgeError('not_found', 'Run not found', 404);
      const tasks = run.taskIds.map((taskId) => state.workItems[taskId]).filter(Boolean);
      const counts = tasks.reduce((summary, task) => ({ ...summary, [task.status]: (summary[task.status] ?? 0) + 1 }), {});
      run.status = tasks.every((task) => task.status === 'completed') ? 'completed' : tasks.some((task) => ['failed', 'blocked'].includes(task.status)) ? 'blocked' : 'active';
      run.report = { generatedAt: now(), counts, taskEvidence: tasks.map((task) => ({ taskId: task.id, status: task.status, evidence: task.evidence })) };
      run.updatedAt = now();
      appendEvent(state, { type: 'run.reported', projectId: run.projectId, runId: id, evidence: { status: run.status, counts } });
      return run;
    });
  }
}
