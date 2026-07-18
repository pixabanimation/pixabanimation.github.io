// ============================================
// pixabanimation — Popup Ad System (Redesigned)
// ============================================

const PopupAds = {
  initialized: false,
  ads: [],
  shownAds: [],
  isShowing: false,
  _popupTimeout: null,
  _dbReady: false,

  // Built-in fallback popup ads
  defaultPopupAds: [
    {
      id: 'fallback-1',
      title: 'Premium Animation Assets',
      description: 'Discover professional motion graphics, stock footage, and After Effects templates for your next creative project.',
      cta_text: 'Browse Shop',
      cta_url: 'https://pixabanimation.github.io/#/shop',
      icon: 'fa-cube',
      bg_color: '#0066cc',
      is_animated: 1,
      is_active: 1
    },
    {
      id: 'fallback-2',
      title: 'Unlock Creative Potential',
      description: 'Join thousands of creators using PixabAnimation assets. Early access, exclusive discounts, and inspiration await.',
      cta_text: 'Learn More',
      cta_url: 'https://pixabanimation.github.io/#/about',
      icon: 'fa-star',
      bg_color: '#5856d6',
      is_animated: 1,
      is_active: 1
    }
  ],

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Don't show popups on admin pages or homepage
    if (window.location.hash && window.location.hash.startsWith('#/admin')) return;
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#') return;

    // Wait for DB to be ready (the <script type="module"> loads async)
    await this._waitForDB();

    // Show popups after page loads
    setTimeout(() => this.showPopups(), 2500);
  },

  // Wait for DB client to be initialized (handles async module loading)
  async _waitForDB(maxWait = 5000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      if (typeof DB !== 'undefined' && DB.client) {
        this._dbReady = true;
        return;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    console.warn('PopupAds: DB not ready after waiting, will use fallback ads');
  },

  // Fisher-Yates shuffle
  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  async loadAds() {
    try {
      if (this._dbReady && typeof DB !== 'undefined' && DB.client) {
        const allAds = await DB.getPopupAds(true);
        if (allAds && allAds.length > 0) {
          this.ads = this.shuffleArray(allAds);
          return this.ads;
        }
      }
      // Fall back to default ads
      console.log('PopupAds: Using built-in fallback ads');
      this.ads = this.shuffleArray(this.defaultPopupAds);
      return this.ads;
    } catch (error) {
      console.warn('PopupAds: Failed to load ads, using defaults', error);
      this.ads = this.shuffleArray(this.defaultPopupAds);
      return this.ads;
    }
  },

  getVisitGroup() {
    const key = 'pixab_popup_visit';
    let visitData = localStorage.getItem(key);

    if (!visitData) {
      const data = { group: 'A', count: 1 };
      localStorage.setItem(key, JSON.stringify(data));
      return 'A';
    }

    try {
      const data = JSON.parse(visitData);
      const newCount = data.count + 1;

      if (data.group === 'A') {
        localStorage.setItem(key, JSON.stringify({ group: 'B', count: newCount }));
        return 'B';
      } else {
        localStorage.setItem(key, JSON.stringify({ group: 'A', count: newCount }));
        return 'A';
      }
    } catch (e) {
      localStorage.setItem(key, JSON.stringify({ group: 'A', count: 1 }));
      return 'A';
    }
  },

  async showPopups() {
    if (this.isShowing) return;
    this.isShowing = true;

    const ads = await this.loadAds();
    if (ads.length === 0) {
      this.isShowing = false;
      return;
    }

    // Split into groups for alternating visits
    let groupA, groupB;
    if (ads.length === 1) {
      // Single ad: show it every visit
      groupA = [ads[0]];
      groupB = [ads[0]];
    } else if (ads.length === 2) {
      groupA = [ads[0]];
      groupB = [ads[1]];
    } else {
      const mid = Math.ceil(ads.length / 2);
      groupA = ads.slice(0, mid);
      groupB = ads.slice(mid);
    }

    const visitGroup = this.getVisitGroup();
    this.shownAds = visitGroup === 'A' ? groupA : groupB;

    if (this.shownAds.length === 0) {
      this.isShowing = false;
      return;
    }

    // Show first popup after a delay
    setTimeout(() => {
      this.showPopup(0);
    }, 1500);
  },

  showPopup(index) {
    if (index >= this.shownAds.length) {
      this.isShowing = false;
      return;
    }

    const ad = this.shownAds[index];
    const container = document.getElementById('popupAdContainer');
    if (!container) {
      this.isShowing = false;
      return;
    }

    const isAnimated = ad.is_animated;
    const bgColor = ad.bg_color || '#0066cc';
    const icon = ad.icon || 'fa-bullhorn';
    const imageUrl = ad.image_url;

    // Build animated title words
    const titleWords = (ad.title || 'Special Offer').split(' ');
    const animatedTitle = titleWords.map((w, i) =>
      `<span class="popup-ad-word" style="animation-delay:${i * 0.12}s">${this.escapeHtml(w)}</span>`
    ).join(' ');

    const popupContent = `
      <div class="popup-ad-inner" style="background:${bgColor}">
        <div class="popup-ad-bg-pattern"></div>
        <div class="popup-ad-glow"></div>
        <button class="popup-ad-close" onclick="PopupAds.closePopup(${index})" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        <div class="popup-ad-body">
          ${imageUrl
            ? `<img src="${this.escapeHtml(imageUrl)}" alt="" class="popup-ad-image" onerror="this.style.display='none'">`
            : `<div class="popup-ad-icon-circle"><i class="fas ${this.escapeHtml(icon)}"></i></div>`
          }
          <div class="popup-ad-content">
            <div class="popup-ad-badge">${isAnimated ? '<i class="fas fa-bolt"></i> Limited Offer' : '<i class="fas fa-tag"></i> Promotion'}</div>
            <h3 class="popup-ad-title">${animatedTitle}</h3>
            <p class="popup-ad-desc">${this.escapeHtml(ad.description || '')}</p>
          </div>
          <a href="${this.escapeHtml(ad.cta_url || '#/shop')}" class="popup-ad-cta" onclick="PopupAds.closePopup(${index})" rel="noopener">
            ${this.escapeHtml(ad.cta_text || 'Learn More')} <i class="fas fa-arrow-right"></i>
          </a>
        </div>
        <div class="popup-ad-progress" id="popupAdProgress${index}"></div>
      </div>
    `;

    container.innerHTML = popupContent;
    container.classList.remove('popup-ad-exit');

    // Force reflow for animation
    void container.offsetWidth;

    container.classList.add('popup-ad-active');

    // Animate countdown timer
    const duration = isAnimated ? 10 : 15;
    this.animateCountdown(index, duration);

    // Auto advance to next popup
    this._popupTimeout = setTimeout(() => {
      this.closePopup(index, true);
    }, duration * 1000);
  },

  animateCountdown(index, duration) {
    const progressBar = document.getElementById(`popupAdProgress${index}`);
    if (!progressBar) return;

    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${duration}s linear`;
    progressBar.style.width = '0%';
  },

  closePopup(index, auto = false) {
    const container = document.getElementById('popupAdContainer');
    if (!container) return;

    if (this._popupTimeout) {
      clearTimeout(this._popupTimeout);
      this._popupTimeout = null;
    }

    container.classList.add('popup-ad-exit');

    setTimeout(() => {
      container.classList.remove('popup-ad-active');
      container.innerHTML = '';

      // Show next popup
      const nextIndex = index + 1;
      if (nextIndex < this.shownAds.length) {
        setTimeout(() => {
          this.showPopup(nextIndex);
        }, 600);
      } else {
        this.isShowing = false;
      }
    }, 400);
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PopupAds.init());
} else {
  PopupAds.init();
}
