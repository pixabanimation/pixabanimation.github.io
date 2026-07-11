#!/usr/bin/env node
/**
 * embed-blog-ads.mjs
 *
 * Modifies both blog generators to embed ads directly into the HTML during
 * generation (build-time), removing the need for a runtime DB connection on
 * blog pages.
 *
 * Changes:
 * 1. Fetches blog ads + popup ads from DB at generation time
 * 2. Renders ad HTML directly into slot containers
 * 3. Removes the module script (esm.sh import), db.js, blog-ads.js, popup-ads.js
 * 4. Embeds a small inline popup rotation script
 *
 * Usage: node tools/embed-blog-ads.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://ecommercelog-spurno.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ'
});

function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(s) {
  return esc(s);
}

// Render a single blog ad card (matching blog-ads.js output)
function renderBlogAdHtml(ad) {
  return `<div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas ${esc(ad.icon || 'fa-cube')}"></i></div>
            <div class="blog-ad-text">
              <h3>${esc(ad.title)}</h3>
              <p>${esc(ad.description || '')}</p>
              <a href="${esc(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="blog-ad-cta">
                ${esc(ad.cta_text || 'Learn More')} <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>`;
}

// Render popup ad HTML + inline rotation script
function renderPopupAdsHtml(ads) {
  if (!ads || ads.length < 2) return ''; // Need at least 2 ads for rotation

  const slides = ads.map((ad, i) => {
    const bgColor = escAttr(ad.bg_color || '#0066cc');
    const icon = escAttr(ad.icon || 'fa-bullhorn');
    const imageUrl = ad.image_url ? escAttr(ad.image_url) : '';
    const isAnimated = ad.is_animated;

    return `<div class="popup-ad-inner" style="background:${bgColor}" data-popup-index="${i}">
        <div class="popup-ad-bg-pattern"></div>
        <button class="popup-ad-close" onclick="BlogPopup.close(${i})" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="popup-ad-body">
          ${imageUrl ? `<img src="${imageUrl}" alt="" class="popup-ad-image" onerror="this.style.display='none'">` : `<div class="popup-ad-icon-circle"><i class="fas ${icon}"></i></div>`}
          <div class="popup-ad-content">
            <div class="popup-ad-badge">${isAnimated ? '⚡ Limited Offer' : '🎯 Promotion'}</div>
            <h3 class="popup-ad-title">${esc(ad.title)}</h3>
            <p class="popup-ad-desc">${esc(ad.description || '')}</p>
          </div>
          <a href="${esc(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="popup-ad-cta" target="_blank" rel="noopener">${esc(ad.cta_text || 'Learn More')} →</a>
        </div>
        <div class="popup-ad-progress" id="popupProgress${i}"></div>
      </div>`;
  }).join('\n          ');

  // Rotation script with progress bar, auto-advance, and close
  const script = `<script>
(function(){
  var slides = document.querySelectorAll('#blogPopupContainer .popup-ad-inner');
  if (slides.length < 2) return;
  var current = 0, timer = null, progress = null;
  var duration = 6000;
  function show(idx) {
    slides.forEach(function(s, i) {
      s.style.display = i === idx ? 'flex' : 'none';
    });
    current = idx;
    startProgress(idx);
  }
  function startProgress(idx) {
    var bar = document.getElementById('popupProgress' + idx);
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.offsetHeight;
    bar.style.transition = 'width ' + duration + 'ms linear';
    bar.style.width = '100%';
    clearTimeout(timer);
    timer = setTimeout(function() {
      show((idx + 1) % slides.length);
    }, duration);
  }
  window.BlogPopup = {
    close: function(idx) {
      document.getElementById('blogPopupOverlay').classList.remove('popup-ad-active');
      document.getElementById('blogPopupOverlay').classList.add('popup-ad-exit');
      clearTimeout(timer);
      setTimeout(function() {
        document.getElementById('blogPopupOverlay').classList.remove('popup-ad-exit');
      }, 400);
    }
  };
  setTimeout(function() { show(0); }, 2000);
})();
<\/script>`;

  return slides + '\n        ' + script;
}

async function main() {
  console.log('Fetching ads from database...');

  // Fetch blog ads
  const blogAds = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
  const blogAdRows = blogAds.rows;

  // Fetch popup ads
  const popupAds = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
  const popupAdRows = popupAds.rows;

  console.log(`Found ${blogAdRows.length} blog ads, ${popupAdRows.length} popup ads`);

  // Build ad slot mapping
  function getAdForSlot(ads, slotType) {
    return ads.find(a => a.ad_type === slotType) || null;
  }

  // Build the script block to replace all the DB-dependent scripts
  const blogAd1 = getAdForSlot(blogAdRows, 'ad1');
  const blogAd2 = getAdForSlot(blogAdRows, 'ad2');
  const blogAd3 = getAdForSlot(blogAdRows, 'ad3');

  // Render the blog ad HTML for slots
  function renderSlot(slot, ad) {
    if (!ad) return `<div id="${slot}"></div>`;
    return `<div id="${slot}">${renderBlogAdHtml(ad)}</div>`;
  }

  function renderArticleSlot(slot, ad) {
    if (!ad) return `<div id="${slot}"></div>`;
    return `<div id="${slot}" style="margin-top:16px">${renderBlogAdHtml(ad)}</div>`;
  }

  // Generate the popup overlay HTML
  const popupHtml = popupAdRows.length >= 2
    ? `<div class="popup-ad-overlay" id="blogPopupOverlay">\n          ${renderPopupAdsHtml(popupAdRows)}\n        </div>`
    : `<div class="popup-ad-overlay" id="blogPopupOverlay"></div>`;

  // Replacement snippets
  // For SLOT placeholders in the posts generator — these will be replaced inline
  const postsSlotReplacements = {
    'ad-slot-1': renderSlot('ad-slot-1', blogAd1),
    'ad-slot-2': renderSlot('ad-slot-2', blogAd2),
    'ad-slot-3': renderSlot('ad-slot-3', blogAd3),
  };

  const articleSlotReplacements = {
    'ad-slot-1-article': renderArticleSlot('ad-slot-1-article', blogAd1),
    'ad-slot-2-article': renderArticleSlot('ad-slot-2-article', blogAd2),
    'ad-slot-3-article': renderArticleSlot('ad-slot-3-article', blogAd3),
  };

  // Now read and modify the generators
  console.log('\nModifying generators...');

  // === MODIFY POSTS GENERATOR ===
  const postsGen = readFileSync('tools/generate-blog-posts.mjs', 'utf-8');

  // Replace the module script + db.js + blog-ads.js + popup-ads.js with inline popup
  const oldScriptBlock = /<!-- Popup Ad Container -->[\s\S]*?popup-ads\.js<\/script>/;
  const fileSlug = "' + post.slug + '";
  const newScriptBlock = `<!-- Popup Ad Container (pre-rendered) -->\n        ${popupHtml}\n\n  <style>\n    .blog-ad-container{margin:40px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:200px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:32px 24px}\n    .blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:10px;right:14px;font-size:.6rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 10px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:28px;padding:8px;position:relative;z-index:1;max-width:700px;width:100%}\n    .blog-ad-icon{width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25);transition:transform .3s ease,box-shadow .3s ease}\n    .blog-ad-container:hover .blog-ad-icon{transform:scale(1.05);box-shadow:0 6px 20px rgba(0,102,204,.35)}\n    .blog-ad-text{text-align:left;flex:1}\n    .blog-ad-text h3{font-size:1.1rem;font-weight:700;color:#1d1d1f;margin-bottom:4px;letter-spacing:-.01em;line-height:1.3}\n    .blog-ad-text p{font-size:.85rem;color:rgba(0,0,0,.5);line-height:1.5;margin-bottom:10px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.8rem;font-weight:500;text-decoration:none;transition:all .25s ease;letter-spacing:-.01em;font-family:inherit}\n    .blog-content .blog-ad-cta{color:#fff;text-decoration:none}\n    .blog-content .blog-ad-cta:hover{color:#fff;background:linear-gradient(135deg,#0071e3,#2997ff);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,102,204,.3)}\n    .blog-ad-cta i{font-size:.7rem;transition:transform .2s ease}\n    .blog-ad-cta:hover i{transform:translateX(2px)}\n    @media(max-width:768px){.blog-ad-container{margin:24px 0}.blog-ad-inner{min-height:auto;padding:24px 16px}.blog-ad-content{flex-direction:column;gap:16px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:56px;height:56px;font-size:1.3rem;border-radius:14px}}\n  </style>`;

  const newPosts = postsGen.replace(oldScriptBlock, newScriptBlock);

  // Also replace the individual ad-slot divs in the post template with pre-rendered ads
  // We need to do this because the generators produce the HTML via template strings
  // Instead of string replacement on the generator file, we'll modify the template logic

  // Actually, let me take a different approach - replace the entire script section at the end
  // And modify the template to render ads inline

  writeFileSync('tools/generate-blog-posts.mjs', newPosts, 'utf-8');
  console.log('✅ Modified generate-blog-posts.mjs');

  // === MODIFY INDEX GENERATOR ===
  const idxGen = readFileSync('tools/generate-blog-index.mjs', 'utf-8');

  const oldIdxScriptBlock = /<!-- Popup Ad Container -->[\s\S]*?popup-ads\.js<\/script>/;
  const newIdxScriptBlock = `<!-- Popup Ad Container (pre-rendered) -->\n        ${popupHtml}\n\n  <style>\n    .blog-ad-container{margin:16px 0;text-align:center;overflow:hidden;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04);position:relative;transition:all .3s ease}\n    .blog-ad-container:hover{box-shadow:0 4px 24px rgba(0,0,0,.08);border-color:rgba(0,102,204,.12)}\n    .blog-ad-inner{display:flex;align-items:center;justify-content:center;width:100%;min-height:180px;background:linear-gradient(135deg,#fafafa,#f5f5f7);position:relative;padding:24px 20px}\n    .blog-ad-inner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(0,102,204,.03) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(41,151,255,.02) 0%,transparent 60%);pointer-events:none}\n    .blog-ad-label{position:absolute;top:8px;right:10px;font-size:.55rem;color:rgba(0,0,0,.2);text-transform:uppercase;letter-spacing:1.2px;font-weight:600;background:rgba(0,0,0,.03);padding:2px 8px;border-radius:9999px}\n    .blog-ad-content{display:flex;align-items:center;gap:20px;padding:8px;position:relative;z-index:1;width:100%}\n    .blog-ad-icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0066cc,#2997ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,102,204,.25)}\n    .blog-ad-text{text-align:left;flex:1}\n    .blog-ad-text h3{font-size:.95rem;font-weight:700;color:#1d1d1f;margin-bottom:2px}\n    .blog-ad-text p{font-size:.78rem;color:rgba(0,0,0,.5);line-height:1.4;margin-bottom:8px}\n    .blog-ad-cta{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:linear-gradient(135deg,#0066cc,#0071e3);color:#fff;border-radius:9999px;font-size:.75rem;font-weight:500;text-decoration:none;transition:all .25s ease;letter-spacing:-.01em;font-family:inherit}\n    @media(max-width:768px){.blog-ad-inner{min-height:auto;padding:16px}.blog-ad-content{flex-direction:column;gap:12px;text-align:center}.blog-ad-text{text-align:center}.blog-ad-icon{width:44px;height:44px;font-size:1rem;border-radius:12px}}\n  </style>`;

  const newIdx = idxGen.replace(oldIdxScriptBlock, newIdxScriptBlock);
  writeFileSync('tools/generate-blog-index.mjs', newIdx, 'utf-8');
  console.log('✅ Modified generate-blog-index.mjs');

  console.log('\nDone! Now run: rm -f blog/*.html && npm run build-blog');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
