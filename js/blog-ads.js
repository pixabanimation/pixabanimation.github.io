// ============================================
// blog-ads.js — Dynamic Blog Ad Loader
// Include this on blog pages to render admin-managed ads
// ============================================

const BlogAds = {
  // Initialize — call when DOM is ready
  async init() {
    // Check if Turso client + DB are available (from main site)
    if (typeof DB === 'undefined') {
      // If not on main site (standalone blog page), try to load from embedded config
      this.renderFromConfig();
      return;
    }
    await this.loadFromDatabase();
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

      if (ad1.length > 0) this.renderAd('ad-slot-1', ad1[0]);
      if (ad2.length > 0) this.renderAd('ad-slot-2', ad2[0]);
      if (ad3.length > 0) this.renderAd('ad-slot-3', ad3[0]);
    } catch (error) {
      console.warn('BlogAds: Failed to load from database, using fallback ads.', error);
    }
  },

  // Render an ad into a slot container
  renderAd(slotId, ad) {
    const slot = document.getElementById(slotId);
    if (!slot) return;

    slot.innerHTML = `
      <div class="blog-ad-container">
        <div class="blog-ad-inner">
          <span class="blog-ad-label">Ad</span>
          <div class="blog-ad-content">
            <div class="blog-ad-icon"><i class="fas ${ad.icon || 'fa-cube'}"></i></div>
            <div class="blog-ad-text">
              <h3>${this.escapeHtml(ad.title)}</h3>
              <p>${this.escapeHtml(ad.description)}</p>
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
    if (!config) return;

    const pathParts = window.location.pathname.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'index.html';

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
        this.renderAd(`ad-slot-${type.replace('ad', '')}`, ad);
      }
    });
  },

  // Simple HTML escaping
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BlogAds.init());
} else {
  BlogAds.init();
}
