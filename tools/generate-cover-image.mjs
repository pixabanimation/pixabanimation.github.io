#!/usr/bin/env node
/**
 * generate-cover-image.mjs
 *
 * Generates a simple SVG cover image for a blog article.
 * Uses the article title rendered as text on a gradient background.
 * No dependencies required — SVG is pure text.
 *
 * Usage: node tools/generate-cover-image.mjs <slug> "<Title>"
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets', 'images', 'blog');

function generateCoverSvg(title) {
  const lines = [];
  // Word-wrap the title into ~4 lines max
  const words = title.split(' ');
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (test.length > 28 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);

  const fontSize = lines.length > 3 ? 36 : 44;
  const lineHeight = 56;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (400 - totalTextHeight) / 2 + 60;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e94560"/>
      <stop offset="100%" style="stop-color:#0bd3d3"/>
    </linearGradient>
    <linearGradient id="glow" x1="50%" y1="50%" x2="50%" y2="100%">
      <stop offset="0%" style="stop-color:#e94560;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#e94560;stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="600" cy="315" rx="500" ry="315" fill="url(#glow)"/>
  <rect x="60" y="558" width="1080" height="4" rx="2" fill="url(#accent)" opacity="0.6"/>
  <g transform="translate(80, 0)">
    <text x="0" y="100" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="#0bd3d3" letter-spacing="3">PIXABANIMATION</text>
${lines.map((line, i) =>
  `    <text x="0" y="${startY + i * lineHeight}" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${escXml(line)}</text>`
).join('\n')}
  </g>
</svg>`;
}

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node tools/generate-cover-image.mjs <slug> "<Article Title>"');
    process.exit(1);
  }

  const slug = args[0];
  const title = args.slice(1).join(' ');
  const outPath = join(assetsDir, `${slug}.svg`);

  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }

  const svg = generateCoverSvg(title);
  writeFileSync(outPath, svg, 'utf-8');
  console.log(`   🖼️  Cover: assets/images/blog/${slug}.svg`);
}

main();
