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
  'AI': '#0f7b7b', 'Web': '#5b51c8', 'Animation': '#2d7d46', 'Design': '#b76616',
  'Freelancing': '#a33f5f', 'Technology': '#236f8e', 'Career': '#7d4bb0',
  'VFX': '#9c3f33', 'Typography': '#0d756c', 'Tools': '#9b6820', 'Resources': '#397a91',
  'Mobile Phone': '#2d7d46', 'Laptop': '#255f9f', 'Tablet': '#5b51c8', 'Wearable': '#9b6820'
};

// ─── Build Premium HTML ──────────────────────────────────────────────────────
function buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags, blogAds, popupAds) {
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
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">

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
    body{background:#f3ecdf;color:#181510;font-family:Manrope,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .pl-hero{position:relative;overflow:hidden;background:#11100e;color:#fff;border-bottom:1px solid rgba(255,255,255,.08)}
    .pl-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(0deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(180deg,#000 0%,transparent 82%);pointer-events:none}
    .pl-hero::after{content:'';position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,#0bd3d3,#d54b3d,#f4c35a,#6f63ff);pointer-events:none}
    .pl-hero-inner{max-width:1220px;margin:0 auto;padding:86px 24px 64px;display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,460px);gap:54px;align-items:center;position:relative;z-index:1}
    .pl-hero-copy{max-width:700px}
    .pl-hero-badge{display:inline-flex;align-items:center;gap:9px;padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(255,255,255,.06);color:#f4c35a;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0}
    .pl-hero-title{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(3.6rem,8vw,7.2rem);font-weight:400;line-height:.88;margin:22px 0 20px;letter-spacing:0;color:#fff;max-width:760px}
    .pl-hero-title em{font-style:italic;color:#0bd3d3}
    .pl-hero-desc{font-size:1rem;color:rgba(255,255,255,.72);line-height:1.8;max-width:620px;margin:0 0 30px}
    .pl-search-panel{position:relative;max-width:620px}
    .pl-search-wrap{display:flex;align-items:center;background:#fff;border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:6px 8px 6px 14px;box-shadow:0 24px 60px rgba(0,0,0,.28)}
    .pl-search-wrap:focus-within{border-color:#0bd3d3;box-shadow:0 0 0 4px rgba(11,211,211,.18),0 24px 60px rgba(0,0,0,.28)}
    .pl-search-wrap i{color:#d54b3d;font-size:.9rem}
    .pl-search-wrap input{border:none;background:transparent;padding:14px 12px;font-size:.95rem;outline:none;width:100%;font-family:inherit;color:#181510}
    .pl-search-clear{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:7px;background:#f3ecdf;color:#5b4d3b;cursor:pointer;transition:background .2s ease,color .2s ease}
    .pl-search-clear[hidden],.pl-search-suggestions[hidden],.pl-no-results[hidden]{display:none!important}
    .pl-search-clear:hover{background:#181510;color:#fff}
    .pl-search-suggestions{position:absolute;z-index:20;top:calc(100% + 10px);left:0;right:0;background:#fffaf1;border:1px solid rgba(24,21,16,.16);border-radius:8px;box-shadow:0 24px 60px rgba(0,0,0,.25);overflow:hidden;color:#181510}
    .pl-search-suggestion{width:100%;display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;padding:10px 12px;border:0;border-bottom:1px solid rgba(24,21,16,.08);background:transparent;text-align:left;color:inherit;cursor:pointer;font-family:inherit}
    .pl-search-suggestion:last-child{border-bottom:none}
    .pl-search-suggestion:hover,.pl-search-suggestion.active{background:#181510;color:#fff}
    .pl-search-suggestion img{width:44px;height:44px;border-radius:7px;object-fit:cover;background:#e4dac9}
    .pl-search-suggestion-title{display:block;font-size:.84rem;font-weight:900;line-height:1.25}
    .pl-search-suggestion-meta{display:block;margin-top:3px;font-size:.68rem;font-weight:800;text-transform:uppercase;color:rgba(24,21,16,.48)}
    .pl-search-suggestion:hover .pl-search-suggestion-meta,.pl-search-suggestion.active .pl-search-suggestion-meta{color:rgba(255,255,255,.62)}
    .pl-search-suggestion i{color:#d54b3d}
    .pl-search-suggestion:hover i,.pl-search-suggestion.active i{color:#f4c35a}
    .pl-search-empty{padding:14px 16px;font-size:.82rem;font-weight:800;color:rgba(24,21,16,.56)}
    .pl-hero-stats{display:grid;grid-template-columns:repeat(4,minmax(92px,1fr));gap:1px;margin-top:24px;max-width:620px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden}
    .pl-hero-stat{padding:16px 14px;background:rgba(255,255,255,.045)}
    .pl-hero-stat-num{font-family:'Instrument Serif',Georgia,serif;font-size:2rem;font-weight:400;color:#f4c35a;line-height:1}
    .pl-hero-stat-label{font-size:.68rem;color:rgba(255,255,255,.6);margin-top:6px;font-weight:800;text-transform:uppercase;letter-spacing:0}
    .pl-hero-stage{position:relative;min-height:520px}
    .pl-hero-frame{position:absolute;display:block;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:#1b1813;box-shadow:0 30px 80px rgba(0,0,0,.38)}
    .pl-hero-frame img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.08) contrast(1.04)}
    .pl-hero-frame:nth-child(1){width:68%;height:58%;right:0;top:0}
    .pl-hero-frame:nth-child(2){width:58%;height:42%;left:0;top:31%}
    .pl-hero-frame:nth-child(3){width:50%;height:34%;right:7%;bottom:0}
    .pl-hero-frame-label{left:10%;bottom:9%;width:170px;height:auto;padding:14px 16px;color:#181510;background:#f4c35a;border-color:#f4c35a;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0;box-shadow:0 18px 40px rgba(244,195,90,.18)}
    .pl-wrapper{max-width:1220px;margin:0 auto;padding:0 24px}
    .pl-layout{display:grid;grid-template-columns:minmax(0,1fr) 302px;gap:44px;padding:54px 0 42px}
    .pl-main{min-width:0}
    .pl-cat-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:38px}
    .pl-cat-chip{padding:8px 13px;border-radius:8px;background:#fffaf1;border:1px solid rgba(24,21,16,.12);font-size:.78rem;font-weight:800;color:rgba(24,21,16,.68);cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s ease;white-space:nowrap;text-decoration:none;font-family:inherit;display:inline-block}
    .pl-cat-chip:hover{background:#fff;border-color:#d54b3d;color:#181510;transform:translateY(-1px)}
    .pl-cat-chip.active,.pl-cat-chip.all-chip.active{background:#181510;border-color:#181510;color:#fff}
    .pl-cat-chip.all-chip{background:#d54b3d;border-color:#d54b3d;color:#fff}
    .pl-section-header{display:flex;align-items:end;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(24,21,16,.16);padding-bottom:14px}
    .pl-section-header h2{font-family:'Instrument Serif',Georgia,serif;font-size:2.25rem;font-weight:400;color:#181510;letter-spacing:0}
    .pl-section-header h2 span{color:#d54b3d!important}
    .pl-section-count{font-size:.76rem;color:rgba(24,21,16,.48);font-weight:800;text-transform:uppercase;letter-spacing:0}
    .pl-featured-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;margin-bottom:44px}
    .pl-feat-hero,.pl-feat-side{position:relative;overflow:hidden;display:block;text-decoration:none;border-radius:8px;background:#181510;color:#fff;border:1px solid rgba(24,21,16,.14)}
    .pl-feat-hero{grid-row:span 2;min-height:430px}
    .pl-feat-side{min-height:208px}
    .pl-feat-hero-img,.pl-feat-side-img{width:100%;height:100%;position:absolute;inset:0}
    .pl-feat-hero-img img,.pl-feat-side-img img{width:100%;height:100%;object-fit:cover;transition:transform .55s ease;filter:saturate(1.05) contrast(1.04)}
    .pl-feat-hero:hover img,.pl-feat-side:hover img{transform:scale(1.045)}
    .pl-feat-hero-overlay,.pl-feat-side-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,9,7,.94),rgba(10,9,7,.48) 52%,rgba(10,9,7,.08));display:flex;flex-direction:column;justify-content:flex-end}
    .pl-feat-hero-overlay{padding:34px}
    .pl-feat-side-overlay{padding:22px}
    .pl-feat-hero-cat,.pl-feat-side-cat{display:inline-block;padding:5px 9px;background:#0bd3d3;color:#08110f;border-radius:6px;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:0;width:fit-content;margin-bottom:12px}
    .pl-feat-side-cat{font-size:.6rem;background:#f4c35a}
    .pl-feat-hero-title{font-family:'Instrument Serif',Georgia,serif;font-size:2rem;font-weight:400;color:#fff;line-height:1.05;margin-bottom:12px;letter-spacing:0}
    .pl-feat-side-title{font-size:1.02rem;font-weight:800;color:#fff;line-height:1.32;margin-bottom:8px}
    .pl-feat-hero-meta,.pl-feat-side-date{display:flex;align-items:center;gap:12px;font-size:.78rem;color:rgba(255,255,255,.72)}
    .pl-articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:38px}
    .pl-card{background:#fffaf1;border:1px solid rgba(24,21,16,.12);border-radius:8px;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;display:block;text-decoration:none;color:inherit}
    .pl-card:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(24,21,16,.12);border-color:rgba(213,75,61,.42)}
    .pl-card-img-wrap{position:relative;aspect-ratio:16/10;overflow:hidden;background:#e4dac9}
    .pl-card-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}
    .pl-card:hover .pl-card-img-wrap img{transform:scale(1.05)}
    .pl-card-cat-badge{position:absolute;top:10px;left:10px;padding:4px 8px;border-radius:6px;font-size:.58rem;font-weight:900;text-transform:uppercase;letter-spacing:0;color:#fff}
    .pl-card-body{padding:17px 17px 18px}
    .pl-card-meta-line{display:flex;align-items:center;gap:8px;font-size:.7rem;color:rgba(24,21,16,.46);margin-bottom:8px;font-weight:800;text-transform:uppercase;letter-spacing:0}
    .pl-card-title{font-size:.98rem;font-weight:800;line-height:1.35;margin-bottom:8px;color:#181510;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .pl-card:hover .pl-card-title{color:#d54b3d}
    .pl-card-excerpt{font-size:.79rem;color:rgba(24,21,16,.62);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .pl-card-footer{display:flex;align-items:center;gap:8px;font-size:.7rem;color:rgba(24,21,16,.42);font-weight:700}
    .pl-card-footer .dot{width:4px;height:4px;border-radius:50%;background:#d54b3d}
    .pl-no-results{margin:-12px 0 36px;padding:28px;background:#fffaf1;border:1px solid rgba(24,21,16,.12);border-radius:8px;text-align:center}
    .pl-no-results h3{font-family:'Instrument Serif',Georgia,serif;font-size:2rem;font-weight:400;color:#181510;margin-bottom:6px}
    .pl-no-results p{font-size:.9rem;color:rgba(24,21,16,.62);line-height:1.6;margin-bottom:16px}
    .pl-no-results button{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border:0;border-radius:8px;background:#181510;color:#fff;font-size:.82rem;font-weight:900;font-family:inherit;cursor:pointer}
    .pl-newsletter{background:#181510;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:44px;text-align:center;color:#fff;margin-bottom:40px;position:relative;overflow:hidden}
    .pl-newsletter::before{content:'';position:absolute;inset:auto 0 0 0;height:6px;background:linear-gradient(90deg,#0bd3d3,#d54b3d,#f4c35a)}
    .pl-newsletter-inner{position:relative;z-index:1;max-width:560px;margin:0 auto}
    .pl-newsletter h3{font-family:'Instrument Serif',Georgia,serif;font-size:2.25rem;font-weight:400;margin-bottom:10px;letter-spacing:0}
    .pl-newsletter p{font-size:.92rem;opacity:.78;margin-bottom:20px;line-height:1.7}
    .pl-newsletter-form{display:flex;gap:8px;max-width:430px;margin:0 auto}
    .pl-newsletter-form input{flex:1;padding:13px 15px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:.85rem;outline:none;font-family:inherit}
    .pl-newsletter-form input::placeholder{color:rgba(255,255,255,.48)}
    .pl-newsletter-form input:focus{border-color:#0bd3d3;box-shadow:0 0 0 3px rgba(11,211,211,.16)}
    .pl-newsletter-form button{padding:13px 18px;border-radius:8px;background:#f4c35a;color:#181510;border:none;font-size:.85rem;font-weight:900;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;font-family:inherit;white-space:nowrap}
    .pl-newsletter-form button:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(244,195,90,.18)}
    .pl-newsletter-note{font-size:.7rem;opacity:.56;margin-top:10px}
    .pl-sidebar{position:sticky;top:80px}
    .pl-sb-widget{background:#fffaf1;border:1px solid rgba(24,21,16,.12);border-radius:8px;padding:20px;margin-bottom:16px;box-shadow:0 12px 30px rgba(24,21,16,.06)}
    .pl-sb-widget-title{font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:0;color:#181510;margin-bottom:15px;padding-bottom:10px;border-bottom:2px solid #d54b3d}
    .pl-sb-post{display:flex;align-items:center;gap:12px;padding:9px 0;text-decoration:none;color:inherit;border-bottom:1px solid rgba(24,21,16,.08);transition:opacity .2s ease}
    .pl-sb-post:last-child{border-bottom:none}
    .pl-sb-post:hover{opacity:.72}
    .pl-sb-post-img{width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;background:#e4dac9}
    .pl-sb-post-info{flex:1;min-width:0}
    .pl-sb-post-title{font-size:.82rem;font-weight:800;color:#181510;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .pl-sb-post-date{font-size:.69rem;color:rgba(24,21,16,.45);margin-top:2px}
    .pl-sb-cat{display:flex;justify-content:space-between;align-items:center;padding:8px 0;text-decoration:none;color:inherit;border-bottom:1px solid rgba(24,21,16,.08);font-size:.8rem;transition:color .2s ease}
    .pl-sb-cat:last-child{border-bottom:none}
    .pl-sb-cat:hover{color:#d54b3d}
    .pl-sb-cat-name{display:flex;align-items:center;gap:8px}
    .pl-sb-cat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .pl-sb-cat-count{color:rgba(24,21,16,.32);font-size:.78rem}
    .pl-sb-tags{display:flex;flex-wrap:wrap;gap:6px}
    .pl-sb-tag{display:inline-block;padding:5px 9px;background:#f3ecdf;border:1px solid rgba(24,21,16,.1);border-radius:8px;font-size:.7rem;font-weight:800;color:#5b4d3b;text-decoration:none;transition:all .2s ease}
    .pl-sb-tag:hover{background:#181510;color:#fff;border-color:#181510}
    .pl-sb-author{display:flex;align-items:center;gap:12px;margin-bottom:11px}
    .pl-sb-author:last-child{margin-bottom:0}
    .pl-sb-author-avatar{width:38px;height:38px;border-radius:8px!important;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:900;color:#fff;flex-shrink:0}
    .pl-sb-author-name{font-size:.85rem;font-weight:900;color:#181510}
    .pl-sb-author-role{font-size:.7rem;color:rgba(24,21,16,.45)}
    .pl-sb-widget[style]{background:#181510!important;border-color:#181510!important;color:#fff}
    .pl-sb-widget[style] .pl-sb-widget-title{color:#fff!important;border-bottom-color:#f4c35a!important}
    .pl-sb-widget[style] p{color:rgba(255,255,255,.7)!important}
    .pl-sb-widget[style] input{border-radius:8px!important}
    .pl-sb-widget[style] button{border-radius:8px!important;background:#f4c35a!important;color:#181510!important}
    .pl-home-cta{text-align:center;padding:4px 24px 50px;background:#f3ecdf}
    .pl-home-cta a{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#181510;color:#fff;border-radius:8px;font-size:.86rem;font-weight:900;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}
    .pl-home-cta a:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(24,21,16,.18)}
    .pl-card:focus-visible,.pl-feat-hero:focus-visible,.pl-feat-side:focus-visible,.pl-cat-chip:focus-visible,.pl-sb-post:focus-visible,.pl-sb-cat:focus-visible,.pl-sb-tag:focus-visible,.pl-home-cta a:focus-visible{outline:3px solid rgba(11,211,211,.72);outline-offset:3px}
    @media(max-width:1024px){.pl-layout{grid-template-columns:1fr}.pl-sidebar{position:static}.pl-articles-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:860px){.pl-hero-inner{grid-template-columns:1fr;padding:64px 20px 48px}.pl-hero-stage{min-height:360px}.pl-featured-grid{grid-template-columns:1fr}.pl-feat-hero{grid-row:span 1;min-height:320px}.pl-feat-side{min-height:210px}}
    @media(max-width:620px){.pl-wrapper{padding:0 16px}.pl-layout{padding-top:34px}.pl-hero-title{font-size:3.35rem}.pl-hero-stats{grid-template-columns:repeat(2,1fr)}.pl-hero-stage{display:none}.pl-articles-grid{grid-template-columns:1fr}.pl-section-header{align-items:flex-start;gap:8px;flex-direction:column}.pl-section-header h2{font-size:1.8rem}.pl-newsletter{padding:32px 18px}.pl-newsletter-form{flex-direction:column}.pl-card-body{padding:15px}.pl-cat-bar{overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px}.pl-search-suggestion{grid-template-columns:38px 1fr}.pl-search-suggestion img{width:38px;height:38px}.pl-search-suggestion i{display:none}}
    @media(prefers-reduced-motion:reduce){.pl-card,.pl-card-img-wrap img,.pl-feat-hero-img img,.pl-feat-side-img img,.pl-cat-chip,.pl-newsletter-form button{transition:none!important}.pl-card:hover,.pl-cat-chip:hover,.pl-newsletter-form button:hover{transform:none!important}}
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
      <div class="pl-hero-copy">
      <div class="pl-hero-badge">
        <i class="fas fa-wave-square"></i> Studio Dispatches
      </div>
      <h1 class="pl-hero-title">PixabAnimation <em>Journal</em></h1>
      <p class="pl-hero-desc">A curated index for motion designers, editors, and creative technologists: production notes, AI workflow analysis, design systems, and gear reviews for faster visual work.</p>
        <div class="pl-search-panel" role="search">
          <div class="pl-search-wrap">
            <i class="fas fa-search"></i>
            <input type="search" id="plSearchInput" placeholder="Search the archive..." aria-label="Search blog posts" autocomplete="off" aria-autocomplete="list" aria-expanded="false" aria-controls="plSearchSuggestions" oninput="plFilterArticles(this.value)" onkeydown="plSearchKeydown(event)" onfocus="plShowSuggestions()">
            <button type="button" class="pl-search-clear" id="plSearchClear" aria-label="Clear search" onclick="plClearSearch()" hidden><i class="fas fa-times"></i></button>
          </div>
          <div class="pl-search-suggestions" id="plSearchSuggestions" role="listbox" aria-label="Search suggestions" hidden></div>
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
          <div class="pl-hero-stat-label">Avg read</div>
        </div>
      </div>
      </div>
      <div class="pl-hero-stage" aria-hidden="true">
${featured.slice(0, 3).map(p => `        <span class="pl-hero-frame"><img src="${escAttr(coverUrl(p.cover))}" alt="" loading="eager"></span>`).join('\n')}
        <span class="pl-hero-frame pl-hero-frame-label">Field notes from the render queue</span>
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
  const searchable = `${p.title} ${p.excerpt} ${p.category} ${p.author} ${(p.tags || []).join(' ')}`.toLowerCase();
  return `          <a href="${p.slug}.html" class="pl-card" data-category="${escAttr(p.category)}" data-title="${escAttr(p.title.toLowerCase())}" data-excerpt="${escAttr(p.excerpt.toLowerCase())}" data-tags="${escAttr((p.tags || []).join(' ').toLowerCase())}" data-author="${escAttr(p.author.toLowerCase())}" data-search="${escAttr(searchable)}">
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
        <div class="pl-no-results" id="plNoResults" hidden>
          <h3>No matching articles</h3>
          <p>Try a broader keyword, choose another category, or reset the archive view.</p>
          <button type="button" onclick="plShowAll()"><i class="fas fa-rotate-left"></i> Show all articles</button>
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
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Ad</div>
          <div id="ad-slot-1"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-cube"></i></div><div class="blog-ad-text"><h3>Premium Motion Graphics Assets</h3><p>Browse 4000+ professional 4K motion backgrounds, animated templates, and stock footage — crafted for creators who demand the best.</p><a href="https://pixabanimation.github.io/#/shop" class="blog-ad-cta">Browse Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div>
          <div id="ad-slot-2"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-film"></i></div><div class="blog-ad-text"><h3>4K Video Clips &amp; Templates</h3><p>Royalty-free motion graphics, lower thirds, and title animations for your next project.</p><a href="https://pixabanimation.github.io/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a></div></div></div></div>
          <div id="ad-slot-3"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-layer-group"></i></div><div class="blog-ad-text"><h3>After Effects Templates</h3><p>Professional logo reveals, typography animations, and infographic templates designed to make an impact.</p><a href="https://stock.adobe.com/contributor/211977281/SPurnoAnimation" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a></div></div></div></div>
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
    var plSearchTimer;
    var plSearchIndex=[];
    var plSuggestionIndex=-1;
    function plNorm(v){return (v||'').toString().toLowerCase().trim()}
    function plEscapeHtml(v){return (v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function plGetInput(){return document.getElementById('plSearchInput')}
    function plGetSuggestions(){return document.getElementById('plSearchSuggestions')}
    function plBuildSearchIndex(){
      plSearchIndex=Array.prototype.slice.call(document.querySelectorAll('#plArticlesGrid .pl-card')).map(function(card){
        var img=card.querySelector('img');
        var titleEl=card.querySelector('.pl-card-title');
        var excerptEl=card.querySelector('.pl-card-excerpt');
        return {
          el:card,
          url:card.getAttribute('href')||'#',
          title:titleEl?titleEl.textContent.trim():'',
          excerpt:excerptEl?excerptEl.textContent.trim():'',
          category:card.getAttribute('data-category')||'',
          image:img?img.getAttribute('src'):'',
          search:card.getAttribute('data-search')||''
        }
      })
    }
    function plSetActiveCat(cat,el){
      plCurrentCat=cat||'all';
      var chips=Array.prototype.slice.call(document.querySelectorAll('#plCatBar .pl-cat-chip'));
      if(!el) el=chips.find(function(c){return c.getAttribute('data-cat')===plCurrentCat});
      chips.forEach(function(c){c.classList.remove('active')});
      if(el) el.classList.add('active');
    }
    function plFilterByCat(cat,el){
      plSetActiveCat(cat,el);
      plApplyFilters({renderSuggestions:false});
      plCloseSuggestions();
      document.getElementById('plArticlesGrid').scrollIntoView({behavior:'smooth',block:'start'});
      return false
    }
    function plSearchTag(tag){
      var inp=plGetInput();
      inp.value=tag;
      plSetActiveCat('all');
      plApplyFilters({renderSuggestions:false});
      plCloseSuggestions();
      document.getElementById('plArticlesGrid').scrollIntoView({behavior:'smooth',block:'start'});
      return false
    }
    function plShowAll(){
      var inp=plGetInput();
      if(inp) inp.value='';
      plSetActiveCat('all');
      plApplyFilters({renderSuggestions:false});
      plCloseSuggestions();
      document.getElementById('plArticlesGrid').scrollIntoView({behavior:'smooth',block:'start'});
      if(inp) inp.focus();
      return false
    }
    function plClearSearch(){
      var inp=plGetInput();
      if(inp){inp.value='';inp.focus()}
      plApplyFilters({renderSuggestions:false});
      plCloseSuggestions();
      return false
    }
    function plScoreResult(item,q){
      var title=plNorm(item.title);
      var cat=plNorm(item.category);
      var text=item.search||'';
      if(!q) return 0;
      if(title===q) return 140;
      if(title.indexOf(q)===0) return 120;
      if(title.indexOf(q)!==-1) return 90;
      if(cat.indexOf(q)!==-1) return 70;
      if(text.indexOf(q)!==-1) return 40;
      return 0
    }
    function plGetMatches(q,limit){
      q=plNorm(q);
      if(!q) return [];
      return plSearchIndex.map(function(item){
        return {item:item,score:plScoreResult(item,q)}
      }).filter(function(row){return row.score>0}).sort(function(a,b){return b.score-a.score||a.item.title.localeCompare(b.item.title)}).slice(0,limit||7)
    }
    function plRenderSuggestions(q){
      var box=plGetSuggestions();
      var inp=plGetInput();
      if(!box||!inp) return;
      q=plNorm(q);
      plSuggestionIndex=-1;
      if(q.length<2){plCloseSuggestions();return}
      var matches=plGetMatches(q,7);
      inp.setAttribute('aria-expanded','true');
      box.hidden=false;
      if(!matches.length){
        box.innerHTML='<div class="pl-search-empty">No suggestions. Press Enter to filter the archive.</div>';
        return
      }
      box.innerHTML=matches.map(function(row,i){
        var item=row.item;
        return '<button type="button" class="pl-search-suggestion" role="option" id="plSearchOption'+i+'" aria-selected="false" data-index="'+i+'" onclick="plOpenSuggestion('+i+')">'+
          '<img src="'+plEscapeHtml(item.image)+'" alt="">'+
          '<span><span class="pl-search-suggestion-title">'+plEscapeHtml(item.title)+'</span><span class="pl-search-suggestion-meta">'+plEscapeHtml(item.category)+'</span></span>'+
          '<i class="fas fa-arrow-right"></i>'+
        '</button>'
      }).join('');
      box._matches=matches
    }
    function plCloseSuggestions(){
      var box=plGetSuggestions();
      var inp=plGetInput();
      if(box){box.hidden=true;box.innerHTML='';box._matches=[]}
      if(inp){inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant')}
      plSuggestionIndex=-1
    }
    function plSetSuggestionIndex(next){
      var box=plGetSuggestions();
      var inp=plGetInput();
      if(!box||box.hidden) return;
      var opts=Array.prototype.slice.call(box.querySelectorAll('.pl-search-suggestion'));
      if(!opts.length) return;
      plSuggestionIndex=(next+opts.length)%opts.length;
      opts.forEach(function(opt,i){
        var active=i===plSuggestionIndex;
        opt.classList.toggle('active',active);
        opt.setAttribute('aria-selected',active?'true':'false')
      });
      if(inp) inp.setAttribute('aria-activedescendant','plSearchOption'+plSuggestionIndex)
    }
    function plOpenSuggestion(index){
      var box=plGetSuggestions();
      var matches=box&&box._matches?box._matches:[];
      var row=matches[index];
      if(row&&row.item&&row.item.url) window.location.href=row.item.url;
      return false
    }
    function plSearchKeydown(e){
      var box=plGetSuggestions();
      if(e.key==='ArrowDown'){e.preventDefault();plShowSuggestions();plSetSuggestionIndex(plSuggestionIndex+1);return}
      if(e.key==='ArrowUp'){e.preventDefault();plShowSuggestions();plSetSuggestionIndex(plSuggestionIndex-1);return}
      if(e.key==='Enter'){
        if(box&&!box.hidden&&plSuggestionIndex>-1){e.preventDefault();plOpenSuggestion(plSuggestionIndex);return}
        plApplyFilters({renderSuggestions:false});
        plCloseSuggestions();
        document.getElementById('plArticlesGrid').scrollIntoView({behavior:'smooth',block:'start'});
        return
      }
      if(e.key==='Escape'){plCloseSuggestions()}
    }
    function plShowSuggestions(){plRenderSuggestions(plGetInput()?plGetInput().value:'')}
    function plApplyFilters(opts){
      opts=opts||{};
      var inp=plGetInput();
      var sv=plNorm(inp?inp.value:'');
      var visible=0;
      plSearchIndex.forEach(function(item){
        var cm=plCurrentCat==='all'||item.category===plCurrentCat;
        var sm=!sv||item.search.indexOf(sv)!==-1;
        if(cm&&sm){item.el.style.display='';visible++}else{item.el.style.display='none'}
      });
      document.getElementById('plVisibleCount').textContent=visible;
      document.getElementById('plArticleCount').textContent=visible+' article'+(visible!==1?'s':'');
      var noResults=document.getElementById('plNoResults');
      if(noResults) noResults.hidden=visible!==0;
      var clear=document.getElementById('plSearchClear');
      if(clear) clear.hidden=!sv;
      if(opts.renderSuggestions!==false) plRenderSuggestions(sv)
    }
    function plFilterArticles(val){
      clearTimeout(plSearchTimer);
      plSearchTimer=setTimeout(function(){plApplyFilters()},90)
    }
    document.addEventListener('DOMContentLoaded',function(){
      plBuildSearchIndex();
      plApplyFilters({renderSuggestions:false});
      document.addEventListener('click',function(e){
        if(!e.target.closest('.pl-search-panel')) plCloseSuggestions()
      });
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

  <!-- Popup Ad Container -->
  <div class="popup-ad-overlay" id="popupAdContainer"></div>

  <!-- Blog Ad Scripts (static, works without DB) -->
  <script src="../js/blog-ads.js"></script>
  <script src="../js/popup-ads.js"></script>
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



  // Fetch active ads for pre-rendering
  let blogAds = [], popupAds = [];
  try {
    const adRes = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    blogAds = adRes.rows;
    const popRes = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    popupAds = popRes.rows;
    if (blogAds.length > 0) console.log('  📢 Ads:', blogAds.length);
    if (popupAds.length > 0) console.log('  🪟 Popups:', popupAds.length);
  } catch(e) { console.warn('  ⚠️ Ads fetch:', e.message); }
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
  const html = buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags, blogAds, popupAds);
  writeFileSync(outputPath, html, 'utf-8');
  console.log(`✅ Generated blog/index.html (${(html.length / 1024).toFixed(1)} KB, ${BLOG_DATA.length} articles)`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
