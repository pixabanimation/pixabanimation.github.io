#!/usr/bin/env node
/**
 * fix-blog-images.mjs
 *
 * Downloads all external blog cover images (Unsplash, Cloudinary) for posts
 * IDs 41-65 to local assets/images/blog/{slug}.png (or .jpg), then
 * updates all references in the generated HTML files and generators.
 *
 * Usage: node tools/fix-blog-images.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';
import { get } from 'https';
import { createWriteStream } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const assetsDir = join(rootDir, 'assets', 'images', 'blog');

// Ensure assets dir exists
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

const BASE_URL = 'https://pixabanimation.github.io';

// ─── DB Connection ──────────────────────────────────────────────────────────
const client = createClient({
  url: 'libsql://ecommercelog-spurno.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ'
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (url.startsWith('https://images.unsplash.com') || url.startsWith('https://res.cloudinary.com')) {
      const file = createWriteStream(dest);
      get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          downloadImage(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        file.close();
        reject(err);
      });
    } else {
      resolve(); // Not an external URL, skip
    }
  });
}

function getExtension(url) {
  const clean = url.split('?')[0];
  const ext = extname(clean);
  if (ext) return ext;
  // Default based on domain
  if (url.includes('cloudinary')) return '.jpg';
  return '.png';
}

function isLocalRef(url) {
  return url.startsWith('../assets/') || url.startsWith(BASE_URL + '/assets/') || url.startsWith('/assets/');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Step 1: Fetching blog posts from database ===\n');
  const result = await client.execute(
    'SELECT id, slug, cover_image FROM blog_posts WHERE id >= 41 ORDER BY id ASC'
  );
  const posts = result.rows;
  console.log(`Found ${posts.length} posts to process.\n`);

  // ── Step 2: Download images ──
  console.log('=== Step 2: Downloading external images ===\n');
  const imageMap = {}; // slug -> { oldUrl, localPath, localRelPath }

  for (const post of posts) {
    const url = post.cover_image;
    if (!url || isLocalRef(url)) {
      console.log(`  ⏭  Already local: ${post.slug}`);
      continue;
    }

    const ext = getExtension(url);
    const filename = `${post.slug}${ext}`;
    const destPath = join(assetsDir, filename);
    const localRelPath = `../assets/images/blog/${filename}`; // relative from blog/

    if (existsSync(destPath)) {
      console.log(`  ⏭  Already downloaded: ${filename}`);
    } else {
      console.log(`  ⬇  Downloading ${filename}...`);
      try {
        await downloadImage(url, destPath);
        console.log(`  ✅ Saved: ${filename}`);
      } catch (err) {
        console.error(`  ❌ Failed: ${filename} - ${err.message}`);
        continue;
      }
    }

    imageMap[post.slug] = { oldUrl: url, localPath: destPath, localRelPath, filename };
  }

  console.log(`\nDownloaded ${Object.keys(imageMap).length} images.\n`);

  // ── Step 3: Update the 25 generated HTML files ──
  console.log('=== Step 3: Updating generated HTML files ===\n');
  let filesUpdated = 0;

  for (const post of posts) {
    const filepath = join(blogDir, `${post.slug}.html`);
    if (!existsSync(filepath)) {
      console.log(`  ⏭  File not found: ${post.slug}.html`);
      continue;
    }

    const entry = imageMap[post.slug];
    if (!entry) {
      continue; // Already local
    }

    let content = readFileSync(filepath, 'utf-8');
    const oldUrl = entry.oldUrl;
    const newUrl = `${BASE_URL}/assets/images/blog/${entry.filename}`;
    const newUrlRelative = entry.localRelPath;

    // Replace in OG tags, Twitter tags, JSON-LD, img src, etc.
    // Need to escape & in old URL for matching escaped versions
    const oldUrlEscaped = oldUrl.replace(/&/g, '&amp;');

    let count = 0;
    // Replace the escaped version first (in HTML attributes and JSON-LD)
    const reEscaped = new RegExp(oldUrlEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(reEscaped, (match) => {
      count++;
      // In OG/Twitter meta tags, use absolute URL
      return newUrl;
    });

    // Also replace unescaped version if any remain
    const reRaw = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(reRaw, (match) => {
      count++;
      return newUrl;
    });

    writeFileSync(filepath, content, 'utf-8');
    console.log(`  ✅ Updated ${post.slug}.html (${count} replacements)`);
    filesUpdated++;
  }

  // ── Step 4: Update blog/index.html ──
  console.log('\n=== Step 4: Updating blog/index.html ===\n');
  const indexPath = join(blogDir, 'index.html');
  if (existsSync(indexPath)) {
    let indexContent = readFileSync(indexPath, 'utf-8');
    let totalIndexReplacements = 0;

    for (const [slug, entry] of Object.entries(imageMap)) {
      const oldUrl = entry.oldUrl;
      const newUrl = `${BASE_URL}/assets/images/blog/${entry.filename}`;
      const oldEscaped = oldUrl.replace(/&/g, '&amp;');

      const re1 = new RegExp(oldEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const before = indexContent;
      indexContent = indexContent.replace(re1, newUrl);
      totalIndexReplacements += (before.length - indexContent.length) / newUrl.length;
    }

    writeFileSync(indexPath, indexContent, 'utf-8');
    console.log(`  ✅ blog/index.html updated (${Math.round(totalIndexReplacements)} replacements)`);
  }

  // ── Step 5: Update generate-blog-index.mjs BLOG_DATA ──
  console.log('\n=== Step 5: Updating generate-blog-index.mjs ===\n');
  const genIndexPath = join(rootDir, 'tools', 'generate-blog-index.mjs');
  if (existsSync(genIndexPath)) {
    let genContent = readFileSync(genIndexPath, 'utf-8');
    let totalGenReplacements = 0;

    for (const [slug, entry] of Object.entries(imageMap)) {
      const oldUrl = entry.oldUrl;
      const newCover = slug; // Just the slug, coverUrl() function will handle it
      const oldUrlEscaped = oldUrl.replace(/'/g, "\\'").replace(/&/g, '&amp;');

      // Pattern: cover: 'https://images.unsplash.com/...'
      // Replace with: cover: 'slug'
      const re = new RegExp(`cover:\\s*'${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "\\'")}'`, 'g');
      genContent = genContent.replace(re, `cover: '${slug}'`);
      totalGenReplacements++;
    }

    writeFileSync(genIndexPath, genContent, 'utf-8');
    console.log(`  ✅ tools/generate-blog-index.mjs updated (${totalGenReplacements} replacements)`);
  }

  // ── Step 6: Regenerate blog/index.html from updated generator ──
  console.log('\n=== Step 6: Regenerating blog/index.html ===\n');
  try {
    const { execSync } = await import('child_process');
    execSync('node tools/generate-blog-index.mjs', { cwd: rootDir, stdio: 'inherit' });
    console.log('  ✅ blog/index.html regenerated');
  } catch (err) {
    console.log('  ⚠️  Regeneration skipped — run manually: node tools/generate-blog-index.mjs');
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Images downloaded: ${Object.keys(imageMap).length}`);
  console.log(`  HTML files updated: ${filesUpdated}`);
  console.log(`  blog/index.html updated and regenerated`);

  if (Object.keys(imageMap).length > 0) {
    console.log(`\n🔔 Note: The generator scripts (generate-blog-index.mjs) have been updated to use local slugs.`);
    console.log(`   Future runs will produce local image references.`);
    console.log(`\n✅ All done!`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
