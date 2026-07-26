import http from 'node:http';
import { ForgeError, ForgeService } from './forge.js';
import { JsonStore } from './store.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const startedAt = new Date().toISOString();

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(`${JSON.stringify(body)}\n`);
};

const readJson = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new ForgeError('payload_too_large', 'Request body exceeds 1 MB', 413);
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ForgeError('invalid_json', 'Request body must be valid JSON');
  }
};

const landingPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forge</title><style>:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#f7f8fa}main{width:min(760px,calc(100% - 40px));padding:48px;border:1px solid #282d38;border-radius:24px;background:#12151c}h1{font-size:clamp(3rem,11vw,6rem);margin:.2em 0}p{color:#c2c8d2;line-height:1.65}.status{display:inline-block;padding:10px 14px;border-radius:999px;background:#1b202a}a{color:#9fc4ff}</style></head><body><main><small>Approval-gated software delivery</small><h1>Forge</h1><p>Durable projects, stable work items, explicit approvals, deterministic transitions, source-revision checks, dependency gates, verification evidence, and auditable run reports.</p><div class="status">Service online · API v1</div><p><a href="/health">Health</a> · <a href="/v1/state">Current state</a></p></main></body></html>`;

const match = (pathname, expression) => pathname.match(expression);

export const createServer = ({ service = new ForgeService(new JsonStore()) } = {}) => http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const method = req.method ?? 'GET';

    if (method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' });
      res.end(landingPage);
      return;
    }

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', service: 'forge', version: '1.0.0', startedAt });
      return;
    }

    if (method === 'GET' && url.pathname === '/v1/state') {
      sendJson(res, 200, await service.snapshot());
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/projects') {
      sendJson(res, 201, await service.createProject(await readJson(req), req.headers['idempotency-key']));
      return;
    }

    let route = match(url.pathname, /^\/v1\/projects\/([^/]+)\/work-items$/);
    if (method === 'POST' && route) {
      sendJson(res, 201, await service.createWorkItem(route[1], await readJson(req), req.headers['idempotency-key']));
      return;
    }

    route = match(url.pathname, /^\/v1\/projects\/([^/]+)\/runs$/);
    if (method === 'POST' && route) {
      sendJson(res, 201, await service.createRun(route[1], await readJson(req)));
      return;
    }

    route = match(url.pathname, /^\/v1\/work-items\/([^/]+)\/approve$/);
    if (method === 'POST' && route) {
      sendJson(res, 200, await service.approveWorkItem(route[1], await readJson(req)));
      return;
    }

    route = match(url.pathname, /^\/v1\/work-items\/([^/]+)\/transition$/);
    if (method === 'POST' && route) {
      sendJson(res, 200, await service.transitionWorkItem(route[1], await readJson(req)));
      return;
    }

    route = match(url.pathname, /^\/v1\/work-items\/([^/]+)\/evidence$/);
    if (method === 'POST' && route) {
      sendJson(res, 201, await service.addEvidence(route[1], await readJson(req)));
      return;
    }

    route = match(url.pathname, /^\/v1\/runs\/([^/]+)\/report$/);
    if (method === 'POST' && route) {
      sendJson(res, 200, await service.reportRun(route[1]));
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  } catch (error) {
    if (error instanceof ForgeError || error?.code === 'invalid_transition') {
      sendJson(res, error.status ?? 409, { error: error.code, message: error.message });
      return;
    }
    console.error(error);
    sendJson(res, 500, { error: 'internal_error' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  createServer().listen(port, '0.0.0.0', () => console.log(`Forge listening on port ${port}`));
}
