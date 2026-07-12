#!/usr/bin/env node
/**
 * generate-blog-posts.mjs
 *
 * Generates static HTML files for blog posts (IDs 41-65) using
 * content from the Turso database. Produces files in blog/{slug}.html
 * following the same template as existing blog posts.
 *
 * Usage: node tools/generate-blog-posts.mjs
 */

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');

const BASE_URL = 'https://pixabanimation.github.io';
const COVER_BASE = `${BASE_URL}/assets/images/blog`;
const LOGO_URL = `${BASE_URL}/assets/pixabanimation-logo.png`;

// ─── DB Connection ──────────────────────────────────────────────────────────
const client = createClient({
  url: 'libsql://ecommercelog-spurno.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ'
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function coverUrl(cover) {
  if (!cover) return `${LOGO_URL}`;
  return cover.startsWith('http') ? cover : `${COVER_BASE}/${cover}.png`;
}

function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(s) {
  return esc(s);
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateISO(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().split('T')[0];
}

function makeId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function renderContent(content) {
  if (!content) return '<p>Content coming soon.</p>';

  // Build a colorful spec table CSS block (injected once)
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

  // Split content into lines
  const lines = content.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];
  let tableCssAdded = false;

  function flushTable() {
    if (tableRows.length === 0) return;
    if (!tableCssAdded) {
      result.push(specCss);
      tableCssAdded = true;
    }
    result.push('<div class="spec-table-wrap"><table class="spec-table">');
    let currentSection = '';
    for (let r = 0; r < tableRows.length; r++) {
      const row = tableRows[r];
      // Skip separator rows (like | :--- | :--- | :--- |)
      if (/^\|\s*:?-+:?\s*\|(\s*:?-+:?\s*\|)*\s*$/.test(row)) continue;

      // Parse cells
      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length === 0) continue;

      // Check if this is a section header row (all cells after first are empty, contains bold)
      const nonEmptyCells = cells.filter(c => c !== '' && c !== '|');
      const isSectionHeader = cells.length >= 2 &&
        /\*\*.+\*\*/.test(cells[0]) &&
        cells.slice(1).every(c => c === '' || c === '|' || /^\s*$/.test(c));

      // Also handle rows where first cell has bold and remaining are empty-trimmed
      const isSectionRow = isSectionHeader || (
        cells.length >= 1 &&
        /\*\*.+\*\*/.test(cells[0]) &&
        cells.slice(1).every(c => !c || c === '')
      );

      if (isSectionRow) {
        const sectionName = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        result.push(`<tr class="spec-section-row"><td colspan="10">${esc(sectionName)}</td></tr>`);
        currentSection = sectionName;
      } else if (cells.length >= 2) {
        const key = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        // Join remaining cells as the value
        const value = cells.slice(1).filter(c => c !== '').join(', ');
        if (key) {
          // Normal key-value row
          result.push(`<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`);
        } else if (value) {
          // Continuation row (empty first cell) — indent the value as a sub-item
          result.push(`          <tr><td colspan="2" style="padding-left:36px;color:rgba(0,0,0,.5);font-size:.85rem">${esc(value)}</td></tr>`);
        }
      } else if (cells.length === 1) {
        // Single cell row - could be a note or continuation
        const val = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
        if (val) {
          result.push(`<tr><td colspan="10">${esc(val)}</td></tr>`);
        }
      }
    }
    result.push('</table></div>');
    tableRows = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect markdown table rows (lines with | separator)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|', 1)) {
      inTable = true;
      tableRows.push(trimmed);
    } else {
      if (inTable) {
        flushTable();
        inTable = false;
      }

      // Convert basic markdown inline formatting
      let processed = line;
      // Convert **bold** to <strong>
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Convert *italic* to <em>
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Convert markdown headings (## heading)
      processed = processed.replace(/^##\s+(.+)$/, '<h2>$1</h2>');
      processed = processed.replace(/^###\s+(.+)$/, '<h3>$1</h3>');
      // Convert markdown images: ![alt](url) or !! [alt](url)
      processed = processed.replace(/(!|!!)\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$3" alt="$2" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0" loading="lazy">');
      // Convert markdown links: [text](url)
      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      // Wrap paragraphs (non-empty, non-heading, non-image, non-HTML lines)
      if (processed.trim() && !processed.startsWith('<h') && !processed.startsWith('<img') && !processed.startsWith('<') && !processed.startsWith('</')) {
        processed = '<p>' + processed + '</p>';
      }

      result.push(processed);
    }
  }
  flushTable(); // Flush any remaining table

  return result.join('\n');
}

function recentPostsHtml(posts, currentSlug) {
  return posts
    .filter(p => p.slug !== currentSlug)
    .slice(0, 3)
    .map(p => {
      return `      <a href="${p.slug}.html" class="sidebar-post">
        <span class="icon" style="background:${CAT_COLORS[p.category] || '#0066cc'}20;border-radius:8px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0">📄</span>
        <div><div class="title">${esc(p.title)}</div><div class="date">${fmtDateShort(p.created_at || p.date)}</div></div>
      </a>`;
    })
    .join('\n');
}

function sidebarTagsHtml(tags) {
  const topTags = [];
  const count = {};
  tags.forEach(t => {
    t.forEach(tag => { count[tag] = (count[tag] || 0) + 1; });
  });
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return sorted.map(([tag]) => {
    const tagId = makeId(tag);
    return `      <a href="index.html" class="sidebar-tag" onclick="return plSearchTag('${escAttr(tag)}')">${esc(tag)}</a>`;
  }).join('\n');
}

const CAT_COLORS = {
  'AI': '#0066cc',
  'Web': '#5856d6',
  'Animation': '#34c759',
  'Design': '#ff9500',
  'Freelancing': '#ff2d55',
  'Technology': '#5ac8fa',
  'Career': '#af52de',
  'VFX': '#ff6482',
  'Typography': '#00c7be',
  'Tools': '#ff9f0a',
  'Resources': '#64d2ff',
  'Mobile Phone': '#34c759',
  'Laptop': '#007aff',
  'Tablet': '#5856d6',
  'Wearable': '#ff9f0a'
};

function getCatColor(cat) {
  return CAT_COLORS[cat] || '#0066cc';
}

// ─── Generate HTML ──────────────────────────────────────────────────────────
function generatePostHtml(post, recentPosts, blogAds, popupAds) {
  const catColor = getCatColor(post.category);
  const isoDate = fmtDateISO(post.created_at || post.date);
  const longDate = fmtDate(post.created_at || post.date);
  const shortDate = fmtDateShort(post.created_at || post.date);
  const coverImg = coverUrl(post.cover_image);
  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
  const tagLinks = tags.map(t => `<a href="index.html" class="tag">${esc(t)}</a>`).join('\n        ');
  const ogTags = tags.map(t => `  <meta property="article:tag" content="${esc(t)}">`).join('\n');

  const metaTitle = post.meta_title || post.title;
  const metaDesc = post.meta_description || post.excerpt || '';
  const shareUrl = `${BASE_URL}/blog/${post.slug}.html`;
  const shareTitle = encodeURIComponent(metaTitle);
  const shareDesc = encodeURIComponent(metaDesc);

  // Generate recent posts sidebar HTML
  const recentHtml = recentPosts
    .filter(p => p.slug !== post.slug)
    .slice(0, 4)
    .map(p => {
      const pShort = fmtDateShort(p.created_at || p.date);
      return `        <a href="${p.slug}.html" class="sidebar-post">
          <span class="icon"><i class="fas fa-file-alt" style="color:${getCatColor(p.category)}"></i></span>
          <div><div class="title">${esc(p.title)}</div><div class="date">${pShort}</div></div>
        </a>`;
    }).join('\n');

  // Generate related posts (same category)
  const related = recentPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);
  const relatedHtml = related.length > 0 ? `
  <div class="related-articles">
    <h2 class="related-articles-title">Related Articles</h2>
    <div class="related-grid">
${related.map(p => {
  const pCover = coverUrl(p.cover_image);
  const pShort = fmtDateShort(p.created_at || p.date);
  return `      <a href="${p.slug}.html" class="related-card">
        <img src="${escAttr(pCover)}" alt="${esc(p.title)}" class="related-card-img" loading="lazy">
        <div class="related-card-body">
          <div class="related-card-cat">${esc(p.category)}</div>
          <div class="related-card-title">${esc(p.title)}</div>
          <div class="related-card-meta">${pShort} · ${p.reading_time || 8} min read</div>
        </div>
      </a>`;
}).join('\n')}
    </div>
  </div>` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(metaTitle)} — PixabAnimation</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta property="og:title" content="${esc(metaTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="${escAttr(coverImg)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:site_name" content="PixabAnimation">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="${isoDate}">
  <meta property="article:modified_time" content="${isoDate}">
  <meta property="article:author" content="${esc(post.author || 'PixabAnimation Team')}">
  <meta property="article:section" content="${esc(post.category || 'Tech')}">
${ogTags}
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="${esc(metaTitle)}">
  <meta name="twitter:description" content="${esc(metaDesc)}">
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
  "headline": "${esc(metaTitle)}",
  "description": "${esc(metaDesc)}",
  "image": "${escAttr(coverImg)}",
  "datePublished": "${isoDate}",
  "dateModified": "${isoDate}",
  "author": {
    "@type": "Organization",
    "name": "${esc(post.author || 'PixabAnimation Team')}",
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
  "articleSection": "${esc(post.category || 'Tech')}",
  "timeRequired": "${post.reading_time} min read"
}
  </script>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${BASE_URL}/blog/" },
    { "@type": "ListItem", "position": 3, "name": "${esc(post.title)}", "item": "${shareUrl}" }
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
          <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation" width="28" height="24">
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
    <a href="index.html">${esc(post.category || 'Tech')}</a><span class="sep">/</span>
    <span class="current">${esc(metaTitle)}</span>
  </div>

<div class="blog-wrapper">
  <article>
    <div class="article-hero">
      <a href="index.html" class="article-category-badge"><i class="fas fa-tag" style="font-size:0.7rem"></i> ${esc(post.category || 'Tech')}</a>
      <h1>${esc(post.title)}</h1>
      <div class="article-meta-row">
        <span class="meta-item"><i class="fas fa-calendar-alt"></i> ${longDate}</span>
        <span class="meta-dot"></span>
        <span class="meta-item"><i class="fas fa-user"></i> ${esc(post.author || 'PixabAnimation Team')}</span>
        <span class="meta-dot"></span>
        <span class="reading-time-badge"><i class="fas fa-clock"></i> ${post.reading_time || 8} min read</span>
      </div>
    </div>

    <div class="blog-cover">
      <img src="${escAttr(coverImg)}" alt="${esc(post.title)}" loading="lazy">
    </div>

    <div class="blog-content">
${renderContent(post.content)}
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
        <div class="name">${esc(post.author || 'PixabAnimation Team')}</div>
        <div class="desc">PixabAnimation creates premium motion graphics, animation assets, and stock footage used by creators worldwide. Our team of motion designers and creative technologists explores the intersection of animation and emerging technology.</div>
      </div>
      <div class="author-social">
        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </div>

      <div id="ad-slot-1-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-cube"></i></div><div class="blog-ad-text"><h3>Premium Motion Graphics Assets</h3><p>Browse 4000+ professional 4K motion backgrounds, animated templates, and stock footage.</p><a href="${BASE_URL}/#/shop" class="blog-ad-cta">Browse Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div>
      <div id="ad-slot-2-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-film"></i></div><div class="blog-ad-text"><h3>4K Video Clips &amp; Templates</h3><p>Royalty-free motion graphics, lower thirds, and title animations.</p><a href="${BASE_URL}/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a></div></div></div></div>
      <div id="ad-slot-3-article"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-layer-group"></i></div><div class="blog-ad-text"><h3>After Effects Templates</h3><p>Professional logo reveals, typography animations, and infographic templates.</p><a href="https://stock.adobe.com/contributor/211977281/SPurnoAnimation" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div>

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

    <div class="sidebar-section">
      <div class="sidebar-title">Recent Posts</div>
${recentHtml}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Popular Tags</div>
      <div class="sidebar-tags">
${sidebarTagsHtml(recentPosts.map(p => typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || [])))}
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
      <div id="ad-slot-2" style="margin-top:12px"></div>
      <div id="ad-slot-3" style="margin-top:12px"></div>
    </div>
  </aside>

  ${relatedHtml}

  <div class="back-section">
    <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back to Blog</a>
  </div>
</div>

  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation Logo" width="28" height="24" loading="lazy" style="filter:brightness(0) invert(1)">
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

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching blog posts from database...');
  const result = await client.execute(
    'SELECT id, title, slug, excerpt, content, category, author, reading_time, featured, tags, cover_image, meta_title, meta_description, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at ASC'
  );
  const posts = result.rows;
  console.log(`Found ${posts.length} posts to generate.\n`);



  // Fetch active blog ads and popup ads for pre-rendering
  let blogAds = [], popupAds = [];
  try {
    const adRows = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    blogAds = adRows.rows;
    const popupRows = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    popupAds = popupRows.rows;
    if (blogAds.length > 0) console.log('  📢 Blog ads:', blogAds.length);
    if (popupAds.length > 0) console.log('  🪟 Popup ads:', popupAds.length);
  } catch(e) {
    console.warn('  ⚠️ Failed to fetch ads:', e.message);
  }
    // Convert external cover URLs to local slug-based paths.
    // Each blog post's image is saved as assets/images/blog/{slug}.{ext}.
    // Since multiple posts may share the same Unsplash URL, we use the post's
    // own unique slug rather than a URL-to-slug map (which would have duplicate keys).
    for (const post of posts) {
      if (post.cover_image && (post.cover_image.startsWith('http://') || post.cover_image.startsWith('https://'))) {
        post.cover_image = post.slug;
      }
    }

    let generated = 0;
  let skipped = 0;

  for (const post of posts) {
    const filename = `${post.slug}.html`;
    const filepath = join(blogDir, filename);

    if (existsSync(filepath)) {
      console.log(`  ⏭  Skipped (exists): ${filename}`);
      skipped++;
      continue;
    }

    // Parse tags from JSON string if needed
    if (typeof post.tags === 'string') {
      try { post.tags = JSON.parse(post.tags); } catch(e) { post.tags = []; }
    }

    const html = generatePostHtml(post, posts, blogAds, popupAds);
    writeFileSync(filepath, html, 'utf-8');
    console.log(`  ✅ Generated: ${filename} (${(html.length / 1024).toFixed(1)} KB)`);
    generated++;
  }

  console.log(`\n📊 Summary: ${generated} generated, ${skipped} skipped, ${posts.length} total`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
