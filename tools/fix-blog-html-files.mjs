#!/usr/bin/env node
/**
 * fix-blog-html-files.mjs
 *
 * Fixes all static blog HTML files by replacing the old DB-dependent
 * script block with a simpler, self-contained approach.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const NEW_BLOCK = `  <!-- Popup Ad Container -->
  <div class="popup-ad-overlay" id="popupAdContainer"></div>

  <!-- Blog Ad Scripts (works without DB) -->
  <script src="../js/blog-ads.js"></script>
  <script src="../js/popup-ads.js"></script>`;

const AD_CSS_POST = `  <style>
    .blog-ad-container{margin:40px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}
    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}
    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:200px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:32px 24px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}
    .blog-ad-label{position:absolute;top:10px;right:14px;font-size:.6rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 10px;border-radius:9999px}
    .blog-ad-content{display:flex;align-items:center;gap:28px;padding:8px;position:relative;z-index:1;max-width:700px;width:100%}
    .blog-ad-icon{width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25);transition:transform .3s ease,box-shadow .3s ease}
    .blog-ad-container:hover .blog-ad-icon{transform:scale(1.05);box-shadow:0 6px 20px rgba(0,102,204,.35)}
    .blog-ad-text{text-align:left;flex:1}
    .blog-ad-text h3{font-size:1.1rem;font-weight:700;color:#1d1d1f;margin-bottom:4px;letter-spacing:-.01em;line-height:1.3}
    .blog-ad-text p{font-size:.85rem;color:rgba(0,0,0,.5);line-height:1.5;margin-bottom:10px}
    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.8rem;font-weight:500;text-decoration:none;transition:all .25s ease;letter-spacing:-.01em}
    .blog-content .blog-ad-cta{color:#fff;text-decoration:none}
    .blog-content .blog-ad-cta:hover{color:#fff;background:linear-gradient(135deg,#0071e3,#2997ff);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,102,204,.3)}
    .blog-ad-cta:active{transform:translateY(0)}
    .blog-ad-cta i{font-size:.7rem;transition:transform .2s ease}
    .blog-ad-cta:hover i{transform:translateX(2px)}
    @media(max-width:768px){.blog-ad-container{margin:24px 0}.blog-ad-inner{min-height:auto;padding:24px 16px}.blog-ad-content{flex-direction:column;gap:16px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:56px;height:56px;font-size:1.3rem;border-radius:14px}}
  </style>`;

const AD_CSS_INDEX = `  <style>
    .blog-ad-container{margin:16px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}
    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}
    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:180px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:24px 20px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}
    .blog-ad-label{position:absolute;top:8px;right:10px;font-size:.55rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 8px;border-radius:9999px}
    .blog-ad-content{display:flex;align-items:center;gap:20px;padding:8px;position:relative;z-index:1;width:100%}
    .blog-ad-icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}
    .blog-ad-text{text-align:left;flex:1}.blog-ad-text h3{font-size:.95rem;font-weight:700;color:#1d1d1f;margin-bottom:2px}.blog-ad-text p{font-size:.78rem;color:rgba(0,0,0,.5);line-height:1.4;margin-bottom:8px}
    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.75rem;font-weight:500;text-decoration:none;font-family:inherit}
    @media(max-width:768px){.blog-ad-inner{min-height:auto;padding:16px}.blog-ad-content{flex-direction:column;gap:12px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:44px;height:44px;font-size:1rem;border-radius:12px}}
  </style>`;

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Check if already fixed (no credentials.js reference)
  if (!content.includes('credentials.js') && !content.includes('esm.sh/@libsql')) {
    return { status: 'already-clean' };
  }

  const isIndex = filePath.toLowerCase().endsWith('index.html');
  const adCss = isIndex ? AD_CSS_INDEX : AD_CSS_POST;

  // Find the start marker: "Popup Ad Container" comment
  const popupCommentIdx = content.indexOf('Popup Ad Container -->');
  if (popupCommentIdx === -1) {
    return { status: 'no-marker' };
  }

  // Find the start of the comment
  const blockStart = content.lastIndexOf('<!--', popupCommentIdx);
  if (blockStart === -1) {
    return { status: 'no-start' };
  }

  // Find the end: the closing </script> tag of popup-ads.js
  const popupScriptEnd = content.indexOf('</script>', content.indexOf('popup-ads.js'));
  if (popupScriptEnd === -1) {
    return { status: 'no-end' };
  }

  const endIdx = popupScriptEnd + '</script>'.length;

  // Build the replacement
  const replacement = `${adCss}\n\n${NEW_BLOCK}`;
  content = content.substring(0, blockStart) + replacement + content.substring(endIdx);

  writeFileSync(filePath, content, 'utf-8');
  return { status: 'fixed' };
}

// Get all blog HTML files
const files = readdirSync('./blog').filter(f => f.endsWith('.html'));
let fixed = 0, clean = 0, errors = 0;

for (const file of files) {
  const filePath = `./blog/${file}`;
  try {
    const result = fixFile(filePath);
    if (result.status === 'fixed') {
      console.log(`✅ Fixed: ${file}`);
      fixed++;
    } else if (result.status === 'already-clean') {
      console.log(`⏭️  Already clean: ${file}`);
      clean++;
    } else {
      console.log(`⚠️  Skipped (${result.status}): ${file}`);
      errors++;
    }
  } catch (err) {
    console.log(`❌ Error: ${file} - ${err.message}`);
    errors++;
  }
}

console.log(`\n📊 Results: ${fixed} fixed, ${clean} already clean, ${errors} errors`);
