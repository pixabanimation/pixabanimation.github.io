#!/usr/bin/env node
// Fix ad script blocks in both generators, handling Windows CRLF line endings
import { readFileSync, writeFileSync } from 'fs';

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Find the block to replace
  const popupStart = content.indexOf('Popup Ad Container -->');
  if (popupStart === -1) {
    console.log(filePath + ': Popup Ad Container not found');
    return false;
  }
  
  const popupEnd = content.indexOf('popup-ads.js', popupStart);
  if (popupEnd === -1) {
    console.log(filePath + ': popup-ads.js not found');
    return false;
  }
  
  // Find the closing tag of popup-ads.js script
  const closeTag = content.indexOf('>', popupEnd);
  const endIdx = closeTag + 1;
  
  // Extract the old block text (from the comment before to the closing > of popup-ads.js)
  const oldBlock = content.substring(popupStart - '<!-- '.length, endIdx);
  
  // Check if this is a post generator or index generator
  const isPost = content.includes('ad-slot-1-article');
  
  const newBlock = isPost
    ? `<!-- Blog Ad & Popup Ad Styles (inlined for reliability) -->\n  <style>\n    .blog-ad-container{margin:40px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:200px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:32px 24px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:10px;right:14px;font-size:.6rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 10px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:28px;padding:8px;position:relative;z-index:1;max-width:700px;width:100%}\n    .blog-ad-icon{width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}\n    .blog-ad-text{text-align:left;flex:1}.blog-ad-text h3{font-size:1.1rem;font-weight:700;color:#1d1d1f;margin-bottom:4px}.blog-ad-text p{font-size:.85rem;color:rgba(0,0,0,.5);line-height:1.5;margin-bottom:10px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.8rem;font-weight:500;text-decoration:none;font-family:inherit}\n    @media(max-width:768px){.blog-ad-container{margin:24px 0}.blog-ad-inner{min-height:auto;padding:24px 16px}.blog-ad-content{flex-direction:column;gap:16px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:56px;height:56px;font-size:1.3rem;border-radius:14px}}\n  </style>`
    : `<!-- Blog Ad & Popup Ad Styles (inlined for reliability) -->\n  <style>\n    .blog-ad-container{margin:16px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:180px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:24px 20px}.blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:8px;right:10px;font-size:.55rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 8px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:20px;padding:8px;position:relative;z-index:1;width:100%}\n    .blog-ad-icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}\n    .blog-ad-text{text-align:left;flex:1}.blog-ad-text h3{font-size:.95rem;font-weight:700;color:#1d1d1f;margin-bottom:2px}.blog-ad-text p{font-size:.78rem;color:rgba(0,0,0,.5);line-height:1.4;margin-bottom:8px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.75rem;font-weight:500;text-decoration:none;font-family:inherit}\n    @media(max-width:768px){.blog-ad-inner{min-height:auto;padding:16px}.blog-ad-content{flex-direction:column;gap:12px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:44px;height:44px;font-size:1rem;border-radius:12px}}\n  </style>\n\n  <!-- Popup Ad Overlay (pre-rendered) -->\n  <div class="popup-ad-overlay" id="popupAdContainer"></div>\n\n  <!-- Popup Ad Rotation Script -->\n  <script>\n    // Load popup ads from database if available, otherwise leave container empty\n    (function(){\n      var c = document.getElementById(\"popupAdContainer\");\n      if (!c) return;\n      // Check if DB is available (main site) - load dynamically\n      // On static blog pages, popup ads rely on DB which may not be available\n      // They will show on the main site where the SPA handles them\n    })();\n  </script>`;
  
  const newContent = content.substring(0, popupStart - '<!-- '.length) + newBlock + content.substring(endIdx);
  writeFileSync(filePath, newContent, 'utf-8');
  console.log(filePath + ': ✅ Replaced (' + (isPost ? 'post' : 'index') + ')');
  return true;
}

fixFile('tools/generate-blog-posts.mjs');
fixFile('tools/generate-blog-index.mjs');

console.log('\nDone! Now run: rm -f blog/*.html && npm run build-blog');
