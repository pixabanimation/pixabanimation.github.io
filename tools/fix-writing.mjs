#!/usr/bin/env node
/**
 * Fix writing quality across all blog pages - typos, capitalization, Apple-style polish
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = join(process.cwd(), 'blog');
const files = readdirSync(BLOG_DIR).filter(f => 
  f.endsWith('.html') && f !== 'blog.css' && f !== 'index.html'
);

let fixed = 0;

for (const file of files) {
  const fp = join(BLOG_DIR, file);
  let c = readFileSync(fp, 'utf-8');
  let o = c;

  // Fix "after effects" capitalization (word boundaries)
  c = c.replace(/\bin after effects\b/gi, 'in After Effects');
  c = c.replace(/\bfor after effects\b/gi, 'for After Effects');
  c = c.replace(/\busing after effects\b/gi, 'using After Effects');
  c = c.replace(/\bwith after effects\b/gi, 'with After Effects');
  c = c.replace(/\bof after effects\b/gi, 'of After Effects');
  
  // Fix common contractions
  c = c.replace(/\bcant\b/gi, "can't");
  c = c.replace(/\bdont\b/gi, "don't");
  c = c.replace(/\bwont\b/gi, "won't");
  c = c.replace(/\bdoesnt\b/gi, "doesn't");
  c = c.replace(/\bdidnt\b/gi, "didn't");
  c = c.replace(/\bwasnt\b/gi, "wasn't");
  c = c.replace(/\bIm\b(?=\s+(a|not|going|very|so|the|an|excited|ready|here))/gi, "I'm");
  c = c.replace(/\byoure\b/gi, "you're");
  c = c.replace(/\btheyll\b/gi, "they'll");
  c = c.replace(/\bthats\b/gi, "that's");
  c = c.replace(/\bits\b(?=\s+(a|an|the|not|important|essential|critical|worth|time))/gi, "it's");
  c = c.replace(/\bcouldnt\b/gi, "couldn't");
  c = c.replace(/\bwouldnt\b/gi, "wouldn't");
  c = c.replace(/\bshouldnt\b/gi, "shouldn't");
  c = c.replace(/\bive\b/gi, "I've");
  c = c.replace(/\byouve\b/gi, "you've");
  c = c.replace(/\btheyre\b/gi, "they're");
  c = c.replace(/\btheres\b/gi, "there's");
  c = c.replace(/\bheres\b/gi, "here's");
  c = c.replace(/\bwhos\b/gi, "who's");
  c = c.replace(/\bwhats\b/gi, "what's");
  
  // Fix other common issues
  c = c.replace(/\balot\b/gi, 'a lot');
  
  // Fix double spaces to single (but preserve intentional spacing)
  c = c.replace(/  +/g, ' ');
  
  // Fix double periods
  c = c.replace(/\.\.+/g, '.');
  
  // Fix: Capitalize first letter of meta descriptions if they start with lowercase
  // (Carefully - only in the content attribute, not the property)
  const metaDescRegex = /<meta name="description" content="([^"]+)"/g;
  c = c.replace(metaDescRegex, (match, content) => {
    if (content.length > 0 && content[0] === content[0].toLowerCase()) {
      return match.replace(content, content[0].toUpperCase() + content.slice(1));
    }
    return match;
  });

  if (c !== o) {
    writeFileSync(fp, c, 'utf-8');
    console.log('Fixed: ' + file);
    fixed++;
  }
}
console.log('Done! ' + fixed + ' files updated with writing fixes.');
