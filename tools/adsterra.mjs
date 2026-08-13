// ============================================
// adsterra.mjs — Adsterra ad snippet library + slot builders
// Source of truth: adsterra.txt (7 ad types)
// Baked directly into static HTML at build time.
// ============================================

// Index 0 = adsterra.txt item 1 ... index 6 = item 7
export const AD_TYPES = [
  // 1. Direct banner script
  `<script src="https://pl30824883.effectivecpmnetwork.com/ce/51/fa/ce51fafe970d3b5020801387d7d50e3c.js"></script>`,

  // 2. Container-based async banner (needs its container div)
  `<script async="async" data-cfasync="false" src="https://pl30824884.effectivecpmnetwork.com/1f79e3796c66caa451743cca1fb4483a/invoke.js"></script>
<div id="container-1f79e3796c66caa451743cca1fb4483a"></div>`,

  // 3. Direct banner script
  `<script src="https://pl30824885.effectivecpmnetwork.com/74/58/c1/7458c1d41a7102d77f7a5dcb8d00c669.js"></script>`,

  // 4. atOptions — 728x90 leaderboard
  `<script>
  atOptions = {
    'key' : 'a6f8ddce3edbab201fd6bb037843d30c',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/a6f8ddce3edbab201fd6bb037843d30c/invoke.js"></script>`,

  // 5. atOptions — 160x300 vertical
  `<script>
  atOptions = {
    'key' : 'd3cb29b60b0023417c12f909ea4a6ba6',
    'format' : 'iframe',
    'height' : 300,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/d3cb29b60b0023417c12f909ea4a6ba6/invoke.js"></script>`,

  // 6. atOptions — 300x250 medium rectangle
  `<script>
  atOptions = {
    'key' : 'c56d627d03635d29065a5692fd96d73d',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/c56d627d03635d29065a5692fd96d73d/invoke.js"></script>`,

  // 7. atOptions — 468x60 banner
  `<script>
  atOptions = {
    'key' : '62eff44ce37f09b13655d3931caf610d',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/62eff44ce37f09b13655d3931caf610d/invoke.js"></script>`
];

export const AD_STYLE = `<!-- Adsterra Style -->
<style>
.adsterra-slot{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:32px 0;min-height:60px;overflow:hidden}
.adsterra-slot .adsterra-label{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:8px;text-align:center}
.adsterra-slot iframe,.adsterra-slot img,.adsterra-slot ins,.adsterra-slot div{max-width:100%}
.adsterra-sidebar{margin:0 auto}
.pl-card-ad{display:flex;flex-direction:column;align-items:center;justify-content:center;grid-column:1/-1;margin:2px 0 10px;min-height:60px;overflow:hidden}
.pl-card-ad .adsterra-label{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(0,0,0,.3);margin-bottom:8px;text-align:center}
@media(max-width:620px){.pl-card-ad iframe{max-width:100%}}
@media(prefers-color-scheme:dark){.adsterra-slot .adsterra-label,.pl-card-ad .adsterra-label{color:rgba(255,255,255,.38)}}
</style>`;

/**
 * Wrap a raw Adsterra snippet in a styled slot.
 * @param {string} snippet raw snippet HTML from AD_TYPES
 * @param {string} extraClass optional extra class e.g. "adsterra-sidebar"
 * @param {string} label label shown above the ad
 */
export function adsterraSlot(snippet, extraClass = '', label = 'Advertisement') {
  const cls = extraClass ? `adsterra-slot ${extraClass}` : 'adsterra-slot';
  return `<!-- Adsterra Ad -->
<div class="${cls}">
  <span class="adsterra-label">${label}</span>
  ${snippet}
</div>`;
}

// Fixed size mapping per slot position.
const TOP_AD = 3;        // 728x90 leaderboard
const MID1_AD = 5;       // 300x250 medium rectangle
const BOTTOM_AD = 6;     // 468x60 banner
const SIDEBAR_AD = 4;    // 160x300 vertical
// Mid-2 (second in-article slot) rotates between the three plain banner
// scripts so every one of the 7 ad types is used across the site.
const MID2_POOL = [0, 1, 2];

export function postAdHtml(fileIndex, slot) {
  switch (slot) {
    case 'top':    return adsterraSlot(AD_TYPES[TOP_AD]);
    case 'mid1':   return adsterraSlot(AD_TYPES[MID1_AD]);
    case 'mid2':   return adsterraSlot(AD_TYPES[MID2_POOL[fileIndex % MID2_POOL.length]]);
    case 'bottom': return adsterraSlot(AD_TYPES[BOTTOM_AD]);
    case 'sidebar': return adsterraSlot(AD_TYPES[SIDEBAR_AD], 'adsterra-sidebar');
    default: throw new Error('Unknown slot: ' + slot);
  }
}

export const INDEX_LEADERBOARD = adsterraSlot(AD_TYPES[TOP_AD]);
export const INDEX_SIDEBAR_1 = adsterraSlot(AD_TYPES[SIDEBAR_AD], 'adsterra-sidebar');
export const INDEX_SIDEBAR_2 = adsterraSlot(AD_TYPES[MID1_AD], 'adsterra-sidebar');

// In-grid ad rows. Uses the three plain banner scripts only, because the
// atOptions pattern relies on a page-global (multiple would overwrite each
// other) and the leaderboard/sidebar already claim every atOptions key.
const GRID_AD_POOL = [0, 1, 2];

/**
 * Build a full-width ad card that weaves between the article cards in the
 * index grid. `.pl-card-ad` spans all grid columns via grid-column:1/-1.
 * @param {number} fileIndex rotates which banner script is used
 */
export function indexGridAd(fileIndex) {
  return adsterraSlot(AD_TYPES[GRID_AD_POOL[fileIndex % GRID_AD_POOL.length]], 'pl-card-ad');
}