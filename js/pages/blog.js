// ============================================
// PixabAnimation — Blog Listing Page
// Premium Google News-Inspired Design
// ============================================

const BlogPage = {
  currentPage: 1,
  pageSize: 12,
  currentCategory: '',
  currentSearch: '',
  searchHighlightIndex: -1,
  searchRequestId: 0,
  searchDebounceTimer: null,

  async render(params) {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div class="blog-page page-enter">
        <!-- Hero -->
        <section class="gn-hero">
          <div class="gn-hero-inner">
            <div class="gn-hero-badge">
              <i class="fas fa-pen-fancy"></i> Insights & Tutorials
            </div>
            <h1 class="gn-hero-title">PixabAnimation <span class="text-gradient">Blog</span></h1>
            <p class="gn-hero-desc">
              Expert tutorials, creative insights, and industry trends on motion graphics,
              animation, AI in design, freelancing, and the future of creative technology.
            </p>
            <div class="gn-search-bar" id="gnSearchBar">
              <i class="fas fa-search"></i>
              <input type="text" id="gnSearchInput" placeholder="Search articles..." autocomplete="off"
                     aria-label="Search blog articles" aria-autocomplete="list">
              <div class="gn-search-suggestions" id="gnSearchSuggestions"></div>
            </div>
            <div class="gn-hero-categories" id="gnHeroCategories">
              <button class="gn-category-chip active" data-category="">All</button>
            </div>
          </div>
        </section>

        <!-- Content Area: 2-Column Layout -->
        <div class="gn-layout" id="gnLayout">
          <!-- Main Content -->
          <div class="gn-main" id="gnMain">
            <div class="gn-loading">
              <div class="loader-spinner"></div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="gn-sidebar" id="gnSidebar">
            <!-- Sidebar Search -->
            <div class="gn-sidebar-widget">
              <h3 class="gn-widget-title"><i class="fas fa-search"></i> Search</h3>
              <div class="gn-sidebar-search">
                <i class="fas fa-search"></i>
                <input type="text" id="gnSidebarSearch" placeholder="Search articles..."
                       onkeydown="if(event.key==='Enter')BlogPage.search(this.value)">
              </div>
            </div>

            <!-- Sidebar Trending -->
            <div class="gn-sidebar-widget" id="gnWidgetTrending">
              <h3 class="gn-widget-title"><i class="fas fa-fire"></i> Trending</h3>
              <div class="gn-trending-list" id="gnTrendingList">
                <div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem">
                  <div class="loader-spinner" style="width:20px;height:20px;margin:0 auto 8px"></div>
                  Loading...
                </div>
              </div>
            </div>

            <!-- Sidebar Categories -->
            <div class="gn-sidebar-widget" id="gnWidgetCategories">
              <h3 class="gn-widget-title"><i class="fas fa-folder"></i> Categories</h3>
              <div class="gn-category-list" id="gnCategoryList">
                <div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem">
                  <div class="loader-spinner" style="width:20px;height:20px;margin:0 auto 8px"></div>
                  Loading...
                </div>
              </div>
            </div>

            <!-- Sidebar Tags -->
            <div class="gn-sidebar-widget" id="gnWidgetTags">
              <h3 class="gn-widget-title"><i class="fas fa-tags"></i> Tags</h3>
              <div class="gn-tag-cloud" id="gnTagCloud">
                <div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem">
                  <div class="loader-spinner" style="width:20px;height:20px;margin:0 auto 8px"></div>
                  Loading...
                </div>
              </div>
            </div>

            <!-- Sidebar Newsletter -->
            <div class="gn-sidebar-widget gn-widget-newsletter">
              <h3 class="gn-widget-title"><i class="fas fa-envelope"></i> Newsletter</h3>
              <p class="gn-newsletter-text">Get the latest articles and resources straight to your inbox.</p>
              <div class="gn-newsletter-form">
                <input type="email" id="gnNewsletterEmail" placeholder="Your email address">
                <button onclick="BlogPage.subscribeNewsletter()"><i class="fas fa-arrow-right"></i></button>
              </div>
            </div>

            <!-- Sidebar Ad Slots -->
            <div id="ad-slot-1" class="gn-sidebar-widget"></div>
            <div id="ad-slot-2" class="gn-sidebar-widget"></div>
            <div id="ad-slot-3" class="gn-sidebar-widget"></div>
          </aside>
        </div>
      </div>
    `;

    // Search autocomplete for hero search
    this.setupSearchAutocomplete();

    // Load everything
    await Promise.all([
      this.loadHeroCategories(),
      this.loadTrendingPosts(),
      this.loadCategoryList(),
      this.loadTagCloud(),
      this.loadPosts()
    ]);
    // BlogAds.loadFromDatabase() is called inside loadPosts() after ad slots are in DOM
  },

  // === Hero Search Autocomplete ===
  setupSearchAutocomplete() {
    const input = document.getElementById('gnSearchInput');
    const suggestionsEl = document.getElementById('gnSearchSuggestions');

    if (!input || !suggestionsEl) return;

    // Input handler
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(this.searchDebounceTimer);
      if (query.length < 1) {
        suggestionsEl.classList.remove('active');
        suggestionsEl.innerHTML = '';
        return;
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.performSearchSuggestions(query);
      }, 200);
    });

    // Focus handler
    input.addEventListener('focus', () => {
      const query = input.value.trim();
      if (query.length >= 1) {
        this.performSearchSuggestions(query);
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      const items = suggestionsEl.querySelectorAll('.gn-search-suggestion-item');
      const totalItems = items.length;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (totalItems > 0) {
            this.searchHighlightIndex = Math.min(this.searchHighlightIndex + 1, totalItems - 1);
            items.forEach((el, i) => el.classList.toggle('highlighted', i === this.searchHighlightIndex));
            if (items[this.searchHighlightIndex]) {
              items[this.searchHighlightIndex].scrollIntoView({ block: 'nearest' });
            }
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (totalItems > 0) {
            this.searchHighlightIndex = Math.max(this.searchHighlightIndex - 1, -1);
            items.forEach((el, i) => el.classList.toggle('highlighted', i === this.searchHighlightIndex));
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (this.searchHighlightIndex >= 0 && items[this.searchHighlightIndex]) {
            items[this.searchHighlightIndex].click();
          } else if (input.value.trim()) {
            this.search(input.value.trim());
            suggestionsEl.classList.remove('active');
          }
          break;
        case 'Escape':
          suggestionsEl.classList.remove('active');
          input.blur();
          break;
        default:
          this.searchHighlightIndex = -1;
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      const searchBar = document.getElementById('gnSearchBar');
      if (searchBar && !searchBar.contains(e.target)) {
        suggestionsEl.classList.remove('active');
      }
    });
  },

  async performSearchSuggestions(query) {
    const suggestionsEl = document.getElementById('gnSearchSuggestions');
    if (!suggestionsEl || !query || query.trim().length < 1) return;

    const requestId = ++this.searchRequestId;

    suggestionsEl.innerHTML = `
      <div class="gn-search-suggestion-loading">
        <div class="loader-spinner" style="width:18px;height:18px;margin:0 auto 6px"></div>
        Searching...
      </div>
    `;
    suggestionsEl.classList.add('active');

    try {
      let results = [];
      if (typeof DB !== 'undefined' && DB.searchBlogSuggestions) {
        results = await DB.searchBlogSuggestions(query);
      }

      if (requestId !== this.searchRequestId) return;

      if (results.length === 0) {
        suggestionsEl.innerHTML = `
          <div class="gn-search-suggestion-empty">
            <i class="fas fa-search" style="font-size:1.2rem;margin-bottom:6px;opacity:0.3;display:block"></i>
            No articles found for "${this.escapeHtml(query)}"
          </div>
          <div class="gn-search-suggestion-view-all" onclick="BlogPage.search('${this.escapeHtml(query)}');document.getElementById('gnSearchSuggestions').classList.remove('active')">
            <i class="fas fa-arrow-right"></i> Search all articles for "${this.escapeHtml(query)}"
          </div>
        `;
        return;
      }

      let html = '';
      results.forEach((post, i) => {
        html += `
          <a href="#/blog/${post.slug}" class="gn-search-suggestion-item" data-index="${i}">
            <div class="gn-search-suggestion-img">
              <img src="${post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&q=60'}" alt="${this.escapeHtml(post.title)}" loading="lazy">
            </div>
            <div class="gn-search-suggestion-info">
              <div class="gn-search-suggestion-title">${this.escapeHtml(post.title)}</div>
              <div class="gn-search-suggestion-category">${post.category || 'General'}</div>
            </div>
          </a>
        `;
      });

      html += `
        <div class="gn-search-suggestion-view-all" onclick="BlogPage.search('${this.escapeHtml(query)}');document.getElementById('gnSearchSuggestions').classList.remove('active')">
          <i class="fas fa-arrow-right"></i> View all results for "${this.escapeHtml(query)}"
        </div>
      `;

      suggestionsEl.innerHTML = html;
      suggestionsEl.classList.add('active');
      this.searchHighlightIndex = -1;
    } catch (error) {
      console.error('Blog search error:', error);
      if (requestId === this.searchRequestId) {
        suggestionsEl.innerHTML = `
          <div class="gn-search-suggestion-empty">
            <i class="fas fa-exclamation-circle" style="font-size:1.2rem;margin-bottom:6px;opacity:0.3;display:block"></i>
            Search unavailable
          </div>
        `;
      }
    }
  },

  // === Hero Categories ===
  async loadHeroCategories() {
    try {
      const categories = await DB.getBlogCategories();
      const container = document.getElementById('gnHeroCategories');
      if (!container) return;

      let html = `<button class="gn-category-chip active" data-category="">All</button>`;
      categories.forEach(c => {
        html += `<button class="gn-category-chip" data-category="${this.escapeAttr(c.category)}">${this.escapeHtml(c.category)} <span class="gn-category-count">${c.count}</span></button>`;
      });
      container.innerHTML = html;

      // Click handler
      container.querySelectorAll('.gn-category-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.gn-category-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.filterByCategory(btn.dataset.category);
        });
      });
    } catch (e) {
      console.warn('Failed to load hero categories:', e);
    }
  },

  // === Sidebar: Trending Posts ===
  async loadTrendingPosts() {
    const list = document.getElementById('gnTrendingList');
    if (!list) return;
    try {
      const posts = await DB.getRecentBlogPosts(5);
      if (posts.length === 0) {
        list.innerHTML = '<div class="gn-trending-empty">No posts yet.</div>';
        return;
      }
      list.innerHTML = posts.map((p, i) => `
        <a href="#/blog/${p.slug}" class="gn-trending-item">
          <span class="gn-trending-number">${i + 1}</span>
          <div class="gn-trending-info">
            <div class="gn-trending-title">${this.escapeHtml(p.title)}</div>
            <div class="gn-trending-meta">${p.category || 'General'} · ${p.reading_time || 5} min read</div>
          </div>
        </a>
      `).join('');
    } catch (e) {
      list.innerHTML = '<div class="gn-trending-empty">Failed to load.</div>';
    }
  },

  // === Sidebar: Category List ===
  async loadCategoryList() {
    const list = document.getElementById('gnCategoryList');
    if (!list) return;
    try {
      const categories = await DB.getBlogCategories();
      if (categories.length === 0) {
        list.innerHTML = '<div class="gn-category-empty">No categories yet.</div>';
        return;
      }
      list.innerHTML = categories.map(c => `
        <a href="#/blog" class="gn-category-item" data-category="${this.escapeAttr(c.category)}">
          <span><i class="fas fa-chevron-right"></i> ${this.escapeHtml(c.category)}</span>
          <span class="gn-category-item-count">${c.count}</span>
        </a>
      `).join('');

      // Click handler - filter by category
      list.querySelectorAll('.gn-category-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const cat = item.dataset.category;
          // Update hero chips
          document.querySelectorAll('.gn-category-chip').forEach(b => {
            b.classList.toggle('active', b.dataset.category === cat);
          });
          this.filterByCategory(cat);
          // Scroll to top of content
          document.getElementById('gnLayout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } catch (e) {
      list.innerHTML = '<div class="gn-category-empty">Failed to load.</div>';
    }
  },

  // === Sidebar: Tag Cloud ===
  async loadTagCloud() {
    const cloud = document.getElementById('gnTagCloud');
    if (!cloud) return;
    try {
      const tags = await DB.getBlogTags(20);
      if (tags.length === 0) {
        cloud.innerHTML = '<div class="gn-tag-empty">No tags yet.</div>';
        return;
      }
      // Calculate sizes based on frequency
      const maxCount = tags[0].count;
      cloud.innerHTML = tags.map(t => {
        const size = 0.7 + (t.count / maxCount) * 0.6;
        return `<span class="gn-tag-item" style="font-size:${size.toFixed(2)}rem" onclick="BlogPage.search('${this.escapeAttr(t.tag)}')">${this.escapeHtml(t.tag)}</span>`;
      }).join('');
    } catch (e) {
      cloud.innerHTML = '<div class="gn-tag-empty">Failed to load.</div>';
    }
  },

  // === Newsletter Subscribe ===
  async subscribeNewsletter() {
    const input = document.getElementById('gnNewsletterEmail');
    const email = input?.value?.trim() || '';
    if (!email || !email.includes('@')) {
      if (typeof Components !== 'undefined') {
        Components.toast('Please enter a valid email address', 'error');
      }
      return;
    }
    try {
      await DB.subscribeNewsletter(email);
      if (typeof Components !== 'undefined') {
        Components.toast('🎉 Subscribed! Check your inbox.', 'success');
      }
      if (input) input.value = '';
    } catch (e) {
      if (typeof Components !== 'undefined') {
        Components.toast('Failed to subscribe. Try again.', 'error');
      }
    }
  },

  // === Blog Posts Loader ===
  async loadPosts() {
    const main = document.getElementById('gnMain');
    if (!main) return;

    try {
      const filters = { published: true, limit: this.pageSize, offset: (this.currentPage - 1) * this.pageSize };
      if (this.currentCategory) filters.category = this.currentCategory;
      if (this.currentSearch) filters.search = this.currentSearch;

      const [posts, categories, featured] = await Promise.all([
        DB.getBlogPosts(filters),
        DB.getBlogCategories(),
        this.currentPage === 1 ? DB.getFeaturedBlogPosts(2) : Promise.resolve([])
      ]);

      if (posts.length === 0 && this.currentPage === 1) {
        main.innerHTML = `
          <div class="gn-empty">
            <div class="gn-empty-icon"><i class="fas fa-newspaper"></i></div>
            <h3>No articles found</h3>
            <p>${this.currentSearch ? `No results for "${this.escapeHtml(this.currentSearch)}"` : 'Blog posts coming soon. Stay tuned!'}</p>
            ${this.currentSearch ? `<button class="gn-load-more-btn" onclick="BlogPage.search('')"><i class="fas fa-times"></i> Clear search</button>` : ''}
          </div>
        `;
        return;
      }

      let html = '';
      let cardCount = 0;

      // Featured posts (only on page 1)
      if (this.currentPage === 1 && featured.length > 0) {
        html += `<div class="gn-featured-row">`;
        featured.forEach((p, i) => {
          html += this.featuredCard(p, i);
          cardCount++;
        });
        html += `</div>`;

        // Ad slot 1 after featured
        if (this.currentPage === 1) {
          html += `<div id="ad-slot-1-article" class="gn-ad-slot"></div>`;
        }
      }

      // Section heading
      if (this.currentPage === 1) {
        html += `
          <div class="gn-section-header">
            <h2 class="gn-section-title"><i class="fas fa-clock"></i> Latest Articles</h2>
            <span class="gn-section-count">${posts.length} articles</span>
          </div>
        `;
      }

      // Posts grid
      html += `<div class="gn-posts-grid">`;
      posts.forEach((p, i) => {
        html += this.postCard(p, cardCount + i);
      });
      html += `</div>`;

      // Ad slot 2 between posts
      html += `<div id="ad-slot-2-article" class="gn-ad-slot"></div>`;

      // Load more
      if (posts.length >= this.pageSize) {
        html += `
          <div class="gn-load-more">
            <button class="gn-load-more-btn" onclick="BlogPage.loadMore()">
              <i class="fas fa-chevron-down"></i> Load More Articles
            </button>
          </div>
        `;
      }

      main.innerHTML = html;

      // Reload ads for the new slots
      if (typeof BlogAds !== 'undefined' && BlogAds.loadFromDatabase) {
        try { BlogAds.loadFromDatabase(); } catch(e) { console.warn('BlogAds: failed to load', e); }
      }
    } catch (error) {
      console.error('Blog load error:', error);
      main.innerHTML = `
        <div class="gn-empty">
          <div class="gn-empty-icon"><i class="fas fa-exclamation-circle"></i></div>
          <h3>Failed to load blog</h3>
          <p>${error.message || 'Something went wrong.'}</p>
          <button class="gn-load-more-btn" onclick="BlogPage.loadPosts()"><i class="fas fa-redo"></i> Try again</button>
        </div>
      `;
    }
  },

  featuredCard(post, index) {
    const tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
    const isLarge = index === 0;
    return `
      <a href="#/blog/${post.slug}" class="gn-featured-card ${isLarge ? 'gn-featured-card--large' : ''}" style="--i:${index}">
        <div class="gn-featured-image">
          <img src="${post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'}" alt="${this.escapeHtml(post.title)}" loading="lazy">
          <div class="gn-featured-overlay">
            <div class="gn-featured-category">${post.category || 'General'}</div>
            <h2 class="gn-featured-title">${this.escapeHtml(post.title)}</h2>
            <p class="gn-featured-excerpt">${post.excerpt || ''}</p>
            <div class="gn-featured-meta">
              <span><i class="far fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span><i class="far fa-clock"></i> ${post.reading_time || 5} min read</span>
              ${tags.length > 0 ? `<span><i class="fas fa-tag"></i> ${this.escapeHtml(tags[0])}</span>` : ''}
            </div>
          </div>
        </div>
      </a>
    `;
  },

  postCard(post, index) {
    const tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
    return `
      <a href="#/blog/${post.slug}" class="gn-post-card" style="--i:${index}">
        <div class="gn-post-image">
          <img src="${post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80'}" alt="${this.escapeHtml(post.title)}" loading="lazy">
          <div class="gn-post-category-badge">${post.category || 'General'}</div>
        </div>
        <div class="gn-post-body">
          <div class="gn-post-meta">
            <span>${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>${post.reading_time || 5} min read</span>
          </div>
          <h3 class="gn-post-title">${this.escapeHtml(post.title)}</h3>
          <p class="gn-post-excerpt">${post.excerpt || ''}</p>
          ${tags.length > 0 ? `
          <div class="gn-post-tags">
            ${tags.slice(0, 2).map(t => `<span class="gn-post-tag">${this.escapeHtml(t)}</span>`).join('')}
          </div>` : ''}
        </div>
      </a>
    `;
  },

  // === Filtering & Search ===
  filterByCategory(category) {
    this.currentCategory = category;
    this.currentPage = 1;
    this.loadPosts();
  },

  search(query) {
    this.currentSearch = query;
    this.currentPage = 1;
    const input = document.getElementById('gnSearchInput');
    if (input && query) input.value = query;
    if (input && !query) input.value = '';

    // Close suggestions
    const suggestions = document.getElementById('gnSearchSuggestions');
    if (suggestions) suggestions.classList.remove('active');

    this.loadPosts();
  },

  async loadMore() {
    this.currentPage++;
    await this.loadPosts();
  },

  // === Utilities ===
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};
