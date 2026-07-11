#!/usr/bin/env node
/**
 * fix-blog-image-refs.mjs
 *
 * Replaces all external image URLs (Unsplash, Cloudinary) with local paths
 * in all generated blog files and generators. All images are already
 * downloaded to assets/images/blog/{slug}.{ext}.
 *
 * Usage: node tools/fix-blog-image-refs.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const BASE_URL = 'https://pixabanimation.github.io';
const LOCAL_IMG = `${BASE_URL}/assets/images/blog`;

// ─── Image URL Mapping (slug → oldUrl) ──────────────────────────────────────
const IMAGE_MAP = {
  'samsung-galaxy-s25-ultra-review-2025':     'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80',
  'samsung-galaxy-s25-s25-plus-review':       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  'samsung-galaxy-s25-edge-specs':             'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  'apple-iphone-17-pro-max-specs-features':   'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80',
  'apple-iphone-17-iphone-17-air-review':     'https://images.unsplash.com/photo-1574755393849-623942b9352c?w=800&q=80',
  'google-pixel-10-pro-specs-ai-features':    'https://images.unsplash.com/photo-1635870723802-e88d76ae5b8e?w=800&q=80',
  'google-pixel-10-specs-price':              'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&q=80',
  'oneplus-13-review-specs-battery':          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
  'xiaomi-15-ultra-camera-specs-review':      'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&q=80',
  'nothing-phone-3-specs-design':             'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
  'motorola-edge-50-ultra-specs-review':      'https://images.unsplash.com/photo-1586056141965-2f1ce5cd7aaa?w=800&q=80',
  'ipad-pro-m5-2025-specs-features':          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
  'ipad-air-7th-gen-2025-specs':              'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
  'samsung-galaxy-tab-s10-ultra-specs':       'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
  'samsung-galaxy-tab-s10-plus-review':       'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
  'macbook-air-m4-2025-review-specs':         'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  'macbook-pro-m4-pro-max-specs-review':      'https://images.unsplash.com/photo-1611186871348-b1f696febbb3?w=800&q=80',
  'dell-xps-14-16-2025-review-specs':         'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
  'microsoft-surface-pro-11-review-specs':    'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&q=80',
  'microsoft-surface-laptop-7-specs':         'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
  'lenovo-thinkpad-x1-carbon-gen-13-review':  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'asus-rog-zephyrus-g14-2025-gaming-laptop': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
  'razer-blade-16-2025-gaming-laptop':        'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&q=80',
  'apple-watch-series-11-features-specs':     'https://res.cloudinary.com/pzyegeqn/image/upload/v1783617148/gzouqbxffssxd9az340a.jpg',
  'samsung-galaxy-watch-7-specs':            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
};

function getExtension(url) {
  const clean = url.split('?')[0];
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return '.jpg';
  if (clean.endsWith('.png')) return '.png';
  if (clean.endsWith('.webp')) return '.webp';
  if (url.includes('cloudinary')) return '.jpg';
  return '.png';
}

function replaceInFile(filepath, slug, oldUrl, newUrl) {
  if (!existsSync(filepath)) return 0;
  let content = readFileSync(filepath, 'utf-8');
  const escapedOld = oldUrl.replace(/&/g, '&amp;');
  let count = 0;

  // Replace escaped version first (HTML entities like &amp;)
  const reEscaped = new RegExp(escapedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(reEscaped, (m) => { count++; return newUrl; });

  // Replace raw version
  const reRaw = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(reRaw, (m) => { count++; return newUrl; });

  if (count > 0) {
    writeFileSync(filepath, content, 'utf-8');
  }
  return count;
}

// ─── Main ────────────────────────────────────────────────────────────────────
let totalReplacements = 0;
let filesUpdated = 0;

// Step 1: Update the 25 generated blog post HTML files
console.log('=== Step 1: Updating 25 blog post files ===\n');
for (const [slug, oldUrl] of Object.entries(IMAGE_MAP)) {
  const ext = getExtension(oldUrl);
  const newUrl = `${LOCAL_IMG}/${slug}${ext}`;
  const filepath = join(blogDir, `${slug}.html`);

  const count = replaceInFile(filepath, slug, oldUrl, newUrl);
  if (count > 0) {
    console.log(`  ✅ ${slug}.html — ${count} replacements`);
    filesUpdated++;
    totalReplacements += count;
  } else {
    console.log(`  ⏭  ${slug}.html — no changes needed`);
  }
}

// Step 2: Update blog/index.html
console.log('\n=== Step 2: Updating blog/index.html ===\n');
const indexPath = join(blogDir, 'index.html');
if (existsSync(indexPath)) {
  let indexContent = readFileSync(indexPath, 'utf-8');
  let indexChanges = 0;

  for (const [slug, oldUrl] of Object.entries(IMAGE_MAP)) {
    const ext = getExtension(oldUrl);
    const newUrl = `${LOCAL_IMG}/${slug}${ext}`;
    const escapedOld = oldUrl.replace(/&/g, '&amp;');

    const reEscaped = new RegExp(escapedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let c = 0;
    indexContent = indexContent.replace(reEscaped, (m) => { c++; return newUrl; });
    indexChanges += c;
  }

  if (indexChanges > 0) {
    writeFileSync(indexPath, indexContent, 'utf-8');
    console.log(`  ✅ blog/index.html — ${indexChanges} replacements`);
    totalReplacements += indexChanges;
  } else {
    console.log(`  ⏭  blog/index.html — no changes needed`);
  }
}

// Step 3: Update generate-blog-index.mjs BLOG_DATA
console.log('\n=== Step 3: Updating tools/generate-blog-index.mjs ===\n');
const genIndexPath = join(rootDir, 'tools', 'generate-blog-index.mjs');
if (existsSync(genIndexPath)) {
  let genContent = readFileSync(genIndexPath, 'utf-8');
  let genChanges = 0;

  for (const [slug, oldUrl] of Object.entries(IMAGE_MAP)) {
    // Pattern: cover: 'https://images.unsplash.com/...' or cover: "https://..."
    // Replace with: cover: 'slug'
    const escapedUrl = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`cover:\\s*['"]${escapedUrl}['"]`, 'g');
    const newCover = `cover: '${slug}'`;

    genContent = genContent.replace(re, (m) => { genChanges++; return newCover; });
  }

  if (genChanges > 0) {
    writeFileSync(genIndexPath, genContent, 'utf-8');
    console.log(`  ✅ tools/generate-blog-index.mjs — ${genChanges} cover URLs replaced with local slugs`);
    totalReplacements += genChanges;
  } else {
    console.log(`  ⏭  tools/generate-blog-index.mjs — no changes needed`);
  }
}

// Step 4: Regenerate blog/index.html from updated generator
console.log('\n=== Step 4: Regenerating blog/index.html ===\n');
try {
  const { execSync } = await import('child_process');
  execSync('node tools/generate-blog-index.mjs', { cwd: rootDir, stdio: 'inherit' });
  console.log('  ✅ blog/index.html regenerated from updated generator');
} catch (err) {
  console.log('  ⚠️  Regeneration failed — run manually: node tools/generate-blog-index.mjs');
  console.log('     Error:', err.message);
}

// Step 5: Update tools/generate-blog-posts.mjs (so future runs also use local paths)
console.log('\n=== Step 5: Updating tools/generate-blog-posts.mjs ===\n');
const genPostsPath = join(rootDir, 'tools', 'generate-blog-posts.mjs');
if (existsSync(genPostsPath)) {
  let postsContent = readFileSync(genPostsPath, 'utf-8');
  let postsChanges = 0;

  // The generator reads cover_image from DB and passes it to coverUrl().
  // coverUrl() already handles slugs correctly (cover.startsWith('http') check).
  // But the DB still has full URLs, so future runs would produce full URLs again.
  // Solution: In the template, after fetching cover_image from DB, convert known URLs to slugs.
  
  // Actually, let me modify the main() function in generate-blog-posts.mjs
  // to convert external URLs to local paths after fetching from DB.
  
  const convertCode = `
    // Convert external cover URLs to local paths
    const EXTERNAL_IMG_MAP = {
${Object.entries(IMAGE_MAP).map(([slug, url]) => `      '${url}': '${slug}'`).join(',\n')}
    };
    for (const post of posts) {
      if (post.cover_image && EXTERNAL_IMG_MAP[post.cover_image]) {
        post.cover_image = EXTERNAL_IMG_MAP[post.cover_image];
      }
    }
`;

  // Find the line after fetching posts and before generating HTML
  const insertAfter = `  let generated = 0;`;
  if (postsContent.includes(insertAfter)) {
    postsContent = postsContent.replace(insertAfter, convertCode + `\n  ${insertAfter}`);
    writeFileSync(genPostsPath, postsContent, 'utf-8');
    console.log('  ✅ tools/generate-blog-posts.mjs — added URL-to-slug conversion');
    postsChanges++;
  } else {
    console.log('  ⏭  tools/generate-blog-posts.mjs — could not find insertion point');
  }
}

// Final summary
console.log(`\n📊 Summary:`);
console.log(`  Blog post files updated: ${filesUpdated}`);
console.log(`  Total replacements: ${totalReplacements}`);
console.log(`\n✅ All done!`);
