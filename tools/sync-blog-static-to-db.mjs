#!/usr/bin/env node
/**
 * sync-blog-static-to-db.mjs
 *
 * Imports static blog articles (blog/*.html) into the Turso `blog_posts`
 * table so they can be managed from the admin panel.
 *
 * Behavior:
 *   - New article (slug not in DB)  -> INSERT (published=1, featured=0)
 *   - Existing article (slug in DB) -> skipped by default
 *   - `--force`                     -> UPDATE existing rows (keeps created_at,
 *                                      published, featured)
 *   - `--dry-run`                   -> preview only, no writes
 *
 * Content is converted from the static article HTML into markdown so it
 * matches the admin editor and the markdown renderers used by the SPA and
 * `generate-blog-posts.mjs`.
 *
 * Usage: node tools/sync-blog-static-to-db.mjs [--force] [--dry-run]
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';
import { getTurso } from './lib/env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');

// ─── CLI args ────────────────────────────────────────────────────────────────
const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── HTML -> markdown conversion ──────────────────────────────────────────────
function inline(text) {
  return text
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '');
}

function tableToMarkdown(tbl) {
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = rowRe.exec(tbl)) !== null) {
    const cells = [];
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cm;
    while ((cm = cellRe.exec(m[1])) !== null) {
      cells.push(inline(cm[1]).replace(/\s*\n+\s*/g, ' ').trim());
    }
    rows.push(cells);
  }
  if (rows.length === 0) return '';
  const cols = Math.max(...rows.map(r => r.length));
  const pad = (r) => Array.from({ length: cols }, (_, i) => r[i] || '').join(' | ');
  let md = `| ${pad(rows[0])} |\n`;
  md += `| ${Array(cols).fill('---').join(' | ')} |\n`;
  for (const r of rows.slice(1)) md += `| ${pad(r)} |\n`;
  return '\n\n' + md + '\n\n';
}

function htmlToMarkdown(html) {
  let s = String(html || '');
  s = s.replace(/\r\n?/g, '\n');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<table[\s\S]*?<\/table>/gi, tableToMarkdown);
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, i) => `\n\n# ${inline(i)}\n\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, i) => `\n\n## ${inline(i)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, i) => `\n\n### ${inline(i)}\n\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, i) => `\n\n#### ${inline(i)}\n\n`);
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
    '\n\n' + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => `- ${inline(li)}\n`) + '\n');
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) =>
    '\n\n' + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => `1. ${inline(li)}\n`) + '\n');
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
    '\n\n' + inner.trim().split('\n').map(l => `> ${inline(l)}`).join('\n') + '\n\n');
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, i) => `\n\n${inline(i)}\n\n`);
  s = s.replace(/<div[^>]*>/gi, '\n').replace(/<\/div>/gi, '\n');
  s = inline(s);
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

// ─── Static article parsing ──────────────────────────────────────────────────
function extractBlogContent(html) {
  const tag = '<div class="blog-content">';
  const start = html.indexOf(tag);
  if (start === -1) return '';
  let depth = 1;
  let pos = start + tag.length;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) return '';
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) return html.slice(start + tag.length, nextClose).trim();
      pos = nextClose + 6;
    }
  }
  return '';
}

function grab(re, content, group = 1) {
  const m = re.exec(content);
  return m ? m[group].trim() : '';
}

function parseArticle(fileName, html) {
  const slug = fileName.replace(/\.html$/, '');
  const ogTitle = grab(/<meta property="og:title" content="([^"]*)"/i, html);
  const h1 = grab(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html);
  let title = ogTitle || h1 || slug;
  title = title.replace(/\s*[—–-]\s*PixabAnimation\s*$/i, '').trim();

  const description = grab(/<meta name="description" content="([^"]*)"/i, html);
  const ogImage = grab(/<meta property="og:image" content="([^"]*)"/i, html);
  const category = grab(/<meta property="article:section" content="([^"]*)"/i, html) ||
    grab(/class="article-category-badge"[^>]*>[\s\S]*?<\/i>\s*([^<]+)/i, html);
  const author = grab(/<meta property="article:author" content="([^"]*)"/i, html) || 'PixabAnimation Team';
  const published = grab(/<meta property="article:published_time" content="([^"]*)"/i, html) ||
    grab(/"datePublished":\s*"([^"]+)"/i, html);
  const timeRequired = grab(/"timeRequired":\s*"([^"]+)"/i, html) ||
    grab(/<span class="reading-time-badge"[^>]*>[\s\S]*?([\d.]+)\s*min read/i, html);
  const tags = [...html.matchAll(/<meta property="article:tag" content="([^"]*)"/gi)].map(m => m[1].trim());

  const readingTimeMatch = timeRequired ? timeRequired.match(/(\d+)/) : null;
  const readingTime = readingTimeMatch ? parseInt(readingTimeMatch[1]) : 7;

  const rawContent = extractBlogContent(html);
  const content = htmlToMarkdown(rawContent);

  return {
    title,
    slug,
    excerpt: description,
    content,
    category,
    author,
    cover_image: ogImage,
    tags,
    reading_time: readingTime,
    created_at: published,
    meta_title: ogTitle,
    meta_description: description
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = createClient(getTurso());

  const existingRes = await client.execute('SELECT id, slug FROM blog_posts');
  const existingBySlug = new Map(existingRes.rows.map(r => [String(r.slug), Number(r.id)]));

  const files = readdirSync(blogDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();

  let toInsert = 0;
  let toUpdate = 0;
  let skipped = 0;
  const report = [];

  for (const fileName of files) {
    const html = readFileSync(join(blogDir, fileName), 'utf-8');
    const post = parseArticle(fileName, html);
    const exists = existingBySlug.has(post.slug);

    if (!exists) {
      if (!DRY_RUN) {
        await client.execute({
          sql: `INSERT INTO blog_posts
            (title, slug, excerpt, content, author, cover_image, category, tags, reading_time, published, featured, meta_title, meta_description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
          args: [post.title, post.slug, post.excerpt || null, post.content, post.author,
                 post.cover_image || null, post.category || null, JSON.stringify(post.tags),
                 post.reading_time, post.meta_title || null, post.meta_description || null,
                 post.created_at || null]
        });
      }
      toInsert++;
      report.push(`INSERT ${post.slug}`);
    } else if (FORCE) {
      if (!DRY_RUN) {
        await client.execute({
          sql: `UPDATE blog_posts SET
            title = ?, excerpt = ?, content = ?, author = ?, cover_image = ?,
            category = ?, tags = ?, reading_time = ?, meta_title = ?, meta_description = ?
            WHERE slug = ?`,
          args: [post.title, post.excerpt || null, post.content, post.author,
                 post.cover_image || null, post.category || null, JSON.stringify(post.tags),
                 post.reading_time, post.meta_title || null, post.meta_description || null,
                 post.slug]
        });
      }
      toUpdate++;
      report.push(`UPDATE ${post.slug}`);
    } else {
      skipped++;
      report.push(`SKIP  ${post.slug} (already in DB)`);
    }
  }

  console.log(report.join('\n'));
  console.log(`\n📊 Summary: ${toInsert} to insert, ${toUpdate} to update, ${skipped} skipped`);
  if (DRY_RUN) console.log('   (dry run — no changes written)');

  client.close();
}

const isCli = process.argv[1] &&
  process.argv[1].replace(/\\/g, '/').endsWith('sync-blog-static-to-db.mjs');

if (isCli) {
  main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

export { parseArticle, htmlToMarkdown, extractBlogContent };
