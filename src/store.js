import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const emptyState = () => ({
  schemaVersion: 1,
  revision: 0,
  projects: {},
  workItems: {},
  runs: {},
  idempotency: {},
  events: []
});

export class JsonStore {
  constructor(filePath = process.env.FORGE_DATA_FILE ?? './data/forge.json') {
    this.filePath = resolve(filePath);
    this.queue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await readFile(this.filePath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return emptyState();
      throw error;
    }
  }

  async transaction(mutator) {
    const operation = this.queue.then(async () => {
      const state = await this.read();
      const result = await mutator(state);
      state.revision += 1;
      await mkdir(dirname(this.filePath), { recursive: true });
      const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
      await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
      await rename(temporaryPath, this.filePath);
      return result;
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}

export class MemoryStore {
  constructor(seed = emptyState()) {
    this.state = structuredClone(seed);
  }

  async read() {
    return structuredClone(this.state);
  }

  async transaction(mutator) {
    const draft = structuredClone(this.state);
    const result = await mutator(draft);
    draft.revision += 1;
    this.state = draft;
    return structuredClone(result);
  }
}
