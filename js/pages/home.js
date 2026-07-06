// ============================================
// PixabAnimation — Home Page
// Professional Gorgeous Design
// ============================================

const HomePage = {
  async render(params) {
    // Enable full-page scroll snap for the homepage
    document.documentElement.classList.add('snap-scroll');
    const content = document.getElementById('pageContent');
    
    content.innerHTML = `
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="skeleton" style="width:160px;height:34px;border-radius:20px;margin-bottom:24px"></div>
            <div class="skeleton" style="width:90%;height:72px;margin-bottom:16px;border-radius:8px"></div>
            <div class="skeleton" style="width:75%;height:24px;margin-bottom:8px;border-radius:6px"></div>
            <div class="skeleton" style="width:60%;height:24px;margin-bottom:32px;border-radius:6px"></div>
            <div class="skeleton" style="width:240px;height:56px;border-radius:12px"></div>
          </div>
          <div class="skeleton" style="width:100%;aspect-ratio:16/10;border-radius:24px"></div>
        </div>
      </section>
    `;

    try {
      const [featuredProducts, categories] = await Promise.all([
        DB.getFeaturedProducts(),
        DB.getCategories()
      ]);

      // Get products for top categories
      const categoryProducts = {};
      const featuredSlugs = ['videos'];
      for (const slug of featuredSlugs) {
        try {
          categoryProducts[slug] = await DB.getProductsByCategory(slug, 8);
        } catch(e) {
          categoryProducts[slug] = [];
        }
      }

      const videoProducts = categoryProducts['videos'] || [];
      const allProducts = featuredProducts.length > 0 ? featuredProducts : videoProducts.slice(0, 8);

      content.innerHTML = `
        <!-- ============================================ -->
        <!-- HERO — Apple-Inspired Product Tile            -->
        <!-- ============================================ -->
        <!-- ============================================ -->
        <!-- HERO — Apple.com-Inspired White/Light         -->
        <!-- ============================================ -->
        <section style="padding:120px 24px 80px;position:relative;overflow:hidden;display:flex;align-items:center;background:#fff;min-height:auto">
          <div class="hero-content" style="width:100%;max-width:1100px">
            <div class="hero-text" style="animation:fadeInUp 0.8s ease-out">
              <h1 style="font-family:var(--font-display);font-size:clamp(2.4rem,4.5vw,3.8rem);font-weight:700;line-height:1.05;letter-spacing:-0.005em;margin-bottom:8px;color:#1d1d1f">
                Premium Motion<br>
                <span style="color:var(--ds-primary)">Graphics &amp; Animation</span>
              </h1>
              
              <p style="font-family:var(--font-primary);font-size:clamp(1rem,1.2vw,1.15rem);font-weight:400;line-height:1.6;letter-spacing:-0.022em;color:rgba(0,0,0,0.56);margin-bottom:36px;max-width:500px">
                Cinema-grade <strong style="color:#1d1d1f">4K motion graphics</strong>, animation assets, and professional editing templates for creators, editors, and motion designers worldwide.
              </p>
              
              <div style="display:flex;gap:12px;flex-wrap:wrap">
                <a href="#/shop" class="ds-pill-cta" style="padding:12px 24px;font-size:16px;gap:8px">
                  Browse Assets
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a href="#/shop?category=videos" class="ds-pill-cta-secondary" style="padding:12px 24px;font-size:16px;border-color:rgba(0,0,0,0.2);color:rgba(0,0,0,0.64)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Demo
                </a>
              </div>

              <div style="display:flex;gap:40px;margin-top:44px;padding-top:28px;border-top:1px solid rgba(0,0,0,0.06)">
                <div>
                  <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:#1d1d1f;letter-spacing:-0.02em">500+</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(0,0,0,0.4)">Premium Assets</div>
                </div>
                <div>
                  <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:#1d1d1f;letter-spacing:-0.02em">10K+</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(0,0,0,0.4)">Happy Creators</div>
                </div>
                <div>
                  <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:#1d1d1f;letter-spacing:-0.02em">4K</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(0,0,0,0.4)">Ultra HD Quality</div>
                </div>
              </div>
            </div>

            <div class="hero-image" style="position:relative;animation:fadeInUp 0.8s ease-out 0.2s both">
              ${VideoPlayer.render({
                src: 'assets/videos/red-motion-animated-background.mp4',
                poster: 'assets/images/motion-red.jpg',
                width: '100%',
                height: 'auto',
                controls: true,
                autoplay: false,
                loop: false,
                className: 'hero-video'
              })}

              <!-- Floating badge 1 -->
              <div style="position:absolute;top:-10px;right:-10px;padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,0.06);border-radius:12px;animation:float 7s ease-in-out infinite;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
                <span style="font-size:1.1rem">🎬</span>
                <div>
                  <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:#1d1d1f">4K Ultra HD</div>
                  <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.35)">Cinematic Quality</div>
                </div>
              </div>

              <!-- Floating badge 2 -->
              <div style="position:absolute;bottom:-10px;left:-10px;padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,0.06);border-radius:12px;animation:float 7s ease-in-out infinite 3.5s;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
                <span style="font-size:1.1rem">⚡</span>
                <div>
                  <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:#1d1d1f">Instant Download</div>
                  <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.35)">After Purchase</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- TRUST BAR — Apple.com Clean Stats Row        -->
        <!-- ============================================ -->
        <div style="max-width:1100px;margin:-24px auto 0;padding:0 24px;position:relative;z-index:3">
          <div class="mobile-trust-bar" style="display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:0;box-shadow:0 2px 12px rgba(0,0,0,0.04)">
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(0,0,0,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(0,0,0,0.64);margin-bottom:2px">
                <i class="fas fa-cloud-download-alt" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>Instant Download
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.3)">Access immediately</div>
            </div>
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(0,0,0,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(0,0,0,0.64);margin-bottom:2px">
                <i class="fas fa-crown" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>Premium Quality
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.3)">Hand-curated assets</div>
            </div>
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(0,0,0,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(0,0,0,0.64);margin-bottom:2px">
                <i class="fas fa-undo-alt" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>14-Day Guarantee
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.3)">Satisfaction assured</div>
            </div>
            <div style="text-align:center;padding:22px 12px">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(0,0,0,0.64);margin-bottom:2px">
                <i class="fas fa-headset" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>24/7 Support
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(0,0,0,0.3)">We're here to help</div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- FEATURED — Apple.com Product Showcase        -->
        <!-- ============================================ -->
        <section style="padding:100px 24px;max-width:1100px;margin:0 auto;background:#fff">
          <div style="text-align:center;margin-bottom:48px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;margin-bottom:12px;color:#1d1d1f">
              Top Animation Assets
            </h2>
            <p style="font-family:var(--font-primary);font-size:clamp(0.95rem,1vw,1.05rem);font-weight:400;line-height:1.5;letter-spacing:-0.022em;color:rgba(0,0,0,0.5);max-width:520px;margin:0 auto">
              Handpicked premium motion graphics and creative templates for editors and motion designers.
            </p>
          </div>
          <div class="product-grid">
            ${allProducts.slice(0, 8).map((p, i) => Components.productCard(p, i)).join('')}
          </div>
          <div style="text-align:center;margin-top:44px">
            <a href="#/shop" class="ds-pill-cta" style="padding:12px 28px;font-size:15px">
              View Full Catalog
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- CATEGORIES — Apple.com Section                -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;max-width:1100px;margin:0 auto;background:#f5f5f7">
          <div style="text-align:center;margin-bottom:44px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
              Explore Categories
            </h2>
          </div>
          <div class="categories-grid">
            ${categories.map((c, i) => Components.categoryCard(c, i)).join('')}
          </div>
        </section>

        <!-- ============================================ -->
        <!-- WHY PIXABANIMATION — Apple.com Value Props    -->
        <!-- ============================================ -->
        <section style="padding:100px 24px;background:#fff;border-top:1px solid rgba(0,0,0,0.04);border-bottom:1px solid rgba(0,0,0,0.04)">
          <div style="max-width:1100px;margin:0 auto">
            <div style="text-align:center;margin-bottom:48px">
              <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
                Built for Creators
              </h2>
            </div>
            <div class="home-value-grid">
              <div style="padding:36px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:14px;transition:all 0.2s ease;background:#fafafa"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.2)';this.style.background='#f5f7f9'"
                   onmouseout="this.style.borderColor='rgba(0,0,0,0.06)';this.style.background='#fafafa'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary);background:rgba(0,102,204,0.06);border-radius:10px"><i class="fas fa-film"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#1d1d1f">Cinema-Grade 4K Quality</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.48)">Every asset rendered in true 4K. Compatible with After Effects, Premiere Pro, Final Cut Pro, and DaVinci Resolve.</p>
              </div>
              <div style="padding:36px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:14px;transition:all 0.2s ease;background:#fafafa"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.2)';this.style.background='#f5f7f9'"
                   onmouseout="this.style.borderColor='rgba(0,0,0,0.06)';this.style.background='#fafafa'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary);background:rgba(0,102,204,0.06);border-radius:10px"><i class="fas fa-bolt"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#1d1d1f">Instant Access</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.48)">Download immediately in full resolution. No watermarks, no queues. Start creating the moment you buy.</p>
              </div>
              <div style="padding:36px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:14px;transition:all 0.2s ease;background:#fafafa"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.2)';this.style.background='#f5f7f9'"
                   onmouseout="this.style.borderColor='rgba(0,0,0,0.06)';this.style.background='#fafafa'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary);background:rgba(0,102,204,0.06);border-radius:10px"><i class="fas fa-layer-group"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#1d1d1f">Editor-Friendly</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.48)">Works with Premiere Pro, After Effects, Final Cut Pro, DaVinci Resolve, and more. Professional formats out of the box.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- NEWSLETTER — Apple.com Light CTA              -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;text-align:center;position:relative;overflow:hidden;background:#f5f5f7;border-top:1px solid rgba(0,0,0,0.04)">
          <div style="max-width:520px;margin:0 auto;position:relative;z-index:1">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.6rem,2.5vw,2.2rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f;margin-bottom:10px">
              Join the Community
            </h2>
            <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.013em;color:rgba(0,0,0,0.48);margin-bottom:24px">
              Get early access to new releases, subscriber-only discounts, and creative inspiration.
            </p>
            <div style="display:flex;gap:8px;max-width:420px;margin:0 auto">
              <input type="email" placeholder="Enter your email" id="newsletterEmail" 
                     style="flex:1;padding:12px 18px;border-radius:9999px;border:1px solid rgba(0,0,0,0.12);background:#fff;color:#1d1d1f;font-size:14px;outline:none;font-family:var(--font-primary);transition:border-color 0.2s ease;box-shadow:0 1px 4px rgba(0,0,0,0.04)">
              <button onclick="App.subscribeNewsletter(event)" 
                      style="padding:12px 24px;background:var(--ds-primary);color:white;border-radius:9999px;font-weight:500;font-size:14px;cursor:pointer;border:none;transition:background 0.2s ease, transform 0.2s ease;white-space:nowrap;font-family:var(--font-primary)">
                Subscribe
              </button>
            </div>
            <p style="font-family:var(--font-primary);font-size:11px;color:rgba(0,0,0,0.25);margin-top:12px">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- TESTIMONIALS — Apple.com Style                -->
        <!-- ============================================ -->
        <section style="padding:80px 24px 100px;max-width:1100px;margin:0 auto;background:#fff">
          <div style="text-align:center;margin-bottom:44px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.5vw,2.2rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
              Loved by Creators Worldwide
            </h2>
          </div>
          <div class="home-testimonials-grid">
            <div style="padding:28px 24px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 8px rgba(0,0,0,0.04)">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.56);margin-bottom:16px">
                "The 4K nature reel is absolutely stunning. Best investment I've made for my video projects — the quality speaks for itself."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">SM</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:#1d1d1f">Sarah M.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(0,0,0,0.35)">Video Editor</div>
                </div>
              </div>
            </div>
            <div style="padding:28px 24px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 8px rgba(0,0,0,0.04)">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.56);margin-bottom:16px">
                "PixabAnimation has the best motion graphics templates. My workflow has never been smoother. The drag-and-drop compatibility is a game-changer."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">AK</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:#1d1d1f">Alex K.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(0,0,0,0.35)">Motion Designer</div>
                </div>
              </div>
            </div>
            <div style="padding:28px 24px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 8px rgba(0,0,0,0.04)">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.56);margin-bottom:16px">
                "Instant download, incredible quality, and the lower thirds bundle saved me hours. My go-to marketplace for animation assets."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">PR</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:#1d1d1f">Priya R.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(0,0,0,0.35)">Content Creator</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- ============================================ -->
        <!-- FAQ — Apple.com Disclosure Style              -->
        <!-- ============================================ -->
        <section style="padding:80px 24px 100px;background:#fff;border-top:1px solid rgba(0,0,0,0.04)">
          <div style="max-width:720px;margin:0 auto">
            <div style="text-align:center;margin-bottom:44px">
              <h2 style="font-family:var(--font-display);font-size:clamp(1.6rem,2.5vw,2.2rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
                Frequently Asked Questions
              </h2>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px" id="faqContainer">
              ${[
                {q:'What file formats are included?',a:'All assets come in industry-standard formats. Video clips are provided as MP4/H.264 and ProRes 422 in 4K resolution. Motion graphics templates are available in .aep (After Effects), .mogrt (Premiere Pro), and .psd (Photoshop). Digital assets include AI, EPS, PNG, and SVG formats.'},
                {q:'How does the instant download work?',a:'After your payment is verified (typically within a few hours for bank transfers, instantly for digital wallets), you will receive a secure download link via email. You can also access all purchased files from your profile dashboard under My Orders — no expiration, no limits.'},
                {q:'Can I use these assets for commercial projects?',a:'Yes! All PixabAnimation assets come with a Standard License that covers commercial use in client projects, YouTube videos, social media content, advertising, broadcast, and film.'},
                {q:'What payment methods do you accept?',a:'We accept Payoneer and Skrill for manual payment processing. Simply send the total amount to our designated account and submit the Transaction ID during checkout.'},
                {q:'What is your refund policy?',a:'We offer a 14-day satisfaction guarantee. If an asset has a technical issue (corrupted file, wrong format, playback error), we will provide a replacement or full refund.'},
                {q:'Do you offer custom animation services?',a:'Yes! We provide custom motion graphics and animation services for brands, agencies, and content creators. Reach out through our Contact page with your project brief.'}
              ].map((faq) => `
                <div style="border:1px solid rgba(0,0,0,0.06);border-radius:12px;overflow:hidden;transition:border-color 0.2s ease;background:#fafafa"
                     onclick="this.classList.toggle('active');const panel=this.querySelector('.faq-answer');panel.style.maxHeight=panel.style.maxHeight||'0px';panel.style.maxHeight=panel.style.maxHeight==='0px'?panel.scrollHeight+'px':'0px';this.querySelector('.faq-chevron').style.transform=panel.style.maxHeight!=='0px'?'rotate(180deg)':'rotate(0deg)'">
                  <div style="display:flex;align-items:center;gap:12px;padding:18px 22px;cursor:pointer;user-select:none">
                    <span style="flex:1;font-family:var(--font-primary);font-size:15px;font-weight:500;letter-spacing:-0.01em;color:#1d1d1f;line-height:1.3">${faq.q}</span>
                    <svg class="faq-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;transition:transform 0.3s ease;color:rgba(0,0,0,0.3)">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1);padding:0 22px 0 22px">
                    <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.48);padding-bottom:20px;margin:0;border-top:1px solid rgba(0,0,0,0.04);padding-top:16px">${faq.a}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

      `;

      App.updateWishlistIcons();
      VideoPlayer.init();
    } catch (error) {
      console.error('Home page error:', error);
      content.innerHTML = Components.emptyState(
        '😔',
        'Unable to load',
        'Failed to load the page. Please check your connection.',
        'Try Again',
        '#/'
      );
    }
  }
};
