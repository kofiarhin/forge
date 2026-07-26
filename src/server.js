import http from 'node:http';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const startedAt = new Date().toISOString();

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(`${JSON.stringify(body)}\n`);
};

const landingPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forge</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0d12; color: #f7f8fa; }
    main { width: min(760px, calc(100% - 40px)); padding: 48px; border: 1px solid #282d38; border-radius: 24px; background: #12151c; box-shadow: 0 24px 80px rgba(0,0,0,.35); }
    .eyebrow { letter-spacing: .14em; text-transform: uppercase; color: #9ba5b7; font-size: .78rem; }
    h1 { margin: 12px 0 16px; font-size: clamp(3rem, 11vw, 6rem); line-height: .9; }
    p { max-width: 60ch; color: #c2c8d2; font-size: 1.1rem; line-height: 1.65; }
    .status { display: inline-flex; gap: 10px; align-items: center; margin-top: 18px; padding: 10px 14px; border-radius: 999px; background: #1b202a; color: #dfe5ee; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #62d38b; box-shadow: 0 0 18px #62d38b; }
    a { color: #9fc4ff; }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Initial service surface</div>
    <h1>Forge</h1>
    <p>Forge is an AI-powered software organization concept coordinated by Zoro. This deployment proves the service shell and operational health surface only; specialist agents and end-to-end orchestration are not yet implemented here.</p>
    <div class="status"><span class="dot"></span> Service online</div>
    <p><a href="/health">View health endpoint</a></p>
  </main>
</body>
</html>`;

export const createServer = () => http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60'
    });
    res.end(landingPage);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'forge',
      version: '0.1.0',
      startedAt
    });
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
});

if (process.env.NODE_ENV !== 'test') {
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`Forge listening on port ${port}`);
  });
}
