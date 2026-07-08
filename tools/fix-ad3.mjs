#!/usr/bin/env node
/**
 * Fix: Add missing Ad 3 to files that don't have it
 * Some files don't have tags-section, so add before back-section or end of blog-content
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = join(process.cwd(), 'blog');

const AD_TEMPLATE = `\n      <!-- Ad Banner 3 -->\n      <div class="blog-ad-container">\n        <div class="blog-ad-inner">\n          <span class="blog-ad-label">Ad</span>\n          <div class="blog-ad-content">\n            <div class="blog-ad-icon"><i class="fas fa-pen-fancy"></i></div>\n            <div class="blog-ad-text">\n              <h3>After Effects Templates</h3>\n              <p>Professional logo reveals, typography animations, and infographic templates designed to make an impact.</p>\n              <a href="https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins" class="blog-ad-cta">View Collection <i class="fas fa-arrow-right"></i></a>\n            </div>\n          </div>\n        </div>\n      </div>`;

const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'blog.css' && f !== 'index.html');
let fixed = 0;

for (const file of files) {
  const filePath = join(BLOG_DIR, file);
  let content = readFileSync(filePath, 'utf-8');
  let original = content;

  if (content.includes('Ad Banner 3')) continue;

  // Try adding before tags-section
  const tagsMatch = content.match(/<div class="tags-section">/);
  if (tagsMatch) {
    const insertPos = tagsMatch.index;
    content = content.slice(0, insertPos) + AD_TEMPLATE + '\n\n    ' + content.slice(insertPos);
  } else {
    // No tags-section - add before the closing </div> of blog-content
    // Find the blog-content div closing
    const contentEnd = content.indexOf('</article>');
    if (contentEnd !== -1) {
      // Find the last </div> before </article> (closing the blog-content div)
      const beforeArticle = content.slice(0, contentEnd);
      const lastDivClose = beforeArticle.lastIndexOf('</div>');
      // But we need the blog-content closing div, not any nested one
      // Look for </div>\n  </article>
      const articleClose = content.indexOf('</article>');
      const beforeArticleSection = content.slice(0, articleClose);
      // Find the last </div> before </article>  
      const lastDiv = beforeArticleSection.lastIndexOf('</div>');
      if (lastDiv !== -1) {
        content = content.slice(0, lastDiv) + AD_TEMPLATE + '\n  ' + content.slice(lastDiv);
      }
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Added Ad 3: ${file}`);
    fixed++;
  }
}
console.log(`\nDone! Added Ad 3 to ${fixed} files.`);
