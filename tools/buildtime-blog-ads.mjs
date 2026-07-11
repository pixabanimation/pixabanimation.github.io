#!/usr/bin/env node
/**
 * buildtime-blog-ads.mjs
 *
 * Modifies both blog generators to:
 * 1. Fetch blog_ads and popup_ads from DB during generation
 * 2. Pre-render blog ad HTML directly into slot divs
 * 3. Embed popup overlay HTML with a working inline rotation script
 *
 * Run BEFORE npm run build-blog
 * Usage: node tools/buildtime-blog-ads.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(s) {
  return esc(s);
}

// Helper to render a blog ad card
function renderAdCard(ad) {
  if (!ad) return '';
  return `<div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas ${esc(ad.icon || 'fa-cube')}"></i></div><div class="blog-ad-text"><h3>${esc(ad.title)}</h3><p>${esc(ad.description || '')}</p><a href="${esc(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="blog-ad-cta">${esc(ad.cta_text || 'Learn More')} <i class="fas fa-arrow-right"></i></a></div></div></div></div>`;
}

// Helper to render popup ads overlay with rotation script
function renderPopupAds(ads) {
  if (!ads || ads.length < 2) {
    return `<div class="popup-ad-overlay" id="popupAdContainer"></div>`;
  }
  
  const slides = ads.map((ad, i) => {
    const bgColor = escAttr(ad.bg_color || '#0066cc');
    const icon = escAttr(ad.icon || 'fa-bullhorn');
    const imageUrl = ad.image_url ? escAttr(ad.image_url) : '';
    const isAnimated = ad.is_animated;
    return `<div class="popup-ad-inner" style="background:${bgColor}" data-idx="${i}"><div class="popup-ad-bg-pattern"></div><button class="popup-ad-close" onclick="BlogPopup.close(${i})" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="popup-ad-body">${imageUrl ? `<img src="${imageUrl}" alt="" class="popup-ad-image" onerror="this.style.display='none'">` : `<div class="popup-ad-icon-circle"><i class="fas ${icon}"></i></div>`}<div class="popup-ad-content"><div class="popup-ad-badge">${isAnimated ? '⚡ Limited Offer' : '🎯 Promotion'}</div><h3 class="popup-ad-title">${esc(ad.title)}</h3><p class="popup-ad-desc">${esc(ad.description || '')}</p></div><a href="${esc(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="popup-ad-cta" target="_blank" rel="noopener">${esc(ad.cta_text || 'Learn More')} →</a></div><div class="popup-ad-progress" id="bpProgress${i}"></div></div>`;
  }).join('');
  
  const rotationScript = `<script>(function(){var s=document.querySelectorAll('#bpOverlay>.popup-ad-inner');if(!s||s.length<2)return;var c=0,S=6e3,T=null;function f(i){s.forEach(function(e,j){e.style.display=j===i?'flex':'none'});c=i;var b=document.getElementById('bpProgress'+i);if(b){b.style.transition='none';b.style.width='0%';b.offsetHeight;b.style.transition='width '+S+'ms linear';b.style.width='100%'}clearTimeout(T);T=setTimeout(function(){f((i+1)%s.length)},S)}window.BlogPopup={close:function(i){var o=document.getElementById('bpOverlay');if(o){o.classList.remove('popup-ad-active');o.classList.add('popup-ad-exit');clearTimeout(T);setTimeout(function(){o.classList.remove('popup-ad-exit')},400)}}};setTimeout(function(){var o=document.getElementById("bpOverlay");if(o)o.classList.add("popup-ad-active");f(0)},2500)})();<\/script>`;
  
  return `<div class="popup-ad-overlay" id="bpOverlay">${slides}</div>${rotationScript}`;
}

// ─── Modify generate-blog-posts.mjs ───
function modifyPostsGenerator(blogAds, popupAds) {
  let content = readFileSync('tools/generate-blog-posts.mjs', 'utf-8');
  
  // Build the ad data as a JS object literal
  const blogAd1 = blogAds.find(a => a.ad_type === 'ad1') || null;
  const blogAd2 = blogAds.find(a => a.ad_type === 'ad2') || null;
  const blogAd3 = blogAds.find(a => a.ad_type === 'ad3') || null;
  
  // Helper to render blog ad into placeholder
  function renderBlogAdContent(ad) {
    if (!ad) return ''; // Leave empty if no ad configured
    return renderAdCard(ad);
  }
  
  // We need to:
  // 1. Add ad queries in the main() function
  // 2. Replace the empty ad-slot divs with pre-rendered content
  // 3. Replace the popup section with pre-rendered popup
  
  // First, add ad fetching to main()
  const mainFunctionStart = content.indexOf('async function main()');
  if (mainFunctionStart === -1) { console.log('main() not found in posts gen'); return; }
  
  // Add query for ads after the blog posts query
  const postsQueryEnd = content.indexOf("'SELECT id, title, slug, excerpt, content, category, author, reading_time, featured, tags, cover_image, meta_title, meta_description, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at ASC'");
  if (postsQueryEnd === -1) { console.log('Posts query not found'); return; }
  
  // Find the line after the const posts = result.rows and console.log
  const afterPostsLog = content.indexOf('console.log(`Found ${posts.length} posts to generate.', postsQueryEnd);
  if (afterPostsLog === -1) { console.log('Posts log not found'); return; }
  
  // Find the next line after the log
  const afterLogEnd = content.indexOf('\n', afterPostsLog);
  const afterLogLine = content.indexOf('\n', afterLogEnd + 1);
  
  // Insert ad fetching code
  const adFetchCode = `\n\n  // Fetch active blog ads and popup ads for pre-rendering\n  let blogAds = [], popupAds = [];\n  try {\n    const adRows = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');\n    blogAds = adRows.rows;\n    const popupRows = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');\n    popupAds = popupRows.rows;\n    if (blogAds.length > 0) console.log('  📢 Blog ads:', blogAds.length);\n    if (popupAds.length > 0) console.log('  🪟 Popup ads:', popupAds.length);\n  } catch(e) {\n    console.warn('  ⚠️ Failed to fetch ads:', e.message);\n  }`;
  
  content = content.substring(0, afterLogLine + 1) + adFetchCode + content.substring(afterLogLine + 1);
  
  // Now replace the ad-slot-1, ad-slot-2, ad-slot-3 in article and sidebar
  // Replace article ad slots
  const articleSlots = [
    { id: 'ad-slot-1-article', ad: blogAd1 },
    { id: 'ad-slot-2-article', ad: blogAd2 },
    { id: 'ad-slot-3-article', ad: blogAd3 }
  ];
  
  for (const slot of articleSlots) {
    const searchStr = `<div id="${slot.id}"`;
    const idx = content.indexOf(searchStr);
    if (idx === -1) { console.log('  ⚠️ Slot not found:', slot.id); continue; }
    const lineEnd = content.indexOf('>', idx + searchStr.length);
    const lineEnd2 = content.indexOf('\n', lineEnd);
    const oldLine = content.substring(idx, lineEnd2);
    const adContent = renderBlogAdContent(slot.ad);
    if (adContent) {
      const newLine = `<div id="${slot.id}">${adContent}`;
      content = content.substring(0, idx) + newLine + content.substring(lineEnd2);
      console.log('  ✅ Populated:', slot.id);
    }
  }
  
  // Replace sidebar ad slots
  const sideSlots = [
    { id: 'ad-slot-1', ad: blogAd1 },
    { id: 'ad-slot-2', ad: blogAd2 },
    { id: 'ad-slot-3', ad: blogAd3 }
  ];
  
  for (const slot of sideSlots) {
    const searchStr = `<div id="${slot.id}"`;
    const idx = content.indexOf(searchStr);
    if (idx === -1) { console.log('  ⚠️ Sidebar slot not found:', slot.id); continue; }
    const lineEnd = content.indexOf('>', idx + searchStr.length);
    const lineEnd2 = content.indexOf('\n', lineEnd);
    const oldLine = content.substring(idx, lineEnd2);
    const adContent = renderBlogAdContent(slot.ad);
    if (adContent) {
      const newLine = `<div id="${slot.id}">${adContent}`;
      content = content.substring(0, idx) + newLine + content.substring(lineEnd2);
      console.log('  ✅ Populated sidebar:', slot.id);
    }
  }
  
  // Replace the static popup overlay with the pre-rendered one
  const oldPopup = `<div class="popup-ad-overlay" id="popupAdContainer"></div>`;
  const popupIdx = content.indexOf(oldPopup);
  if (popupIdx >= 0) {
    const newPopup = renderPopupAds(popupAds);
    content = content.substring(0, popupIdx) + newPopup + content.substring(popupIdx + oldPopup.length);
    console.log('  ✅ Popup ads pre-rendered');
  }
  
  // Also add ad data to generatePostHtml call - pass blogAds and popupAds
  // Find the generatePostHtml call
  const genCallStart = content.indexOf('const html = generatePostHtml(post, posts);');
  if (genCallStart >= 0) {
    content = content.substring(0, genCallStart) + 'const html = generatePostHtml(post, posts, blogAds, popupAds);' + content.substring(genCallStart + 'const html = generatePostHtml(post, posts);'.length);
  }
  
  // Update generatePostHtml function signature
  const funcSig = 'function generatePostHtml(post, recentPosts)';
  const sigIdx = content.indexOf(funcSig);
  if (sigIdx >= 0) {
    content = content.substring(0, sigIdx) + 'function generatePostHtml(post, recentPosts, blogAds, popupAds)' + content.substring(sigIdx + funcSig.length);
  }
  
  // Add blogAds and popupAds to the template - need to pass them through
  // Since we already replaced the slot content directly, and the popup overlay,
  // the template doesn't need to change further. The slot replacements above
  // modified the template strings themselves.
  
  writeFileSync('tools/generate-blog-posts.mjs', content, 'utf-8');
  console.log('✅ generate-blog-posts.mjs updated');
}

// ─── Modify generate-blog-index.mjs ───
function modifyIndexGenerator(blogAds, popupAds) {
  let content = readFileSync('tools/generate-blog-index.mjs', 'utf-8');
  
  const blogAd1 = blogAds.find(a => a.ad_type === 'ad1') || null;
  const blogAd2 = blogAds.find(a => a.ad_type === 'ad2') || null;
  const blogAd3 = blogAds.find(a => a.ad_type === 'ad3') || null;
  
  function renderBlogAdContent(ad) {
    if (!ad) return '';
    return renderAdCard(ad);
  }
  
  // Add ad fetching to main()
  const fetchCall = content.indexOf("'SELECT id, title, slug, excerpt, category, author, reading_time, featured, tags, cover_image, meta_title, meta_description, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'");
  if (fetchCall === -1) { console.log('Posts query not found in index gen'); return; }
  
  const afterRows = content.indexOf('const rows = result.rows;', fetchCall);
  if (afterRows === -1) { console.log('result.rows not found'); return; }
  
  const afterRowsLog = content.indexOf('console.log(`Found ${rows.length} published posts.', afterRows);
  if (afterRowsLog === -1) { console.log('Log line not found'); return; }
  
  const afterLogLineEnd = content.indexOf('\n', afterRowsLog);
  const insertPos = content.indexOf('\n', afterLogLineEnd + 1);
  
  const adFetchCode = `\n\n  // Fetch active ads for pre-rendering\n  let blogAds = [], popupAds = [];\n  try {\n    const adRes = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');\n    blogAds = adRes.rows;\n    const popRes = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');\n    popupAds = popRes.rows;\n    if (blogAds.length > 0) console.log('  📢 Ads:', blogAds.length);\n    if (popupAds.length > 0) console.log('  🪟 Popups:', popupAds.length);\n  } catch(e) { console.warn('  ⚠️ Ads fetch:', e.message); }\n  `;
  
  content = content.substring(0, insertPos + 1) + adFetchCode + content.substring(insertPos + 1);
  
  // Replace sidebar ad slots
  const sideSlots = [
    { id: 'ad-slot-1', ad: blogAd1 },
    { id: 'ad-slot-2', ad: blogAd2 },
    { id: 'ad-slot-3', ad: blogAd3 }
  ];
  
  for (const slot of sideSlots) {
    const searchStr = `<div id="${slot.id}"`;
    const idx = content.indexOf(searchStr);
    if (idx === -1) { console.log('  ⚠️ Slot not found:', slot.id); continue; }
    const lineEnd = content.indexOf('>', idx + searchStr.length);
    const lineEnd2 = content.indexOf('\n', lineEnd);
    const adContent = renderBlogAdContent(slot.ad);
    if (adContent) {
      const newLine = `<div id="${slot.id}">${adContent}`;
      content = content.substring(0, idx) + newLine + content.substring(lineEnd2);
      console.log('  ✅ Populated sidebar:', slot.id);
    }
  }
  
  // Replace the popup overlay
  const oldPopup = `<div class="popup-ad-overlay" id="popupAdContainer"></div>`;
  const popupIdx = content.indexOf(oldPopup);
  if (popupIdx >= 0) {
    const newPopup = renderPopupAds(popupAds);
    content = content.substring(0, popupIdx) + newPopup + content.substring(popupIdx + oldPopup.length);
    console.log('  ✅ Popup ads pre-rendered');
  }
  
  // Pass blogAds/popupAds to buildHtml
  const buildHtmlCall = content.indexOf('const html = buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags);');
  if (buildHtmlCall >= 0) {
    content = content.substring(0, buildHtmlCall) + 'const html = buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags, blogAds, popupAds);' + content.substring(buildHtmlCall + 'const html = buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags);'.length);
  }
  
  // Update buildHtml function signature
  const oldSig = 'function buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags)';
  const sigIdx = content.indexOf(oldSig);
  if (sigIdx >= 0) {
    content = content.substring(0, sigIdx) + 'function buildHtml(BLOG_DATA, featured, sortedAll, recentPosts, categories, tags, blogAds, popupAds)' + content.substring(sigIdx + oldSig.length);
  }
  
  writeFileSync('tools/generate-blog-index.mjs', content, 'utf-8');
  console.log('✅ generate-blog-index.mjs updated');
}

// ─── Main ───
async function main() {
  // Import and setup DB
  const { createClient } = await import('@libsql/client');
  const client = createClient({
    url: 'libsql://ecommercelog-spurno.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ'
  });
  
  console.log('Fetching ads from database...');
  let blogAds = [], popupAds = [];
  
  try {
    const adRes = await client.execute('SELECT * FROM blog_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    blogAds = adRes.rows;
    const popRes = await client.execute('SELECT * FROM popup_ads WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    popupAds = popRes.rows;
    console.log(`Found ${blogAds.length} blog ads, ${popupAds.length} popup ads`);
  } catch(e) {
    console.warn('Failed to fetch ads:', e.message);
  }
  
  console.log('\nModifying generators...');
  modifyPostsGenerator(blogAds, popupAds);
  modifyIndexGenerator(blogAds, popupAds);
  
  console.log('\n✅ All done! Run: rm -f blog/*.html && npm run build-blog');
}

main().catch(e => { console.error(e); process.exit(1); });
