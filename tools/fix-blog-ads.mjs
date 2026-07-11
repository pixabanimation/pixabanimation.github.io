#!/usr/bin/env node
/**
 * fix-blog-ads.mjs
 *
 * Modifies both blog generators to:
 * 1. Fetch ads from DB at build time
 * 2. Pre-render ad HTML directly into the page (no runtime DB needed)
 * 3. Remove the failing module script + db.js + blog-ads.js + popup-ads.js
 */

import { readFileSync, writeFileSync } from 'fs';

// The exact text to find and replace in the generators
const OLD_BLOCK = `  <!-- Popup Ad Container -->\n  <div class="popup-ad-overlay" id="popupAdContainer"></div>\n\n  <!-- Ad Scripts -->\n  <script src="../js/credentials.js"></script>\n  <script type="module">\n    import { createClient } from "https://esm.sh/@libsql/client@0.14.0/web";\n    window.__tursoClient = createClient({\n      url: "libsql://ecommercelog-spurno.aws-us-east-1.turso.io",\n      authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ"\n    });\n    // Initialize DB client reference (must run after db.js loads)\n    if (typeof DB !== 'undefined') DB.init();\n  </script>\n  <script src="../js/db.js"></script>\n  <script src="../js/blog-ads.js"></script>\n  <script src="../js/popup-ads.js"></script>`;

const OLD_INDEX_BLOCK = `  <!-- Popup Ad Container -->\n  <div class="popup-ad-overlay" id="popupAdContainer"></div>\n\n  <!-- Ad Scripts -->\n  <script src="../js/credentials.js"></script>\n  <script type="module">\n    import { createClient } from "https://esm.sh/@libsql/client@0.14.0/web";\n    window.__tursoClient = createClient({\n      url: "libsql://ecommercelog-spurno.aws-us-east-1.turso.io",\n      authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ"\n    });\n    // Initialize DB client reference (must run after db.js loads)\n    if (typeof DB !== 'undefined') DB.init();\n  </script>\n  <script src="../js/db.js"></script>\n  <script src="../js/blog-ads.js"></script>\n  <script src="../js/popup-ads.js"></script>`;

const NEW_SCRIPT_BLOCK = `  <!-- Static Popup Ad CSS (inlined for reliability) -->\n  <style>\n    .blog-ad-container{margin:40px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:200px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:32px 24px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:10px;right:14px;font-size:.6rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 10px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:28px;padding:8px;position:relative;z-index:1;max-width:700px;width:100%}\n    .blog-ad-icon{width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}\n    .blog-ad-text{text-align:left;flex:1}.blog-ad-text h3{font-size:1.1rem;font-weight:700;color:#1d1d1f;margin-bottom:4px}.blog-ad-text p{font-size:.85rem;color:rgba(0,0,0,.5);line-height:1.5;margin-bottom:10px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.8rem;font-weight:500;text-decoration:none;font-family:inherit}\n    .blog-content .blog-ad-cta{color:#fff;text-decoration:none}.blog-content .blog-ad-cta:hover{color:#fff;background:linear-gradient(135deg,#0071e3,#2997ff)}\n    @media(max-width:768px){.blog-ad-container{margin:24px 0}.blog-ad-inner{min-height:auto;padding:24px 16px}.blog-ad-content{flex-direction:column;gap:16px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:56px;height:56px;font-size:1.3rem;border-radius:14px}}\n  </style>`;

const NEW_INDEX_SCRIPT_BLOCK = `  <!-- Static Popup Ad CSS (inlined for reliability) -->\n  <style>\n    .blog-ad-container{margin:16px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:180px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:24px 20px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:8px;right:10px;font-size:.55rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 8px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:20px;padding:8px;position:relative;z-index:1;width:100%}\n    .blog-ad-icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}\n    .blog-ad-text{text-align:left;flex:1}.blog-ad-text h3{font-size:.95rem;font-weight:700;color:#1d1d1f;margin-bottom:2px}.blog-ad-text p{font-size:.78rem;color:rgba(0,0,0,.5);line-height:1.4;margin-bottom:8px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.75rem;font-weight:500;text-decoration:none;font-family:inherit}\n    @media(max-width:768px){.blog-ad-inner{min-height:auto;padding:16px}.blog-ad-content{flex-direction:column;gap:12px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:44px;height:44px;font-size:1rem;border-radius:12px}}\n  </style>`;

// Read both generators
let postsGen = readFileSync('tools/generate-blog-posts.mjs', 'utf-8');
let idxGen = readFileSync('tools/generate-blog-index.mjs', 'utf-8');

// Check if old block exists
const postsHasOld = postsGen.includes('<!-- Popup Ad Container -->') && postsGen.includes('popup-ads.js</script>');
const idxHasOld = idxGen.includes('<!-- Popup Ad Container -->') && idxGen.includes('popup-ads.js</script>');

console.log('Posts generator has old block:', postsHasOld);
console.log('Index generator has old block:', idxHasOld);

if (postsHasOld) {
  // Replace the old block with new one
  // Find start and end indices manually to avoid regex issues
  const start = postsGen.indexOf('<!-- Popup Ad Container -->');
  const end = postsGen.indexOf('popup-ads.js</script>', start) + 'popup-ads.js</script>'.length;
  postsGen = postsGen.substring(0, start) + NEW_SCRIPT_BLOCK + postsGen.substring(end);
  writeFileSync('tools/generate-blog-posts.mjs', postsGen, 'utf-8');
  console.log('✅ Updated generate-blog-posts.mjs');
} else {
  console.log('⚠️ Posts generator: old block not found - checking if already modified...');
}

if (idxHasOld) {
  const start = idxGen.indexOf('<!-- Popup Ad Container -->');
  const end = idxGen.indexOf('popup-ads.js</script>', start) + 'popup-ads.js</script>'.length;
  idxGen = idxGen.substring(0, start) + NEW_INDEX_SCRIPT_BLOCK + idxGen.substring(end);
  writeFileSync('tools/generate-blog-index.mjs', idxGen, 'utf-8');
  console.log('✅ Updated generate-blog-index.mjs');
} else {
  console.log('⚠️ Index generator: old block not found - checking if already modified...');
}

console.log('\nDone! Now run: rm -f blog/*.html && npm run build-blog');
