#!/usr/bin/env node
/**
 * generate-blog-index.mjs
 *
 * Reads all published blog posts from the database and generates
 * a premium static blog/index.html listing page.
 *
 * Usage: node tools/generate-blog-index.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const outputPath = join(blogDir, 'index.html');

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
  return cover.startsWith('http') ? cover : `${COVER_BASE}/${cover}.png`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escAttr(s) {
  return esc(s);
}
function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const CAT_COLORS = {
  'AI': '#0066cc', 'Web': '#5856d6', 'Animation': '#34c759', 'Design': '#ff9500',
  'Freelancing': '#ff2d55', 'Technology': '#5ac8fa', 'Career': '#af52de',
  'VFX': '#ff6482', 'Typography': '#00c7be', 'Tools': '#ff9f0a', 'Resources': '#64d2ff',
  'Mobile Phone': '#34c759', 'Laptop': '#007aff', 'Tablet': '#5856d6', 'Wearable': '#ff9f0a'
};

// ─── Build Premium HTML ──────────────────────────────────────────────────────
function buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PixabAnimation Blog — Motion Graphics, AI & Design Insights (${BLOG_DATA.length}+ Articles)</title>
  <meta name="description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI in design, animation, typography, freelancing, and creative technology. ${BLOG_DATA.length}+ articles from industry professionals.">
  <meta name="keywords" content="motion graphics, blog, animation, AI, design, typography, freelancing, After Effects, tutorials, creative insights">
  <meta name="author" content="PixabAnimation">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/blog/">

  <!-- Open Graph -->
  <meta property="og:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta property="og:description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI, design, animation, tech reviews, and creative technology. ${BLOG_DATA.length}+ articles.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/blog/">
  <meta property="og:image" content="${LOGO_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="PixabAnimation">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta name="twitter:description" content="Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, and gadgets. ${BLOG_DATA.length}+ articles.">
  <meta name="twitter:image" content="${LOGO_URL}">

  <!-- Theme & Icons -->
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" type="image/png" href="${LOGO_URL}" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${LOGO_URL}" sizes="180x180">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="blog.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${BASE_URL}/blog/" }
    ]
  }
  </script>
  <!-- JSON-LD: ItemList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PixabAnimation Blog Articles",
    "description": "Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, and gadgets.",
    "url": "${BASE_URL}/blog/",
    "numberOfItems": ${BLOG_DATA.length},
    "itemListElement": [
${BLOG_DATA.map((p, i) => `      { "@type": "ListItem", "position": ${i + 1}, "url": "${BASE_URL}/blog/${p.slug}.html" }`).join(',\n')}
    ]
  }
  </script>
  <!-- JSON-LD: Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PixabAnimation",
    "url": "${BASE_URL}/",
    "logo": "${LOGO_URL}",
    "description": "Premium marketplace for motion graphics, animation assets, and creative tools for creators worldwide.",
    "sameAs": ["https://facebook.com/pixabanimation","https://twitter.com/pixabanimation","https://instagram.com/pixabanimation","https://pinterest.com/pixabanimation"]
  }
  </script>

  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    .pl-hero{position:relative;padding:80px 24px 60px;text-align:center;overflow:hidden;background:linear-gradient(180deg,#f5f5f7 0,#ffffff 100%)}
    .pl-hero::before{content:'';position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(0,102,204,0.04) 0,transparent 70%);top:-200px;right:-150px;pointer-events:none}
    .pl-hero::after{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(41,151,255,0.03) 0,transparent 70%);bottom:-150px;left:-120px;pointer-events:none}
    .pl-hero-inner{max-width:780px;margin:0 auto;position:relative;z-index:1}
    .pl-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.08);border-radius:9999px;font-size:.8rem;font-weight:600;color:#06c;margin-bottom:24px;letter-spacing:.02em}
    .pl-hero-title{font-family:Inter,-apple-system,sans-serif;font-size:3.2rem;font-weight:800;line-height:1.1;margin-bottom:16px;letter-spacing:-.03em;background:linear-gradient(135deg,#1d1d1f 0,#06c 50%,#2997ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .pl-hero-desc{font-size:1.1rem;color:rgba(0,0,0,.5);line-height:1.7;max-width:560px;margin:0 auto 32px}
    .pl-hero-stats{display:flex;justify-content:center;gap:48px;margin-top:32px;padding-top:28px;border-top:1px solid rgba(0,0,0,.06)}
    .pl-hero-stat{text-align:center}
    .pl-hero-stat-num{font-size:1.6rem;font-weight:800;background:linear-gradient(135deg,#06c,#2997ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .pl-hero-stat-label{font-size:.8rem;color:rgba(0,0,0,.4);margin-top:2px;font-weight:500}
    .pl-search-wrap{max-width:480px;margin:0 auto;display:flex;align-items:center;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:9999px;padding:4px 20px;transition:all .25s ease;box-shadow:0 2px 8px rgba(0,0,0,.04)}
    .pl-search-wrap:focus-within{border-color:#06c;box-shadow:0 4px 16px rgba(0,102,204,.12)}
    .pl-search-wrap i{color:rgba(0,0,0,.25);font-size:.85rem}
    .pl-search-wrap input{border:none;background:transparent;padding:12px;font-size:.9rem;outline:none;width:100%}
    .pl-wrapper{max-width:1200px;margin:0 auto;padding:0 24px}
    .pl-layout{display:grid;grid-template-columns:1fr 300px;gap:48px;padding:40px 0}
    @media(max-width:960px){.pl-layout{grid-template-columns:1fr}}
    .pl-main{min-width:0}
    .pl-cat-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px}
    .pl-cat-chip{padding:7px 18px;border-radius:9999px;background:rgba(0,0,0,.03);border:1px solid rgba(0,0,0,.06);font-size:.82rem;font-weight:500;color:rgba(0,0,0,.55);cursor:pointer;transition:all .25s ease;white-space:nowrap;text-decoration:none;font-family:inherit;display:inline-block}
    .pl-cat-chip:hover{background:rgba(0,102,204,.06);border-color:rgba(0,102,204,.2);color:#06c}
    .pl-cat-chip.active{background:#06c;border-color:#06c;color:#fff;font-weight:600}
    .pl-cat-chip.all-chip{background:#1d1d1f;border-color:#1d1d1f;color:#fff;font-weight:600}
    .pl-section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    .pl-section-header h2{font-size:1.2rem;font-weight:700;color:#1d1d1f;letter-spacing:-.02em}
    .pl-section-count{font-size:.8rem;color:rgba(0,0,0,.35);font-weight:500}
    .pl-featured-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:48px}
    .pl-feat-hero{grid-row:span 2;position:relative;border-radius:16px;overflow:hidden;display:block;text-decoration:none;min-height:400px}
    .pl-feat-hero-img{width:100%;height:100%;position:absolute;inset:0}
    .pl-feat-hero-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
    .pl-feat-hero:hover .pl-feat-hero-img img{transform:scale(1.05)}
    .pl-feat-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0,rgba(0,0,0,.3) 40%,rgba(0,0,0,.1) 70%,transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:32px}
    .pl-feat-hero-cat{display:inline-block;padding:4px 12px;background:rgba(255,255,255,.15);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:9999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#fff;width:fit-content;margin-bottom:12px}
    .pl-feat-hero-title{font-family:Inter,-apple-system,sans-serif;font-size:1.5rem;font-weight:700;color:#fff;line-height:1.25;margin-bottom:8px;letter-spacing:-.02em}
    .pl-feat-hero-meta{display:flex;align-items:center;gap:12px;font-size:.8rem;color:rgba(255,255,255,.7)}
    .pl-feat-side{position:relative;border-radius:14px;overflow:hidden;display:block;text-decoration:none;min-height:190px}
    .pl-feat-side-img{width:100%;height:100%;position:absolute;inset:0}
    .pl-feat-side-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
    .pl-feat-side:hover .pl-feat-side-img img{transform:scale(1.06)}
    .pl-feat-side-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0,rgba(0,0,0,.2) 50%,transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px}
    .pl-feat-side-cat{display:inline-block;padding:3px 10px;background:rgba(255,255,255,.15);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border-radius:9999px;font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#fff;width:fit-content;margin-bottom:8px}
    .pl-feat-side-title{font-size:1rem;font-weight:700;color:#fff;line-height:1.3;margin-bottom:4px}
    .pl-feat-side-date{font-size:.72rem;color:rgba(255,255,255,.6)}
    .pl-articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
    @media(max-width:1024px){.pl-articles-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.pl-articles-grid{grid-template-columns:1fr}}
    .pl-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:14px;overflow:hidden;transition:all .3s ease;display:block;text-decoration:none;color:inherit}
    .pl-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08);border-color:rgba(0,102,204,.15)}
    .pl-card-img-wrap{position:relative;aspect-ratio:16/10;overflow:hidden;background:#f5f5f7}
    .pl-card-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
    .pl-card:hover .pl-card-img-wrap img{transform:scale(1.06)}
    .pl-card-cat-badge{position:absolute;top:10px;left:10px;padding:3px 10px;border-radius:9999px;font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#fff}
    .pl-card-body{padding:16px 18px 18px}
    .pl-card-meta-line{display:flex;align-items:center;gap:8px;font-size:.72rem;color:rgba(0,0,0,.4);margin-bottom:6px}
    .pl-card-title{font-size:.95rem;font-weight:700;line-height:1.35;margin-bottom:6px;color:#1d1d1f;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .pl-card:hover .pl-card-title{color:#06c}
    .pl-card-excerpt{font-size:.8rem;color:rgba(0,0,0,.5);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .pl-card-footer{display:flex;align-items:center;gap:8px;font-size:.72rem;color:rgba(0,0,0,.35)}
    .pl-card-footer .dot{width:3px;height:3px;border-radius:50%;background:rgba(0,0,0,.2)}
    .pl-newsletter{background:linear-gradient(135deg,#06c 0,#2997ff 100%);border-radius:20px;padding:48px;text-align:center;color:#fff;margin-bottom:40px;position:relative;overflow:hidden}
    .pl-newsletter::before{content:'';position:absolute;width:400px;height:400px;background:rgba(255,255,255,.04);border-radius:50%;top:-120px;right:-80px;pointer-events:none}
    .pl-newsletter::after{content:'';position:absolute;width:250px;height:250px;background:rgba(255,255,255,.03);border-radius:50%;bottom:-60px;left:-60px;pointer-events:none}
    .pl-newsletter-inner{position:relative;z-index:1;max-width:520px;margin:0 auto}
    .pl-newsletter h3{font-size:1.5rem;font-weight:700;margin-bottom:8px;letter-spacing:-.02em}
    .pl-newsletter p{font-size:.9rem;opacity:.85;margin-bottom:20px;line-height:1.6}
    .pl-newsletter-form{display:flex;gap:8px;max-width:420px;margin:0 auto}
    .pl-newsletter-form input{flex:1;padding:12px 18px;border-radius:9999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:#fff;font-size:.85rem;outline:none;font-family:inherit}
    .pl-newsletter-form input::placeholder{color:rgba(255,255,255,.5)}
    .pl-newsletter-form input:focus{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.15)}
    .pl-newsletter-form button{padding:12px 24px;border-radius:9999px;background:#fff;color:#06c;border:none;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .25s ease;font-family:inherit;white-space:nowrap}
    .pl-newsletter-form button:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.15)}
    .pl-newsletter-note{font-size:.72rem;opacity:.5;margin-top:10px}
    .pl-sidebar{position:sticky;top:80px}
    @media(max-width:960px){.pl-sidebar{position:static;margin-top:32px}}
    .pl-sb-widget{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:22px;margin-bottom:18px;box-shadow:0 1px 4px rgba(0,0,0,.02)}
    .pl-sb-widget-title{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:rgba(0,0,0,.35);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #06c}
    .pl-sb-post{display:flex;align-items:center;gap:12px;padding:8px 0;text-decoration:none;color:inherit;border-bottom:1px solid rgba(0,0,0,.04);transition:opacity .2s}
    .pl-sb-post:last-child{border-bottom:none}
    .pl-sb-post:hover{opacity:.7}
    .pl-sb-post-img{width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#f0f0f0}
    .pl-sb-post-info{flex:1;min-width:0}
    .pl-sb-post-title{font-size:.82rem;font-weight:600;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pl-sb-post-date{font-size:.7rem;color:rgba(0,0,0,.35);margin-top:2px}
    .pl-sb-cat{display:flex;justify-content:space-between;align-items:center;padding:7px 0;text-decoration:none;color:inherit;border-bottom:1px solid rgba(0,0,0,.04);font-size:.82rem;transition:color .2s}
    .pl-sb-cat:last-child{border-bottom:none}
    .pl-sb-cat:hover{color:#06c}
    .pl-sb-cat-name{display:flex;align-items:center;gap:8px}
    .pl-sb-cat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .pl-sb-cat-count{color:rgba(0,0,0,.25);font-size:.78rem}
    .pl-sb-tags{display:flex;flex-wrap:wrap;gap:6px}
    .pl-sb-tag{display:inline-block;padding:4px 10px;background:rgba(0,102,204,.05);border:1px solid rgba(0,102,204,.08);border-radius:9999px;font-size:.72rem;color:#06c;text-decoration:none;transition:all .2s}
    .pl-sb-tag:hover{background:rgba(0,102,204,.1)}
    .pl-sb-author{display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .pl-sb-author:last-child{margin-bottom:0}
    .pl-sb-author-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:#fff;flex-shrink:0}
    .pl-sb-author-name{font-size:.85rem;font-weight:600;color:#1d1d1f}
    .pl-sb-author-role{font-size:.7rem;color:rgba(0,0,0,.35)}
    @media(max-width:768px){
      .pl-hero{padding:60px 20px 40px}
      .pl-hero-title{font-size:2rem}
      .pl-hero-desc{font-size:.95rem}
      .pl-hero-stats{gap:28px;flex-wrap:wrap}
      .pl-featured-grid{grid-template-columns:1fr}
      .pl-feat-hero{grid-row:span 1;min-height:280px}
      .pl-feat-side{min-height:160px}
      .pl-feat-hero-title{font-size:1.2rem}
      .pl-newsletter{padding:32px 20px;border-radius:14px}
      .pl-newsletter h3{font-size:1.2rem}
      .pl-newsletter-form{flex-direction:column}
      .pl-sb-widget{padding:16px}
    }
    @media(max-width:480px){
      .pl-hero-title{font-size:1.5rem}
      .pl-hero-stat-num{font-size:1.2rem}
      .pl-feat-hero{min-height:220px}
      .pl-feat-hero-overlay{padding:20px}
      .pl-feat-hero-title{font-size:1rem}
      .pl-card-body{padding:12px 14px}
    }
    .pl-home-cta{text-align:center;padding:0 24px 48px}
    .pl-home-cta a{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:linear-gradient(135deg,#06c,#0071e3);color:#fff;border-radius:9999px;font-size:.9rem;font-weight:600;text-decoration:none;transition:all .25s ease}
    .pl-home-cta a:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,102,204,.3)}
  </style>
</head>
<body>

  <!-- Navigation (matching homepage) -->
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navLinks">
        <li class="nav-brand-item">
          <a href="${BASE_URL}/" class="nav-brand">
            <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation" class="brand-logo" width="36" height="32">
          </a>
        </li>
        <li><a href="${BASE_URL}/" class="nav-link active" data-nav><i class="fas fa-home"></i> Home</a></li>
        <li><a href="${BASE_URL}/#/shop" class="nav-link" data-nav><i class="fas fa-store"></i> Shop</a></li>
        <li><a href="${BASE_URL}/#/shop?category=videos" class="nav-link" data-nav><i class="fas fa-video"></i> Videos</a></li>
        <li><a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins" class="nav-link" data-nav><i class="fas fa-plug"></i> Plugins</a></li>
        <li><a href="index.html" class="nav-link" data-nav><i class="fas fa-newspaper"></i> Blog</a></li>
        <li><a href="${BASE_URL}/#/about" class="nav-link" data-nav><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="${BASE_URL}/#/contact" class="nav-link" data-nav><i class="fas fa-envelope"></i> Contact</a></li>
        <li class="nav-divider-mobile"><hr></li>
        <li><a href="${BASE_URL}/#/wishlist" class="nav-link nav-action-mobile" data-nav><i class="fas fa-heart"></i> Wishlist <span class="badge wishlist-badge-mobile">0</span></a></li>
        <li><a href="${BASE_URL}/#/cart" class="nav-link nav-action-mobile" data-nav><i class="fas fa-shopping-bag"></i> Cart <span class="badge cart-badge-mobile">0</span></a></li>
        <li><a href="${BASE_URL}/#/login" class="nav-link nav-action-mobile" data-nav><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
        <li><a href="${BASE_URL}/#/profile" class="nav-link nav-action-mobile" data-nav><i class="fas fa-user"></i> Profile</a></li>
      </ul>
      <div class="nav-actions">
        <a href="${BASE_URL}/#/wishlist" class="nav-icon-btn" aria-label="Wishlist">
          <i class="fas fa-heart"></i>
          <span class="badge wishlist-badge">0</span>
        </a>
        <a href="${BASE_URL}/#/cart" class="nav-icon-btn" aria-label="Cart">
          <i class="fas fa-shopping-bag"></i>
          <span class="badge cart-badge">0</span>
        </a>
        <a href="${BASE_URL}/#/login" class="btn btn-sm btn-primary">Sign In</a>
      </div>
    </div>
  </nav>

  <!-- ═══ Hero ═══ -->
  <section class="pl-hero">
    <div class="pl-hero-inner">
      <div class="pl-hero-badge">
        <i class="fas fa-newspaper"></i> Latest Insights
      </div>
      <h1 class="pl-hero-title">PixabAnimation Blog</h1>
      <p class="pl-hero-desc">Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, gadgets, and more. ${BLOG_DATA.length}+ articles.</p>
      <div class="pl-search-wrap">
        <i class="fas fa-search"></i>
        <input type="search" id="plSearchInput" placeholder="Search articles..." aria-label="Search blog posts" oninput="plFilterArticles(this.value)">
      </div>
      <div class="pl-hero-stats">
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${BLOG_DATA.length}+</div>
          <div class="pl-hero-stat-label">Articles</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${categories.length}</div>
          <div class="pl-hero-stat-label">Categories</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${tags.length}</div>
          <div class="pl-hero-stat-label">Topics</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">15+</div>
          <div class="pl-hero-stat-label">Min Read Avg</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ Main Content ═══ -->
  <div class="pl-wrapper">
    <div class="pl-layout">
      <div class="pl-main">

        <!-- Featured Articles -->
        <div class="pl-section-header">
          <h2>Featured <span style="color:#06c">Articles</span></h2>
          <span class="pl-section-count">Editor's picks</span>
        </div>
        <div class="pl-featured-grid">
          <a href="${featured[0].slug}.html" class="pl-feat-hero">
            <div class="pl-feat-hero-img">
              <img src="${escAttr(coverUrl(featured[0].cover))}" alt="${escAttr(featured[0].title)}" loading="eager">
            </div>
            <div class="pl-feat-hero-overlay">
              <span class="pl-feat-hero-cat">${esc(featured[0].category)}</span>
              <h3 class="pl-feat-hero-title">${esc(featured[0].title)}</h3>
              <div class="pl-feat-hero-meta">
                <span>📅 ${fmtDate(featured[0].date)}</span>
                <span>📖 ${featured[0].reading_time} min read</span>
              </div>
            </div>
          </a>
          ${[1, 2].map(i => {
            const p = featured[i];
            if (!p) return '';
            return `<a href="${p.slug}.html" class="pl-feat-side">
              <div class="pl-feat-side-img">
                <img src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
              </div>
              <div class="pl-feat-side-overlay">
                <span class="pl-feat-side-cat">${esc(p.category)}</span>
                <h3 class="pl-feat-side-title">${esc(p.title)}</h3>
                <span class="pl-feat-side-date">${fmtDate(p.date)}</span>
              </div>
            </a>`;
          }).join('')}
        </div>

        <!-- Category Filter Bar -->
        <div class="pl-cat-bar" id="plCatBar">
          <a href="index.html" class="pl-cat-chip all-chip active" data-cat="all" onclick="return plFilterByCat('all', this)">All</a>
${categories.map(c => `<a href="index.html" class="pl-cat-chip" data-cat="${escAttr(c.category)}" onclick="return plFilterByCat('${escAttr(c.category)}', this)" style="--cat-color: ${CAT_COLORS[c.category] || '#06c'}">${esc(c.category)}</a>`).join('\n')}
        </div>

        <!-- All Articles -->
        <div class="pl-section-header">
          <h2>All <span style="color:#06c">Articles</span></h2>
          <span class="pl-section-count" id="plArticleCount">${BLOG_DATA.length} articles</span>
        </div>
        <div class="pl-articles-grid" id="plArticlesGrid">
${sortedAll.map(p => {
  const catColor = CAT_COLORS[p.category] || '#06c';
  return `          <a href="${p.slug}.html" class="pl-card" data-category="${escAttr(p.category)}" data-title="${escAttr(p.title.toLowerCase())}" data-excerpt="${escAttr(p.excerpt.toLowerCase())}">
            <div class="pl-card-img-wrap">
              <img src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
              <span class="pl-card-cat-badge" style="background:${catColor}">${esc(p.category)}</span>
            </div>
            <div class="pl-card-body">
              <div class="pl-card-meta-line">
                <span>${fmtDate(p.date)}</span>
                <span class="dot"></span>
                <span>${p.reading_time} min read</span>
              </div>
              <h3 class="pl-card-title">${esc(p.title)}</h3>
              <p class="pl-card-excerpt">${esc(p.excerpt)}</p>
              <div class="pl-card-footer">
                <i class="fas fa-user-circle" style="font-size:.75rem"></i>
                ${esc(p.author)}
                <span class="dot"></span>
                <i class="far fa-clock" style="font-size:.65rem"></i>
                ${p.reading_time} min
              </div>
            </div>
          </a>`;
}).join('\n')}
        </div>

        <div style="text-align:center;margin-bottom:40px">
          <span class="pl-section-count" style="font-size:.85rem">Showing <span id="plVisibleCount" aria-live="polite">${BLOG_DATA.length}</span> of ${BLOG_DATA.length} articles</span>
        </div>

        <!-- Newsletter CTA -->
        <div class="pl-newsletter">
          <div class="pl-newsletter-inner">
            <h3>Stay in the Creative Loop</h3>
            <p>Get early access to new releases, exclusive discounts, and creative inspiration delivered to your inbox.</p>
            <form class="pl-newsletter-form" action="${BASE_URL}/" method="get" onsubmit="alert('Thanks for subscribing! 🎉');return false">
              <input type="email" placeholder="Enter your email" required aria-label="Email for newsletter">
              <button type="submit">Subscribe Free</button>
            </form>
            <p class="pl-newsletter-note">No spam. Unsubscribe anytime. Join 5,000+ creators.</p>
          </div>
        </div>

      </div>

      <!-- ═══ Premium Sidebar ═══ -->
      <aside class="pl-sidebar">
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Recent Posts</div>
${recentPosts.map(p => {
  return `          <a href="${p.slug}.html" class="pl-sb-post">
            <img class="pl-sb-post-img" src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
            <div class="pl-sb-post-info">
              <div class="pl-sb-post-title">${esc(p.title)}</div>
              <div class="pl-sb-post-date">${fmtDate(p.date)} · ${p.reading_time} min</div>
            </div>
          </a>`;
}).join('\n')}
        </div>
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Categories</div>
${categories.map(c => {
  const catColor = CAT_COLORS[c.category] || '#06c';
  return `          <a href="index.html" class="pl-sb-cat" onclick="return plFilterByCat('${escAttr(c.category)}')">
            <span class="pl-sb-cat-name">
              <span class="pl-sb-cat-dot" style="background:${catColor}"></span>
              ${esc(c.category)}
            </span>
            <span class="pl-sb-cat-count">${c.count}</span>
          </a>`;
}).join('\n')}
        </div>
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Popular Tags</div>
          <div class="pl-sb-tags">
${tags.map(t => `            <a href="index.html" class="pl-sb-tag" onclick="return plSearchTag('${escAttr(t.tag)}')">${esc(t.tag)}</a>`).join('\n')}
          </div>
        </div>
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Top Authors</div>
          <div class="pl-sb-author">
            <div class="pl-sb-author-avatar" style="background:linear-gradient(135deg,#06c,#2997ff)">P</div>
            <div>
              <div class="pl-sb-author-name">PixabAnimation</div>
              <div class="pl-sb-author-role">Content Creator · ${BLOG_DATA.length} articles</div>
            </div>
          </div>
          <div class="pl-sb-author">
            <div class="pl-sb-author-avatar" style="background:linear-gradient(135deg,#5856d6,#af52de)">S</div>
            <div>
              <div class="pl-sb-author-name">SPurno</div>
              <div class="pl-sb-author-role">Motion Design Expert</div>
            </div>
          </div>
        </div>
        <div class="pl-sb-widget" style="background:linear-gradient(135deg,#f5f5f7,#fff);border-color:rgba(0,102,204,.08)">
          <div class="pl-sb-widget-title" style="border-bottom-color:#06c">📬 Newsletter</div>
          <p style="font-size:.8rem;color:rgba(0,0,0,.5);margin-bottom:12px;line-height:1.5">Get the latest articles and creative insights.</p>
          <form onsubmit="alert('Thanks for subscribing! 🎉');return false" style="display:flex;gap:6px">
            <input type="email" placeholder="Your email" required style="flex:1;padding:8px 12px;border:1px solid rgba(0,0,0,.08);border-radius:9999px;font-size:.78rem;background:#fff;outline:none;font-family:inherit">
            <button type="submit" style="padding:8px 14px;border-radius:9999px;background:#06c;color:#fff;border:none;font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap">Join</button>
          </form>
        </div>
      </aside>
    </div>
  </div>

  <!-- ═══ Home CTA ═══ -->
  <div class="pl-home-cta">
    <a href="${BASE_URL}/"><i class="fas fa-home"></i> Return to Homepage</a>
  </div>

    <!-- Footer — matching homepage -->
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation Logo" class="footer-logo" width="28" height="24" loading="lazy">
          <span class="footer-brand-name">PixabAnimation</span>
          <p class="footer-brand-desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</p>
          <div class="footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <!-- Shop -->
        <div class="footer-col">
          <h4 class="footer-col-title">Shop</h4>
          <a href="${BASE_URL}/#/shop" class="footer-link">All Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos" class="footer-link">Animation &amp; Video</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins" class="footer-link">After Effects Plugins</a>
          <a href="${BASE_URL}/#/shop?category=background-animation" class="footer-link">Background Animation</a>
          <a href="${BASE_URL}/#/shop?category=infographic-animation" class="footer-link">Infographic Animation</a>
        </div>
        <!-- Categories -->
        <div class="footer-col">
          <h4 class="footer-col-title">Categories</h4>
          <a href="${BASE_URL}/#/shop?category=videos" class="footer-link">Motion Graphics</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins" class="footer-link">Plugins &amp; Extensions</a>
          <a href="${BASE_URL}/#/shop?category=green-screen-mockup" class="footer-link">Green Screen Mockups</a>
          <a href="${BASE_URL}/#/shop?category=ads-design" class="footer-link">Advertising Design</a>
          <a href="${BASE_URL}/#/shop" class="footer-link footer-link-all">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <!-- Support -->
        <div class="footer-col">
          <h4 class="footer-col-title">Support</h4>
          <a href="${BASE_URL}/#/contact" class="footer-link">Contact Us</a>
          <a href="${BASE_URL}/#/about" class="footer-link">About Us</a>
          <a href="${BASE_URL}/#/privacy-policy" class="footer-link">Privacy Policy</a>
          <a href="${BASE_URL}/#/refund-policy" class="footer-link">Refund Policy</a>
          <a href="${BASE_URL}/#/terms-of-use" class="footer-link">Terms of Use</a>
          <a href="index.html" class="footer-link">Blog</a>
        </div>
        <!-- Newsletter -->
        <div class="footer-col footer-col-newsletter">
          <h4 class="footer-col-title">Stay in the Loop</h4>
          <p class="footer-newsletter-text">Get early access to new releases, subscriber-only discounts, and creative inspiration.</p>
          <form class="footer-newsletter-form" action="${BASE_URL}/" method="get">
            <input type="email" placeholder="Enter your email" required>
            <button type="submit" aria-label="Subscribe"><i class="fas fa-arrow-right"></i></button>
          </form>
          <p class="footer-newsletter-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-links">
          <a href="${BASE_URL}/#/privacy-policy">Privacy</a>
          <span class="footer-bottom-sep">·</span>
          <a href="${BASE_URL}/#/refund-policy">Refunds</a>
          <span class="footer-bottom-sep">·</span>
          <a href="${BASE_URL}/#/terms-of-use">Terms</a>
          <span class="footer-bottom-sep">·</span>
          <a href="${BASE_URL}/#/contact">Support</a>
        </div>
        <p class="footer-bottom-copy">&copy; 2026 PixabAnimation & SPurno. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
        </div>
      </div>
    </div>
  </footer>

  <script>
    window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>50)});
    document.addEventListener('click',function(e){var t=e.target.closest('#navToggle');if(t){document.getElementById('navLinks').classList.toggle('open');return}if(!e.target.closest('.nav-links')&&!e.target.closest('#navToggle')){document.getElementById('navLinks').classList.remove('open')}});
    document.addEventListener('click',function(e){var t=e.target.closest('#navToggle');if(t){document.getElementById('navLinks').classList.toggle('open');return}if(!e.target.closest('.nav-links')&&!e.target.closest('#navToggle')){document.getElementById('navLinks').classList.remove('open')}});
    var plCurrentCat='all';
    function plFilterByCat(cat,el){
      if(!el) el=document.querySelector('#plCatBar [data-cat="'+cat+'"]');
      document.querySelectorAll('#plCatBar .pl-cat-chip').forEach(function(c){c.classList.remove('active')});
      if(el) el.classList.add('active');
      plCurrentCat=cat;plApplyFilters();return false
    }
    function plSearchTag(tag){
      var inp=document.getElementById('plSearchInput');inp.value=tag;
      plCurrentCat='all';
      document.querySelectorAll('#plCatBar .pl-cat-chip').forEach(function(c){c.classList.remove('active')});
      var ac=document.querySelector('#plCatBar [data-cat="all"]');if(ac)ac.classList.add('active');
      plApplyFilters();
      document.getElementById('plArticlesGrid').scrollIntoView({behavior:'smooth',block:'start'});return false
    }
    function plApplyFilters(){
      var sv=(document.getElementById('plSearchInput').value||'').toLowerCase().trim();
      var cards=document.querySelectorAll('#plArticlesGrid .pl-card');
      var visible=0;
      cards.forEach(function(card){
        var cat=card.getAttribute('data-category')||'';
        var title=card.getAttribute('data-title')||'';
        var excerpt=card.getAttribute('data-excerpt')||'';
        var cm=plCurrentCat==='all'||cat===plCurrentCat;
        var sm=!sv||title.indexOf(sv)!==-1||excerpt.indexOf(sv)!==-1;
        if(cm&&sm){card.style.display='';visible++}else{card.style.display='none'}
      });
      document.getElementById('plVisibleCount').textContent=visible;
      document.getElementById('plArticleCount').textContent=visible+' article'+(visible!==1?'s':'');
    }
    var plSearchTimer;
    function plFilterArticles(val){clearTimeout(plSearchTimer);plSearchTimer=setTimeout(function(){plApplyFilters()},200)}
    document.addEventListener('DOMContentLoaded',function(){
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';obs.unobserve(e.target)}})
      },{threshold:0.1});
      document.querySelectorAll('#plArticlesGrid .pl-card').forEach(function(card,i){
        card.style.opacity='0';card.style.transform='translateY(20px)';
        card.style.transition='opacity .5s ease '+(i*.04)+'s,transform .5s ease '+(i*.04)+'s';
        obs.observe(card)
      })
    });
  </script>
</body>
</html>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching blog posts from database...');
  const result = await client.execute(
    'SELECT id, title, slug, excerpt, category, author, reading_time, featured, tags, cover_image, meta_title, meta_description, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'
  );
  const rows = result.rows;
  console.log(`Found ${rows.length} published posts.\n`);

  // Map DB rows to BLOG_DATA format
  const BLOG_DATA = rows.map(row => {
    let tags = [];
    if (row.tags) {
      try { tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []); }
      catch(e) { tags = []; }
    }
    let cover = row.cover_image || row.slug;
    if (cover && (cover.startsWith('http://') || cover.startsWith('https://'))) {
      cover = row.slug;
    }
    return {
      id: row.id,
      slug: row.slug,
      featured: row.featured ? 1 : 0,
      title: row.title,
      excerpt: row.excerpt || '',
      cover: cover || row.slug,
      category: row.category || 'General',
      tags: tags,
      reading_time: row.reading_time || 5,
      date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      author: row.author || 'PixabAnimation Team'
    };
  });

  // Compute derived data
  const featured = BLOG_DATA.filter(p => p.featured).sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedAll = [...BLOG_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentPosts = sortedAll.slice(0, 6);

  const catMap = {};
  BLOG_DATA.forEach(p => { if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1; });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ category: k, count: v }));

  const tagCounts = {};
  BLOG_DATA.forEach(p => (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, v]) => ({ tag: k, count: v }));

  // Generate HTML
  const html = buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags);
  writeFileSync(outputPath, html, 'utf-8');
  console.log(`✅ Generated blog/index.html (${(html.length / 1024).toFixed(1)} KB, ${BLOG_DATA.length} articles)`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
