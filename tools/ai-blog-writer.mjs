#!/usr/bin/env node
/**
 * ai-blog-writer.mjs
 *
 * AI-powered blog article writer for PixabAnimation.
 * Uses OpenRouter (or any OpenAI-compatible API) to generate complete
 * blog articles with proper metadata, then writes the HTML file and
 * regenerates sitemap + blog index.
 *
 * Usage:
 *   node tools/ai-blog-writer.mjs
 *   node tools/ai-blog-writer.mjs "Your Article Topic Here"
 *   node tools/ai-blog-writer.mjs --batch topics.txt
 *   node tools/ai-blog-writer.mjs --model "anthropic/claude-sonnet-4-20250514" "Topic"
 *
 * Setup:
 *   Set OPENROUTER_API_KEY environment variable (get at https://openrouter.ai/keys)
 *   Optional: OPENROUTER_MODEL (default: "google/gemini-2.5-flash")
 */

import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');

// Load .env file if it exists (no dependencies required)
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

const BASE_URL = 'https://pixabanimation.github.io';
const LOGO_URL = `${BASE_URL}/assets/pixabanimation-logo.png`;

const VALID_CATEGORIES = [
  'AI', 'Animation', 'Career', 'Design', 'Freelancing', 'Laptop',
  'Mobile Phone', 'Resources', 'Tablet', 'Technology', 'Tools',
  'Typography', 'VFX', 'Wearable', 'Web'
];

const CAT_COLORS = {
  'AI': '#0066cc', 'Animation': '#34c759', 'Career': '#af52de',
  'Design': '#ff9500', 'Freelancing': '#ff2d55', 'Laptop': '#007aff',
  'Mobile Phone': '#34c759', 'Resources': '#64d2ff', 'Tablet': '#5856d6',
  'Technology': '#5ac8fa', 'Tools': '#ff9f0a', 'Typography': '#00c7be',
  'VFX': '#ff6482', 'Wearable': '#ff9f0a', 'Web': '#5856d6'
};

// ─── API Helpers ──────────────────────────────────────────────────────────────

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('❌ OPENROUTER_API_KEY not set.');
    console.error('   Get a key at https://openrouter.ai/keys');
    console.error('   Then: set OPENROUTER_API_KEY=sk-or-v1-...');
    process.exit(1);
  }
  return key;
}

function getModel() {
  return process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
}

async function callAI(systemPrompt, userPrompt, options = {}) {
  const key = getApiKey();
  const model = options.model || getModel();
  const maxTokens = options.maxTokens || 8192;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': BASE_URL,
      'X-Title': 'PixabAnimation Blog Writer'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: options.temperature || 0.7
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9- ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function fmtDateShort(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

// ─── HTML Helpers ─────────────────────────────────────────────────────────────

function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(s) { return esc(s); }

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).length;
}

function calcReadingTime(html) {
  return Math.max(3, Math.round(countWords(html) / 200));
}

// ─── Markdown → HTML Converter ───────────────────────────────────────────────

function mdToHtml(md) {
  if (!md) return '<p>Content coming soon.</p>';

  const specCss = `<style>
.spec-table-wrap{overflow-x:auto;margin:28px 0;border-radius:16px;box-shadow:0 2px 20px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.06)}
.spec-table{width:100%;border-collapse:collapse;font-family:Inter,-apple-system,sans-serif;font-size:.9rem}
.spec-table thead th{background:linear-gradient(135deg,#1d1d1f,#2d2d2f);color:#fff;padding:14px 20px;text-align:left;font-weight:700;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.spec-table tbody tr:first-child td{padding-top:16px}
.spec-table tbody tr:last-child td{padding-bottom:16px}
.spec-table tbody tr td{padding:8px 20px;border-bottom:1px solid rgba(0,0,0,.04);vertical-align:top;line-height:1.5}
.spec-table tbody tr:last-child td{border-bottom:none}
.spec-table tbody tr td:first-child{font-weight:600;color:#1d1d1f;white-space:nowrap;width:30%;min-width:140px}
.spec-table tbody tr td:last-child{color:rgba(0,0,0,.65)}
.spec-table tbody tr:nth-child(even){background:rgba(0,102,204,.02)}
.spec-table tbody tr:hover{background:rgba(0,102,204,.04)}
.spec-section-row td{background:linear-gradient(135deg,#0066cc,#0071e3)!important;color:#fff!important;font-weight:700!important;font-size:.8rem!important;letter-spacing:.04em;text-transform:uppercase;padding:10px 20px!important;border-bottom:2px solid rgba(255,255,255,.1)!important}
.spec-section-row td:first-child,.spec-section-row td:last-child{color:#fff!important}
.spec-table tbody tr.spec-section-row:hover{background:linear-gradient(135deg,#0066cc,#0071e3)!important}
@media(max-width:600px){.spec-table tbody tr td:first-child{white-space:normal;width:40%}}
</style>`;

  const lines = md.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];
  let tableCssAdded = false;

  function flushTable() {
    if (tableRows.length === 0) return;
    if (!tableCssAdded) { result.push(specCss); tableCssAdded = true; }
    result.push('<div class="spec-table-wrap"><table class="spec-table">');
    for (let r = 0; r < tableRows.length; r++) {
      const row = tableRows[r];
      if (/^\|\s*:?-+:?\s*\|(\s*:?-+:?\s*\|)*\s*$/.test(row)) continue;
      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length === 0) continue;
      const nonEmpty = cells.filter(c => c !== '' && c !== '|');
      const isSectionRow = cells.length >= 1 && /\*\*.+\*\*/.test(cells[0]) &&
        cells.slice(1).every(c => !c || c === '');
      if (isSectionRow) {
        const name = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        result.push(`<tr class="spec-section-row"><td colspan="10">${esc(name)}</td></tr>`);
      } else if (cells.length >= 2) {
        const key = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        const value = cells.slice(1).filter(c => c !== '').join(', ');
        if (key) result.push(`<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`);
        else if (value) result.push(`<tr><td colspan="2" style="padding-left:36px;color:rgba(0,0,0,.5);font-size:.85rem">${esc(value)}</td></tr>`);
      } else if (cells.length === 1) {
        const val = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        if (val) result.push(`<tr><td colspan="10">${esc(val)}</td></tr>`);
      }
    }
    result.push('</table></div>');
    tableRows = [];
  }

  function processInline(text) {
    let t = text;
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/(!|!!)\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$3" alt="$2" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0" loading="lazy">');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|', 1)) {
      inTable = true;
      tableRows.push(trimmed);
    } else {
      if (inTable) { flushTable(); inTable = false; }
      let processed = processInline(line);
      if (processed.startsWith('## ')) {
        const text = processed.replace(/^## /, '');
        const id = text.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
        result.push(`<h2 id="${id}">${text}</h2>`);
      } else if (processed.startsWith('### ')) {
        const text = processed.replace(/^### /, '');
        const id = text.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
        result.push(`<h3 id="${id}">${text}</h3>`);
      } else if (processed.trim() && !processed.startsWith('<h') && !processed.startsWith('<img') &&
                 !processed.startsWith('<') && !processed.startsWith('</')) {
        result.push('<p>' + processed + '</p>');
      } else {
        result.push(processed);
      }
    }
  }
  flushTable();
  return result.join('\n');
}

// ─── Extract headings from HTML for TOC ───────────────────────────────────────

function extractHeadings(content) {
  const headings = [];
  const h2Matches = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];
  for (const m of h2Matches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    const id = text.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    headings.push({ level: 2, text, id });
  }
  return headings;
}

function tocHtml(headings) {
  if (headings.length < 2) return '';
  return '<ul class="toc-list">' +
    headings.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('') +
    '</ul>';
}

// ─── Generate Full Blog HTML ──────────────────────────────────────────────────

function generateBlogHtml(post) {
  const {
    title, slug, excerpt, content, category, author, reading_time,
    tags, cover_image, meta_title, meta_description, created_at
  } = post;

  const catColor = CAT_COLORS[category] || '#0066cc';
  const isoDate = created_at;
  const longDate = fmtDate(created_at);
  const shortDate = fmtDateShort(created_at);
  const displayTitle = meta_title || title;
  const displayDesc = meta_description || excerpt;
  const shareUrl = `${BASE_URL}/blog/${slug}.html`;
  const shareTitle = encodeURIComponent(displayTitle);
  const shareDesc = encodeURIComponent(displayDesc);
  let coverImg = cover_image
    ? (cover_image.startsWith('http') ? cover_image : '')
    : '';
  if (!coverImg) {
    // Check for .png (existing posts) or .svg (AI-generated)
    const pngPath = join(blogDir, '..', 'assets', 'images', 'blog', `${cover_image || slug}.png`);
    const svgPath = join(blogDir, '..', 'assets', 'images', 'blog', `${cover_image || slug}.svg`);
    if (existsSync(pngPath)) {
      coverImg = `${BASE_URL}/assets/images/blog/${cover_image || slug}.png`;
    } else if (existsSync(svgPath)) {
      coverImg = `${BASE_URL}/assets/images/blog/${cover_image || slug}.svg`;
    } else {
      coverImg = LOGO_URL;
    }
  }
  const tagLinks = tags.map(t => `        <a href="index.html" class="tag">${esc(t)}</a>`).join('\n');

  const contentHtml = mdToHtml(content);
  const headings = extractHeadings(contentHtml);
  const toc = tocHtml(headings);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(displayTitle)} — PixabAnimation</title>
  <meta name="description" content="${esc(displayDesc)}">
  <meta property="og:title" content="${esc(displayTitle)}">
  <meta property="og:description" content="${esc(displayDesc)}">
  <meta property="og:image" content="${escAttr(coverImg)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:site_name" content="PixabAnimation">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="${isoDate}">
  <meta property="article:modified_time" content="${isoDate}">
  <meta property="article:author" content="${esc(author || 'PixabAnimation Team')}">
  <meta property="article:section" content="${esc(category || 'Tech')}">
${tags.map(t => `  <meta property="article:tag" content="${esc(t)}">`).join('\n')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="${esc(displayTitle)}">
  <meta name="twitter:description" content="${esc(displayDesc)}">
  <meta name="twitter:image" content="${escAttr(coverImg)}">
  <link rel="canonical" href="${shareUrl}">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="blog.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${esc(displayTitle)}",
  "description": "${esc(displayDesc)}",
  "image": "${escAttr(coverImg)}",
  "datePublished": "${isoDate}",
  "dateModified": "${isoDate}",
  "author": {
    "@type": "Organization",
    "name": "${esc(author || 'PixabAnimation Team')}",
    "url": "${BASE_URL}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PixabAnimation",
    "logo": {
      "@type": "ImageObject",
      "url": "${LOGO_URL}"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${shareUrl}"
  },
  "keywords": "${esc(tags.join(', '))}",
  "articleSection": "${esc(category || 'Tech')}",
  "timeRequired": "${reading_time} min read"
}
  </script>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${BASE_URL}/blog/" },
    { "@type": "ListItem", "position": 3, "name": "${esc(title)}", "item": "${shareUrl}" }
  ]
}
  </script>
  <link rel="icon" type="image/png" href="${LOGO_URL}" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${LOGO_URL}" sizes="180x180">
  <meta name="msapplication-TileColor" content="#4338CA">
  <meta name="theme-color" content="#FAF8F5">
</head>
<body>
  <div class="reading-progress" id="readingProgress"></div>
  <nav class="blog-navbar" id="navbar">
    <div class="blog-nav-container">
      <button class="blog-nav-toggle" id="navToggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="blog-nav-links" id="navLinks">
        <li><a href="${BASE_URL}/" class="blog-nav-brand">
          <img src="${LOGO_URL}" alt="PixabAnimation" width="28" height="24">
          PixabAnimation
        </a></li>
        <li><a href="${BASE_URL}/">Home</a></li>
        <li><a href="${BASE_URL}/#/shop">Shop</a></li>
        <li><a href="${BASE_URL}/#/shop?category=videos">Videos</a></li>
        <li><a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">Plugins</a></li>
        <li><a href="index.html" class="active">Blog</a></li>
        <li><a href="${BASE_URL}/#/about">About</a></li>
        <li><a href="${BASE_URL}/#/contact">Contact</a></li>
      </ul>
      <div class="blog-nav-actions">
        <a href="${BASE_URL}/#/wishlist"><i class="fas fa-heart"></i></a>
        <a href="${BASE_URL}/#/cart"><i class="fas fa-shopping-bag"></i></a>
        <a href="${BASE_URL}/#/login" style="background:var(--accent);color:#fff;padding:6px 16px;border-radius:9999px;font-size:.82rem;font-weight:600;text-decoration:none">Sign In</a>
      </div>
    </div>
  </nav>

  <div class="breadcrumb-bar">
    <a href="${BASE_URL}/">Home</a><span class="sep">/</span>
    <a href="index.html">Blog</a><span class="sep">/</span>
    <a href="index.html">${esc(category || 'Tech')}</a><span class="sep">/</span>
    <span class="current">${esc(displayTitle)}</span>
  </div>

<div class="blog-wrapper">
  <article>
    <div class="article-hero">
      <a href="index.html" class="article-category-badge"><i class="fas fa-tag" style="font-size:0.7rem"></i> ${esc(category || 'Tech')}</a>
      <h1>${esc(title)}</h1>
      <div class="article-meta-row">
        <span class="meta-item"><i class="fas fa-calendar-alt"></i> ${longDate}</span>
        <span class="meta-dot"></span>
        <span class="meta-item"><i class="fas fa-user"></i> ${esc(author || 'PixabAnimation Team')}</span>
        <span class="meta-dot"></span>
        <span class="reading-time-badge"><i class="fas fa-clock"></i> ${reading_time} min read</span>
      </div>
    </div>

    <div class="blog-cover">
      <img src="${escAttr(coverImg)}" alt="${esc(title)}" loading="lazy">
    </div>

    <div class="mobile-toc" id="mobileToc">
      <button class="mobile-toc-toggle" onclick="document.getElementById('mobileToc').classList.toggle('open')">
        <span><i class="fas fa-list" style="margin-right:8px"></i> Table of Contents</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      ${toc}
    </div>

    <div class="blog-content">
${contentHtml}
    </div>

    <div class="tags-section">
      <div class="label">Tags</div>
${tagLinks}
    </div>

    <div class="share-section">
      <span class="label">Share</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" class="share-btn" title="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
      <a href="https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}" target="_blank" class="share-btn" title="Share on X"><i class="fab fa-x-twitter"></i></a>
      <a href="https://www.pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareDesc}" target="_blank" class="share-btn" title="Share on Pinterest"><i class="fab fa-pinterest-p"></i></a>
      <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.innerHTML='<i class=\\'fas fa-check\\'></i>';setTimeout(()=>{this.innerHTML='<i class=\\'fas fa-link\\'></i>'},1500)})" title="Copy link"><i class="fas fa-link"></i></button>
    </div>

    <div class="author-bio">
      <div class="author-avatar">P</div>
      <div class="author-info">
        <div class="name">${esc(author || 'PixabAnimation Team')}</div>
        <div class="desc">PixabAnimation creates premium motion graphics, animation assets, and stock footage used by creators worldwide. Our team of motion designers and creative technologists explores the intersection of animation and emerging technology.</div>
      </div>
      <div class="author-social">
        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </div>

      <div id="ad-slot-1-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-cube"></i></div><div class="blog-ad-text"><h3>Premium Motion Graphics Assets</h3><p>Browse 4000+ professional 4K motion backgrounds, animated templates, and stock footage.</p><a href="${BASE_URL}/#/shop" class="blog-ad-cta">Browse Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
      <div id="ad-slot-2-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-film"></i></div><div class="blog-ad-text"><h3>4K Video Clips &amp; Templates</h3><p>Royalty-free motion graphics, lower thirds, and title animations.</p><a href="${BASE_URL}/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
      <div id="ad-slot-3-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-layer-group"></i></div><div class="blog-ad-text"><h3>After Effects Templates</h3><p>Professional logo reveals, typography animations, and infographic templates.</p><a href="https://stock.adobe.com/contributor/211977281/SPurnoAnimation" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>

    <div class="useful-links">
      <div class="label">Useful Links</div>
      <div class="grid">
        <a href="${BASE_URL}/#/shop"><i class="fas fa-shopping-bag" style="margin-right:6px"></i> Shop Premium Assets</a>
        <a href="${BASE_URL}/#/shop?category=videos"><i class="fas fa-video" style="margin-right:6px"></i> Motion Graphics Stock</a>
        <a href="${BASE_URL}/#/about"><i class="fas fa-info-circle" style="margin-right:6px"></i> About PixabAnimation</a>
        <a href="${BASE_URL}/"><i class="fas fa-home" style="margin-right:6px"></i> Return to Homepage</a>
      </div>
    </div>
  </article>

  <aside class="sidebar">
    <div class="sidebar-section reading-progress-sidebar">
      <div class="progress-text" id="readingPercent">0%</div>
      <div class="progress-label">Read</div>
    </div>

    ${toc ? `<div class="sidebar-section">
      <div class="sidebar-title">Contents</div>
      ${toc}
    </div>` : ''}

    <div class="sidebar-section">
      <div class="sidebar-title">Recent Posts</div>
      <!-- populated by JS or rebuild -->
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Popular Tags</div>
      <div class="sidebar-tags">
${tags.map(t => `        <a href="index.html" class="sidebar-tag" onclick="return plSearchTag('${esc(t)}')">${esc(t)}</a>`).join('\n')}
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Authors</div>
      <div class="sidebar-author">
        <div class="initial">P</div>
        <div><div class="name">PixabAnimation</div><div class="role">Content Creator</div></div>
      </div>
      <div class="sidebar-author">
        <div class="initial" style="background:linear-gradient(135deg,#7C3AED,#A78BFA)">S</div>
        <div><div class="name">SPurno</div><div class="role">Motion Design Expert</div></div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Sponsored</div>
      <div id="ad-slot-1"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-cube"></i></div><div class="blog-ad-text"><h3>Premium Motion Graphics</h3><p>4000+ professional 4K motion backgrounds and templates.</p><a href="${BASE_URL}/#/shop" class="blog-ad-cta">Browse <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
      <div id="ad-slot-2" style="margin-top:12px"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-plug"></i></div><div class="blog-ad-text"><h3>AE Plugins &amp; Tools</h3><p>Powerful After Effects plugins to supercharge your motion design workflow and save hours on every project.</p><a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins" class="blog-ad-cta">Explore Plugins <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
      <div id="ad-slot-3" style="margin-top:12px"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-film"></i></div><div class="blog-ad-text"><h3>Video Collections</h3><p>Royalty-free motion clips and animated backgrounds for any project.</p><a href="${BASE_URL}/#/shop?category=videos" class="blog-ad-cta">Explore <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
    </div>
  </aside>

  <div class="back-section">
    <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back to Blog</a>
  </div>
</div>

  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <img src="${LOGO_URL}" alt="PixabAnimation Logo" width="28" height="24" loading="lazy" style="filter:brightness(0) invert(1)">
          <span class="name">PixabAnimation</span>
          <p class="desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</p>
          <div class="blog-footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="blog-footer-col">
          <h4>Shop</h4>
          <a href="${BASE_URL}/#/shop">All Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos">Animation & Video</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">AE Plugins</a>
          <a href="${BASE_URL}/#/shop?category=background-animation">Backgrounds</a>
        </div>
        <div class="blog-footer-col">
          <h4>Categories</h4>
          <a href="${BASE_URL}/#/shop?category=videos">Motion Graphics</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">Plugins</a>
          <a href="${BASE_URL}/#/shop?category=green-screen-mockup">Green Screen</a>
          <a href="${BASE_URL}/#/shop?category=ads-design">Advertising</a>
        </div>
        <div class="blog-footer-col">
          <h4>Support</h4>
          <a href="${BASE_URL}/#/contact">Contact Us</a>
          <a href="${BASE_URL}/#/about">About Us</a>
          <a href="${BASE_URL}/#/privacy-policy">Privacy Policy</a>
          <a href="${BASE_URL}/#/terms-of-use">Terms of Use</a>
          <a href="index.html">Blog</a>
        </div>
        <div class="blog-footer-col blog-footer-col-newsletter">
          <h4>Stay in the Loop</h4>
          <p class="blog-footer-newsletter-text">Get early access to new releases and creative inspiration.</p>
          <form class="blog-footer-newsletter-form" action="${BASE_URL}/" method="get">
            <input type="email" placeholder="Enter your email" required>
            <button type="submit" aria-label="Subscribe"><i class="fas fa-arrow-right"></i></button>
          </form>
          <p class="blog-footer-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
      <div class="blog-footer-bottom">
        <div class="blog-footer-bottom-links">
          <a href="${BASE_URL}/#/privacy-policy">Privacy</a>
          <a href="${BASE_URL}/#/refund-policy">Refunds</a>
          <a href="${BASE_URL}/#/terms-of-use">Terms</a>
          <a href="${BASE_URL}/#/contact">Support</a>
        </div>
        <p class="blog-footer-bottom-copy">&copy; 2026 PixabAnimation & SPurno. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
        </div>
      </div>
    </div>
  </footer>
  <script>
  window.addEventListener('scroll', function() {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    var bar = document.getElementById('readingProgress');
    var pct = document.getElementById('readingPercent');
    var article = document.querySelector('article');
    if (bar && article) {
      var total = article.scrollHeight - window.innerHeight;
      var percent = Math.min(100, Math.max(0, Math.round((-article.getBoundingClientRect().top / total) * 100)));
      bar.style.width = percent + '%';
      if (pct) pct.textContent = percent + '%';
    }
  });
  document.addEventListener('click', function(e) {
    var toggle = e.target.closest('#navToggle');
    if (toggle) { document.getElementById('navLinks').classList.toggle('open'); return; }
    if (!e.target.closest('.blog-nav-links') && !e.target.closest('#navToggle')) {
      document.getElementById('navLinks').classList.remove('open');
    }
  });
  </script>
  <div class="popup-ad-overlay" id="popupAdContainer"></div>
  <script src="../js/blog-ads.js"></script>
  <script src="../js/popup-ads.js"></script>
</body>
</html>`;
}

// ─── Sitemap Generator ────────────────────────────────────────────────────────

function regenerateSitemap() {
  console.log('\n📋 Regenerating sitemap...');
  const sitemapPath = join(rootDir, 'sitemap.xml');
  const staticPages = [
    { file: 'shop.html', priority: '0.9', changefreq: 'weekly' },
    { file: 'about.html', priority: '0.7', changefreq: 'monthly' },
    { file: 'contact.html', priority: '0.7', changefreq: 'monthly' },
    { file: 'privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
    { file: 'refund-policy.html', priority: '0.3', changefreq: 'yearly' },
    { file: 'terms-of-use.html', priority: '0.3', changefreq: 'yearly' }
  ];
  const today = getToday();

  const files = readdirSync(blogDir).filter(f => f.endsWith('.html')).sort();
  const articles = files.map(f => {
    const isIndex = f === 'index.html';
    return {
      loc: isIndex ? `${BASE_URL}/blog/` : `${BASE_URL}/blog/${f}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: isIndex ? '0.9' : '0.8'
    };
  });

  const staticUrls = staticPages.map(p => ({
    loc: `${BASE_URL}/${p.file}`,
    lastmod: today,
    changefreq: p.changefreq,
    priority: p.priority
  }));

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  for (const item of [...staticUrls, ...articles]) {
    xml += `  <url><loc>${item.loc}</loc><lastmod>${item.lastmod}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>\n`;
  }
  xml += '</urlset>\n';

  writeFileSync(sitemapPath, xml, 'utf-8');
  const urlCount = 1 + staticUrls.length + articles.length;
  console.log(`   ✅ sitemap.xml updated — ${urlCount} URLs`);
}

// ─── Blog Index Generator ────────────────────────────────────────────────────

function regenerateBlogIndex() {
  console.log('\n📄 Regenerating blog index from filesystem...');
  const indexPath = join(blogDir, 'index.html');
  const indexGen = join(__dirname, 'generate-blog-index-from-fs.mjs');
  if (existsSync(indexGen)) {
    const result = spawnSync('node', [indexGen], { stdio: 'inherit', cwd: rootDir });
    if (result.status === 0) {
      console.log('   ✅ blog/index.html regenerated');
    } else {
      console.error('   ❌ blog index regeneration failed (exit code ' + result.status + ')');
    }
  } else if (existsSync(indexPath)) {
    console.log('   ℹ️  generate-blog-index-from-fs.mjs not found, leaving existing index');
  } else {
    console.log('   ⚠️  blog/index.html not found — run generate-blog-index.mjs separately');
  }
}

// ─── AI Article Generator ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional tech/motion-design blog writer for PixabAnimation.
Your job is to write comprehensive, well-researched blog articles.

Output your response in this EXACT format (the delimiter lines are ====):

TITLE: Your Article Title Here (max 70 chars, SEO-friendly)
SLUG: url-friendly-slug-here (lowercase, hyphens, max 80 chars)
EXCERPT: 1-2 sentence summary (max 160 chars)
CATEGORY: One of: ${VALID_CATEGORIES.join(', ')}
TAGS: tag1, tag2, tag3, tag4, tag5 (comma-separated, 3-8 tags)
AUTHOR: PixabAnimation Team
META_TITLE: SEO-optimized title (max 60 chars)
META_DESCRIPTION: SEO description (max 160 chars)
====
Full article content in markdown here. Use ## for h2 headings, ### for h3.
Include 5-8 sections with substantial paragraphs. 1500-3000 words.
Write detailed, authoritative content that would rank well in search.

Guidelines:
- Write for motion designers, creative professionals, and tech enthusiasts
- Include practical tips, data, and actionable insights
- Use pipe-table format for spec tables when reviewing products
- Keep paragraphs 2-4 sentences
- Include a strong intro paragraph and a conclusion
- Natural internal linking to pixabanimation.github.io`;

async function generateArticle(topic) {
  console.log(`\n🤖 Generating article: "${topic}"...`);

  const raw = await callAI(SYSTEM_PROMPT, `Write a complete blog article about: ${topic}`, {
    maxTokens: 8192,
    temperature: 0.7
  });

  // Parse the delimiter-based format
  const parts = raw.split('====');
  const header = parts[0]?.trim() || '';
  const content = parts.slice(1).join('====').trim();

  if (!header || !content) {
    console.error('   Raw response excerpt:', raw.slice(0, 500));
    throw new Error('Could not split response into header/content. Check delimiter format.');
  }

  // Parse header fields
  const getField = (prefix) => {
    const regex = new RegExp(`^${prefix}:\\s*(.+)$`, 'im');
    const match = header.match(regex);
    return match ? match[1].trim() : '';
  };

  const title = getField('TITLE');
  const slugRaw = getField('SLUG') || toSlug(title);
  const excerpt = getField('EXCERPT');
  const category = getField('CATEGORY');
  const tagsRaw = getField('TAGS');
  const author = getField('AUTHOR') || 'PixabAnimation Team';
  const metaTitle = getField('META_TITLE') || title;
  const metaDesc = getField('META_DESCRIPTION') || excerpt;

  if (!title) {
    console.error('   Raw response excerpt:', raw.slice(0, 500));
    throw new Error('AI response missing title field');
  }

  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 8)
    : [];

  const slug = slugRaw;
  const date = getToday();
  const validatedCat = VALID_CATEGORIES.includes(category) ? category : 'Technology';

  if (!VALID_CATEGORIES.includes(category)) {
    console.warn(`   ⚠️  Category "${category}" not in valid list, using "Technology"`);
  }

  const post = {
    title,
    slug,
    excerpt: excerpt || metaDesc || '',
    content,
    category: validatedCat,
    tags,
    author,
    reading_time: calcReadingTime(content),
    cover_image: slug,
    meta_title: metaTitle,
    meta_description: metaDesc || excerpt || '',
    created_at: date
  };

  return post;
}

// ─── Generate Cover Image SVG ────────────────────────────────────────────────

function generateCoverSvg(title) {
  const words = title.split(' ');
  const lines = [];
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

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

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
  `    <text x="0" y="${startY + i * lineHeight}" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${esc(line)}</text>`
).join('\n')}
  </g>
</svg>`;
}

// ─── Write HTML File + Cover Image ────────────────────────────────────────────

async function writeArticle(post, skipExisting = true) {
  const filepath = join(blogDir, `${post.slug}.html`);

  if (skipExisting && existsSync(filepath)) {
    console.log(`   ⏭️  Skipped (exists): ${post.slug}.html`);
    return false;
  }

  // Generate cover SVG first so the HTML template can detect it
  const coverDir = join(rootDir, 'assets', 'images', 'blog');
  if (!existsSync(coverDir)) {
    mkdirSync(coverDir, { recursive: true });
  }
  const svgPath = join(coverDir, `${post.slug}.svg`);
  if (!existsSync(svgPath)) {
    const svg = generateCoverSvg(post.title);
    writeFileSync(svgPath, svg, 'utf-8');
    console.log(`   🖼️  Cover: assets/images/blog/${post.slug}.svg`);
  }

  const html = generateBlogHtml(post);
  writeFileSync(filepath, html, 'utf-8');
  const sizeKb = (html.length / 1024).toFixed(1);
  console.log(`   ✅ Written: ${post.slug}.html (${sizeKb} KB, ~${post.reading_time} min read)`);

  return true;
}

// ─── Trending Topics ──────────────────────────────────────────────────────────

const TRENDING_PROMPT = `List exactly 10 specific, currently trending blog topics for a motion design/animation/creative tech site.

Rules:
- Each topic must be a specific article title (40-120 characters)
- One topic per line, no numbering, no bullet points, no explanation
- No introduction, no conclusion, no commentary
- Just 10 lines, each line is a complete article topic

Example format:
How Runway Gen-4 is Changing Motion Design Workflows
Best Free Animation Software for Beginners in 2026
Top 10 After Effects Plugins Every Motion Designer Needs`;

async function discoverTrendingTopics(count = 10) {
  console.log('\n🔍 Discovering trending topics...');
  const raw = await callAI(TRENDING_PROMPT, `List ${count} currently trending blog topics.`, {
    model: getModel(),
    maxTokens: 2048,
    temperature: 0.8
  });

  // Clean up: remove list markers, empty lines, explanations
  const topics = raw
    .split('\n')
    .map(l => l.replace(/^[-*\d]+[.)]?\s*/, '').trim())
    .filter(Boolean)
    .filter(l => l.length > 20 && l.length < 200 && !l.startsWith('Here') && !l.startsWith('Since') && !l.startsWith('As a') && !l.startsWith('I') && !l.startsWith('The') && !l.includes(':**') && !l.startsWith('List'))
    .slice(0, count);

  if (topics.length === 0) {
    console.warn('   ⚠️ Could not parse topics from AI response, using fallback topics');
    return [
      'Best Free Animation Software for Beginners in 2026',
      'How AI is Changing Motion Design Workflows',
      'CSS vs JavaScript Animations: When to Use Each',
      'Top 10 After Effects Plugins Every Motion Designer Needs',
      'Lottie vs Rive: Which Animation Format Should You Use?'
    ];
  }

  console.log(`   Found ${topics.length} trending topics:`);
  topics.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));
  return topics;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let topics = [];
  let model = null;
  let force = false;
  let trendingMode = false;
  let trendingCount = 10;

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch' && args[i + 1]) {
      const batchFile = args[++i];
      const content = readFileSync(batchFile, 'utf-8');
      topics = content.split('\n').map(l => l.trim()).filter(Boolean);
    } else if (args[i] === '--model' && args[i + 1]) {
      model = args[++i];
    } else if (args[i] === '--force') {
      force = true;
    } else if (args[i] === '--trending') {
      trendingMode = true;
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        trendingCount = parseInt(args[++i]) || 10;
      }
    } else if (!args[i].startsWith('--')) {
      topics.push(args[i]);
    }
  }

  if (trendingMode) {
    topics = await discoverTrendingTopics(trendingCount);
  }

  // Interactive mode (only if no topics and not trending)
  if (topics.length === 0) {
    const readline = (await import('readline')).default;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => {
      rl.question('📝 Enter article topic (or comma-separated topics): ', resolve);
    });
    rl.close();
    if (!answer.trim()) {
      console.log('No topic provided. Exiting.');
      return;
    }
    topics = answer.split(',').map(t => t.trim()).filter(Boolean);
  }

  console.log(`\n🚀 PixabAnimation AI Blog Writer`);
  console.log(`   Model: ${model || getModel()}`);
  console.log(`   Topics: ${topics.length}`);
  console.log(`   Force overwrite: ${force}`);

  let written = 0;
  for (const topic of topics) {
    try {
      const post = await generateArticle(topic);
      const didWrite = await writeArticle(post, !force);
      if (didWrite) written++;
    } catch (err) {
      console.error(`   ❌ Failed: ${topic} — ${err.message}`);
    }
  }

  console.log(`\n📊 Summary: ${written}/${topics.length} articles written`);

  if (written > 0) {
    regenerateSitemap();
    regenerateBlogIndex();
  }

  console.log('\n✅ Done!');
}

// ─── Exports (for API server) ────────────────────────────────────────────────
export { callAI, generateArticle, writeArticle, discoverTrendingTopics,
  regenerateSitemap, regenerateBlogIndex, getModel, getApiKey, BASE_URL };
export { VALID_CATEGORIES, toSlug, generateBlogHtml, generateCoverSvg };

// ─── CLI Entry Point ──────────────────────────────────────────────────────────
const isCli = process.argv[1] &&
  (process.argv[1].replace(/\\/g, '/').endsWith('ai-blog-writer.mjs') ||
   process.argv[1].replace(/\\/g, '/').endsWith('ai-blog-writer'));

if (isCli) {
  main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  });
}
