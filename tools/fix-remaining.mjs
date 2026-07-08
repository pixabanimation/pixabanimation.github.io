#!/usr/bin/env node
/**
 * Fix remaining issues: stray </h2> tags from broken h2
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = join(process.cwd(), 'blog');

const filesToFix = [
  'future-of-web-animation-2026.html',
  'typography-trends-2026.html',
  'claude-ai-coding-productivity.html',
  'ai-design-tools-creative-workflow.html',
  'ai-video-generation-2026.html',
  'chatgpt-codex-vs-claude-coding.html'
];

for (const file of filesToFix) {
  const filePath = join(BLOG_DIR, file);
  let content = readFileSync(filePath, 'utf-8');
  let original = content;

  // Fix: stray </h2> followed by ad banner - remove the stray </h2>
  // Pattern: </h2>\n\n      <!-- Ad Banner 1 -->
  // But there's a valid </h2> that closes a real h2, so we need to be careful.
  
  // Look for </h2> followed by whitespace then Ad Banner, where there's no preceding <h2> 
  // within the same paragraph area (i.e. it's not properly paired)
  
  // The pattern: a </h2> that appears right after a </p> or similar, before the ad
  // This should actually be removed entirely since the original had an unclosed <h2>
  
  // Remove pattern: </h2>\n\n      <!-- Ad Banner 1 --> but only when it's clearly orphaned
  // (i.e. right after a paragraph's </p> tag, not following a proper h2 heading)
  content = content.replace(
    /(<\/p>)\s*\n\s*<\/h2>\s*\n\s*(<!-- Ad Banner 1 -->)/g,
    '$1\n\n      $2'
  );
  
  // Also fix the <div> case for ad banner 3
  // Pattern: <div <!-- Ad Banner 3 -->  
  content = content.replace(
    /<div\s+<!-- Ad Banner 3 -->/g,
    '<div>\n      <!-- Ad Banner 3 -->'
  );

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed remaining: ${file}`);
  } else {
    console.log(`  No changes: ${file}`);
  }
}
