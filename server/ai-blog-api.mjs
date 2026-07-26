#!/usr/bin/env node

import { createServer } from 'http';
import { spawn } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const PORT = parseInt(process.env.API_PORT || '3456');

const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function startSSE(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    ...CORS_HEADERS
  });
}

function spawnAndStream(res, cmd, args, opts = {}) {
  startSSE(res);
  sendSSE(res, 'start', { message: opts.startMessage || 'Starting...' });

  const child = spawn(cmd, args, {
    cwd: rootDir,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: opts.shell || false
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) sendSSE(res, 'output', { line });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) sendSSE(res, 'output', { line, stream: 'stderr' });
  });

  child.on('close', (code) => {
    sendSSE(res, 'done', { code, message: `Exit code: ${code}` });
    res.end();
  });

  child.on('error', (err) => {
    sendSSE(res, 'error', { message: err.message });
    res.end();
  });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
  });
}

let runningJobs = {};

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // GET /api/status
  if (path === '/api/status' && method === 'GET') {
    const blogDir = join(rootDir, 'blog');
    let blogPostCount = 0;
    if (existsSync(blogDir)) {
      blogPostCount = readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html').length;
    }
    sendJSON(res, 200, {
      status: 'ok',
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free',
      blogPostCount,
      rootDir
    });
    return;
  }

  // GET /api/blog/trending?count=5
  if (path === '/api/blog/trending' && method === 'GET') {
    try {
      const { discoverTrendingTopics } = await import('../tools/ai-blog-writer.mjs');
      const count = parseInt(url.searchParams.get('count') || '5');
      const topics = await discoverTrendingTopics(count);
      sendJSON(res, 200, { topics });
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  // POST /api/blog/generate
  if (path === '/api/blog/generate' && method === 'POST') {
    const body = await parseBody(req);
    const { topics = [], trending = false, count = 3, model, force = false } = body;

    if (!topics.length && !trending) {
      sendJSON(res, 400, { error: 'Provide topics[] or set trending:true' });
      return;
    }

    const args = ['tools/ai-blog-writer.mjs'];
    if (model) args.push('--model', model);
    if (force) args.push('--force');
    if (trending) {
      args.push('--trending', String(count));
    } else {
      for (const t of topics) args.push(t);
    }

    spawnAndStream(res, 'node', args, {
      startMessage: 'Generating blog articles via AI...'
    });
    return;
  }

  // POST /api/blog/generate-topic
  if (path === '/api/blog/generate-topic' && method === 'POST') {
    const body = await parseBody(req);
    const { topic, model } = body;

    if (!topic) {
      sendJSON(res, 400, { error: 'Provide a topic' });
      return;
    }

    const args = ['tools/ai-blog-writer.mjs'];
    if (model) args.push('--model', model);
    args.push(topic);

    spawnAndStream(res, 'node', args, {
      startMessage: `Generating article: "${topic}"...`
    });
    return;
  }

  // POST /api/blog/build
  if (path === '/api/blog/build' && method === 'POST') {
    spawnAndStream(res, 'npm', ['run', 'build-blog'], {
      startMessage: 'Building static blog files from database...',
      shell: true
    });
    return;
  }

  // POST /api/blog/build-index
  if (path === '/api/blog/build-index' && method === 'POST') {
    spawnAndStream(res, 'node', ['tools/generate-blog-index-from-fs.mjs'], {
      startMessage: 'Regenerating blog index from filesystem...'
    });
    return;
  }

  sendJSON(res, 404, { error: 'Not found' });
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   PixabAnimation — AI Blog API Server       ║');
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║  URL:  http://localhost:${PORT}                  ║`);
  console.log(`  ║  Key:  ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Not set'}                        ║`);
  console.log(`  ║  Model: ${(process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free').padEnd(30)} ║`);
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log('  ║  Endpoints:                                  ║');
  console.log('  ║  GET  /api/status                            ║');
  console.log('  ║  GET  /api/blog/trending?count=N             ║');
  console.log('  ║  POST /api/blog/generate   (JSON)            ║');
  console.log('  ║  POST /api/blog/generate-topic (JSON)         ║');
  console.log('  ║  POST /api/blog/build                        ║');
  console.log('  ║  POST /api/blog/build-index                  ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
