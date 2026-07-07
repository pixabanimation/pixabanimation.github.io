// ============================================
// pixabanimation — Shop Page (Premium Redesign)
// ============================================

const ShopPage = {
  loadedCount: 0,
  currentFilters: null,
  currentCategoryName: '',

  async render(params) {
    const content = document.getElementById('pageContent');
    const { query } = params;
    const categorySlug = query.category || '';
    const searchQuery = query.search || '';
    const sortBy = query.sort || 'newest';

    // Store current category name for display
    this.currentCategoryName = categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    content.innerHTML = `
      <!-- Shop Hero -->
      <div class="shop-hero page-enter">
        <div class="shop-hero-inner">
          <div class="shop-hero-badge">
            <i class="fas fa-store"></i>
            ${categorySlug ? this.currentCategoryName : 'Premium Marketplace'}
          </div>
          <h1 class="shop-hero-title">
            ${categorySlug 
              ? `<span class="text-gradient">${this.currentCategoryName}</span>`
              : 'Explore Our <span class="text-gradient">Collection</span>'
            }
          </h1>
          <p class="shop-hero-desc">
            ${categorySlug 
              ? `Browse our curated selection of ${this.currentCategoryName.toLowerCase()} — premium motion graphics, templates, and creative assets.`
              : 'Discover premium motion graphics, animation assets, video clips, and creative tools for your next project.'
            }
          </p>
          <div class="shop-category-chips" id="shopCategoryChips">
            <span style="font-size:0.75rem;color:rgba(0,0,0,0.35);padding:6px 4px">Quick filter:</span>
          </div>
        </div>
      </div>

      <!-- Sticky Filter Toolbar -->
      <div class="shop-toolbar" id="shopToolbar">
        <div class="shop-toolbar-inner">
          <div class="shop-toolbar-left">
            <select class="shop-filter-select" id="filterCategory" onchange="ShopPage.applyFilters()">
              <option value="">All Categories</option>
            </select>
            <select class="shop-filter-select" id="filterSort" onchange="ShopPage.applyFilters()">
              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Name (A-Z)</option>
            </select>
          </div>
          <div class="shop-toolbar-right">
            <button class="shop-clear-filters" id="shopClearFilters" style="${categorySlug || searchQuery ? '' : 'display:none'}"
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
            <strong>Loading</strong> products...
          </div>
        </div>
        <div id="shopGrid">${Components.loadingSkeleton(8)}</div>
        <div class="shop-load-more" id="shopLoadMoreContainer" style="display:none">
          <button class="shop-load-more-btn" id="shopLoadMoreBtn" onclick="ShopPage.loadMore()">
            <i class="fas fa-cog shop-load-more-spinner" id="shopLoadMoreSpinner"></i>
            <i class="fas fa-chevron-down"></i>
            Load More Products
          </button>
        </div>
      </div>

      <!-- SEO Structured Data -->
      <script type="application/ld+json" id="shopStructuredData">${this.buildStructuredData(categorySlug, searchQuery, sortBy)}<\/script>
    `;

    // Scroll event for toolbar shadow
    this.toolbarScrollHandler = () => {
      const toolbar = document.getElementById('shopToolbar');
      if (toolbar) {
        toolbar.classList.toggle('scrolled', window.scrollY > 280);
      }
    };
    window.addEventListener('scroll', this.toolbarScrollHandler);

    // Search input debounce
    const searchInput = document.getElementById('shopSearchInput');
    let searchTimer = null;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => ShopPage.applyFilters(), 350);
    });

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
          '🔍',
          'No products found',
          'Try adjusting your filters or search terms. We add new assets daily!',
          'View All Products',
          '#/shop'
        );
        results.innerHTML = '<strong>0</strong> products found';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      } else {
        grid.innerHTML = `
          <div class="product-grid">
            ${products.map((p, i) => Components.productCard(p, i)).join('')}
          </div>
        `;
        this.loadedCount = products.length;
        results.innerHTML = `<strong>${products.length}</strong> product${products.length !== 1 ? 's' : ''} found`;
        App.updateWishlistIcons();

        if (loadMoreContainer) {
          loadMoreContainer.style.display = products.length >= 8 ? '' : 'none';
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      grid.innerHTML = Components.emptyState(
        '😔',
        'Failed to load products',
        'Please check your connection and try again.',
        'Retry',
        '#/shop'
      );
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }
  },

  async loadMore() {
    const btn = document.getElementById('shopLoadMoreBtn');
    const spinner = document.getElementById('shopLoadMoreSpinner');
    const container = document.getElementById('shopLoadMoreContainer');
    const results = document.getElementById('shopResults');

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
      if (results) results.innerHTML = `<strong>${this.loadedCount}</strong> product${this.loadedCount !== 1 ? 's' : ''} found`;
      App.updateWishlistIcons();

      if (moreProducts.length < 8) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check" style="margin-right:6px"></i> All products loaded';
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'default';
        setTimeout(() => {
          if (container) container.style.display = 'none';
        }, 1800);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      Components.toast('Failed to load more products', 'error');
    } finally {
      btn.disabled = false;
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
        ? `${this.currentCategoryName || categorySlug} — PixabAnimation Shop` 
        : "Premium Motion Graphics & Animation Assets Marketplace — PixabAnimation",
      "description": categorySlug
        ? `Browse ${this.currentCategoryName || categorySlug} — premium motion graphics, animation templates, and video assets for professional editors and motion designers.`
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
  }
};

// Register cleanup when route changes
Router.beforeEach(() => {
  ShopPage.cleanup();
});
