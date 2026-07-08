// ============================================
// PixabAnimation — Blog Listing Page
// Apple-inspired design
// ============================================

const BlogPage = {
  currentPage: 1,
  pageSize: 12,
  currentCategory: '',
  currentSearch: '',

  async render(params) {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div class="blog-page page-enter">
        <section class="blog-hero">
          <div class="blog-hero-inner">
            <div class="blog-hero-badge">
              <i class="fas fa-pen-fancy"></i> Insights & Tutorials
            </div>
            <h1 class="blog-hero-title">PixabAnimation <span class="text-gradient">Blog</span></h1>
            <p class="blog-hero-desc">
              Expert tutorials, creative insights, and industry trends on motion graphics, 
              animation, AI in design, freelancing, and the future of creative technology.
            </p>
            <div class="blog-search-bar">
              <i class="fas fa-search"></i>
              <input type="text" id="blogSearchInput" placeholder="Search articles..." 
                     onkeydown="if(event.key==='Enter')BlogPage.search(this.value)">
            </div>
          </div>
        </section>
        <div id="blogContent">
          <div style="text-align:center;padding:60px">
            <div class="loader-spinner"></div>
          </div>
        </div>
      </div>
    `;
    await this.loadPosts();
  },

  async loadPosts() {
    const container = document.getElementById('blogContent');
    try {
      const filters = { published: true, limit: this.pageSize, offset: (this.currentPage - 1) * this.pageSize };
      if (this.currentCategory) filters.category = this.currentCategory;
      if (this.currentSearch) filters.search = this.currentSearch;

      const [posts, categories, featured] = await Promise.all([
        DB.getBlogPosts(filters),
        DB.getBlogCategories(),
        this.currentPage === 1 ? DB.getFeaturedBlogPosts(3) : Promise.resolve([])
      ]);

      if (posts.length === 0 && this.currentPage === 1) {
        container.innerHTML = `
          <div style="max-width:1100px;margin:0 auto;padding:40px 24px 80px">
            ${blogEmptyState()}
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="blog-layout">
          ${this.currentPage === 1 && featured.length > 0 ? `
          <section class="blog-featured-section">
            <div class="blog-featured-grid">
              ${featured.map((p, i) => this.featuredCard(p, i)).join('')}
            </div>
          </section>
          ` : ''}
          
          <div class="blog-main-section" style="max-width:1100px;margin:0 auto;padding:0 24px 60px">
            <div class="blog-category-bar">
              <button class="blog-category-chip ${!this.currentCategory ? 'active' : ''}" 
                      onclick="BlogPage.filterByCategory('')">All</button>
              ${categories.map(c => `
                <button class="blog-category-chip ${this.currentCategory === c.category ? 'active' : ''}" 
                        onclick="BlogPage.filterByCategory('${c.category}')">${c.category}</button>
              `).join('')}
            </div>
            
            <div class="blog-grid" id="blogGrid">
              ${posts.map((p, i) => this.blogCard(p, i)).join('')}
            </div>
            
            ${posts.length >= this.pageSize ? `
            <div style="text-align:center;margin-top:40px">
              <button class="blog-load-more" onclick="BlogPage.loadMore()">
                <i class="fas fa-chevron-down"></i> Load More Articles
              </button>
            </div>` : ''}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Blog error:', error);
      container.innerHTML = `<div style="max-width:1100px;margin:0 auto;padding:40px 24px 80px">${Components.emptyState('😔', 'Failed to load blog', error.message)}</div>`;
    }
  },

  featuredCard(post, index) {
    return `
      <a href="#/blog/${post.slug}" class="blog-featured-card" style="--i:${index};${index === 0 ? 'grid-column:span 2;' : ''}">
        <div class="blog-featured-image">
          <img src="${post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80'}" alt="${post.title}" loading="lazy">
          <div class="blog-featured-overlay">
            <span class="blog-card-category">${post.category || 'General'}</span>
            <h2>${post.title}</h2>
            <div class="blog-card-meta">
              <span>${post.reading_time || 5} min read</span>
              <span>•</span>
              <span>${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  },

  blogCard(post, index) {
    const tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
    return `
      <a href="#/blog/${post.slug}" class="blog-card" style="animation-delay:${index * 0.05}s">
        <div class="blog-card-image">
          <img src="${post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80'}" alt="${post.title}" loading="lazy">
          <div class="blog-card-category-badge">${post.category || 'General'}</div>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span>${post.reading_time || 5} min read</span>
          </div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${post.excerpt || ''}</p>
          ${tags.length > 0 ? `
          <div class="blog-card-tags">
            ${tags.slice(0, 3).map(t => `<span class="blog-tag">${t}</span>`).join('')}
          </div>` : ''}
        </div>
      </a>
    `;
  },

  filterByCategory(category) {
    this.currentCategory = category;
    this.currentPage = 1;
    this.loadPosts();
  },

  search(query) {
    this.currentSearch = query;
    this.currentPage = 1;
    this.loadPosts();
  },

  async loadMore() {
    this.currentPage++;
    await this.loadPosts();
  }
};

function blogEmptyState() {
  return `
    <div class="empty-state" style="text-align:center;padding:60px">
      <div style="font-size:4rem;margin-bottom:20px;opacity:0.3"><i class="fas fa-newspaper"></i></div>
      <h3 style="font-size:1.4rem;margin-bottom:8px">No articles yet</h3>
      <p style="color:var(--text-muted);margin-bottom:24px">Blog posts coming soon. Stay tuned!</p>
    </div>
  `;
}
