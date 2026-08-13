// ============================================
// apply-adsterra.mjs
// Removes the legacy blog ad system and bakes Adsterra ads into static HTML.
//
// - blog/*.html      → 5 Adsterra slots (top, mid1, mid2, bottom, sidebar)
// - blog/index.html  → leaderboard + 2 sidebar Adsterra slots
// - Strips: ad-slot-{1|2|3}[-article], popupAdContainer, blog-ads/popup-ads/blog-bundle scripts
//
// Usage: node tools/apply-adsterra.mjs
// ============================================
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postAdHtml, AD_STYLE, INDEX_LEADERBOARD, INDEX_SIDEBAR_1, INDEX_SIDEBAR_2, indexGridAd } from './adsterra.mjs';

const STYLE_MARKER = '<!-- Adsterra Style -->';
const GRID_AD_EVERY = 9;   // a full-row ad card after every N grid cards
const GRID_AD_FIRST = 8;   // first grid ad after this many cards (1-based)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '../blog');

// ---- line removers -------------------------------------------------------

const OLD_AD_SLOT_LINE = /^\s*<div id="ad-slot-[^"]+"[^>]*>[^\n]*\n/gm;
const OLD_COMMENT_LINE = (name) => new RegExp(`^\\s*<!-- ${name} -->[^\\n]*\\n`, 'gm');
const OLD_SCRIPT_LINE = (src) => new RegExp(`^\\s*<script[^>]*src="[^"]*${src}"[^>]*></script>[^\\n]*\\n`, 'gm');

function stripOldAds(html) {
  let out = html;
  out = out.replace(OLD_AD_SLOT_LINE, '');
  out = out.replace(OLD_COMMENT_LINE('Ad Slots'), '');
  out = out.replace(OLD_COMMENT_LINE('Popup Ad Container'), '');
  out = out.replace(OLD_COMMENT_LINE('Blog Ad Scripts'), '');
  out = out.replace(OLD_COMMENT_LINE('Ads'), '');
  out = out.replace(/^\s*<div class="popup-ad-overlay" id="popupAdContainer"><\/div>[^\n]*\n/gm, '');
  out = out.replace(OLD_SCRIPT_LINE('blog-bundle.js'), '');
  out = out.replace(OLD_SCRIPT_LINE('blog-ads.js'), '');
  out = out.replace(OLD_SCRIPT_LINE('popup-ads.js'), '');
  return out;
}

function injectStyle(html) {
  // Idempotent: replace the existing Adsterra style block (marked or detected
  // by content) so changes to AD_STYLE propagate, or insert a new one.
  const marked = /<!-- Adsterra Style -->\s*\n?<style>[\s\S]*?<\/style>\n?/;
  const legacy = /<style>\s*\.adsterra-slot\{[\s\S]*?<\/style>\n?/;
  let out = html;
  if (marked.test(out)) {
    return out.replace(marked, AD_STYLE + '\n');
  }
  if (legacy.test(out)) {
    return out.replace(legacy, AD_STYLE + '\n');
  }
  const headEnd = out.lastIndexOf('</head>');
  if (headEnd === -1) return out;
  return out.slice(0, headEnd) + '\n' + AD_STYLE + '\n' + out.slice(headEnd);
}

// Insert mid-article ads after h2 headings inside .blog-content.
// Positions are re-derived after every edit so offsets never go stale.
function insertMidAds(html, index) {
  let out = html;
  const h2Positions = (src) => {
    const c = src.indexOf('class="blog-content"');
    if (c === -1) return [];
    const t = src.indexOf('<div class="tags-section"', c);
    const end = t === -1 ? src.length : t;
    const positions = [];
    let p = c;
    while ((p = src.indexOf('<h2', p + 1)) !== -1) {
      if (p < end) positions.push(p);
      else break;
    }
    return positions;
  };
  const insertAt = (src, absPos, block) => {
    const lineEnd = src.indexOf('\n', absPos);
    const at = lineEnd === -1 ? src.length : lineEnd + 1;
    return src.slice(0, at) + '\n' + block + '\n' + src.slice(at);
  };

  const first = h2Positions(out);
  if (first.length >= 2) {
    out = insertAt(out, first[1], postAdHtml(index, 'mid1'));
  } else if (first.length === 1) {
    out = insertAt(out, first[0], postAdHtml(index, 'mid1'));
  } else {
    return out; // no h2 → no mid ads
  }

  const second = h2Positions(out);
  if (second.length >= 4) {
    out = insertAt(out, second[3], postAdHtml(index, 'mid2'));
  }
  return out;
}

function convertPost(html, index) {
  // Idempotent: skip files that already contain Adsterra ads
  if (html.includes('<!-- Adsterra Ad -->')) return html;
  let out = stripOldAds(html);

  // Top ad: after mobile TOC, before article content
  const contentTag = '<div class="blog-content">';
  if (out.includes(contentTag)) {
    const top = postAdHtml(index, 'top');
    out = out.replace(contentTag, top + '\n      ' + contentTag);
  }

  // Mid ads: after 2nd and 4th h2 inside blog-content
  out = insertMidAds(out, index);

  // Bottom ad: right before Useful Links (after author bio)
  if (out.includes('<div class="useful-links">')) {
    const bottom = postAdHtml(index, 'bottom');
    out = out.replace('<div class="useful-links">', '\n' + bottom + '\n      <div class="useful-links">');
  }

  // Sidebar ad: inside the Sponsored section
  if (out.includes('<div class="sidebar-title">Sponsored</div>')) {
    const sidebar = postAdHtml(index, 'sidebar');
    out = out.replace(
      '<div class="sidebar-title">Sponsored</div>',
      '<div class="sidebar-title">Sponsored</div>\n' + sidebar
    );
  }

  return injectStyle(out);
}

// ---- index grid helpers ---------------------------------------------------

const GRID_OPEN = '<div class="pl-articles-grid" id="plArticlesGrid">';
const CARD_RE = /<a href="[^"]*" class="pl-card"[\s\S]*?<\/a>/g;
const META_DATE_RE = /<span>([A-Za-z]{3} \d{1,2}, \d{4})<\/span>/;

// Locate the grid container and return the slice boundaries.
// The grid's own close tag is the first </div> after the last card, because
// cards themselves contain nested divs.
function gridBounds(html) {
  const start = html.indexOf(GRID_OPEN);
  if (start === -1) return null;
  const contentStart = start + GRID_OPEN.length;
  const tail = html.slice(contentStart);
  const matches = [...tail.matchAll(CARD_RE)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  const afterLastCard = contentStart + last.index + last[0].length;
  const end = html.indexOf('</div>', afterLastCard);
  if (end === -1) return null;
  return { start, contentStart, end };
}

// Extract the card blocks that live inside the grid.
function gridCards(html) {
  const b = gridBounds(html);
  if (!b) return [];
  const inner = html.slice(b.contentStart, b.end);
  return [...inner.matchAll(CARD_RE)].map((m) => ({ html: m[0], date: cardDate(m[0]) }));
}

function cardDate(cardHtml) {
  const m = cardHtml.match(META_DATE_RE);
  return m ? Date.parse(m[1]) : 0;
}

const CARD_SEP = '\n          ';

// Sort the grid's cards newest-first so the ad rows land at fixed offsets.
function reorderGridCards(html) {
  const b = gridBounds(html);
  if (!b) return html;
  const cards = gridCards(html);
  if (cards.length === 0) return html;
  cards.sort((a, z) => z.date - a.date);
  const rebuilt = '\n' + cards.map((c) => CARD_SEP + c.html.trim()).join('') + '\n        ';
  return html.slice(0, b.contentStart) + rebuilt + html.slice(b.end);
}

// Weave full-row ad cards into the grid after every Nth article card.
function injectGridAds(html, fileIndex) {
  const b = gridBounds(html);
  if (!b) return html;
  const cards = gridCards(html);
  if (cards.length === 0) return html;

  const rebuilt = [];
  cards.forEach((card, i) => {
    const pos = i + 1; // 1-based
    rebuilt.push(CARD_SEP + card.html.trim());
    if (pos >= GRID_AD_FIRST && (pos - GRID_AD_FIRST) % GRID_AD_EVERY === 0) {
      rebuilt.push(CARD_SEP + indexGridAd(fileIndex + Math.floor((pos - GRID_AD_FIRST) / GRID_AD_EVERY)).replace(/\n/g, '\n          '));
    }
  });

  return html.slice(0, b.contentStart) + '\n' + rebuilt.join('') + '\n        ' + html.slice(b.end);
}

function convertIndex(html, fileIndex = 0) {
  let out = stripOldAds(html);

  // Leaderboard above the articles grid (idempotent via marker check)
  if (!out.includes(INDEX_LEADERBOARD) && out.includes(GRID_OPEN)) {
    out = out.replace(GRID_OPEN, INDEX_LEADERBOARD + '\n        ' + GRID_OPEN);
  }

  // Sidebar ads inside the "Ad" widget (idempotent)
  if (!out.includes(INDEX_SIDEBAR_1) && out.includes('<div class="pl-sb-widget-title">Ad</div>')) {
    out = out.replace(
      '<div class="pl-sb-widget-title">Ad</div>',
      '<div class="pl-sb-widget-title">Ad</div>\n' + INDEX_SIDEBAR_1 + '\n' + INDEX_SIDEBAR_2
    );
  }

  // In-grid ads: sort newest-first then weave in ad cards (idempotent)
  if (!out.includes('pl-card-ad')) {
    out = reorderGridCards(out);
    out = injectGridAds(out, fileIndex);
  }

  return injectStyle(out);
}

async function main() {
  const files = (await fs.readdir(BLOG_DIR)).filter((f) => f.endsWith('.html')).sort();
  const posts = files.filter((f) => f !== 'index.html');

  console.log(`Found ${files.length} html files (${posts.length} posts).`);

  let changed = 0;
  for (const [i, file] of posts.entries()) {
    const p = path.join(BLOG_DIR, file);
    const orig = await fs.readFile(p, 'utf8');
    const out = convertPost(orig, i);
    if (out !== orig) {
      await fs.writeFile(p, out, 'utf8');
      changed++;
    }
  }

  const idxPath = path.join(BLOG_DIR, 'index.html');
  const idxOrig = await fs.readFile(idxPath, 'utf8');
  const idxOut = convertIndex(idxOrig, posts.length);
  if (idxOut !== idxOrig) {
    await fs.writeFile(idxPath, idxOut, 'utf8');
    console.log('Updated blog/index.html');
  }

  // sanity: no leftovers
  let leftovers = 0;
  for (const file of files) {
    const p = path.join(BLOG_DIR, file);
    const html = await fs.readFile(p, 'utf8');
    if (/ad-slot-|popupAdContainer|blog-ads\.js|popup-ads\.js|blog-bundle\.js/.test(html)) {
      console.log(`  LEFTOVER in ${file}`);
      leftovers++;
    }
  }

  console.log(`Converted ${changed} posts. Leftovers: ${leftovers}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});