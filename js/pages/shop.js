// ============================================
// pixabanimation - Shop Page (Premium Redesign)
// ============================================

const ShopPage = {
  loadedCount: 0,
  currentFilters: null,
  currentCategoryName: '',
  searchHighlightIndex: -1,
  searchRequestId: 0,
  searchDebounceTimer: null,
  shopSearchOutsideHandler: null,

  escapeAttr(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  async render(params) {
    const content = document.getElementById('pageContent');
    const { query } = params;
    const categorySlug = query.category || '';
    const searchQuery = query.search || '';
    const sortBy = query.sort || 'newest';

    // Store current category name for display
    this.currentCategoryName = categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    content.innerHTML = `
      <div class="shop-page-premium">
        <!-- Shop Hero -->
        <div class="shop-hero page-enter">
          <div class="shop-hero-inner">
            <div class="shop-hero-copy">
              <div class="shop-hero-badge">
                <i class="fas fa-gem"></i>
                ${categorySlug ? this.currentCategoryName : 'PixabAnimation Marketplace'}
              </div>
              <h1 class="shop-hero-title">
                ${categorySlug
                  ? `${this.currentCategoryName} for polished productions`
                  : 'Premium motion assets for decisive edits'
                }
              </h1>
              <p class="shop-hero-desc">
                ${categorySlug
                  ? `Browse hand-picked ${this.currentCategoryName.toLowerCase()} assets built for editors, motion designers, and production teams.`
                  : 'Curated animation templates, video backgrounds, mockups, and creative packs with instant access for professional work.'
                }
              </p>
              <div class="shop-hero-stats" aria-label="Marketplace highlights">
                <span><strong>4K</strong><small>ready visuals</small></span>
                <span><strong>Instant</strong><small>download flow</small></span>
                <span><strong>Pro</strong><small>creator license</small></span>
              </div>
            </div>

            <div class="shop-hero-gallery" aria-hidden="true">
              <div class="shop-visual-card shop-visual-card-main">
                <img src="assets/images/Animated-Background-Stock-Video-Footage-for-Premium-Download.jpg" alt="">
                <span>Motion Background</span>
              </div>
              <div class="shop-visual-card">
                <img src="assets/images/news-background-animation.jpg" alt="">
                <span>Broadcast Pack</span>
              </div>
              <div class="shop-visual-card">
                <img src="assets/images/infographic.jpg" alt="">
                <span>Infographic Kit</span>
              </div>
              <div class="shop-visual-card">
                <img src="assets/images/iphone-mockup.jpg" alt="">
                <span>Device Mockup</span>
              </div>
            </div>

            <div class="shop-category-chips" id="shopCategoryChips">
              <span class="shop-category-label">Quick filter</span>
            </div>
          </div>
        </div>

        <!-- Sticky Filter Toolbar -->
        <div class="shop-toolbar" id="shopToolbar">
          <div class="shop-toolbar-inner">
            <div class="shop-toolbar-search">
              <i class="fas fa-search"></i>
              <input type="search" id="shopSearchInput" value="${this.escapeAttr(searchQuery)}"
                     placeholder="Search templates, clips, mockups..." aria-label="Search products"
                     autocomplete="off" aria-autocomplete="list" aria-expanded="false"
                     aria-controls="shopSearchSuggestions">
              <div class="shop-search-suggestions" id="shopSearchSuggestions" role="listbox"
                   aria-label="Search suggestions" hidden></div>
            </div>
            <div class="shop-toolbar-left">
              <select class="shop-filter-select" id="filterCategory" onchange="ShopPage.applyFilters()" aria-label="Filter by category">
                <option value="">All Categories</option>
              </select>
              <select class="shop-filter-select" id="filterSort" onchange="ShopPage.applyFilters()" aria-label="Sort products">
                <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest</option>
                <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
                <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Name (A-Z)</option>
              </select>
            </div>
            <div class="shop-toolbar-right">
              <button class="shop-clear-filters" id="shopClearFilters" style="${categorySlug || searchQuery || sortBy !== 'newest' ? '' : 'display:none'}"
                      onclick="ShopPage.clearFilters()">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
          </div>
          <!-- Active filter tags -->
          <div class="shop-filter-tags" id="shopFilterTags"></div>
        </div>

        <!-- Products Section -->
        <div class="shop-section">
          <div class="shop-toolbar-top">
            <div class="shop-results" id="shopResults">
              <span class="shop-results-kicker">Marketplace</span>
              <strong>Loading</strong> assets...
            </div>
          </div>
          <div id="shopGrid">${Components.loadingSkeleton(8)}</div>
          <div class="shop-load-more" id="shopLoadMoreContainer" style="display:none">
            <button class="shop-load-more-btn" id="shopLoadMoreBtn" onclick="ShopPage.loadMore()">
              <i class="fas fa-cog shop-load-more-spinner" id="shopLoadMoreSpinner"></i>
              <i class="fas fa-chevron-down"></i>
              Load More Assets
            </button>
          </div>
        </div>

        <!-- SEO Structured Data -->
        <script type="application/ld+json" id="shopStructuredData">${this.buildStructuredData(categorySlug, searchQuery, sortBy)}<\/script>
      </div>
    `;

    // Scroll event for toolbar shadow
    this.toolbarScrollHandler = () => {
      const toolbar = document.getElementById('shopToolbar');
      if (toolbar) {
        toolbar.classList.toggle('scrolled', window.scrollY > 280);
      }
    };
    window.addEventListener('scroll', this.toolbarScrollHandler);

    // Search autocomplete: suggestions appear while typing; navigation waits for click or Enter.
    const searchInput = document.getElementById('shopSearchInput');
    const suggestionsEl = document.getElementById('shopSearchSuggestions');
    searchInput?.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      clearTimeout(this.searchDebounceTimer);
      this.searchHighlightIndex = -1;
      if (query.length < 2) {
        this.closeShopSearchSuggestions();
        return;
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.renderShopSearchSuggestions(query);
      }, 180);
    });

    searchInput?.addEventListener('keydown', (event) => {
      const items = suggestionsEl?.querySelectorAll('[data-shop-suggestion-index]');
      const totalItems = items?.length || 0;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!suggestionsEl || suggestionsEl.hidden) this.renderShopSearchSuggestions(searchInput.value.trim());
          if (totalItems > 0) this.setShopSearchHighlight(this.searchHighlightIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!suggestionsEl || suggestionsEl.hidden) this.renderShopSearchSuggestions(searchInput.value.trim());
          if (totalItems > 0) this.setShopSearchHighlight(this.searchHighlightIndex - 1);
          break;
        case 'Enter':
          event.preventDefault();
          if (this.searchHighlightIndex >= 0 && items?.[this.searchHighlightIndex]) {
            items[this.searchHighlightIndex].click();
          } else {
            this.applyFilters();
            this.closeShopSearchSuggestions();
          }
          break;
        case 'Escape':
          this.closeShopSearchSuggestions();
          searchInput.blur();
          break;
        default:
          this.searchHighlightIndex = -1;
      }
    });

    searchInput?.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) {
        this.renderShopSearchSuggestions(searchInput.value.trim());
      }
    });

    this.shopSearchOutsideHandler = (event) => {
      const searchWrap = document.querySelector('.shop-toolbar-search');
      if (searchWrap && !searchWrap.contains(event.target)) {
        this.closeShopSearchSuggestions();
      }
    };
    document.addEventListener('click', this.shopSearchOutsideHandler);

    // Load categories into chips and filter dropdown
    try {
      const categories = await DB.getCategories();
      const chipsContainer = document.getElementById('shopCategoryChips');
      const select = document.getElementById('filterCategory');

      categories.forEach(cat => {
        // Add to filter dropdown
        const option = document.createElement('option');
        option.value = cat.slug;
        option.textContent = cat.name;
        if (cat.slug === categorySlug) option.selected = true;
        select.appendChild(option);

        // Add as quick filter chip (only if has products)
        if (cat.product_count > 0) {
          const chip = document.createElement('a');
          chip.className = `shop-category-chip${cat.slug === categorySlug ? ' active' : ''}`;
          chip.href = `#/shop?category=${cat.slug}`;
          chip.innerHTML = `<i class="fas fa-tag"></i> ${cat.name}`;
          chipsContainer.appendChild(chip);
        }
      });
    } catch (e) {
      console.error('Failed to load categories:', e);
    }

    // Render filter tags if filters are active
    this.renderFilterTags(categorySlug, searchQuery, sortBy);

    await this.loadProducts({ category: categorySlug, search: searchQuery, sort: sortBy });
  },

  renderFilterTags(categorySlug, searchQuery, sortBy) {
    const container = document.getElementById('shopFilterTags');
    if (!container) return;

    const tags = [];

    if (categorySlug) {
      const name = this.currentCategoryName || categorySlug.replace(/-/g, ' ');
      tags.push({ label: `Category: ${name}`, type: 'category' });
    }
    if (searchQuery) {
      tags.push({ label: `Search: "${searchQuery}"`, type: 'search' });
    }
    if (sortBy && sortBy !== 'newest') {
      const sortLabels = { 'price-asc': 'Price: Low to High', 'price-desc': 'Price: High to Low', 'rating': 'Top Rated', 'name': 'Name (A-Z)' };
      tags.push({ label: `Sort: ${sortLabels[sortBy] || sortBy}`, type: 'sort' });
    }

    if (tags.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = tags.map(t => `
      <span class="shop-filter-tag">
        ${t.label}
        <button class="shop-filter-tag-remove" data-filter-type="${t.type}">
          <i class="fas fa-times"></i>
        </button>
      </span>
    `).join('');

    // Delegate click on filter tag remove buttons
    container.querySelectorAll('.shop-filter-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        ShopPage.removeFilter(btn.dataset.filterType);
      });
    });
  },

  removeFilter(type) {
    const params = new URLSearchParams(window.location.hash.replace('#/shop?', ''));
    if (type === 'category') params.delete('category');
    if (type === 'search') params.delete('search');
    if (type === 'sort') params.delete('sort');
    const qs = params.toString();
    Router.navigate(qs ? `#/shop?${qs}` : '#/shop');
  },

  clearFilters() {
    Router.navigate('#/shop');
  },

  async renderShopSearchSuggestions(query) {
    const suggestionsEl = document.getElementById('shopSearchSuggestions');
    const input = document.getElementById('shopSearchInput');
    if (!suggestionsEl || !input || !query || query.trim().length < 2) {
      this.closeShopSearchSuggestions();
      return;
    }

    const requestId = ++this.searchRequestId;
    input.setAttribute('aria-expanded', 'true');
    suggestionsEl.hidden = false;
    suggestionsEl.innerHTML = `
      <div class="shop-search-suggestion-loading">
        <div class="loader-spinner"></div>
        Searching assets...
      </div>
    `;

    try {
      const [products, categories] = await Promise.all([
        DB.searchSuggestions(query, 6),
        DB.searchCategories(query)
      ]);

      if (requestId !== this.searchRequestId) return;
      this.searchHighlightIndex = -1;

      if (products.length === 0 && categories.length === 0) {
        suggestionsEl.innerHTML = `
          <div class="shop-search-suggestion-empty">No suggestions. Press Enter to search all products.</div>
        `;
        return;
      }

      let index = 0;
      let html = '';

      if (products.length > 0) {
        html += '<div class="shop-search-suggestions-group">';
        products.forEach((product) => {
          const price = Number.parseFloat(product.price || 0).toFixed(2);
          html += `
            <button type="button" class="shop-search-suggestion" role="option"
                    id="shopSearchOption${index}" data-shop-suggestion-index="${index}"
                    data-shop-suggestion-type="product" data-shop-suggestion-value="${this.escapeAttr(product.slug)}">
              <img src="${this.escapeAttr(product.image_url || 'assets/images/Animated-Background-Stock-Video-Footage-for-Premium-Download.jpg')}" alt="">
              <span>
                <span class="shop-search-suggestion-title">${this.escapeAttr(product.name)}</span>
                <span class="shop-search-suggestion-meta">${this.escapeAttr(product.category_name || 'Product')} / $${price}</span>
              </span>
              <i class="fas fa-arrow-right"></i>
            </button>
          `;
          index += 1;
        });
        html += '</div>';
      }

      if (categories.length > 0) {
        html += '<div class="shop-search-suggestions-group shop-search-category-group">';
        categories.forEach((category) => {
          html += `
            <button type="button" class="shop-search-suggestion shop-search-category-suggestion" role="option"
                    id="shopSearchOption${index}" data-shop-suggestion-index="${index}"
                    data-shop-suggestion-type="category" data-shop-suggestion-value="${this.escapeAttr(category.slug)}">
              <span class="shop-search-category-icon"><i class="fas fa-tag"></i></span>
              <span>
                <span class="shop-search-suggestion-title">${this.escapeAttr(category.name)}</span>
                <span class="shop-search-suggestion-meta">Category</span>
              </span>
              <i class="fas fa-arrow-right"></i>
            </button>
          `;
          index += 1;
        });
        html += '</div>';
      }

      html += `
        <button type="button" class="shop-search-view-all" role="option"
                id="shopSearchOption${index}" data-shop-suggestion-index="${index}"
                data-shop-suggestion-type="search" data-shop-suggestion-value="${this.escapeAttr(query)}">
          <i class="fas fa-search"></i> Search all assets for "${this.escapeAttr(query)}"
        </button>
      `;

      suggestionsEl.innerHTML = html;
      suggestionsEl.querySelectorAll('[data-shop-suggestion-type]').forEach((button) => {
        button.addEventListener('click', () => {
          this.openShopSearchSuggestion(button.dataset.shopSuggestionType, button.dataset.shopSuggestionValue);
        });
      });
    } catch (error) {
      console.error('Shop search suggestions failed:', error);
      if (requestId === this.searchRequestId) {
        suggestionsEl.innerHTML = `
          <div class="shop-search-suggestion-empty">Search suggestions are unavailable. Press Enter to search.</div>
        `;
      }
    }
  },

  setShopSearchHighlight(nextIndex) {
    const suggestionsEl = document.getElementById('shopSearchSuggestions');
    const input = document.getElementById('shopSearchInput');
    if (!suggestionsEl || suggestionsEl.hidden) return;

    const items = Array.from(suggestionsEl.querySelectorAll('[data-shop-suggestion-index]'));
    if (items.length === 0) return;

    this.searchHighlightIndex = (nextIndex + items.length) % items.length;
    items.forEach((item, index) => {
      const active = index === this.searchHighlightIndex;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    input?.setAttribute('aria-activedescendant', `shopSearchOption${this.searchHighlightIndex}`);
  },

  closeShopSearchSuggestions() {
    const suggestionsEl = document.getElementById('shopSearchSuggestions');
    const input = document.getElementById('shopSearchInput');
    if (suggestionsEl) {
      suggestionsEl.hidden = true;
      suggestionsEl.innerHTML = '';
    }
    this.searchRequestId += 1;
    input?.setAttribute('aria-expanded', 'false');
    input?.removeAttribute('aria-activedescendant');
    this.searchHighlightIndex = -1;
  },

  openShopSearchSuggestion(type, value) {
    this.closeShopSearchSuggestions();

    switch (type) {
      case 'product':
        Router.navigate(`#/product/${value}`);
        break;
      case 'category':
        Router.navigate(`#/shop?category=${value}`);
        break;
      case 'search':
        Router.navigate(`#/shop?search=${encodeURIComponent(value)}`);
        break;
    }
  },

  async loadProducts(filters) {
    const grid = document.getElementById('shopGrid');
    const results = document.getElementById('shopResults');
    const loadMoreContainer = document.getElementById('shopLoadMoreContainer');

    this.loadedCount = 0;
    this.currentFilters = filters;

    try {
      const products = await DB.getProducts({
        category: filters.category,
        search: filters.search,
        sort: filters.sort,
        limit: 8,
        offset: 0
      });

      if (products.length === 0) {
        grid.innerHTML = Components.emptyState(
          '<i class="fas fa-search"></i>',
          'No assets found',
          'Try adjusting your filters or search terms. We add new assets daily.',
          'View All Assets',
          '#/shop'
        );
        results.innerHTML = '<span class="shop-results-kicker">Marketplace</span><strong>0</strong> assets found';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      } else {
        grid.innerHTML = `
          <div class="product-grid">
            ${products.map((p, i) => Components.productCard(p, i)).join('')}
          </div>
        `;
        this.loadedCount = products.length;
        results.innerHTML = `<span class="shop-results-kicker">Marketplace</span><strong>${products.length}</strong> premium asset${products.length !== 1 ? 's' : ''} shown`;
        App.updateWishlistIcons();

        if (loadMoreContainer) {
          loadMoreContainer.style.display = products.length >= 8 ? '' : 'none';
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      grid.innerHTML = Components.emptyState(
        '<i class="fas fa-exclamation-circle"></i>',
        'Failed to load assets',
        'Please check your connection and try again.',
        'Retry',
        '#/shop'
      );
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }
  },

  async loadMore() {
    const btn = document.getElementById('shopLoadMoreBtn');
    const container = document.getElementById('shopLoadMoreContainer');
    const results = document.getElementById('shopResults');
    let reachedEnd = false;

    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
      const moreProducts = await DB.getProducts({
        category: this.currentFilters?.category,
        search: this.currentFilters?.search,
        sort: this.currentFilters?.sort,
        limit: 8,
        offset: this.loadedCount
      });

      if (moreProducts.length === 0) {
        if (container) container.remove();
        return;
      }

      const grid = document.querySelector('#shopGrid .product-grid');
      if (grid) {
        // Append with stagger animation
        grid.insertAdjacentHTML('beforeend', moreProducts.map((p, i) => Components.productCard(p, this.loadedCount + i)).join(''));
      }

      this.loadedCount += moreProducts.length;
      if (results) results.innerHTML = `<span class="shop-results-kicker">Marketplace</span><strong>${this.loadedCount}</strong> premium asset${this.loadedCount !== 1 ? 's' : ''} shown`;
      App.updateWishlistIcons();

      if (moreProducts.length < 8) {
        reachedEnd = true;
        btn.innerHTML = '<i class="fas fa-check" style="margin-right:6px"></i> All assets loaded';
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'default';
        setTimeout(() => {
          if (container) container.style.display = 'none';
        }, 1800);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      Components.toast('Failed to load more assets', 'error');
    } finally {
      if (!reachedEnd) btn.disabled = false;
      btn.classList.remove('loading');
    }
  },

  applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const sort = document.getElementById('filterSort').value;
    const search = document.getElementById('shopSearchInput')?.value?.trim() || '';

    let hash = '#/shop';
    const params = [];
    if (category) params.push(`category=${category}`);
    if (sort && sort !== 'newest') params.push(`sort=${sort}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) hash += '?' + params.join('&');
    Router.navigate(hash);
  },

  buildStructuredData(categorySlug, searchQuery, sortBy) {
    const urlParams = [];
    if (categorySlug) urlParams.push(`category=${categorySlug}`);
    if (searchQuery) urlParams.push(`search=${encodeURIComponent(searchQuery)}`);
    if (sortBy && sortBy !== 'newest') urlParams.push(`sort=${sortBy}`);
    const qs = urlParams.length > 0 ? '?' + urlParams.join('&') : '';
    const pageUrl = `https://pixabanimation.github.io/#/shop${qs}`;

    const data = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": pageUrl,
      "url": pageUrl,
      "name": categorySlug
        ? `${this.currentCategoryName || categorySlug} - PixabAnimation Shop`
        : "Premium Motion Graphics & Animation Assets Marketplace - PixabAnimation",
      "description": categorySlug
        ? `Browse ${this.currentCategoryName || categorySlug} - premium motion graphics, animation templates, and video assets for professional editors and motion designers.`
        : "Discover thousands of premium motion graphics, animation assets, 4K video clips, and creative templates. Download instantly for your next project.",
      "mainEntityOfPage": {
        "@type": "CollectionPage",
        "@id": "https://pixabanimation.github.io/#/shop"
      },
      "about": {
        "@type": "Thing",
        "name": "Motion Graphics & Animation Assets",
        "description": "Premium motion design templates, video clips, and animation resources for creative professionals."
      },
      "provider": {
        "@type": "Organization",
        "name": "PixabAnimation",
        "url": "https://pixabanimation.github.io"
      },
      "inLanguage": "en-US",
      "isAccessibleForFree": false
    };
    return JSON.stringify(data, null, 2);
  },

  cleanup() {
    if (this.toolbarScrollHandler) {
      window.removeEventListener('scroll', this.toolbarScrollHandler);
    }
    if (this.shopSearchOutsideHandler) {
      document.removeEventListener('click', this.shopSearchOutsideHandler);
      this.shopSearchOutsideHandler = null;
    }
    clearTimeout(this.searchDebounceTimer);
    this.closeShopSearchSuggestions();
  }
};

// Register cleanup when route changes
Router.beforeEach(() => {
  ShopPage.cleanup();
});
