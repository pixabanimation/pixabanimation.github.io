// ============================================
// pixabanimation — Shop Page
// ============================================

const ShopPage = {
  loadedCount: 0,
  currentFilters: null,

  async render(params) {
    const content = document.getElementById('pageContent');
    const { query } = params;
    const categorySlug = query.category || '';
    const searchQuery = query.search || '';
    const sortBy = query.sort || 'newest';

    content.innerHTML = `
      <div class="shop-header" style="padding:48px 24px 32px;text-align:center;background:var(--bg-secondary)">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:16px">
          <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
          <span class="ds-caption" style="font-weight:500;color:var(--ds-primary)">Shop</span>
        </div>
        <h1 class="ds-display-lg" style="color:#1d1d1f;margin-bottom:8px">Explore Our <span class="text-gradient">Collection</span></h1>
        <p class="ds-body" style="color:rgba(0,0,0,0.56);max-width:480px;margin:0 auto">${categorySlug ? `Browsing: ${categorySlug}` : 'Discover premium motion graphics and animation assets'}</p>
      </div>
      <div class="section" style="padding-top:32px">
        <div class="shop-controls">
          <div class="shop-filters">
            <select class="filter-select" id="filterCategory" onchange="ShopPage.applyFilters()">
              <option value="">All Categories</option>
            </select>
            <select class="filter-select" id="filterSort" onchange="ShopPage.applyFilters()">
              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Name</option>
            </select>
          </div>
          <div class="shop-results ds-caption" id="shopResults" style="color:rgba(0,0,0,0.48)">Loading products...</div>
        </div>
        <div id="shopGrid">${Components.loadingSkeleton(8)}</div>
        ${categorySlug ? `<div style="text-align:center;margin-top:32px">
          <a href="#/shop" class="ds-pill-cta-secondary" style="font-size:13px;padding:8px 18px"><i class="fas fa-times"></i> Clear Filters</a>
        </div>` : ''}
        <div style="text-align:center;margin-top:32px;display:none" id="shopLoadMoreContainer">
          <button onclick="ShopPage.loadMore()" class="ds-pill-cta" id="shopLoadMoreBtn" style="padding:12px 28px;font-size:15px;cursor:pointer;border:none;font-family:var(--font-primary)">
            <i class="fas fa-cog" id="shopLoadMoreSpinner" style="margin-right:8px;animation:spin 1s linear infinite;display:none"></i>
            <i class="fas fa-chevron-down" style="margin-right:8px"></i>
            Load More
          </button>
        </div>
      </div>
    `;

    // Load categories into filter
    try {
      const categories = await DB.getCategories();
      const select = document.getElementById('filterCategory');
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.slug;
        option.textContent = cat.name;
        if (cat.slug === categorySlug) option.selected = true;
        select.appendChild(option);
      });
    } catch (e) {
      console.error('Failed to load categories:', e);
    }

    await this.loadProducts({ category: categorySlug, search: searchQuery, sort: sortBy });
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
          'Try adjusting your filters or search terms.',
          'View All Products',
          '#/shop'
        );
        results.textContent = '0 products found';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      } else {
        grid.innerHTML = `
          <div class="product-grid">
            ${products.map((p, i) => Components.productCard(p, i)).join('')}
          </div>
        `;
        this.loadedCount = products.length;
        results.textContent = `${products.length} products found`;
        App.updateWishlistIcons();

        // Show load more only if we got a full batch (more products may exist)
        if (loadMoreContainer) {
          loadMoreContainer.style.display = products.length >= 8 ? '' : 'none';
        }
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      grid.innerHTML = Components.emptyState(
        '😔',
        'Failed to load products',
        'Please check your connection and try again.'
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
    if (spinner) spinner.style.display = 'inline-block';

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
        grid.insertAdjacentHTML('beforeend', moreProducts.map((p, i) => Components.productCard(p, this.loadedCount + i)).join(''));
      }

      this.loadedCount += moreProducts.length;
      if (results) results.textContent = `${this.loadedCount} products found`;
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

  applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const sort = document.getElementById('filterSort').value;
    let hash = '#/shop';
    const params = [];
    if (category) params.push(`category=${category}`);
    if (sort && sort !== 'newest') params.push(`sort=${sort}`);
    if (params.length > 0) hash += '?' + params.join('&');
    Router.navigate(hash);
  }
};
