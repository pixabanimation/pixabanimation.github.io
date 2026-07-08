import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'blog') + '/';
const EXCLUDE = ['index.html', 'blog.css'];
const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && !EXCLUDE.includes(f));

const NAV_HTML = `
  <!-- Navigation -->
  <nav class="blog-navbar" id="blogNavbar">
    <div class="blog-nav-container">
      <a href="https://pixabanimation.github.io/" class="blog-nav-brand">
        <img src="https://pixabanimation.github.io/assets/pixabanimation-logo.png" alt="PixabAnimation">
        PixabAnimation
      </a>
      <button class="blog-nav-toggle" onclick="document.getElementById('blogNavLinks').classList.toggle('open')" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="blog-nav-links" id="blogNavLinks">
        <li><a href="https://pixabanimation.github.io/">Home</a></li>
        <li><a href="https://pixabanimation.github.io/#/shop">Shop</a></li>
        <li><a href="https://pixabanimation.github.io/#/shop?category=videos">Videos</a></li>
        <li><a href="https://pixabanimation.github.io/#/about">About</a></li>
        <li><a href="https://pixabanimation.github.io/#/contact">Contact</a></li>
        <li><a href="index.html">Blog</a></li>
      </ul>
      <div class="blog-nav-actions">
        <a href="https://pixabanimation.github.io/#/shop"><i class="fas fa-store"></i></a>
        <a href="https://pixabanimation.github.io/#/cart"><i class="fas fa-shopping-bag"></i></a>
      </div>
    </div>
  </nav>`;

const AD1 = `<!-- Ad Banner 1 -->\n      <div class="blog-ad-container">\n        <div class="blog-ad-inner">\n          <span class="blog-ad-label">Advertisement</span>\n          <div class="blog-ad-content">\n            <div class="blog-ad-icon">✦</div>\n            <div class="blog-ad-text">\n              <h3>Premium Motion Graphics Assets</h3>\n              <p>Browse 500+ professional 4K motion backgrounds, animated templates, and stock footage.</p>\n              <a href="https://pixabanimation.github.io/#/shop" class="blog-ad-cta">Shop Now →</a>\n            </div>\n          </div>\n        </div>\n      </div>`;

const AD2 = `<!-- Ad Banner 2 -->\n      <div class="blog-ad-container">\n        <div class="blog-ad-inner">\n          <span class="blog-ad-label">Advertisement</span>\n          <div class="blog-ad-content">\n            <div class="blog-ad-icon"><i class="fas fa-video"></i></div>\n            <div class="blog-ad-text">\n              <h3>4K Video Clips & Templates</h3>\n              <p>Royalty-free motion graphics, lower thirds, and title animations for your next project.</p>\n              <a href="https://pixabanimation.github.io/#/shop?category=videos" class="blog-ad-cta">Explore →</a>\n            </div>\n          </div>\n        </div>\n      </div>`;

const AD3 = `<!-- Ad Banner 3 -->\n      <div class="blog-ad-container">\n        <div class="blog-ad-inner">\n          <span class="blog-ad-label">Advertisement</span>\n          <div class="blog-ad-content">\n            <div class="blog-ad-icon"><i class="fas fa-pen-fancy"></i></div>\n            <div class="blog-ad-text">\n              <h3>After Effects Templates</h3>\n              <p>Professional logo reveals, typography animations, and infographic templates.</p>\n              <a href="https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins" class="blog-ad-cta">View Collection →</a>\n            </div>\n          </div>\n        </div>\n      </div>`;

const FOOTER_HTML = `
  <!-- Footer -->
  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <div class="name"><img src="https://pixabanimation.github.io/assets/pixabanimation-logo.png" alt="" style="width:24px;height:20px"> PixabAnimation</div>
          <div class="desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</div>
          <div class="blog-footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="blog-footer-col">
          <h4>Shop</h4>
          <a href="https://pixabanimation.github.io/#/shop">All Assets</a>
          <a href="https://pixabanimation.github.io/#/shop?category=videos">Animation & Video</a>
          <a href="https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins">After Effects Plugins</a>
        </div>
        <div class="blog-footer-col">
          <h4>Categories</h4>
          <a href="https://pixabanimation.github.io/#/shop?category=videos">Motion Graphics</a>
          <a href="https://pixabanimation.github.io/#/shop?category=green-screen-mockup">Green Screen</a>
          <a href="https://pixabanimation.github.io/#/shop">View All</a>
        </div>
        <div class="blog-footer-col">
          <h4>Support</h4>
          <a href="https://pixabanimation.github.io/#/contact">Contact Us</a>
          <a href="https://pixabanimation.github.io/#/about">About Us</a>
          <a href="index.html">Blog</a>
          <a href="https://pixabanimation.github.io/#/privacy-policy">Privacy</a>
        </div>
        <div class="blog-footer-col blog-footer-col-newsletter">
          <h4>Stay in the Loop</h4>
          <p class="blog-footer-newsletter-text">Get early access to new releases, exclusive discounts, and creative inspiration.</p>
          <form class="blog-footer-newsletter-form" action="https://pixabanimation.github.io/" method="get">
            <input type="email" placeholder="Enter your email" required>
            <button type="submit" aria-label="Subscribe"><i class="fas fa-arrow-right"></i></button>
          </form>
          <p class="blog-footer-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
      <div class="blog-footer-bottom">
        <div class="blog-footer-bottom-links">
          <a href="https://pixabanimation.github.io/#/privacy-policy">Privacy</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="https://pixabanimation.github.io/#/refund-policy">Refunds</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="https://pixabanimation.github.io/#/terms-of-use">Terms</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="https://pixabanimation.github.io/#/contact">Support</a>
        </div>
        <p class="blog-footer-bottom-copy">&copy; 2026 PixabAnimation. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <i class="fab fa-cc-visa"></i>
          <i class="fab fa-cc-mastercard"></i>
          <i class="fab fa-cc-amex"></i>
          <i class="fab fa-cc-paypal"></i>
        </div>
      </div>
    </div>
  </footer>
  <script>
    window.addEventListener('scroll', () => {
      document.getElementById('blogNavbar').classList.toggle('scrolled', window.scrollY > 50);
    });
  </script>`;

let count = 0;
for (const file of files) {
  const path = join(BLOG_DIR, file);
  let html = readFileSync(path, 'utf-8');

  // Skip if already has blog.css (already processed)
  if (html.includes('blog.css')) {
    console.log(`Skipping ${file} (already processed)`);
    continue;
  }

  // 1. Replace inline <style> block with blog.css link
  html = html.replace(/<style>[\s\S]*?<\/style>/, `<link rel="stylesheet" href="blog.css">\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">`);

  // 2. Add navbar after <body>
  html = html.replace('<body>', '<body>' + NAV_HTML);

  // 3. Add 3 ad banners in the content
  // Insert Ad 1 after first <h2> (replacing first </p>\n\n      <h2 with ad + h2)
  html = html.replace(/(<p>[\s\S]*?<\/p>\n\n\s*<h2>)/, '$1\n\n      ' + AD1 + '\n\n      <h2>');

  // Insert Ad 2 before second-to-last <h2> (approximate middle)
  const h2Matches = html.match(/<h2>/g);
  if (h2Matches && h2Matches.length > 2) {
    const midH2 = Math.floor(h2Matches.length / 2);
    let count2 = 0;
    html = html.replace(/<h2>/g, (match) => {
      count2++;
      if (count2 === midH2) {
        return AD2 + '\n\n      <h2>';
      }
      return match;
    });
  }

  // Insert Ad 3 before tags-section
  html = html.replace('class="tags-section"', AD3 + '\n\n    <div class="tags-section"');

  // 4. Add footer before </body>
  html = html.replace('</body>', FOOTER_HTML + '\n</body>');

  writeFileSync(path, html, 'utf-8');
  count++;
  console.log(`Updated ${file}`);
}

console.log(`\n✅ Updated ${count} blog articles with nav, footer, and ad banners`);
