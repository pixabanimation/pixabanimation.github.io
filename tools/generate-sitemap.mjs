#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * 
 * Auto-generates sitemap.xml for PixabAnimation GitHub Pages site.
 * Scans the blog/ directory for static HTML files and generates
 * a valid sitemap.xml with only crawlable URLs (no hash/fragment routes).
 * 
 * Usage: node tools/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const outputPath = join(rootDir, 'sitemap.xml');

const BASE_URL = 'https://pixabanimation.github.io';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Helper to escape XML special characters
function xmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Get all blog article HTML files, sorted alphabetically
// List of static SPA shell pages (crawlable HTML files at root level)
const STATIC_PAGES = [
  { file: 'shop.html', priority: '0.9', changefreq: 'weekly' },
  { file: 'about.html', priority: '0.7', changefreq: 'monthly' },
  { file: 'contact.html', priority: '0.7', changefreq: 'monthly' },
  { file: 'privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
  { file: 'refund-policy.html', priority: '0.3', changefreq: 'yearly' },
  { file: 'terms-of-use.html', priority: '0.3', changefreq: 'yearly' }
];

function getBlogArticles() {
  const files = readdirSync(blogDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();
  
  return files.map(file => {
    const filePath = join(blogDir, file);
    const stats = statSync(filePath);
    const lastMod = stats.mtime.toISOString().split('T')[0];
    
    return {
      loc: `${BASE_URL}/blog/${xmlEscape(file)}`,
      lastmod: lastMod,
      changefreq: 'monthly',
      priority: '0.8'
    };
  });
}

function getStaticPages() {
  return STATIC_PAGES.map(p => {
    const filePath = join(rootDir, p.file);
    let lastMod = TODAY;
    try {
      const stats = statSync(filePath);
      lastMod = stats.mtime.toISOString().split('T')[0];
    } catch {}
    return {
      loc: `${BASE_URL}/${p.file}`,
      lastmod: lastMod,
      changefreq: p.changefreq,
      priority: p.priority
    };
  });
}

// Build XML
function buildSitemap(articles, staticPages) {
  const urls = [
    // Root page
    {
      loc: `${BASE_URL}/`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '1.0'
    },
    // Blog index
    {
      loc: `${BASE_URL}/blog/`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.9'
    },
    // Static pages (shop, about, contact, policies)
    ...staticPages,
    // Blog articles
    ...articles
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Root page — pretty-printed
  xml += `  <url>\n`;
  xml += `    <loc>${urls[0].loc}</loc>\n`;
  xml += `    <lastmod>${urls[0].lastmod}</lastmod>\n`;
  xml += `    <changefreq>${urls[0].changefreq}</changefreq>\n`;
  xml += `    <priority>${urls[0].priority}</priority>\n`;
  xml += `  </url>\n`;

  // Blog index — pretty-printed
  xml += `  <url>\n`;
  xml += `    <loc>${urls[1].loc}</loc>\n`;
  xml += `    <lastmod>${urls[1].lastmod}</lastmod>\n`;
  xml += `    <changefreq>${urls[1].changefreq}</changefreq>\n`;
  xml += `    <priority>${urls[1].priority}</priority>\n`;
  xml += `  </url>\n`;

  // Static pages + blog articles — compact format
  for (const item of urls.slice(2)) {
    xml += `  <url><loc>${item.loc}</loc><lastmod>${item.lastmod}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>\n`;
  }

  xml += `</urlset>\n`;

  return xml;
}

// --- Main ---
try {
  console.log('🔍 Scanning blog directory...');
  const articles = getBlogArticles();
  console.log(`   Found ${articles.length} blog articles`);

  console.log('🔍 Checking static pages...');
  const staticPages = getStaticPages();
  console.log(`   Found ${staticPages.length} static pages`);

  console.log('📝 Generating sitemap...');
  const sitemap = buildSitemap(articles, staticPages);
  
  console.log('💾 Writing sitemap.xml...');
  writeFileSync(outputPath, sitemap, 'utf-8');

  // Validate
  const opens = (sitemap.match(/<url>/g) || []).length;
  const closes = (sitemap.match(/<\/url>/g) || []).length;

  console.log('\n✅ Sitemap generated successfully!');
  console.log(`   File: sitemap.xml`);
  console.log(`   URLs: ${articles.length + staticPages.length + 2} total (2 root + ${staticPages.length} static + ${articles.length} blog)`);
  console.log(`   Tags: ${opens} <url> / ${closes} </url> — ${opens === closes ? '✅ Balanced' : '❌ MISMATCH'}`);
  console.log(`   Hash URLs: ${/#\//.test(sitemap) ? '❌ PRESENT' : '✅ None'}`);
} catch (err) {
  console.error('❌ Error generating sitemap:', err.message);
  process.exit(1);
}
