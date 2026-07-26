export const TASK_STATES = Object.freeze([
  'proposed',
  'ready',
  'needs_discovery',
  'needs_spec',
  'needs_approval',
  'blocked',
  'running',
  'verifying',
  'completed',
  'failed',
  'skipped'
]);

const transitions = new Map([
  ['proposed', new Set(['ready', 'needs_discovery', 'needs_spec', 'needs_approval', 'skipped'])],
  ['needs_discovery', new Set(['proposed', 'needs_spec', 'needs_approval', 'ready', 'blocked', 'skipped'])],
  ['needs_spec', new Set(['proposed', 'needs_approval', 'ready', 'blocked', 'skipped'])],
  ['needs_approval', new Set(['ready', 'blocked', 'skipped'])],
  ['ready', new Set(['running', 'blocked', 'skipped'])],
  ['running', new Set(['verifying', 'failed', 'blocked'])],
  ['verifying', new Set(['completed', 'failed', 'blocked', 'running'])],
  ['blocked', new Set(['proposed', 'ready', 'running', 'verifying', 'failed', 'skipped'])],
  ['failed', new Set(['ready', 'running', 'skipped'])],
  ['completed', new Set()],
  ['skipped', new Set()]
]);

export class StateTransitionError extends Error {
  constructor(from, to, reason) {
    super(reason ?? `Invalid task transition: ${from} -> ${to}`);
    this.name = 'StateTransitionError';
    this.code = 'invalid_transition';
    this.from = from;
    this.to = to;
  }
}

export const assertTaskState = (state) => {
  if (!TASK_STATES.includes(state)) {
    throw new StateTransitionError(state, state, `Unknown task state: ${state}`);
  }
};

export const assertTransition = ({ task, to, evidence = [] }) => {
  assertTaskState(task.status);
  assertTaskState(to);

  if (!transitions.get(task.status)?.has(to)) {
    throw new StateTransitionError(task.status, to);
  }

  if (to === 'running' && (!task.approved || task.status !== 'ready')) {
    throw new StateTransitionError(task.status, to, 'Only approved ready tasks may enter implementation');
  }

  if (to === 'completed') {
    const verificationEvidence = evidence.filter((item) => item.type === 'verification' && item.outcome === 'passed');
    if (verificationEvidence.length === 0) {
      throw new StateTransitionError(task.status, to, 'Completion requires passed verification evidence');
    }
  }

  return true;
};
