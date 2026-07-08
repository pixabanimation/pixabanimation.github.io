#!/usr/bin/env node
/**
 * Blog Fix Script — Standardizes ad banners, fixes broken HTML, adds missing ads
 * Usage: node tools/fix-blog-ads.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const BLOG_DIR = join(process.cwd(), 'blog');

// Premium ad banner templates (Apple-style)
const AD_TEMPLATES = {
  ad1: `      <!-- Ad Banner 1 -->
      <div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas fa-cube"></i></div>
            <div class="blog-ad-text">
              <h3>Premium Motion Graphics Assets</h3>
              <p>Browse 500+ professional 4K motion backgrounds, animated templates, and stock footage — crafted for creators who demand the best.</p>
              <a href="https://pixabanimation.github.io/#/shop" class="blog-ad-cta">Browse Collection <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>`,

  ad2: `      <!-- Ad Banner 2 -->
      <div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas fa-play-circle"></i></div>
            <div class="blog-ad-text">
              <h3>4K Video Clips &amp; Templates</h3>
              <p>Royalty-free motion graphics, lower thirds, and title animations. Elevate every project with professional-grade assets.</p>
              <a href="https://pixabanimation.github.io/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>`,

  ad3: `      <!-- Ad Banner 3 -->
      <div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas fa-pen-fancy"></i></div>
            <div class="blog-ad-text">
              <h3>After Effects Templates</h3>
              <p>Professional logo reveals, typography animations, and infographic templates designed to make an impact.</p>
              <a href="https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>`
};

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let original = content;
  const filename = filePath.split('\\').pop().split('/').pop();

  // 1. Fix broken h2 tags: `<h2>\n\n      <!-- Ad Banner` → close h2 before ad
  // Pattern: <h2> followed by whitespace then ad banner
  content = content.replace(/<h2>\s*\n\s*(<!-- Ad Banner \d -->)/g, '</h2>\n\n      $1');

  // 2. Fix broken div: `<div <!-- Ad Banner` → `<div>\n      <!-- Ad Banner`
  content = content.replace(/<div\s+(<!-- Ad Banner \d -->)/g, '<div>\n      $1');

  // 3. Standardize Ad 1: Replace "Advertisement" label with "Ad"
  content = content.replace(/<span class="blog-ad-label">Advertisement<\/span>/g, '<span class="blog-ad-label">Ad</span>');

  // 4. Standardize Ad 2: Update CTA text
  content = content.replace(/<a href="https:\/\/pixabanimation\.github\.io\/#\/shop\?category=videos" class="blog-ad-cta">Explore →<\/a>/g,
    '<a href="https://pixabanimation.github.io/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a>');
  content = content.replace(/<a href="https:\/\/pixabanimation\.github\.io\/#\/shop\?category=videos" class="blog-ad-cta">Explore →<\/a>/g,
    '<a href="https://pixabanimation.github.io/#/shop?category=videos" class="blog-ad-cta">Explore Library <i class="fas fa-arrow-right"></i></a>');

  // 5. Standardize Shop Now CTA
  content = content.replace(/<a href="https:\/\/pixabanimation\.github\.io\/#\/shop" class="blog-ad-cta">Shop Now →<\/a>/g,
    '<a href="https://pixabanimation.github.io/#/shop" class="blog-ad-cta">Browse Collection <i class="fas fa-arrow-right"></i></a>');

  // 6. Standardize View Collection CTA
  content = content.replace(/<a href="https:\/\/pixabanimation\.github\.io\/#\/shop\?category=adobe-after-effect-plugins" class="blog-ad-cta">View Collection →<\/a>/g,
    '<a href="https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a>');

  // 7. Standardize ad icons
  // Ad 1 icon: ✦ → cube
  content = content.replace(/<div class="blog-ad-icon">✦<\/div>\s*<div class="blog-ad-text">\s*<h3>Premium Motion Graphics Assets<\/h3>\s*<p>Browse 500\+ professional 4K motion backgrounds, animated templates, and stock footage\.<\/p>/g,
    `<div class="blog-ad-icon"><i class="fas fa-cube"></i></div>
            <div class="blog-ad-text">
              <h3>Premium Motion Graphics Assets</h3>
              <p>Browse 500+ professional 4K motion backgrounds, animated templates, and stock footage — crafted for creators who demand the best.</p>`);

  // Ad 2 icon & text
  content = content.replace(/<div class="blog-ad-icon"><i class="fas fa-video"><\/i><\/div>\s*<div class="blog-ad-text">\s*<h3>4K Video Clips &amp; Templates<\/h3>\s*<p>Royalty-free motion graphics, lower thirds, and title animations for your next project\.<\/p>/g,
    `<div class="blog-ad-icon"><i class="fas fa-play-circle"></i></div>
            <div class="blog-ad-text">
              <h3>4K Video Clips &amp; Templates</h3>
              <p>Royalty-free motion graphics, lower thirds, and title animations. Elevate every project with professional-grade assets.</p>`);

  // Ad 3 icon & text
  content = content.replace(/<div class="blog-ad-icon"><i class="fas fa-pen-fancy"><\/i><\/div>\s*<div class="blog-ad-text">\s*<h3>After Effects Templates<\/h3>\s*<p>Professional logo reveals, typography animations, and infographic templates\.<\/p>/g,
    `<div class="blog-ad-icon"><i class="fas fa-pen-fancy"></i></div>
            <div class="blog-ad-text">
              <h3>After Effects Templates</h3>
              <p>Professional logo reveals, typography animations, and infographic templates designed to make an impact.</p>`);

  // 8. Fix "after effects" → "After Effects" (case-insensitive when lowercase, but not inside HTML tags)
  content = content.replace(/\b([Aa]fter) [Ee]ffects\b/g, (match, first) => {
    // Only fix if it's "after effects" (lowercase a) or mixed case
    if (first === 'after' || first === 'After') {
      return 'After Effects';
    }
    return match;
  });

  // 9. Fix "in after effects" specifically  
  content = content.replace(/\bin after effects\b/gi, 'in After Effects');
  content = content.replace(/\bfor after effects\b/gi, 'for After Effects');

  // 10. Add missing Ad 1 for files that don't have it
  // Check if file has Ad 1
  if (!content.includes('Ad Banner 1') && content.includes('blog-content')) {
    // Add after the first closing </p> that's after the first <h2>
    const h2Match = content.match(/<h2>[^<]+<\/h2>/);
    if (h2Match) {
      const h2End = h2Match.index + h2Match[0].length;
      const afterH2 = content.slice(h2End);
      const pEnd = afterH2.indexOf('</p>');
      if (pEnd !== -1) {
        const insertPos = h2End + pEnd + 4;
        content = content.slice(0, insertPos) + '\n\n' + AD_TEMPLATES.ad1 + '\n\n' + content.slice(insertPos);
      }
    }
  }

  // 11. Add missing Ad 3 for files that don't have it (before tags-section or back-section)
  if (!content.includes('Ad Banner 3')) {
    const tagsMatch = content.match(/<div class="tags-section">/);
    if (tagsMatch) {
      const insertPos = tagsMatch.index;
      content = content.slice(0, insertPos) + '\n' + AD_TEMPLATES.ad3 + '\n\n' + content.slice(insertPos);
    }
  }

  // 12. Add missing Ad 2 for files that don't have it
  if (!content.includes('Ad Banner 2')) {
    // Find the middle of the blog-content section and add Ad 2 after a closing h2 or p
    const blogContentStart = content.indexOf('<div class="blog-content">');
    const tagsStart = content.indexOf('<div class="tags-section">');
    if (blogContentStart !== -1 && tagsStart !== -1) {
      const contentMiddle = blogContentStart + Math.floor((tagsStart - blogContentStart) / 2);
      // Find the nearest </h2> or </p> after contentMiddle
      const afterMiddle = content.slice(contentMiddle);
      const h2End = afterMiddle.indexOf('</h2>');
      const pEnd = afterMiddle.indexOf('</p>');
      let insertAfter = -1;
      if (h2End !== -1 && pEnd !== -1) {
        insertAfter = contentMiddle + Math.min(h2End + 5, pEnd + 4);
      } else if (h2End !== -1) {
        insertAfter = contentMiddle + h2End + 5;
      } else if (pEnd !== -1) {
        insertAfter = contentMiddle + pEnd + 4;
      }
      if (insertAfter !== -1) {
        content = content.slice(0, insertAfter) + '\n\n' + AD_TEMPLATES.ad2 + '\n\n' + content.slice(insertAfter);
      }
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${filename}`);
    return true;
  }
  return false;
}

// Process all blog HTML files
const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'blog.css');
let fixed = 0;
let unchanged = 0;

for (const file of files) {
  const filePath = join(BLOG_DIR, file);
  if (fixFile(filePath)) {
    fixed++;
  } else {
    unchanged++;
  }
}

console.log(`\nDone! ${fixed} files fixed, ${unchanged} files unchanged.`);
