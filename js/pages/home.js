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

    // Remove any previous FAQ schema to avoid accumulation
    // Remove any previous FAQ schema to avoid accumulation
    const oldFaqSchema = document.getElementById('homeFaqSchema');
    if (oldFaqSchema) oldFaqSchema.remove();

    // FAQ data — shared between the rendered UI and structured data
    const faqs = [
      {q:'What file formats are included?',a:'All assets come in industry-standard formats. Video clips are provided as MP4/H.264 and ProRes 422 in 4K resolution. Motion graphics templates are available in .aep (After Effects), .mogrt (Premiere Pro), and .psd (Photoshop). Digital assets include AI, EPS, PNG, and SVG formats.'},
      {q:'How does the instant download work?',a:'After your payment is verified (typically within a few hours for bank transfers, instantly for digital wallets), you will receive a secure download link via email. You can also access all purchased files from your profile dashboard under My Orders — no expiration, no limits.'},
      {q:'Can I use these assets for commercial projects?',a:'Yes! All PixabAnimation assets come with a Standard License that covers commercial use in client projects, YouTube videos, social media content, advertising, broadcast, and film.'},
      {q:'What payment methods do you accept?',a:'We accept Payoneer and Skrill for manual payment processing. Simply send the total amount to our designated account and submit the Transaction ID during checkout.'},
      {q:'What is your refund policy?',a:'We offer a 14-day satisfaction guarantee. If an asset has a technical issue (corrupted file, wrong format, playback error), we will provide a replacement or full refund.'},
      {q:'Do you offer custom animation services?',a:'Yes! We provide custom motion graphics and animation services for brands, agencies, and content creators. Reach out through our Contact page with your project brief.'}
    ];


    // Inject FAQPage JSON-LD structured data
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.a
        }
      }))
    };
    const schemaScript = document.createElement('script');
    schemaScript.id = 'homeFaqSchema';
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(schemaScript);

    try {
      const [featuredProducts, categories] = await Promise.all([
        DB.getFeaturedProducts(),
        DB.getCategories()
      ]);

      // Get products for top categories
      const categoryProducts = {};
      const featuredSlugs = ['videos', 'adobe-after-effect-plugins'];
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
        <section class="hero" style="background:#fff;min-height:auto">
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
          <div style="text-align:center;margin-top:44px" id="loadMoreContainer">
            <button onclick="HomePage.loadMore()" class="ds-pill-cta" id="loadMoreBtn" style="padding:12px 28px;font-size:15px;cursor:pointer;border:none;font-family:var(--font-primary)">
              <i class="fas fa-cog" id="loadMoreSpinner" style="margin-right:8px;animation:spin 1s linear infinite;display:none"></i>
              <i class="fas fa-chevron-down" style="margin-right:8px"></i>
              Load More
            </button>
          </div>
        </section>

        ${(categoryProducts['adobe-after-effect-plugins'] || []).length > 0 ? `
        <!-- ============================================ -->
        <!-- AFTER EFFECTS PLUGINS — Category Spotlight    -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;max-width:1100px;margin:0 auto;background:#fff;border-top:1px solid rgba(0,0,0,0.04)">
          <div style="text-align:center;margin-bottom:48px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;margin-bottom:12px;color:#1d1d1f">
              After Effects Plugins
            </h2>
            <p style="font-family:var(--font-primary);font-size:clamp(0.95rem,1vw,1.05rem);font-weight:400;line-height:1.5;letter-spacing:-0.022em;color:rgba(0,0,0,0.5);max-width:520px;margin:0 auto">
              Extend your creative toolkit with powerful After Effects plugins and extensions.
            </p>
          </div>
          <div class="product-grid">
            ${(categoryProducts['adobe-after-effect-plugins'] || []).slice(0, 8).map((p, i) => Components.productCard(p, i)).join('')}
          </div>
          <div style="text-align:center;margin-top:44px">
            <a href="#/shop?category=after-effects-plugins" class="ds-pill-cta" style="padding:12px 28px;font-size:15px">
              View All Plugins
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </section>
        ` : ''}

        <!-- ============================================ -->
        <!-- CATEGORIES — Apple-Style Album Cover Slider   -->
        <!-- ============================================ -->
        <section style="padding:80px 24px;max-width:1100px;margin:0 auto;background:transparent">
          <div style="text-align:center;margin-bottom:44px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
              Explore Categories
            </h2>
          </div>
          <div class="category-slider-wrapper" id="categorySlider">
            <button class="category-slider-arrow category-slider-arrow--prev" aria-label="Previous categories">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="category-slider-stage" id="categorySliderStage">
              <div class="category-slider-track" id="categorySliderTrack">
                ${categories.map((c, i) => `
                  <div class="category-slider-card-wrap" data-index="${i}">
                    ${Components.categoryCard(c, i)}
                  </div>
                `).join('')}
              </div>
            </div>
            <button class="category-slider-arrow category-slider-arrow--next" aria-label="Next categories">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="category-slider-dots" id="categorySliderDots">
            ${categories.map((_, i) => `<span class="category-slider-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('')}
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
        <!-- WORLDWIDE CUSTOMER COUNTRIES — Flag Slider    -->
        <!-- ============================================ -->
        <section style="padding:48px 24px 40px;background:#f5f5f7;border-top:1px solid rgba(0,0,0,0.04)">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1rem,1.6vw,1.3rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
              Worldwide Customer Countries
            </h2>
          </div>
          <div style="max-width:900px;margin:0 auto">
            <div class="country-slider-wrapper" id="countrySlider">
              <button class="country-slider-arrow country-slider-arrow--prev" id="countryPrev" aria-label="Previous countries">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="country-slider-stage" id="countrySliderStage">
                <div class="country-slider-track" id="countrySliderTrack">
                  ${HomePage.countries.map((c, i) => `
                    <div class="country-slide" data-index="${i}" title="${c.name}">
                      <img src="https://flagcdn.com/w80/${c.code}.png"
                           srcset="https://flagcdn.com/w160/${c.code}.png 2x"
                           alt="${c.name}"
                           width="80" height="60"
                           loading="lazy"
                           style="display:block;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,0.08)">
                    </div>
                  `).join('')}
                </div>
              </div>
              <button class="country-slider-arrow country-slider-arrow--next" id="countryNext" aria-label="Next countries">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
            <div class="country-slider-dots" id="countrySliderDots">
              ${HomePage.countries.map((_, i) => `<span class="country-slider-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('')}
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
        <!-- TESTIMONIALS — Draggable Carousel             -->
        <!-- ============================================ -->
        <section style="padding:80px 24px 80px;max-width:1100px;margin:0 auto;background:#fff">
          <div style="text-align:center;margin-bottom:36px">
            <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,2.5vw,2.2rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
              Loved by Creators Worldwide
            </h2>
          </div>
          <div class="testimonial-slider-wrapper" id="testimonialSlider">
            <button class="testimonial-slider-arrow testimonial-slider-arrow--prev" id="testimonialPrev" aria-label="Previous testimonials">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="testimonial-slider-stage" id="testimonialSliderStage">
              <div class="testimonial-slider-track" id="testimonialSliderTrack">
                ${HomePage.testimonials.map((t, i) => `
                  <div class="testimonial-slide" data-index="${i}">
                    <div style="padding:28px 24px;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;box-shadow:0 1px 8px rgba(0,0,0,0.04);height:100%;display:flex;flex-direction:column">
                      <div style="font-size:0.85rem;margin-bottom:12px;letter-spacing:1px;color:var(--ds-primary)">${'\u2605'.repeat(t.rating)}${'\u2606'.repeat(5 - t.rating)}</div>
                      <p style="flex:1;font-family:var(--font-primary);font-size:13.5px;font-weight:400;line-height:1.6;letter-spacing:-0.013em;color:rgba(0,0,0,0.56);margin-bottom:14px">
                        "${t.text}"
                      </p>
                      <div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.04)">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--ds-primary);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:white;flex-shrink:0">${t.initials}</div>
                        <div>
                          <div style="font-family:var(--font-primary);font-size:13px;font-weight:500;color:#1d1d1f">${t.name}</div>
                          <div style="font-family:var(--font-primary);font-size:11px;color:rgba(0,0,0,0.35)">${t.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <button class="testimonial-slider-arrow testimonial-slider-arrow--next" id="testimonialNext" aria-label="Next testimonials">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="testimonial-slider-dots" id="testimonialSliderDots">
            ${HomePage.testimonials.map((_, i) => `<span class="testimonial-slider-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('')}
          </div>
        </section>
        <!-- ============================================ -->
        <!-- FAQ — Grid Accordion                          -->
        <!-- ============================================ -->
        <section style="padding:60px 24px;background:#fff;border-top:1px solid rgba(0,0,0,0.04)">
          <div style="max-width:900px;margin:0 auto">
            <div style="text-align:center;margin-bottom:28px">
              <h2 style="font-family:var(--font-display);font-size:clamp(1.3rem,2vw,1.6rem);font-weight:700;line-height:1.1;letter-spacing:-0.005em;color:#1d1d1f">
                FAQs
              </h2>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:8px" id="faqContainer">
              ${faqs.map((faq) => `
                <div style="border:1px solid rgba(0,0,0,0.06);border-radius:10px;overflow:hidden;transition:border-color 0.2s ease,box-shadow 0.2s ease;background:#fafafa;align-self:start"
                     onmouseenter="this.style.borderColor='rgba(0,102,204,0.2)';this.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'"
                     onmouseleave="this.style.borderColor='rgba(0,0,0,0.06)';this.style.boxShadow='none'"
                     onclick="this.classList.toggle('active');const panel=this.querySelector('.faq-answer');panel.style.maxHeight=panel.style.maxHeight||'0px';panel.style.maxHeight=panel.style.maxHeight==='0px'?panel.scrollHeight+'px':'0px';this.querySelector('.faq-chevron').style.transform=panel.style.maxHeight!=='0px'?'rotate(180deg)':'rotate(0deg)'">
                  <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;user-select:none">
                    <span style="flex:1;font-family:var(--font-primary);font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#1d1d1f;line-height:1.3">${faq.q}</span>
                    <svg class="faq-chevron" width="12" height="12" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;transition:transform 0.3s ease;color:rgba(0,0,0,0.25)">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.3s cubic-bezier(0.4,0,0.2,1);padding:0 14px 0 14px">
                    <p style="font-family:var(--font-primary);font-size:12.5px;font-weight:400;line-height:1.5;letter-spacing:-0.01em;color:rgba(0,0,0,0.48);padding-bottom:14px;margin:0;border-top:1px solid rgba(0,0,0,0.04);padding-top:10px">${faq.a}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

      `;

      App.updateWishlistIcons();
      VideoPlayer.init();

      // Init sliders
      HomePage.initCountrySlider();
      HomePage.initTestimonialSlider();
      HomePage.initCategorySlider();
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
  },

  testimonials: [
    {name:'Sarah M.', initials:'SM', role:'Video Editor', rating:5, text:'The 4K nature reel is absolutely stunning. Best investment I\'ve made for my video projects — the quality speaks for itself.'},
    {name:'Alex K.', initials:'AK', role:'Motion Designer', rating:5, text:'PixabAnimation has the best motion graphics templates. My workflow has never been smoother. The drag-and-drop compatibility is a game-changer.'},
    {name:'Priya R.', initials:'PR', role:'Content Creator', rating:5, text:'Instant download, incredible quality, and the lower thirds bundle saved me hours. My go-to marketplace for animation assets.'},
    {name:'Marcus J.', initials:'MJ', role:'Film Director', rating:5, text:'The cinematic transitions pack elevated my short film to a whole new level. Every template feels like it was crafted by a seasoned professional.'},
    {name:'Elena V.', initials:'EV', role:'Social Media Manager', rating:5, text:'I use PixabAnimation assets daily for client content. The variety and consistent quality keep me coming back. Highly recommend to any content team.'},
    {name:'David L.', initials:'DL', role:'YouTuber', rating:4, text:'Great selection of intros and lower thirds. My channel looks way more professional now. Would love to see more gaming-themed templates in the future.'},
    {name:'Aisha N.', initials:'AN', role:'Freelance Editor', rating:5, text:'As a freelancer, I need assets that work out of the box. Every download has been flawless — proper formats, clean files, instant delivery.'},
    {name:'Tom W.', initials:'TW', role:'Advertising Creative', rating:5, text:'We used PixabAnimation for a brand campaign and the results were incredible. The AE templates saved our team over 20 hours of production time.'},
    {name:'Lina K.', initials:'LK', role:'Animator', rating:5, text:'The 4K ProRes clips are studio-grade. No transcoding needed, no quality loss. This is the kind of marketplace the animation community has been waiting for.'},
    {name:'Raj P.', initials:'RP', role:'Post-Production Supervisor', rating:5, text:'We\'ve integrated PixabAnimation into our studio\'s asset library. The consistency across categories makes it easy to mix and match for any project.'}
  ],

  countries: [
    {name:'United States', code:'us'},
    {name:'United Kingdom', code:'gb'},
    {name:'Australia', code:'au'},
    {name:'Spain', code:'es'},
    {name:'Germany', code:'de'},
    {name:'Italy', code:'it'},
    {name:'France', code:'fr'},
    {name:'Netherlands', code:'nl'},
    {name:'Argentina', code:'ar'},
    {name:'Brazil', code:'br'},
    {name:'Switzerland', code:'ch'},
    {name:'Greece', code:'gr'}
  ],

  loadedCount: 8,

  async loadMore() {
    const btn = document.getElementById('loadMoreBtn');
    const spinner = document.getElementById('loadMoreSpinner');
    const container = document.getElementById('loadMoreContainer');

    if (!btn || btn.disabled) return;
    btn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';

    try {
      const moreProducts = await DB.getProducts({ limit: 8, offset: this.loadedCount });

      if (moreProducts.length === 0) {
        if (container) container.remove();
        return;
      }

      const grid = document.querySelector('.product-grid');
      if (grid) {
        grid.insertAdjacentHTML('beforeend', moreProducts.map((p, i) => Components.productCard(p, this.loadedCount + i)).join(''));
      }

      this.loadedCount += moreProducts.length;
      App.updateWishlistIcons();

      if (moreProducts.length < 8) {
        btn.textContent = 'All products loaded';
        btn.onclick = null;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'default';
        setTimeout(() => {
          if (container) container.style.display = 'none';
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      Components.toast('Failed to load more products', 'error');
    } finally {
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
    }
  },

  // Country flag slider — draggable horizontal scroll-snap
  initCountrySlider() {
    if (this._countryCleanup) {
      this._countryCleanup();
    }

    const track = document.getElementById('countrySliderTrack');
    const slides = document.querySelectorAll('.country-slide');
    const prevBtn = document.getElementById('countryPrev');
    const nextBtn = document.getElementById('countryNext');
    const dots = document.querySelectorAll('.country-slider-dot');
    if (!track || slides.length === 0) return;

    let rafId = null;
    let autoScrollInterval;

    function updateActiveDot() {
      const trackRect = track.getBoundingClientRect();
      const containerCenter = trackRect.left + trackRect.width / 2;
      let closestIdx = 0, closestDist = Infinity;
      slides.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - containerCenter);
        if (d < closestDist) { closestDist = d; closestIdx = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }

    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { updateActiveDot(); rafId = null; });
    }
    track.addEventListener('scroll', onScroll, { passive: true });

    // Mouse drag
    let isDragging = false, dragStartX = 0, dragScrollLeft = 0, dragDist = 0;
    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
      track.style.userSelect = 'none';
    }
    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      dragDist = Math.abs(x - dragStartX);
      track.scrollLeft = dragScrollLeft - (x - dragStartX) * 1.5;
    }
    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = '';
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
      track.style.userSelect = '';
    }
    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mousemove', onMouseMove);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mouseleave', onMouseUp);

    // Touch support
    function onTouchStart(e) {
      const touch = e.touches[0];
      isDragging = true;
      dragStartX = touch.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
    }
    function onTouchMove(e) {
      if (!isDragging) return;
      const touch = e.touches[0];
      const x = touch.pageX - track.offsetLeft;
      dragDist = Math.abs(x - dragStartX);
      track.scrollLeft = dragScrollLeft - (x - dragStartX) * 1.5;
    }
    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
    }
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });

    // Arrow navigation
    const slideWidth = () => slides[0]?.getBoundingClientRect().width + 16 || 100;
    const onPrev = () => { track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }); resetAutoScroll(); };
    const onNext = () => { track.scrollBy({ left: slideWidth(), behavior: 'smooth' }); resetAutoScroll(); };
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    // Dot navigation
    const dotHandlers = [];
    dots.forEach((dot) => {
      const handler = () => {
        const index = parseInt(dot.dataset.index);
        const target = slides[index];
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        resetAutoScroll();
      };
      dot.addEventListener('click', handler);
      dotHandlers.push({ el: dot, handler });
    });

    // Keyboard
    const onKeydown = (e) => {
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }); resetAutoScroll(); }
      if (e.key === 'ArrowRight') { track.scrollBy({ left: slideWidth(), behavior: 'smooth' }); resetAutoScroll(); }
    };
    track.addEventListener('keydown', onKeydown);
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', 'Customer countries carousel');

    // Auto-scroll
    function startAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      if (track.scrollWidth <= track.clientWidth + 1) return;
      autoScrollInterval = setInterval(() => {
        const isNearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 50;
        if (isNearEnd) {
          slides[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          track.scrollBy({ left: slideWidth(), behavior: 'smooth' });
        }
      }, 4500);
    }
    function resetAutoScroll() { clearInterval(autoScrollInterval); startAutoScroll(); }

    const onMouseEnter = () => clearInterval(autoScrollInterval);
    const onMouseLeave = startAutoScroll;
    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { updateActiveDot(); rafId = null; });
    };
    window.addEventListener('resize', onResize, { passive: true });

    requestAnimationFrame(() => { updateActiveDot(); });
    startAutoScroll();

    this._countryCleanup = () => {
      clearInterval(autoScrollInterval);
      if (rafId) cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('keydown', onKeydown);
      track.removeEventListener('mouseenter', onMouseEnter);
      track.removeEventListener('mouseleave', startAutoScroll);
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mousemove', onMouseMove);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mouseleave', onMouseUp);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      dotHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
      window.removeEventListener('resize', onResize);
    };
  },

  // Testimonial slider — draggable horizontal scroll-snap
  initTestimonialSlider() {
    if (this._testimonialCleanup) {
      this._testimonialCleanup();
    }

    const track = document.getElementById('testimonialSliderTrack');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    const dots = document.querySelectorAll('.testimonial-slider-dot');
    if (!track || slides.length === 0) return;

    let rafId = null;
    let autoScrollInterval;

    // --- Update active dot ---
    function updateActiveDot() {
      const trackRect = track.getBoundingClientRect();
      const containerCenter = trackRect.left + trackRect.width / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - containerCenter);
        if (d < closestDist) { closestDist = d; closestIdx = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }

    // --- Scroll handler ---
    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { updateActiveDot(); rafId = null; });
    }
    track.addEventListener('scroll', onScroll, { passive: true });

    // --- Mouse drag ---
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    let dragDist = 0;

    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none';
      track.style.userSelect = 'none';
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - dragStartX) * 1.2;
      dragDist = Math.abs(walk);
      track.scrollLeft = dragScrollLeft - walk;
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = '';
      track.style.scrollSnapType = '';
      track.style.userSelect = '';
      setTimeout(() => { updateActiveDot(); }, 50);
    }

    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mousemove', onMouseMove);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mouseleave', onMouseUp);

    // Touch support
    function onTouchStart(e) {
      const touch = e.touches[0];
      isDragging = true;
      dragStartX = touch.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
    }
    function onTouchMove(e) {
      if (!isDragging) return;
      const touch = e.touches[0];
      const x = touch.pageX - track.offsetLeft;
      dragDist = Math.abs(x - dragStartX);
      track.scrollLeft = dragScrollLeft - (x - dragStartX) * 1.2;
    }
    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
    }
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });

    // Prevent slide click when dragging
    slides.forEach(slide => {
      slide.addEventListener('click', (e) => {
        if (dragDist > 5) e.stopPropagation();
      }, true);
    });

    // --- Arrow navigation ---
    const slideWidth = () => slides[0]?.getBoundingClientRect().width + 16 || 340;
    const onPrev = () => { track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }); resetAutoScroll(); };
    const onNext = () => { track.scrollBy({ left: slideWidth(), behavior: 'smooth' }); resetAutoScroll(); };
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    // --- Dot navigation ---
    const dotHandlers = [];
    dots.forEach((dot) => {
      const handler = () => {
        const index = parseInt(dot.dataset.index);
        const target = slides[index];
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        resetAutoScroll();
      };
      dot.addEventListener('click', handler);
      dotHandlers.push({ el: dot, handler });
    });

    // --- Keyboard ---
    const onKeydown = (e) => {
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }); resetAutoScroll(); }
      if (e.key === 'ArrowRight') { track.scrollBy({ left: slideWidth(), behavior: 'smooth' }); resetAutoScroll(); }
    };
    track.addEventListener('keydown', onKeydown);
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', 'Testimonial carousel');

    // --- Auto-scroll every 5s ---
    function startAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      if (track.scrollWidth <= track.clientWidth + 1) return;
      autoScrollInterval = setInterval(() => {
        const isNearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 50;
        if (isNearEnd) {
          slides[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          track.scrollBy({ left: slideWidth(), behavior: 'smooth' });
        }
      }, 5000);
    }

    function resetAutoScroll() {
      clearInterval(autoScrollInterval);
      startAutoScroll();
    }

    const onMouseEnter = () => clearInterval(autoScrollInterval);
    const onMouseLeave = startAutoScroll;
    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);

    // --- Resize ---
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { updateActiveDot(); rafId = null; });
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Init
    requestAnimationFrame(() => { updateActiveDot(); });
    startAutoScroll();

    this._testimonialCleanup = () => {
      clearInterval(autoScrollInterval);
      if (rafId) cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('keydown', onKeydown);
      track.removeEventListener('mouseenter', onMouseEnter);
      track.removeEventListener('mouseleave', onMouseLeave);
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mousemove', onMouseMove);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mouseleave', onMouseUp);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      dotHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
      window.removeEventListener('resize', onResize);
    };
  },

  // iTunes 10 Cover Flow — scroll-snap with 3D transforms
  initCategorySlider() {
    // Cleanup previous instance
    if (this._sliderCleanup) {
      this._sliderCleanup();
    }

    const track = document.getElementById('categorySliderTrack');
    const wraps = document.querySelectorAll('.category-slider-card-wrap');
    const prevBtn = document.querySelector('.category-slider-arrow--prev');
    const nextBtn = document.querySelector('.category-slider-arrow--next');
    const dots = document.querySelectorAll('.category-slider-dot');
    if (!track || wraps.length === 0) return;

    let rafId = null;
    let autoScrollInterval;
    const total = wraps.length;
    const snapTransitions = []; // store timeout IDs for cleanup

    // --- Apply 3D transforms based on scroll position ---
    function applyTransforms(transitionDuration) {
      const trackRect = track.getBoundingClientRect();
      const containerCenter = trackRect.left + trackRect.width / 2;
      const halfCard = 100; // half of card width (200px / 2)

      wraps.forEach((wrap) => {
        const cardRect = wrap.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = (cardCenter - containerCenter) / halfCard;

        const absDist = Math.abs(distance);
        const clampedDist = Math.min(3, absDist);

        // Rotate Y: up to -45° away from center
        const rotY = -distance * 45;
        const clampedRot = Math.max(-70, Math.min(70, rotY));

        // Scale: center = 1, fade to 0.65 at edges
        const scale = Math.max(0.65, 1 - clampedDist * 0.1);

        // TranslateZ: push back as we get farther from center
        const translateZ = -Math.min(clampedDist * 60, 180);

        // Opacity: fade at extremes
        const opacity = clampedDist <= 1.5 ? 1 : Math.max(0, 1 - (clampedDist - 1.5) * 0.4);

        // Z-index: cards closer to center on top
        const zIndex = Math.round(100 - clampedDist * 20);

        wrap.style.zIndex = zIndex;
        wrap.style.opacity = opacity;

        // Only add transition when snapping (arrows/dots), not during scroll
        if (transitionDuration) {
          wrap.style.transition = `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
          wrap.style.transition = 'none';
        }

        // Apply transforms: translateZ first (push back), then rotateY, then scale
        // Container perspective handles the 3D space
        wrap.style.transform = `translateZ(${translateZ}px) rotateY(${clampedRot}deg) scale(${scale})`;
      });

      // Update active dot based on closest card to center
      let closestIdx = 0;
      let closestDist = Infinity;
      wraps.forEach((wrap, i) => {
        const r = wrap.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - containerCenter);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }

    // --- Throttled scroll handler ---
    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyTransforms();
        rafId = null;
      });
    }

    track.addEventListener('scroll', onScroll, { passive: true });

    // --- Mouse drag/swipe support ---
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    let dragDist = 0;

    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none';
      track.style.userSelect = 'none';
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - dragStartX) * 1.5;
      dragDist = Math.abs(walk);
      track.scrollLeft = dragScrollLeft - walk;
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = '';
      track.style.scrollSnapType = '';
      track.style.userSelect = '';
      // Re-snap after a quick timeout so the snap animation plays
      setTimeout(() => {
        applyTransforms(0.3);
      }, 10);
    }

    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mousemove', onMouseMove);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mouseleave', onMouseUp);

    // Touch support
    function onTouchStart(e) {
      const touch = e.touches[0];
      isDragging = true;
      dragStartX = touch.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      dragDist = 0;
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
    }
    function onTouchMove(e) {
      if (!isDragging) return;
      const touch = e.touches[0];
      const x = touch.pageX - track.offsetLeft;
      dragDist = Math.abs(x - dragStartX);
      track.scrollLeft = dragScrollLeft - (x - dragStartX) * 1.5;
    }
    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.scrollSnapType = '';
      track.style.scrollBehavior = '';
      setTimeout(() => { applyTransforms(0.3); }, 10);
    }
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });

    // Prevent card click when user was dragging (use capture phase to fire before child onclick)
    wraps.forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        if (dragDist > 5) {
          e.stopPropagation();
        }
      }, true);
    });

    // --- Arrow navigation ---
    const onPrev = () => {
      track.scrollBy({ left: -200, behavior: 'smooth' });
      // Add snap transition for smooth transform animation during scroll-snap
      applyTransforms(0.4);
      resetAutoScroll();
    };
    const onNext = () => {
      track.scrollBy({ left: 200, behavior: 'smooth' });
      applyTransforms(0.4);
      resetAutoScroll();
    };
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    // --- Dot navigation ---
    const dotHandlers = [];
    dots.forEach((dot) => {
      const handler = () => {
        const index = parseInt(dot.dataset.index);
        const target = wraps[index];
        if (target) {
          applyTransforms(0.4);
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        resetAutoScroll();
      };
      dot.addEventListener('click', handler);
      dotHandlers.push({ el: dot, handler });
    });

    // --- Keyboard navigation ---
    const onKeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        track.scrollBy({ left: -200, behavior: 'smooth' });
        applyTransforms(0.4);
        resetAutoScroll();
      }
      if (e.key === 'ArrowRight') {
        track.scrollBy({ left: 200, behavior: 'smooth' });
        applyTransforms(0.4);
        resetAutoScroll();
      }
    };
    track.addEventListener('keydown', onKeydown);
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', 'Category carousel');

    // --- Auto-scroll every 5 seconds, wraps to start ---
    function startAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      // Don't auto-scroll if all cards fit in viewport
      if (track.scrollWidth <= track.clientWidth + 1) return;
      autoScrollInterval = setInterval(() => {
        // Check if we're near the end — if so, wrap to first card
        const isNearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 100;
        if (isNearEnd) {
          applyTransforms(0.4);
          wraps[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          applyTransforms(0.4);
          track.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }, 5000);
    }

    function resetAutoScroll() {
      clearInterval(autoScrollInterval);
      startAutoScroll();
    }

    // Pause on hover
    const onMouseEnter = () => clearInterval(autoScrollInterval);
    const onMouseLeave = startAutoScroll;
    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);

    // --- Resize handler ---
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyTransforms();
        rafId = null;
      });
    };
    window.addEventListener('resize', onResize, { passive: true });

    // --- Init ---
    requestAnimationFrame(() => {
      applyTransforms();
    });

    startAutoScroll();

    // --- Store cleanup function ---
    this._sliderCleanup = () => {
      clearInterval(autoScrollInterval);
      if (rafId) cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('keydown', onKeydown);
      track.removeEventListener('mouseenter', onMouseEnter);
      track.removeEventListener('mouseleave', onMouseLeave);
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mousemove', onMouseMove);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mouseleave', onMouseUp);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      dotHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
      window.removeEventListener('resize', onResize);
      snapTransitions.forEach(t => clearTimeout(t));
    };
  }
};
