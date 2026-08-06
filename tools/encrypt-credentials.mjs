#!/usr/bin/env node
/**
 * Encrypts the Turso database credentials with AES-256-GCM and writes two
 * split-secret files for the browser:
 *
 *   - js/credentials.js       → ciphertext only (IV : authTag : data)
 *   - js/credentials-key.js   → base64 AES-256 key (separate file)
 *
 * Neither output contains the plaintext URL or auth token. The plaintext is
 * read from `.env` (TURSO_URL / TURSO_AUTH_TOKEN) at the repo root — it is
 * never hardcoded here.
 *
 * Usage:  node tools/encrypt-credentials.mjs
 * Rotate: regenerate the Turso token, update .env, re-run this tool.
 */

import { randomBytes, createCipheriv } from 'crypto';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getTurso } from './lib/env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const { url, authToken } = getTurso();

// AES-256-GCM
const key = randomBytes(32);
const iv = randomBytes(12); // 96-bit GCM nonce
const cipher = createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(JSON.stringify({ url, authToken }), 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

const payloadFile = [
  '// ============================================',
  '// pixabanimation — Encrypted Database Credentials',
  '// ============================================',
  '// The Turso database URL + auth token are encrypted with AES-256-GCM.',
  '// The ciphertext lives in this file; the 256-bit key lives separately in',
  '// js/credentials-key.js (split-secret). Neither file contains plaintext.',
  '//',
  '// REGENERATE with:  node tools/encrypt-credentials.mjs',
  '',
  `const _CREDENTIALS_PAYLOAD = '${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}';`,
  ''
].join('\n');

const keyFile = [
  '// ============================================',
  '// pixabanimation — AES-256 key (base64)',
  '// ============================================',
  '// Used by js/credentials.js to decrypt the database credentials.',
  '// Stored separately from the ciphertext (split-secret). Because this is a',
  '// static site this file ships to the browser — do NOT rely on it alone to',
  '// protect the token; rotate the token if it ever leaked.',
  '',
  `const _CREDENTIALS_KEY = '${key.toString('base64')}';`,
  ''
].join('\n');

writeFileSync(join(rootDir, 'js', 'credentials.js'), payloadFile);
writeFileSync(join(rootDir, 'js', 'credentials-key.js'), keyFile);

console.log('✅ Wrote js/credentials.js (ciphertext) + js/credentials-key.js (AES-256 key).');
console.log('   Plaintext credentials were read from .env and are NOT written anywhere.');
