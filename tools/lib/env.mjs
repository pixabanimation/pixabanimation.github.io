// ============================================
// pixabanimation — Shared environment loader
// ============================================
// Loads secrets from the repo-root `.env` file (which is gitignored) so that
// NO credentials are hardcoded in committed scripts. Values from the real
// process environment always take precedence (useful for CI).
//
// Usage in any .mjs tool:
//   import { getTurso } from './lib/env.mjs';
//   const client = createClient(getTurso());

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// tools/lib/ -> repo root
export const REPO_ROOT = join(__dirname, '..', '..');

export function loadEnvFile(path = join(REPO_ROOT, '.env')) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

export function getEnv() {
  return { ...loadEnvFile(), ...process.env };
}

// Returns Turso credentials from .env / process.env. Exits with a clear
// message instead of silently running with undefined secrets.
export function getTurso() {
  const env = getEnv();
  const url = env.TURSO_URL;
  const authToken = env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.error('❌ Missing Turso credentials.');
    console.error('   Create a .env file at the repo root (see .env.example):');
    console.error('     TURSO_URL=libsql://your-database.turso.io');
    console.error('     TURSO_AUTH_TOKEN=your-turso-auth-token');
    process.exit(1);
  }
  return { url, authToken };
}
