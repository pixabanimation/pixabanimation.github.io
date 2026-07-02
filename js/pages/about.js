// ============================================
// PixabAnimation — About Page
// ============================================

const AboutPage = {
  render() {
    const content = document.getElementById('pageContent');

    content.innerHTML = `
      <div class="about-page page-enter">
        <div class="about-hero" style="text-align:center;padding:60px 24px;max-width:800px;margin:0 auto">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:20px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
            <span class="ds-caption" style="font-weight:500;color:var(--ds-primary)">Our Story</span>
          </div>
          <h1 class="ds-display-lg" style="color:#fff;margin-bottom:16px">
            Where <span class="text-gradient">Creativity</span> Meets Motion
          </h1>
          <p class="ds-body" style="color:rgba(255,255,255,0.6);max-width:640px;margin:0 auto">
            At PixabAnimation, we believe every creator deserves access to premium animation assets that bring their vision to life. 
            Founded in 2024, our marketplace curates the finest 4K video clips, motion graphics, design templates, and animation resources 
            from top artists around the world. From indie filmmakers to major production studios — we power the stories that move us.
          </p>
        </div>

        <div class="about-values" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;max-width:var(--max-width);margin:0 auto;padding:40px 24px">
          <div class="value-card" style="padding:32px 24px;text-align:center;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
            <div style="width:48px;height:48px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--ds-primary)">
              <i class="fas fa-gem"></i>
            </div>
            <h3 class="ds-body-strong" style="margin-bottom:8px;color:#fff">Premium Quality</h3>
            <p class="ds-caption" style="color:rgba(255,255,255,0.5);line-height:1.6">Every asset is hand-curated and tested to ensure 4K resolution, professional-grade quality, and seamless integration with your workflow.</p>
          </div>
          <div class="value-card" style="padding:32px 24px;text-align:center;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
            <div style="width:48px;height:48px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--ds-primary)">
              <i class="fas fa-leaf"></i>
            </div>
            <h3 class="ds-body-strong" style="margin-bottom:8px;color:#fff">Creator-First</h3>
            <p class="ds-caption" style="color:rgba(255,255,255,0.5);line-height:1.6">We partner with independent artists and studios worldwide, ensuring fair compensation and a diverse, ever-growing library of original content.</p>
          </div>
          <div class="value-card" style="padding:32px 24px;text-align:center;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
            <div style="width:48px;height:48px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--ds-primary)">
              <i class="fas fa-rocket"></i>
            </div>
            <h3 class="ds-body-strong" style="margin-bottom:8px;color:#fff">Instant Access</h3>
            <p class="ds-caption" style="color:rgba(255,255,255,0.5);line-height:1.6">Download your purchases instantly in full resolution. No watermarks, no delays. Start creating the moment you buy.</p>
          </div>
          <div class="value-card" style="padding:32px 24px;text-align:center;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
            <div style="width:48px;height:48px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--ds-primary)">
              <i class="fas fa-heart"></i>
            </div>
            <h3 class="ds-body-strong" style="margin-bottom:8px;color:#fff">Community Driven</h3>
            <p class="ds-caption" style="color:rgba(255,255,255,0.5);line-height:1.6">Join a thriving community of 10,000+ creators. Share your work, get inspired, and grow your craft with PixabAnimation.</p>
          </div>
        </div>

        <div style="max-width:var(--max-width);margin:40px auto;padding:0 24px">
          <div class="glass" style="padding:48px;text-align:center;border:1px solid rgba(255,255,255,0.06);border-radius:14px">
            <h2 class="ds-display-md" style="color:#fff;margin-bottom:24px">
              <span class="text-gradient">Numbers</span> Speak Louder
            </h2>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:600px;margin:0 auto">
              <div>
                <div style="font-family:var(--font-display);font-size:2rem;font-weight:600;color:var(--ds-primary)">10K+</div>
                <div class="ds-caption" style="color:rgba(255,255,255,0.4)">Happy Creators</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:2rem;font-weight:600;color:var(--ds-primary)">500+</div>
                <div class="ds-caption" style="color:rgba(255,255,255,0.4)">Premium Assets</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:2rem;font-weight:600;color:var(--ds-primary)">50+</div>
                <div class="ds-caption" style="color:rgba(255,255,255,0.4)">Artist Partners</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:2rem;font-weight:600;color:var(--ds-primary)">4K</div>
                <div class="ds-caption" style="color:rgba(255,255,255,0.4)">Ultra HD Quality</div>
              </div>
            </div>
          </div>
        </div>

        <div style="max-width:var(--max-width);margin:40px auto;padding:0 24px 60px;text-align:center">
          <h2 class="ds-display-md" style="color:#fff;margin-bottom:12px">Ready to Elevate Your Creative Projects?</h2>
          <p class="ds-body" style="color:rgba(255,255,255,0.5);margin-bottom:24px">Join thousands of creators who trust PixabAnimation for their animation and design needs.</p>
          <a href="#/shop" class="ds-pill-cta" style="padding:12px 28px;font-size:15px">
            <i class="fas fa-store"></i> Explore Assets
          </a>
        </div>
      </div>
    `;
  }
};
