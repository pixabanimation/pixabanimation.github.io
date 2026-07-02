// ============================================
// PixabAnimation — Home Page
// Professional Gorgeous Design
// ============================================

const HomePage = {
  async render(params) {
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
        <section class="hero" style="min-height:90vh;padding:100px 24px 60px;position:relative;overflow:hidden;display:flex;align-items:center">
          <!-- Subtle ambient glow -->
          <div style="position:absolute;inset:0;overflow:hidden;z-index:0">
            <div style="position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(0,102,204,0.08),transparent 70%);top:-250px;right:-150px;animation:float 14s ease-in-out infinite"></div>
            <div style="position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(0,102,204,0.06),transparent 70%);bottom:-180px;left:-100px;animation:float 12s ease-in-out infinite reverse"></div>
          </div>

          <div class="hero-content" style="position:relative;z-index:1;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center">
            <div class="hero-text" style="animation:fadeInUp 0.8s ease-out">
              <!-- Section label -->
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:24px">
                <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
                <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">New — 2026 Animation Collection</span>
              </div>
              
              <h1 style="font-family:var(--font-display);font-size:clamp(2.2rem,4.5vw,3.5rem);font-weight:600;line-height:1.07;letter-spacing:-0.005em;margin-bottom:16px;color:#fff">
                Premium Motion Graphics<br>
                <span style="color:var(--ds-primary)">&amp; Animation Assets</span>
              </h1>
              
              <p style="font-family:var(--font-primary);font-size:clamp(0.95rem,1.1vw,1.05rem);font-weight:400;line-height:1.6;letter-spacing:-0.022em;color:rgba(255,255,255,0.65);margin-bottom:32px;max-width:480px">
                Elevate your projects with cinema-grade <strong style="color:rgba(255,255,255,0.85)">4K motion graphics</strong>, animation assets, and professional editing templates. Used by 10,000+ creators in 50+ countries.
              </p>
              
              <div style="display:flex;gap:14px;flex-wrap:wrap">
                <a href="#/shop" class="ds-pill-cta" style="padding:12px 24px;font-size:16px;gap:10px">
                  Browse Assets
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a href="#/shop?category=videos" class="ds-pill-cta-secondary" style="padding:12px 24px;font-size:16px;border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.8)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Demo
                </a>
              </div>

              <div style="display:flex;gap:36px;margin-top:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.06)">
                <div>
                  <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;color:var(--ds-primary)">500+</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(255,255,255,0.4)">Premium Assets</div>
                </div>
                <div>
                  <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;color:var(--ds-primary)">10K+</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(255,255,255,0.4)">Happy Creators</div>
                </div>
                <div>
                  <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;color:var(--ds-primary)">4K</div>
                  <div style="font-family:var(--font-primary);font-size:12px;font-weight:400;letter-spacing:-0.007em;color:rgba(255,255,255,0.4)">Ultra HD Quality</div>
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
              <div style="position:absolute;top:-10px;right:-10px;padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);border-radius:12px;animation:float 7s ease-in-out infinite">
                <span style="font-size:1.1rem">🎬</span>
                <div>
                  <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:#fff">4K Ultra HD</div>
                  <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.4)">Cinematic Quality</div>
                </div>
              </div>

              <!-- Floating badge 2 -->
              <div style="position:absolute;bottom:-10px;left:-10px;padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);border-radius:12px;animation:float 7s ease-in-out infinite 3.5s">
                <span style="font-size:1.1rem">⚡</span>
                <div>
                  <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:#fff">Instant Download</div>
                  <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.4)">After Purchase</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- TRUST BAR — Clean Stats Row                  -->
        <!-- ============================================ -->
        <div style="max-width:1100px;margin:-24px auto 0;padding:0 24px;position:relative;z-index:3">
          <div class="mobile-trust-bar" style="display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,0.4);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:0">
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(255,255,255,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(255,255,255,0.7);margin-bottom:2px">
                <i class="fas fa-cloud-download-alt" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>Instant Download
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.35)">Access immediately</div>
            </div>
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(255,255,255,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(255,255,255,0.7);margin-bottom:2px">
                <i class="fas fa-crown" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>Premium Quality
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.35)">Hand-curated assets</div>
            </div>
            <div style="text-align:center;padding:22px 12px;border-right:1px solid rgba(255,255,255,0.04)">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(255,255,255,0.7);margin-bottom:2px">
                <i class="fas fa-undo-alt" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>14-Day Guarantee
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.35)">Satisfaction assured</div>
            </div>
            <div style="text-align:center;padding:22px 12px">
              <div style="font-family:var(--font-primary);font-weight:500;font-size:12px;letter-spacing:-0.01em;color:rgba(255,255,255,0.7);margin-bottom:2px">
                <i class="fas fa-headset" style="font-size:1rem;color:var(--ds-primary);margin-right:6px"></i>24/7 Support
              </div>
              <div style="font-family:var(--font-primary);font-size:10px;color:rgba(255,255,255,0.35)">We're here to help</div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- FEATURED — Apple-Inspired Product Tile        -->
        <!-- ============================================ -->
        <section style="padding:100px 24px;max-width:1100px;margin:0 auto">
          <div style="text-align:center;margin-bottom:48px">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
              <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">Featured Collection</span>
            </div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.6rem,2.8vw,2.5rem);font-weight:600;line-height:1.1;letter-spacing:0;margin-bottom:12px;color:#fff">
              Top Animation Assets
            </h2>
            <p style="font-family:var(--font-primary);font-size:clamp(0.9rem,1vw,1rem);font-weight:400;line-height:1.5;letter-spacing:-0.022em;color:rgba(255,255,255,0.5);max-width:520px;margin:0 auto">
              Handpicked premium motion graphics, animation clips, and creative templates for editors, motion designers, and content creators.
            </p>
          </div>
          <div class="product-grid">
            ${allProducts.slice(0, 8).map((p, i) => Components.productCard(p, i)).join('')}
          </div>
          <div style="text-align:center;margin-top:40px">
            <a href="#/shop" class="ds-pill-cta" style="padding:11px 28px;font-size:15px">
              View Full Catalog
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- CATEGORIES — Apple-Inspired Tile              -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;max-width:1100px;margin:0 auto">
          <div style="text-align:center;margin-bottom:44px">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
              <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">Browse By</span>
            </div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.6rem,2.8vw,2.5rem);font-weight:600;line-height:1.1;letter-spacing:0;color:#fff">
              Explore Categories
            </h2>
          </div>
          <div class="categories-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
            ${categories.map((c, i) => Components.categoryCard(c, i)).join('')}
          </div>
        </section>

        <!-- ============================================ -->
        <!-- WHY PIXABANIMATION — Value Props              -->
        <!-- ============================================ -->
        <section style="padding:100px 24px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04)">
          <div style="max-width:1100px;margin:0 auto">
            <div style="text-align:center;margin-bottom:48px">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
                <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
                <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">Why Us</span>
              </div>
              <h2 style="font-family:var(--font-display);font-size:clamp(1.6rem,2.8vw,2.5rem);font-weight:600;line-height:1.1;letter-spacing:0;color:#fff">
                Built for Creators
              </h2>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
              <div style="padding:32px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:all 0.2s ease"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.3)'"
                   onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary)"><i class="fas fa-film"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#fff">Cinema-Grade 4K Quality</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.013em;color:rgba(255,255,255,0.45)">Every asset rendered in true 4K. Compatible with After Effects, Premiere Pro, Final Cut Pro, and DaVinci Resolve.</p>
              </div>
              <div style="padding:32px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:all 0.2s ease"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.3)'"
                   onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary)"><i class="fas fa-bolt"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#fff">Instant Access</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.013em;color:rgba(255,255,255,0.45)">Download immediately in full resolution. No watermarks, no queues. Start creating the moment you buy.</p>
              </div>
              <div style="padding:32px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:all 0.2s ease"
                   onmouseover="this.style.borderColor='rgba(0,102,204,0.3)'"
                   onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div style="width:44px;height:44px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--ds-primary)"><i class="fas fa-layer-group"></i></div>
                <h3 style="font-family:var(--font-primary);font-size:17px;font-weight:600;line-height:1.24;letter-spacing:-0.022em;margin-bottom:6px;color:#fff">Editor-Friendly</h3>
                <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.013em;color:rgba(255,255,255,0.45)">Works with Premiere Pro, After Effects, Final Cut Pro, DaVinci Resolve, and more. Professional formats out of the box.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- NEWSLETTER — Apple-Inspired Dark CTA          -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;text-align:center;position:relative;overflow:hidden;background:#000;border-top:1px solid rgba(255,255,255,0.06)">
          <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,102,204,0.06),transparent 70%);top:-120px;right:-80px"></div>
          <div style="max-width:520px;margin:0 auto;position:relative;z-index:1">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.4rem,2.5vw,2rem);font-weight:600;line-height:1.1;letter-spacing:0;color:#fff;margin-bottom:10px">
              Join the Community
            </h2>
            <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.013em;color:rgba(255,255,255,0.5);margin-bottom:24px">
              Get early access to new releases, subscriber-only discounts, and creative inspiration.
            </p>
            <div style="display:flex;gap:8px;max-width:420px;margin:0 auto">
              <input type="email" placeholder="Enter your email" id="newsletterEmail" 
                     style="flex:1;padding:12px 16px;border-radius:9999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;font-family:var(--font-primary);transition:border-color 0.2s ease">
              <button onclick="App.subscribeNewsletter(event)" 
                      style="padding:12px 24px;background:var(--ds-primary);color:white;border-radius:9999px;font-weight:500;font-size:14px;cursor:pointer;border:none;transition:background 0.2s ease;white-space:nowrap;font-family:var(--font-primary)">
                Subscribe
              </button>
            </div>
            <p style="font-family:var(--font-primary);font-size:11px;color:rgba(255,255,255,0.25);margin-top:12px">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- TESTIMONIALS — Apple-Inspired                 -->
        <!-- ============================================ -->
        <section style="padding:80px 24px 100px;max-width:1100px;margin:0 auto">
          <div style="text-align:center;margin-bottom:44px">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
              <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">Testimonials</span>
            </div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.4rem,2.5vw,2.2rem);font-weight:600;line-height:1.1;letter-spacing:0;color:#fff">
              Loved by Creators Worldwide
            </h2>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
            <div style="padding:28px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(255,255,255,0.6);margin-bottom:16px;font-style:normal">
                "The 4K nature reel is absolutely stunning. Best investment I've made for my video projects — the quality speaks for itself."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">SM</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:rgba(255,255,255,0.8)">Sarah M.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(255,255,255,0.35)">Video Editor</div>
                </div>
              </div>
            </div>
            <div style="padding:28px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(255,255,255,0.6);margin-bottom:16px;font-style:normal">
                "PixabAnimation has the best motion graphics templates. My workflow has never been smoother. The drag-and-drop compatibility is a game-changer."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">AK</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:rgba(255,255,255,0.8)">Alex K.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(255,255,255,0.35)">Motion Designer</div>
                </div>
              </div>
            </div>
            <div style="padding:28px 24px;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
              <div style="font-size:0.9rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">★★★★★</div>
              <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(255,255,255,0.6);margin-bottom:16px;font-style:normal">
                "Instant download, incredible quality, and the lower thirds bundle saved me hours. My go-to marketplace for animation assets."
              </p>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white">PR</div>
                <div>
                  <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:rgba(255,255,255,0.8)">Priya R.</div>
                  <div style="font-family:var(--font-primary);font-size:11px;color:rgba(255,255,255,0.35)">Content Creator</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- ============================================ -->
        <!-- FAQ — Apple-Inspired Disclosure Style        -->
        <!-- ============================================ -->
        <section style="padding:80px 24px 100px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.04)">
          <div style="max-width:800px;margin:0 auto">
            <div style="text-align:center;margin-bottom:44px">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
                <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
                <span style="font-family:var(--font-primary);font-size:12px;font-weight:500;letter-spacing:-0.01em;color:var(--ds-primary)">FAQ</span>
              </div>
              <h2 style="font-family:var(--font-display);font-size:clamp(1.4rem,2.5vw,2.2rem);font-weight:600;line-height:1.1;letter-spacing:0;color:#fff">
                Frequently Asked Questions
              </h2>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px" id="faqContainer">
              ${[
                {q:'What file formats are included?',a:'All assets come in industry-standard formats. Video clips are provided as MP4/H.264 and ProRes 422 in 4K resolution. Motion graphics templates are available in .aep (After Effects), .mogrt (Premiere Pro), and .psd (Photoshop). Digital assets include AI, EPS, PNG, and SVG formats.'},
                {q:'How does the instant download work?',a:'After your payment is verified (typically within a few hours for bank transfers, instantly for digital wallets), you will receive a secure download link via email. You can also access all purchased files from your profile dashboard under "My Orders" — no expiration, no limits.'},
                {q:'Can I use these assets for commercial projects?',a:'Yes! All PixabAnimation assets come with a Standard License that covers commercial use in client projects, YouTube videos, social media content, advertising, broadcast, and film. Resale or redistribution of raw assets is not permitted.'},
                {q:'What payment methods do you accept?',a:'We accept Payoneer and Skrill for manual payment processing. Simply send the total amount to our designated account and submit the Transaction ID during checkout. Our team verifies and approves your order within 24 hours.'},
                {q:'What is your refund policy?',a:'We offer a 14-day satisfaction guarantee. If an asset has a technical issue (corrupted file, wrong format, playback error), we will provide a replacement or full refund. Contact our support team with your order details to start the process.'},
                {q:'Do you offer custom animation services?',a:'Yes! We provide custom motion graphics and animation services for brands, agencies, and content creators. Reach out through our Contact page with your project brief, and our design team will provide a quote within 48 hours.'}
              ].map((faq, i) => `
                <div style="border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;transition:border-color 0.2s ease;background:rgba(255,255,255,0.02)"
                     onclick="this.classList.toggle('active');const panel=this.querySelector('.faq-answer');panel.style.maxHeight=panel.style.maxHeight||'0px';panel.style.maxHeight=panel.style.maxHeight==='0px'?panel.scrollHeight+'px':'0px';this.querySelector('.faq-chevron').style.transform=panel.style.maxHeight!=='0px'?'rotate(180deg)':'rotate(0deg)'">
                  <div style="display:flex;align-items:center;gap:12px;padding:18px 22px;cursor:pointer;user-select:none">
                    <span style="width:4px;height:4px;border-radius:50%;background:var(--ds-primary);flex-shrink:0"></span>
                    <span style="flex:1;font-family:var(--font-primary);font-size:15px;font-weight:500;letter-spacing:-0.01em;color:rgba(255,255,255,0.85);line-height:1.3">${faq.q}</span>
                    <svg class="faq-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;transition:transform 0.3s ease;color:rgba(255,255,255,0.3)">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1);padding:0 22px 0 38px">
                    <p style="font-family:var(--font-primary);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(255,255,255,0.5);padding-bottom:20px;margin:0">${faq.a}</p>
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
