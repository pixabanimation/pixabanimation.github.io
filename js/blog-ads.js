// ============================================
// blog-ads.js — Dynamic Blog Ad Loader
// Include this on blog pages to render admin-managed ads
// ============================================

const BlogAds = {
  // Default fallback ads — used when DB is unavailable
  defaultAds: {
    ad1: [{
      title: 'Premium Motion Graphics Assets',
      description: 'Level up your projects with professional motion graphics, stock footage, and After Effects templates used by top creators worldwide.',
      cta_text: 'Browse Shop',
      cta_url: 'https://pixabanimation.github.io/#/shop',
      icon: 'fa-cube'
    }],
    ad2: [{
      title: 'Exclusive After Effects Plugins',
      description: 'Streamline your workflow with powerful AE plugins built for motion designers. Save hours on every project.',
      cta_text: 'Explore Plugins',
      cta_url: 'https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins',
      icon: 'fa-plug'
    }],
    ad3: [{
      title: 'Join the Creative Community',
      description: 'Subscribe to get early access to new releases, subscriber-only discounts, and creative inspiration delivered to your inbox.',
      cta_text: 'Subscribe Now',
      cta_url: '#',
      icon: 'fa-envelope'
    }]
  },

  // Initialize — call when DOM is ready
  async init() {
    // Check if Turso client + DB are available (from main site)
    if (typeof DB === 'undefined' || !DB.init) {
      // Standalone blog page — use fallback ads
      this.renderFallbackAds();
      return;
    }
    try {
      await this.loadFromDatabase();
    } catch (error) {
      console.warn('BlogAds: DB unavailable, using fallback ads.', error);
      this.renderFallbackAds();
    }
  },

  // Render built-in fallback ads (no DB required)
  renderFallbackAds() {
    this.renderAd('ad-slot-1', this.defaultAds.ad1[0]);        // sidebar
    this.renderAd('ad-slot-1-article', this.defaultAds.ad1[0]); // article
    this.renderAd('ad-slot-2', this.defaultAds.ad2[0]);        // sidebar
    this.renderAd('ad-slot-2-article', this.defaultAds.ad2[0]); // article
    this.renderAd('ad-slot-3', this.defaultAds.ad3[0]);        // sidebar
    this.renderAd('ad-slot-3-article', this.defaultAds.ad3[0]); // article
  },

  // Load ads from the Turso database (when available on main site)
  async loadFromDatabase() {
    try {
      // Get current page filename from URL
      const pathParts = window.location.pathname.split('/');
      const currentPage = pathParts[pathParts.length - 1] || 'index.html';

      // Fetch active ads for this page by position
      const [ad1, ad2, ad3] = await Promise.all([
        DB.getActiveAdsForPage(currentPage, 'ad1'),
        DB.getActiveAdsForPage(currentPage, 'ad2'),
        DB.getActiveAdsForPage(currentPage, 'ad3')
      ]);

      // Track whether any ads were loaded
      let loaded = false;

      // Render each ad to both the sidebar slot and the in-article slot
      if (ad1.length > 0) {
        this.renderAd('ad-slot-1', ad1[0]);
        this.renderAd('ad-slot-1-article', ad1[0]);
        loaded = true;
      }
      if (ad2.length > 0) {
        this.renderAd('ad-slot-2', ad2[0]);
        this.renderAd('ad-slot-2-article', ad2[0]);
        loaded = true;
      }
      if (ad3.length > 0) {
        this.renderAd('ad-slot-3', ad3[0]);
        this.renderAd('ad-slot-3-article', ad3[0]);
        loaded = true;
      }

      // If no DB ads found, fall back to defaults
      if (!loaded) {
        this.renderFallbackAds();
      }
    } catch (error) {
      console.warn('BlogAds: Failed to load from database, using fallback ads.', error);
      this.renderFallbackAds();
    }
  },

  // Render an ad into a slot container
  renderAd(slotId, ad) {
    const slot = document.getElementById(slotId);
    if (!slot) return;

    // Prevent double-render
    if (slot.dataset.rendered) return;
    slot.dataset.rendered = '1';

    slot.innerHTML = `
      <div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas ${ad.icon || 'fa-cube'}"></i></div>
            <div class="blog-ad-text">
              <h3>${this.escapeHtml(ad.title)}</h3>
              <p>${this.escapeHtml(ad.description || '')}</p>
              <a href="${this.escapeHtml(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="blog-ad-cta">
                ${this.escapeHtml(ad.cta_text || 'Learn More')} <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Render from window.__BLOG_ADS_CONFIG if available (fallback for standalone pages)
  renderFromConfig() {
    const config = window.__BLOG_ADS_CONFIG;
    if (!config) {
      this.renderFallbackAds();
      return;
    }

    const pathParts = window.location.pathname.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'index.html';

    let loaded = false;
    ['ad1', 'ad2', 'ad3'].forEach(type => {
      const ads = config[type] || [];
      const ad = ads.find(a => {
        if (a.target_pages === 'all') return true;
        try {
          return JSON.parse(a.target_pages).includes(currentPage);
        } catch {
          return false;
        }
      });
      if (ad) {
        const num = type.replace('ad', '');
        this.renderAd(`ad-slot-${num}`, ad);
        this.renderAd(`ad-slot-${num}-article`, ad);
        loaded = true;
      }
    });

    if (!loaded) {
      this.renderFallbackAds();
    }
  },

  // Simple HTML escaping
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};

// Auto-initialize when DOM is ready — wait for full page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => BlogAds.init(), 100);
  });
} else {
  setTimeout(() => BlogAds.init(), 100);
}

