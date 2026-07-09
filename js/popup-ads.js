// ============================================
// pixabanimation — Popup Ad System
// ============================================

const PopupAds = {
  initialized: false,
  ads: [],
  shownAds: [],
  isShowing: false,

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Don't show popups on admin pages
    if (window.location.hash && window.location.hash.startsWith('#/admin')) return;

    // Check if DB is available
    if (typeof DB === 'undefined' || !DB.init) return;

    // Wait a bit for the page to fully load before showing popups
    setTimeout(() => this.showPopups(), 2000);
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
      const allAds = await DB.getPopupAds(true);
      // Shuffle 4 times (randomize order)
      let shuffled = this.shuffleArray(allAds);
      shuffled = this.shuffleArray(shuffled);
      shuffled = this.shuffleArray(shuffled);
      shuffled = this.shuffleArray(shuffled);
      this.ads = shuffled;
      return this.ads;
    } catch (error) {
      console.warn('PopupAds: Failed to load ads', error);
      return [];
    }
  },

  getVisitGroup() {
    // Use localStorage to track visit groups
    const key = 'pixab_popup_visit';
    let visitData = localStorage.getItem(key);
    
    if (!visitData) {
      // First visit ever -> show group A (first 2 ads)
      const data = { group: 'A', count: 1 };
      localStorage.setItem(key, JSON.stringify(data));
      return 'A';
    }

    try {
      const data = JSON.parse(visitData);
      const newCount = data.count + 1;
      
      if (data.group === 'A') {
        // Next visit -> show group B (other 2 ads)
        const newData = { group: 'B', count: newCount };
        localStorage.setItem(key, JSON.stringify(newData));
        return 'B';
      } else {
        // After group B -> reset to group A for the next round
        const newData = { group: 'A', count: newCount };
        localStorage.setItem(key, JSON.stringify(newData));
        return 'A';
      }
    } catch (e) {
      // Fallback
      const data = { group: 'A', count: 1 };
      localStorage.setItem(key, JSON.stringify(data));
      return 'A';
    }
  },

  async showPopups() {
    // Guard against concurrent calls — set isShowing BEFORE the await
    if (this.isShowing) return;
    this.isShowing = true;

    const ads = await this.loadAds();
    if (ads.length < 2) {
      console.warn('PopupAds: Need at least 2 active ads');
      this.isShowing = false;
      return;
    }

    // Assign ads to groups without duplicates
    const shuffled = [...ads];
    const groupA = shuffled.slice(0, Math.min(2, shuffled.length));
    
    // Build groupB from remaining ads, avoiding duplicates with groupA
    const remaining = shuffled.filter(ad => !groupA.find(a => a.id === ad.id));
    let groupB = [];
    if (remaining.length >= 2) {
      groupB = remaining.slice(0, 2);
    } else {
      // Not enough unique ads for groupB — reuse groupA's ads
      groupB = [...groupA];
    }

    const visitGroup = this.getVisitGroup();
    const popupsToShow = visitGroup === 'A' ? groupA : groupB;

    if (popupsToShow.length === 0) {
      this.isShowing = false;
      return;
    }

    this.shownAds = popupsToShow;

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
    if (!container) return;

    const isAnimated = ad.is_animated;
    const bgColor = ad.bg_color || '#0066cc';
    const icon = ad.icon || 'fa-bullhorn';
    const imageUrl = ad.image_url;

    // 900x300 horizontal banner layout at the bottom
    const popupContent = `
      <div class="popup-ad-inner" style="background:${bgColor}">
        <div class="popup-ad-bg-pattern"></div>
        <button class="popup-ad-close" onclick="PopupAds.closePopup(${index})" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        <div class="popup-ad-body">
          ${imageUrl ? `<img src="${imageUrl}" alt="" class="popup-ad-image" onerror="this.style.display='none'">` : `<div class="popup-ad-icon-circle"><i class="fas ${icon}"></i></div>`}
          <div class="popup-ad-content">
            <div class="popup-ad-badge">${ad.is_animated ? '⚡ Limited Offer' : '🎯 Promotion'}</div>
            <h3 class="popup-ad-title">${this.escapeHtml(ad.title)}</h3>
            <p class="popup-ad-desc">${this.escapeHtml(ad.description)}</p>
          </div>
          <a href="${this.escapeHtml(ad.cta_url)}" class="popup-ad-cta" target="_blank" onclick="PopupAds.closePopup(${index})" rel="noopener">
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
    if (isAnimated) {
      this.animateCountdown(index, 10); // 10 seconds auto-close
    } else {
      this.animateCountdown(index, 15); // 15 seconds for non-animated
    }

    // Auto advance to next popup after timing out
    this._popupTimeout = setTimeout(() => {
      this.closePopup(index, true);
    }, isAnimated ? 10000 : 15000);
  },

  animateCountdown(index, duration) {
    const progressBar = document.getElementById(`popupAdProgress${index}`);
    if (!progressBar) return;

    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    
    // Force reflow
    void progressBar.offsetWidth;
    
    progressBar.style.transition = `width ${duration}s linear`;
    progressBar.style.width = '0%';
  },

  closePopup(index, auto = false) {
    const container = document.getElementById('popupAdContainer');
    if (!container) return;

    // Clear the auto-advance timeout
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
        }, 500);
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
