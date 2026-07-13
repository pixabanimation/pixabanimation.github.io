// ============================================
// blog-ads.js — Dynamic Blog Ad Loader (Redesigned)
// Ads: Top (after cover), Mid-article, Bottom, Sidebar (single)
// ============================================

const BlogAds = {
  defaultAds: {
    top: {
      title: 'Premium Motion Graphics Assets',
      description: 'Level up your projects with professional motion graphics, stock footage, and After Effects templates used by top creators worldwide.',
      cta_text: 'Browse Shop',
      cta_url: 'https://pixabanimation.github.io/#/shop',
      icon: 'fa-cube'
    },
    mid: {
      title: 'Exclusive After Effects Plugins',
      description: 'Streamline your workflow with powerful AE plugins built for motion designers. Save hours on every project.',
      cta_text: 'Explore Plugins',
      cta_url: 'https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins',
      icon: 'fa-plug'
    },
    bottom: {
      title: 'Join the Creative Community',
      description: 'Subscribe to get early access to new releases, subscriber-only discounts, and creative inspiration delivered to your inbox.',
      cta_text: 'Subscribe Now',
      cta_url: 'https://pixabanimation.github.io/#/shop',
      icon: 'fa-envelope'
    },
    sidebar: {
      title: 'Premium Animation Assets',
      description: '4000+ professional 4K motion backgrounds and templates for editors and designers.',
      cta_text: 'Browse Collection',
      cta_url: 'https://pixabanimation.github.io/#/shop',
      icon: 'fa-film'
    }
  },

  async init() {
    if (typeof DB === 'undefined' || !DB.init) {
      this.injectAdSlots();
      this.renderFallbackAds();
      return;
    }
    try {
      await this.loadFromDatabase();
    } catch (error) {
      console.warn('BlogAds: DB unavailable, using fallback ads.', error);
      this.injectAdSlots();
      this.renderFallbackAds();
    }
  },

  // Dynamically inject ad slot containers into the page
  injectAdSlots() {
    const article = document.querySelector('article');
    const blogContent = document.querySelector('.blog-content');
    const sidebar = document.querySelector('.sidebar');

    if (article && !document.getElementById('blog-ad-top')) {
      // Top ad: after mobile TOC or after cover image
      const topTarget = article.querySelector('.mobile-toc') || article.querySelector('.blog-cover');
      if (topTarget) {
        const topSlot = document.createElement('div');
        topSlot.id = 'blog-ad-top';
        topSlot.className = 'blog-ad-slot blog-ad-slot-top';
        topTarget.insertAdjacentElement('afterend', topSlot);
      }
    }

    if (blogContent && !document.getElementById('blog-ad-mid')) {
      // Mid-article ad: after the 2nd h2
      const h2s = blogContent.querySelectorAll('h2');
      if (h2s.length >= 2) {
        const midSlot = document.createElement('div');
        midSlot.id = 'blog-ad-mid';
        midSlot.className = 'blog-ad-slot blog-ad-slot-mid';
        h2s[1].insertAdjacentElement('afterend', midSlot);
      } else if (h2s.length === 1) {
        // Only 1 h2: place after it
        const midSlot = document.createElement('div');
        midSlot.id = 'blog-ad-mid';
        midSlot.className = 'blog-ad-slot blog-ad-slot-mid';
        h2s[0].insertAdjacentElement('afterend', midSlot);
      }
    }

    // Bottom ad: use existing ad-slot-1-article or create one
    if (article && !document.getElementById('blog-ad-bottom')) {
      const existing = document.getElementById('ad-slot-1-article');
      if (existing) {
        existing.id = 'blog-ad-bottom';
        existing.className = 'blog-ad-slot blog-ad-slot-bottom';
      } else {
        const bottomTarget = article.querySelector('.author-bio') || article.querySelector('.tags-section');
        if (bottomTarget) {
          const bottomSlot = document.createElement('div');
          bottomSlot.id = 'blog-ad-bottom';
          bottomSlot.className = 'blog-ad-slot blog-ad-slot-bottom';
          bottomTarget.insertAdjacentElement('afterend', bottomSlot);
        }
      }
    }

    // Sidebar: single ad slot
    if (sidebar) {
      const sidebarSection = sidebar.querySelector('.sidebar-section:last-child');
      if (sidebarSection && !document.getElementById('blog-ad-sidebar')) {
        const title = sidebarSection.querySelector('.sidebar-title');
        if (title && title.textContent.includes('Sponsored')) {
          // Clear existing ad slots in this section
          const existingSlots = sidebarSection.querySelectorAll('[id^="ad-slot-"]');
          existingSlots.forEach(s => s.remove());

          const sidebarSlot = document.createElement('div');
          sidebarSlot.id = 'blog-ad-sidebar';
          sidebarSlot.className = 'blog-ad-slot blog-ad-slot-sidebar';
          sidebarSection.appendChild(sidebarSlot);
        }
      }
    }
  },

  renderFallbackAds() {
    this.renderAd('blog-ad-top', this.defaultAds.top);
    this.renderAd('blog-ad-mid', this.defaultAds.mid);
    this.renderAd('blog-ad-bottom', this.defaultAds.bottom);
    this.renderAd('blog-ad-sidebar', this.defaultAds.sidebar);
  },

  async loadFromDatabase() {
    try {
      const pathParts = window.location.pathname.split('/');
      const currentPage = pathParts[pathParts.length - 1] || 'index.html';

      const [ad1, ad2, ad3] = await Promise.all([
        DB.getActiveAdsForPage(currentPage, 'ad1'),
        DB.getActiveAdsForPage(currentPage, 'ad2'),
        DB.getActiveAdsForPage(currentPage, 'ad3')
      ]);

      this.injectAdSlots();

      let loaded = false;

      // Ad1 → Top of article
      if (ad1.length > 0) {
        this.renderAd('blog-ad-top', ad1[0]);
        loaded = true;
      }
      // Ad2 → Mid-article
      if (ad2.length > 0) {
        this.renderAd('blog-ad-mid', ad2[0]);
        loaded = true;
      }
      // Ad3 → Bottom of article + Sidebar (same ad)
      if (ad3.length > 0) {
        this.renderAd('blog-ad-bottom', ad3[0]);
        this.renderAd('blog-ad-sidebar', ad3[0]);
        loaded = true;
      } else if (ad1.length > 0) {
        // Fallback: use ad1 for sidebar if no ad3
        this.renderAd('blog-ad-sidebar', ad1[0]);
      }

      if (!loaded) {
        this.renderFallbackAds();
      }
    } catch (error) {
      console.warn('BlogAds: Failed to load from database, using fallback ads.', error);
      this.injectAdSlots();
      this.renderFallbackAds();
    }
  },

  renderAd(slotId, ad) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    if (slot.dataset.rendered) return;
    slot.dataset.rendered = '1';

    const isSidebar = slotId.includes('sidebar');

    if (isSidebar) {
      // Sidebar ad: compact vertical layout
      slot.innerHTML = `
        <div class="blog-ad-container blog-ad-sidebar">
          <div class="blog-ad-inner">
            <span class="blog-ad-label">Ad</span>
            <div class="blog-ad-content" style="flex-direction:column;text-align:center;gap:16px">
              <div class="blog-ad-icon"><i class="fas ${this.escapeHtml(ad.icon || 'fa-cube')}"></i></div>
              <div class="blog-ad-text" style="text-align:center">
                <h3>${this.escapeHtml(ad.title)}</h3>
                <p>${this.escapeHtml(ad.description || '')}</p>
              </div>
              <a href="${this.escapeHtml(ad.cta_url || 'https://pixabanimation.github.io/#/shop')}" class="blog-ad-cta" style="justify-content:center">
                ${this.escapeHtml(ad.cta_text || 'Learn More')} <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      // Article ads: horizontal layout
      slot.innerHTML = `
        <div class="blog-ad-container">
          <div class="blog-ad-inner">
            <span class="blog-ad-label">Ad</span>
            <div class="blog-ad-content">
              <div class="blog-ad-icon"><i class="fas ${this.escapeHtml(ad.icon || 'fa-cube')}"></i></div>
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
    }
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => BlogAds.init(), 100);
  });
} else {
  setTimeout(() => BlogAds.init(), 100);
}
