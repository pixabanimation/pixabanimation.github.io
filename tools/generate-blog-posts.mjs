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
  return content;
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
function generatePostHtml(post, recentPosts) {
  const catColor = getCatColor(post.category);
  const isoDate = fmtDateISO(post.created_at || post.date);
  const longDate = fmtDate(post.created_at || post.date);
  const shortDate = fmtDateShort(post.created_at || post.date);
  const coverImg = coverUrl(post.cover_image);
  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
  const tagLinks = tags.map(t => `<a href="index.html" class="tag">${esc(t)}</a>`).join('\n      ');
  const ogTags = tags.map(t => `  <meta property="article:tag" content="${esc(t)}">`).join('\n');

  const metaTitle = post.meta_title || post.title;
  const metaDesc = post.meta_description || post.excerpt || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(metaTitle)} — PixabAnimation</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta property="og:title" content="${esc(metaTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="${escAttr(coverImg)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${BASE_URL}/blog/${post.slug}.html">
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
  <link rel="canonical" href="${BASE_URL}/blog/${post.slug}.html">
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
    "@id": "${BASE_URL}/blog/${post.slug}.html"
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
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "${BASE_URL}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "${BASE_URL}/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${esc(post.title)}",
      "item": "${BASE_URL}/blog/${post.slug}.html"
    }
  ]
}
  </script>
  <link rel="icon" type="image/png" href="${LOGO_URL}" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${LOGO_URL}" sizes="180x180">
  <meta name="msapplication-TileColor" content="#0066cc">
  <meta name="theme-color" content="#ffffff">
</head>
<body>
  <!-- Navigation -->
  <nav class="blog-navbar" id="blogNavbar">
    <div class="blog-nav-container">
      <a href="${BASE_URL}/" class="blog-nav-brand">
        <img src="${LOGO_URL}" alt="PixabAnimation">
        PixabAnimation
      </a>
      <button class="blog-nav-toggle" onclick="document.getElementById('blogNavLinks').classList.toggle('open')" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="blog-nav-links" id="blogNavLinks">
        <li><a href="${BASE_URL}/">Home</a></li>
        <li><a href="${BASE_URL}/#/shop">Shop</a></li>
        <li><a href="${BASE_URL}/#/shop?category=videos">Videos</a></li>
        <li><a href="${BASE_URL}/#/about">About</a></li>
        <li><a href="${BASE_URL}/#/contact">Contact</a></li>
        <li><a href="index.html">Blog</a></li>
      </ul>
      <div class="blog-nav-actions">
        <a href="${BASE_URL}/#/shop"><i class="fas fa-store"></i></a>
        <a href="${BASE_URL}/#/cart"><i class="fas fa-shopping-bag"></i></a>
      </div>
    </div>
  </nav>

<div class="blog-wrapper">
  <article>
    <div style="margin-bottom:24px">
      <div class="blog-category"><span style="font-size:1.2rem">✦</span> ${esc(post.category || 'Tech')}</div>
      <h1>${esc(post.title)}</h1>
      <div class="blog-meta">
        <span>📅 ${longDate}</span>
        <span>•</span>
        <span>📝 ${esc(post.author || 'PixabAnimation Team')}</span>
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
      <a href="https://www.facebook.com/sharer/sharer.php?u=${BASE_URL}/blog/${post.slug}.html" target="_blank" class="share-btn" style="background:rgba(0,0,0,.04)" onmouseover="this.style.background='#1877f2';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'">f</a>
      <a href="https://twitter.com/intent/tweet?text=${esc(encodeURIComponent(post.title))}&url=${BASE_URL}/blog/${post.slug}.html" target="_blank" class="share-btn" onmouseover="this.style.background='#000';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'">𝕏</a>
      <a href="https://www.pinterest.com/pin/create/button/?url=${BASE_URL}/blog/${post.slug}.html&description=${esc(encodeURIComponent(metaDesc))}" target="_blank" class="share-btn" onmouseover="this.style.background='#e60023';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'">P</a>
      <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href);alert('Link copied!')" onmouseover="this.style.background='rgba(0,102,204,0.1)';this.style.color='#0066cc'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'"><i class="fas fa-link"></i></button>
    </div>

    <div class="author-bio">
      <div class="author-avatar">P</div>
      <div class="author-info">
        <div class="name">${esc(post.author || 'PixabAnimation Team')}</div>
        <div class="desc">PixabAnimation creates premium motion graphics, animation assets, and stock footage used by creators worldwide. Our team of motion designers and creative technologists explores the intersection of animation and emerging technology.</div>
      </div>
      <div class="author-social">
        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" aria-label="Twitter">𝕏</a>
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </div>

    <div class="useful-links">
      <div class="label">Useful Links</div>
      <div class="grid">
        <a href="${BASE_URL}/#/shop">▸ Shop Premium Assets</a>
        <a href="${BASE_URL}/#/shop?category=videos">▸ Motion Graphics Stock</a>
        <a href="${BASE_URL}/#/about">▸ About PixabAnimation</a>
        <a href="${BASE_URL}/">▸ Return to Homepage</a>
      </div>
    </div>
  </article>

  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Recent Posts</div>
${recentPostsHtml(recentPosts, post.slug)}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Popular Tags</div>
      <div class="sidebar-tags">
${sidebarTagsHtml(recentPosts.map(p => typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || [])))}
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Top Authors</div>
      <div class="sidebar-author" style="margin-bottom:12px">
        <div class="initial">P</div>
        <div><div class="name">PixabAnimation</div><div class="role">Content Creator</div></div>
      </div>
      <div class="sidebar-author">
        <div class="initial" style="background:linear-gradient(135deg,#5856d6,#af52de)">S</div>
        <div><div class="name">SPurno</div><div class="role">Motion Design Expert</div></div>
      </div>
    </div>
  </aside>

  <div class="back-section">
    <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back to Blog</a>
  </div>
</div>

  <!-- Footer -->
  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <div class="name"><img src="${LOGO_URL}" alt="" style="width:24px;height:20px"> PixabAnimation</div>
          <div class="desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</div>
          <div class="blog-footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="blog-footer-col">
          <h4>Shop</h4>
          <a href="${BASE_URL}/#/shop">All Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos">Animation &amp; Video</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">After Effects Plugins</a>
        </div>
        <div class="blog-footer-col">
          <h4>Categories</h4>
          <a href="${BASE_URL}/#/shop?category=videos">Motion Graphics</a>
          <a href="${BASE_URL}/#/shop?category=green-screen-mockup">Green Screen</a>
          <a href="${BASE_URL}/#/shop">View All</a>
        </div>
        <div class="blog-footer-col">
          <h4>Support</h4>
          <a href="${BASE_URL}/#/contact">Contact Us</a>
          <a href="${BASE_URL}/#/about">About Us</a>
          <a href="index.html">Blog</a>
          <a href="${BASE_URL}/#/privacy-policy">Privacy</a>
        </div>
        <div class="blog-footer-col blog-footer-col-newsletter">
          <h4>Stay in the Loop</h4>
          <p class="blog-footer-newsletter-text">Get early access to new releases, exclusive discounts, and creative inspiration.</p>
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
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/refund-policy">Refunds</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/terms-of-use">Terms</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/contact">Support</a>
        </div>
        <p class="blog-footer-bottom-copy">&copy; &copy; 2026 PixabAnimation &amp; SPurno. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
        </div>
      </div>
    </div>
  </footer>

  <script>
    window.addEventListener('scroll', () => {
      document.getElementById('blogNavbar').classList.toggle('scrolled', window.scrollY > 50);
    });
  </script>
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

    const html = generatePostHtml(post, posts);
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
