// ============================================
// pixabanimation — Admin Dashboard
// ============================================

const AdminPage = {
  currentTab: 'dashboard',
  productPage: 0,
  orderPage: 0,
  pageSize: 10,

  async render() {
    const content = document.getElementById('pageContent');
    
    // Admin access guard
    const user = App.getUser();
    if (!user || !user.is_admin) {
      content.innerHTML = Components.emptyState(
        '🔒', 'Admin Access Required', 'Please sign in with an admin account to access the dashboard.',
        'Sign In', '#/login'
      );
      return;
    }

    content.innerHTML = `
      <div class="admin-page page-enter">
        <div class="admin-sidebar">
          <div class="admin-sidebar-header">
            <span class="brand-icon">✦</span>
            <span class="brand-text">SPurno E-commerce</span>
          </div>
          <button class="admin-sidebar-toggle" onclick="AdminPage.toggleSidebar()" aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <nav class="admin-sidebar-nav" id="adminSidebarNav">
            <button class="admin-nav-item active" data-tab="dashboard" onclick="AdminPage.switchTab('dashboard');AdminPage.closeSidebar()">
              <i class="fas fa-chart-pie"></i> Dashboard
            </button>
            <button class="admin-nav-item" data-tab="products" onclick="AdminPage.switchTab('products');AdminPage.closeSidebar()">
              <i class="fas fa-box"></i> Products
            </button>
            <button class="admin-nav-item" data-tab="categories" onclick="AdminPage.switchTab('categories');AdminPage.closeSidebar()">
              <i class="fas fa-tags"></i> Categories
            </button>
            <button class="admin-nav-item" data-tab="orders" onclick="AdminPage.switchTab('orders');AdminPage.closeSidebar()">
              <i class="fas fa-truck"></i> Orders
            </button>
            <button class="admin-nav-item" data-tab="users" onclick="AdminPage.switchTab('users');AdminPage.closeSidebar()">
              <i class="fas fa-users"></i> Users
            </button>
            <button class="admin-nav-item" data-tab="coupons" onclick="AdminPage.switchTab('coupons');AdminPage.closeSidebar()">
              <i class="fas fa-tag"></i> Coupons
            </button>
            <button class="admin-nav-item" data-tab="media" onclick="AdminPage.switchTab('media');AdminPage.closeSidebar()">
              <i class="fas fa-cloud-upload-alt"></i> Media
            </button>
            <button class="admin-nav-item" data-tab="subscribers" onclick="AdminPage.switchTab('subscribers');AdminPage.closeSidebar()">
              <i class="fas fa-envelope"></i> Subscribers
            </button>
            <button class="admin-nav-item" data-tab="reviews" onclick="AdminPage.switchTab('reviews');AdminPage.closeSidebar()">
              <i class="fas fa-star"></i> Reviews
            </button>
            <button class="admin-nav-item" data-tab="messages" onclick="AdminPage.switchTab('messages');AdminPage.closeSidebar()" id="adminMessagesNav">
              <i class="fas fa-envelope"></i> Messages
            </button>
            <button class="admin-nav-item" data-tab="blog" onclick="AdminPage.switchTab('blog');AdminPage.closeSidebar()">
              <i class="fas fa-pen-fancy"></i> Blog
            </button>
            <button class="admin-nav-item" data-tab="ads" onclick="AdminPage.switchTab('ads');AdminPage.closeSidebar()">
              <i class="fas fa-bullhorn"></i> Ads
            </button>
            <button class="admin-nav-item" data-tab="popupads" onclick="AdminPage.switchTab('popupads');AdminPage.closeSidebar()">
              <i class="fas fa-window-restore"></i> Popup Ads
            </button>
            <hr class="admin-divider">
            <button class="admin-nav-item" data-tab="settings" onclick="AdminPage.switchTab('settings');AdminPage.closeSidebar()">
              <i class="fas fa-cog"></i> Settings
            </button>
            <hr class="admin-divider">
            <a href="#/" class="admin-nav-item" onclick="AdminPage.closeSidebar()">
              <i class="fas fa-arrow-left"></i> Back to Store
            </a>
          </nav>
        </div>
        <div class="admin-main">
          <div class="admin-header">
            <h2 id="adminPageTitle">Dashboard</h2>
            <div class="admin-header-actions">
              <span class="admin-badge">Admin</span>
            </div>
          </div>
          <div class="admin-content" id="adminContent">
            <div style="text-align:center;padding:60px">
              <div class="loader-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Close sidebar on outside click (mobile) — remove stale listener first
    document.removeEventListener('click', AdminPage.handleOutsideClick);
    document.addEventListener('click', AdminPage.handleOutsideClick);

    await this.loadDashboard();
  },

  toggleSidebar() {
    const nav = document.getElementById('adminSidebarNav');
    const btn = document.querySelector('.admin-sidebar-toggle');
    if (!nav) return;
    nav.classList.toggle('open');
    if (btn) btn.classList.toggle('active');
  },

  closeSidebar() {
    const nav = document.getElementById('adminSidebarNav');
    const btn = document.querySelector('.admin-sidebar-toggle');
    if (!nav) return;
    nav.classList.remove('open');
    if (btn) btn.classList.remove('active');
  },

  handleOutsideClick(e) {
    const sidebar = document.querySelector('.admin-sidebar');
    const nav = document.getElementById('adminSidebarNav');
    if (!sidebar || !nav || !nav.classList.contains('open')) return;
    if (!sidebar.contains(e.target)) {
      AdminPage.closeSidebar();
    }
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById('adminPageTitle').textContent = tab.charAt(0).toUpperCase() + tab.slice(1);

    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="text-align:center;padding:60px"><div class="loader-spinner"></div></div>`;

    switch (tab) {
      case 'dashboard': this.loadDashboard(); break;
      case 'products': this.loadProducts(); break;
      case 'categories': this.loadCategories(); break;
      case 'orders': this.loadOrders(); break;
      case 'users': this.loadUsers(); break;
      case 'coupons': this.loadCoupons(); break;
      case 'media': AdminMedia.render(); break;
      case 'subscribers': this.loadSubscribers(); break;
      case 'reviews': this.loadReviews(); break;
      case 'messages': this.loadMessages(); break;
      case 'blog': this.loadBlogPosts(); break;
      case 'ads': this.loadAds(); break;
      case 'popupads': AdminPopupAds.render(); break;
      case 'settings': AdminSettings.render(); break;
    }
  },

  // ===================== DASHBOARD =====================
  async loadDashboard() {
    const container = document.getElementById('adminContent');

    try {
      const [stats, recentOrders, topProducts, dailySales, categoryDist, ordersByStatus] = await Promise.all([
        DB.getDashboardStats(),
        DB.getRecentOrders(5),
        DB.getTopProducts(5),
        DB.getDailySales(7),
        DB.getCategoryDistribution(),
        DB.getOrdersByStatus()
      ]);

      // Generate sales chart bars
      const salesData = this.generateSalesData(dailySales, 7);

      container.innerHTML = `
        <!-- Stats Cards -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card glass">
            <div class="admin-stat-icon revenue">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="admin-stat-info">
              <div class="admin-stat-value">$${parseFloat(stats.totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div class="admin-stat-label">Total Revenue</div>
            </div>
            <div class="admin-stat-change positive">
              <i class="fas fa-arrow-up"></i> 12.5%
            </div>
          </div>
          <div class="admin-stat-card glass">
            <div class="admin-stat-icon orders">
              <i class="fas fa-shopping-bag"></i>
            </div>
            <div class="admin-stat-info">
              <div class="admin-stat-value">${stats.totalOrders}</div>
              <div class="admin-stat-label">Total Orders</div>
            </div>
            <div class="admin-stat-change positive">
              <i class="fas fa-arrow-up"></i> 8.3%
            </div>
          </div>
          <div class="admin-stat-card glass">
            <div class="admin-stat-icon products">
              <i class="fas fa-box"></i>
            </div>
            <div class="admin-stat-info">
              <div class="admin-stat-value">${stats.totalProducts}</div>
              <div class="admin-stat-label">Products</div>
            </div>
            <div class="admin-stat-change">
              <i class="fas fa-minus"></i> 0%
            </div>
          </div>
          <div class="admin-stat-card glass">
            <div class="admin-stat-icon users">
              <i class="fas fa-users"></i>
            </div>
            <div class="admin-stat-info">
              <div class="admin-stat-value">${stats.totalUsers}</div>
              <div class="admin-stat-label">Users</div>
            </div>
            <div class="admin-stat-change positive">
              <i class="fas fa-arrow-up"></i> 5.2%
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="admin-charts-row">
          <div class="admin-chart-card glass">
            <div class="admin-chart-header">
              <h3>Sales (Last 7 Days)</h3>
            </div>
            <div class="admin-chart-body">
              <div class="admin-bar-chart" id="salesChart">
                ${salesData.map((d, i) => `
                  <div class="admin-bar-item">
                    <div class="admin-bar-value">$${d.revenue}</div>
                    <div class="admin-bar-track">
                      <div class="admin-bar-fill" style="height:${d.percent}%"></div>
                    </div>
                    <div class="admin-bar-label">${d.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="admin-chart-card glass">
            <div class="admin-chart-header">
              <h3>Orders by Status</h3>
            </div>
            <div class="admin-chart-body">
              <div class="admin-pie-legend">
                ${this.getStatusColorMap().map(s => {
                  const count = ordersByStatus.find(o => o.status === s.id)?.count || 0;
                  const total = ordersByStatus.reduce((sum, o) => sum + o.count, 0);
                  const pct = total > 0 ? Math.round(count / total * 100) : 0;
                  return `
                    <div class="admin-legend-item">
                      <span class="admin-legend-dot" style="background:${s.color}"></span>
                      <span>${s.label}</span>
                      <span class="admin-legend-count">${count} (${pct}%)</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="admin-charts-row">
          <div class="admin-chart-card glass">
            <div class="admin-chart-header">
              <h3>Top Products</h3>
              <a href="#/admin" onclick="AdminPage.switchTab('products');return false" class="admin-chart-link">View All</a>
            </div>
            <div class="admin-chart-body" style="padding:0">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${topProducts.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted)">No sales data yet</td></tr>' : 
                    topProducts.map(p => `
                      <tr>
                        <td style="display:flex;align-items:center;gap:10px">
                          <img src="${p.image_url}" alt="${p.name}" style="width:36px;height:36px;border-radius:6px;object-fit:cover">
                          <span style="font-weight:500;font-size:0.9rem">${p.name}</span>
                        </td>
                        <td>${p.total_sold || 0}</td>
                        <td style="font-weight:600;color:var(--accent-1)">$${parseFloat(p.revenue || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="admin-chart-card glass">
            <div class="admin-chart-header">
              <h3>Recent Orders</h3>
              <a href="#/admin" onclick="AdminPage.switchTab('orders');return false" class="admin-chart-link">View All</a>
            </div>
            <div class="admin-chart-body" style="padding:0">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentOrders.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-muted)">No orders yet</td></tr>' :
                    recentOrders.map(o => `
                      <tr>
                        <td>
                          <span style="font-weight:600">#${o.id}</span>
                          <span style="font-size:0.8rem;color:var(--text-muted);display:block">
                            ${new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td>${AdminPage.statusBadge(o.status)}</td>
                        <td style="font-weight:600">$${parseFloat(o.total).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Dashboard error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load dashboard', error.message);
    }
  },

  generateSalesData(dailySales, days) {
    const data = [];
    const maxRevenue = Math.max(...dailySales.map(d => parseFloat(d.revenue || 0)), 1);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailySales.find(d => d.date === dateStr) || { revenue: '0', orders: '0' };
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      data.push({
        label: dayLabels[date.getDay()],
        date: dateStr,
        revenue: parseFloat(dayData.revenue).toFixed(0),
        orders: dayData.orders || 0,
        percent: Math.max((parseFloat(dayData.revenue) / maxRevenue) * 100, 5)
      });
    }
    return data;
  },

  getStatusColorMap() {
    return [
      { id: 'pending', label: 'Pending', color: 'var(--warning)' },
      { id: 'confirmed', label: 'Confirmed', color: 'var(--info)' },
      { id: 'shipped', label: 'Shipped', color: 'var(--accent-1)' },
      { id: 'delivered', label: 'Delivered', color: 'var(--success)' },
      { id: 'cancelled', label: 'Cancelled', color: 'var(--error)' }
    ];
  },

  statusBadge(status) {
    const colors = {
      'pending': 'var(--warning)',
      'confirmed': 'var(--info)',
      'shipped': 'var(--accent-1)',
      'delivered': 'var(--success)',
      'cancelled': 'var(--error)'
    };
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:${colors[status] || 'var(--text-muted)'}20;color:${colors[status] || 'var(--text-muted)'}">
      <span style="width:6px;height:6px;border-radius:50%;background:${colors[status] || 'var(--text-muted)'}"></span>
      ${status.charAt(0).toUpperCase() + status.slice(1)}
    </span>`;
  },

  // ===================== PRODUCTS =====================
  async loadProducts(search = '') {
    const container = document.getElementById('adminContent');

    try {
      const filters = {};
      if (search) filters.search = search;
      const [products, categories] = await Promise.all([
        DB.getAllProducts(filters),
        DB.getCategories()
      ]);

      container.innerHTML = `
        <div class="admin-toolbar">
          <div class="admin-search">
            <i class="fas fa-search"></i>
            <input type="text" id="productSearch" placeholder="Search products..." value="${search}" 
                   onkeydown="if(event.key==='Enter')AdminPage.loadProducts(this.value)">
          </div>
          <button class="btn btn-primary btn-sm" onclick="AdminPage.showProductForm(null, ${JSON.stringify(categories).replace(/"/g, "'")})">
            <i class="fas fa-plus"></i> Add Product
          </button>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width:40px">ID</th>
                <th style="width:300px">Product</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Featured</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${products.length === 0 ? 
                '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">No products found</td></tr>' :
                products.map(p => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${p.id}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:12px">
                        <img src="${p.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=60'}" 
                             alt="${p.name}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">
                        <div>
                          <div style="font-weight:600;font-size:0.9rem">${p.name}</div>
                          <div style="font-size:0.75rem;color:var(--text-muted)">Slug: ${p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style="font-size:0.85rem">${p.category_name || '—'}</span></td>
                    <td><span style="font-size:0.75rem;padding:2px 8px;border-radius:var(--radius-full);background:${p.media_type === 'video' ? 'rgba(0,102,204,0.15)' : p.media_type === 'digital' ? 'rgba(0,230,118,0.15)' : 'var(--bg-input)'};color:${p.media_type === 'video' ? 'var(--accent-1)' : p.media_type === 'digital' ? 'var(--success)' : 'var(--text-muted)'}">${p.media_type === 'video' ? '🎬 Video' : p.media_type === 'digital' ? '📄 Digital' : '📦 Physical'}</span></td>
                    <td><span style="font-weight:600;color:var(--accent-1)">$${parseFloat(p.price).toFixed(2)}</span></td>
                    <td>
                      <span style="color:${p.stock > 0 ? 'var(--success)' : 'var(--error)'};font-weight:600">
                        ${p.stock > 0 ? p.stock : 'Out'}
                      </span>
                    </td>
                    <td>
                      <span style="color:#ffc107">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span>
                      <span style="font-size:0.8rem;color:var(--text-muted)">(${p.reviews_count || 0})</span>
                    </td>
                    <td>
                      <button class="admin-toggle ${p.featured ? 'active' : ''}" 
                              onclick="AdminPage.toggleFeatured(${p.id}, ${!p.featured})">
                        <div class="admin-toggle-knob"></div>
                      </button>
                    </td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="admin-action-btn" onclick="AdminPage.showProductForm(${p.id}, ${JSON.stringify(categories).replace(/"/g, "'")})" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" onclick="AdminPage.deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Products error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load products', error.message);
    }
  },

  async showProductForm(productId, categories) {
    let product = null;
    if (productId) {
      product = await DB.getProductById(productId);
    }

    const isEdit = !!product;
    const catOptions = categories.map(c => 
      `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const defaultMediaType = product ? (product.media_type || 'physical') : 'physical';

    Components.showModal(isEdit ? 'Edit Product' : 'Add Product', `
      <form id="productForm" onsubmit="AdminPage.saveProduct(event, ${productId || 'null'})" class="admin-product-form" style="display:flex;flex-direction:column;gap:14px">
        <!-- Row 1: Basic Info -->
        <div class="admin-form-grid-3">
          <div class="form-group">
            <label>Product Name *</label>
            <input type="text" id="pf_name" value="${isEdit ? product.name : ''}" required>
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input type="text" id="pf_slug" value="${isEdit ? product.slug : ''}" placeholder="auto-generated">
          </div>
          <div class="form-group">
            <label>Product Type</label>
            <select id="pf_media_type" onchange="AdminPage.toggleMediaTypeFields()" style="padding:12px 16px">
              <option value="physical" ${defaultMediaType === 'physical' ? 'selected' : ''}>📦 Physical</option>
              <option value="digital" ${defaultMediaType === 'digital' ? 'selected' : ''}>📄 Digital</option>
              <option value="video" ${defaultMediaType === 'video' ? 'selected' : ''}>🎬 Video</option>
            </select>
          </div>
        </div>
        <!-- Row 2: Description (full width) -->
        <div class="form-group">
          <label>Description</label>
          <textarea id="pf_description" rows="3" style="resize:vertical">${isEdit ? (product.description || '') : ''}</textarea>
        </div>
        <!-- Row 3: Pricing & Stock -->
        <div class="admin-form-grid-3">
          <div class="form-group">
            <label>Price ($) *</label>
            <input type="number" id="pf_price" step="0.01" min="0" value="${isEdit ? product.price : ''}" required>
          </div>
          <div class="form-group">
            <label>Compare Price ($)</label>
            <input type="number" id="pf_compare" step="0.01" min="0" value="${isEdit && product.compare_price ? product.compare_price : ''}">
          </div>
          <div class="form-group" id="pf_stock_group">
            <label>Stock</label>
            <input type="number" id="pf_stock" min="0" value="${isEdit ? product.stock : '0'}">
          </div>
        </div>
        <!-- Row 4: Category & Image -->
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Category</label>
            <select id="pf_category">
              <option value="">No category</option>
              ${catOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Image/Thumbnail URL</label>
            ${Components.mediaField('pf_image', isEdit ? (product.image_url || '') : '', 'https://...')}
          </div>
        </div>
        <!-- Row 5: Checkbox (inline) -->
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <label class="admin-form-checkbox">
            <input type="checkbox" id="pf_featured" ${isEdit && product.featured ? 'checked' : ''}>
            <span>Featured product</span>
          </label>
        </div>

        <!-- Video-specific fields -->
        <div id="pf_video_fields" class="admin-form-video-section" style="display:${defaultMediaType === 'video' ? 'flex' : 'none'}">
          <div class="admin-form-section-header">
            <i class="fas fa-video"></i> Video Details
          </div>
          <div class="admin-form-grid-3">
            <div class="form-group">
              <label>Video File URL</label>
              <input type="url" id="pf_video_url" value="${isEdit && product.video_url ? product.video_url : ''}" placeholder="https://.../video.mp4">
            </div>
            <div class="form-group">
              <label>Preview Video URL</label>
              <input type="url" id="pf_preview_url" value="${isEdit && product.preview_url ? product.preview_url : ''}" placeholder="https://.../preview.mp4">
            </div>
            <div class="form-group">
              <label>File Size (GB)</label>
              <input type="number" id="pf_file_size" step="0.1" min="0" value="${isEdit && product.file_size ? product.file_size : ''}" placeholder="e.g. 2.4">
            </div>
          </div>
          <div class="admin-form-grid-2">
            <div class="form-group">
              <label>Preview Description</label>
              <textarea id="pf_preview_desc" rows="2" style="resize:vertical" placeholder="Describe what the preview shows...">${isEdit && product.preview_description ? product.preview_description : ''}</textarea>
            </div>
            <div class="form-group">
              <label>Duration (seconds)</label>
              <input type="number" id="pf_duration" step="1" min="0" value="${isEdit && product.duration ? product.duration : ''}" placeholder="e.g. 720">
              <div class="admin-form-hint">Total runtime in seconds</div>
            </div>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    `, '900px');

    // Auto-generate slug from name (only for new products)
    const slugField = document.getElementById('pf_slug');
    const nameField = document.getElementById('pf_name');
    
    // If it's a new product (empty slug), enable auto-generation
    if (!slugField.value) {
      nameField?.addEventListener('input', function() {
        if (!slugField.dataset.manual) {
          slugField.value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
      });
    }
    
    slugField?.addEventListener('input', function() {
      this.dataset.manual = 'true';
    });
  },

  toggleMediaTypeFields() {
    const type = document.getElementById('pf_media_type').value;
    const videoFields = document.getElementById('pf_video_fields');
    const stockGroup = document.getElementById('pf_stock_group');
    if (videoFields) {
      videoFields.style.display = type === 'video' ? 'flex' : 'none';
    }
    if (stockGroup) {
      stockGroup.style.display = type === 'physical' ? 'block' : 'none';
    }
  },

  async saveProduct(event, productId) {
    event.preventDefault();
    const mediaType = document.getElementById('pf_media_type').value;
    const data = {
      name: document.getElementById('pf_name').value,
      slug: document.getElementById('pf_slug').value || document.getElementById('pf_name').value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: document.getElementById('pf_description').value,
      price: parseFloat(document.getElementById('pf_price').value),
      compare_price: document.getElementById('pf_compare').value ? parseFloat(document.getElementById('pf_compare').value) : null,
      stock: mediaType === 'physical' ? (parseInt(document.getElementById('pf_stock').value) || 0) : 999,
      category_id: document.getElementById('pf_category').value ? parseInt(document.getElementById('pf_category').value) : null,
      image_url: document.getElementById('pf_image').value || null,
      featured: document.getElementById('pf_featured').checked ? 1 : 0,
      media_type: mediaType
    };

    // Video-specific fields
    if (mediaType === 'video') {
      data.video_url = document.getElementById('pf_video_url').value || null;
      data.preview_url = document.getElementById('pf_preview_url').value || null;
      data.preview_description = document.getElementById('pf_preview_desc').value || null;
      data.file_size = document.getElementById('pf_file_size').value ? parseFloat(document.getElementById('pf_file_size').value) : null;
      data.duration = document.getElementById('pf_duration').value ? parseInt(document.getElementById('pf_duration').value) : null;
      if (!data.category_id) data.category_id = 7; // Default to Videos category
    }

    try {
      if (productId) {
        await DB.updateProduct(productId, data);
        Components.toast('Product updated!', 'success');
      } else {
        await DB.createProduct(data);
        Components.toast('Product created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.loadProducts();
    } catch (error) {
      Components.toast('Failed to save product: ' + error.message, 'error');
    }
  },

  async toggleFeatured(productId, featured) {
    try {
      await DB.updateProduct(productId, { featured: featured ? 1 : 0 });
      Components.toast(featured ? 'Featured' : 'Unfeatured', 'success');
      this.loadProducts();
    } catch (error) {
      Components.toast('Failed to update', 'error');
    }
  },

  async deleteProduct(productId, productName) {
    Components.showModal('Delete Product', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete <strong>${productName}</strong>? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.confirmDelete(${productId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async confirmDelete(productId) {
    try {
      await DB.deleteProduct(productId);
      Components.toast('Product deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadProducts();
    } catch (error) {
      Components.toast('Failed to delete', 'error');
    }
  },

  // ===================== CATEGORIES =====================
  async loadCategories() {
    const container = document.getElementById('adminContent');

    try {
      const categories = await DB.getCategories();

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Manage Categories</h3>
          <button class="btn btn-primary btn-sm" onclick="AdminPage.showCategoryForm(null)">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width:40px">ID</th>
                <th style="width:80px">Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${categories.length === 0 ? 
                '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No categories found</td></tr>' :
                categories.map(c => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${c.id}</td>
                    <td>
                      <img src="${c.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=60'}" 
                           alt="${c.name}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">
                    </td>
                    <td><span style="font-weight:600">${c.name}</span></td>
                    <td><span style="font-size:0.8rem;color:var(--text-muted);font-family:monospace">${c.slug}</span></td>
                    <td>
                      <span style="font-size:0.85rem;color:var(--text-secondary);display:block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(c.description || '').replace(/"/g, '&quot;')}">
                        ${c.description || '—'}
                      </span>
                    </td>
                    <td><span style="font-weight:600;color:var(--accent-1)">${c.product_count || 0}</span></td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="admin-action-btn" onclick="AdminPage.showCategoryForm(${c.id})" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}')" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Categories error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load categories', error.message);
    }
  },

  async showCategoryForm(categoryId) {
    let category = null;
    if (categoryId) {
      category = await DB.getCategoryById(categoryId);
    }

    const isEdit = !!category;

    Components.showModal(isEdit ? 'Edit Category' : 'Add Category', `
      <form id="categoryForm" onsubmit="AdminPage.saveCategory(event, ${categoryId || 'null'})" style="display:flex;flex-direction:column;gap:14px">
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Category Name</label>
            <input type="text" id="cf_name" value="${isEdit ? category.name : ''}" required>
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input type="text" id="cf_slug" value="${isEdit ? category.slug : ''}" placeholder="auto-generated">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="cf_description" rows="2" style="resize:vertical" placeholder="Optional description...">${isEdit ? (category.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label>Image URL</label>
          ${Components.mediaField('cf_image', isEdit ? (category.image_url || '') : '', 'https://...')}
        </div>
        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </form>
    `);

    // Auto-generate slug from name (only for new categories)
    const slugField = document.getElementById('cf_slug');
    const nameField = document.getElementById('cf_name');
    if (!slugField.value) {
      nameField?.addEventListener('input', function() {
        if (!slugField.dataset.manual) {
          slugField.value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
      });
    }
    slugField?.addEventListener('input', function() {
      this.dataset.manual = 'true';
    });
  },

  async saveCategory(event, categoryId) {
    event.preventDefault();
    const name = document.getElementById('cf_name').value.trim();
    const slug = document.getElementById('cf_slug').value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const description = document.getElementById('cf_description').value.trim();
    const image_url = document.getElementById('cf_image').value.trim() || null;

    if (!name) {
      Components.toast('Category name is required', 'error');
      return;
    }

    try {
      if (categoryId) {
        await DB.updateCategory(categoryId, { name, slug, description, image_url });
        Components.toast('Category updated!', 'success');
      } else {
        await DB.createCategory({ name, slug, description, image_url });
        Components.toast('Category created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.loadCategories();
    } catch (error) {
      Components.toast('Failed to save category: ' + error.message, 'error');
    }
  },

  confirmDeleteCategory(categoryId, categoryName) {
    Components.showModal('Delete Category', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete <strong>${categoryName}</strong>? Products in this category will be unlinked (not deleted).
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteCategory(${categoryId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteCategory(categoryId) {
    try {
      await DB.deleteCategory(categoryId);
      Components.toast('Category deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadCategories();
    } catch (error) {
      Components.toast('Failed to delete category', 'error');
    }
  },

  // ===================== ORDERS =====================
  async loadOrders(statusFilter = '') {
    const container = document.getElementById('adminContent');

    try {
      const filters = statusFilter ? { status: statusFilter } : {};
      const orders = await DB.getAllOrders(filters);

      container.innerHTML = `
        <div class="admin-toolbar">
          <div class="admin-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search orders..." onkeydown="if(event.key==='Enter')AdminPage.loadOrders()">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select class="filter-select" onchange="AdminPage.loadOrders(this.value)" style="font-size:0.85rem">
              <option value="" ${statusFilter === '' ? 'selected' : ''}>All Status</option>
              <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${statusFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="delivered" ${statusFilter === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-sm btn-secondary" onclick="AdminPage.loadPendingTransactions()">
              <i class="fas fa-clock"></i> Pending TX
            </button>
          </div>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>TX ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.length === 0 ?
                '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">No orders found</td></tr>' :
                orders.map(o => `
                  <tr>
                    <td><span style="font-weight:700">#${o.id}</span></td>
                    <td><span style="font-size:0.85rem;color:var(--text-muted)">${new Date(o.created_at).toLocaleDateString()}</span></td>
                    <td><span style="font-size:0.85rem">${o.customer_info ? o.customer_info.split(',')[0] : '—'}</span></td>
                    <td>${o.item_count}</td>
                    <td style="font-weight:600;color:var(--accent-1)">$${parseFloat(o.total).toFixed(2)}</td>
                    <td><span style="font-size:0.8rem;text-transform:capitalize">${o.payment_method || '—'}</span></td>
                    <td>
                      ${o.transaction_id ? `<span style="font-size:0.75rem;font-family:monospace;color:${o.transaction_approved ? 'var(--success)' : 'var(--warning)'}">${o.transaction_id.substring(0, 12)}...</span>` : '<span style="font-size:0.75rem;color:var(--text-muted)">—</span>'}
                    </td>
                    <td>${this.statusBadge(o.status)}</td>
                    <td>
                      <div style="display:flex;gap:4px">
                        <button class="admin-action-btn" onclick="AdminPage.viewOrder(${o.id})" title="View Order">
                          <i class="fas fa-eye"></i>
                        </button>
                        ${o.transaction_id && !o.transaction_approved && o.status === 'pending' ? `
                        <button class="admin-action-btn" style="color:var(--success)" onclick="AdminPage.approveTransaction(${o.id})" title="Approve Transaction">
                          <i class="fas fa-check"></i>
                        </button>
                        ` : ''}
                        ${o.status !== 'cancelled' && o.status !== 'delivered' ? `
                        <button class="admin-action-btn delete" onclick="AdminPage.cancelOrder(${o.id})" title="Cancel Order">
                          <i class="fas fa-times"></i>
                        </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Orders error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load orders', error.message);
    }
  },

  async loadPendingTransactions() {
    const container = document.getElementById('adminContent');
    try {
      const orders = await DB.getPendingTransactions();
      const title = document.getElementById('adminPageTitle');
      if (title) title.textContent = 'Pending Transactions';

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Transactions Awaiting Approval</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${orders.length} pending</span>
        </div>
        ${orders.length === 0 ? `
        <div style="text-align:center;padding:60px;color:var(--text-muted)">
          <i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);margin-bottom:16px;display:block"></i>
          All caught up! No pending transactions.
        </div>
        ` : `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Provider</th>
                <th>Transaction ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr style="background:rgba(255,215,64,0.03)">
                  <td><span style="font-weight:700">#${o.id}</span></td>
                  <td><span style="font-size:0.85rem;color:var(--text-muted)">${new Date(o.created_at).toLocaleDateString()}</span></td>
                  <td><span style="font-size:0.85rem">${o.customer_info ? o.customer_info.split(',')[0] : '—'}</span></td>
                  <td style="font-weight:600;color:var(--accent-1)">$${parseFloat(o.total).toFixed(2)}</td>
                  <td><span style="text-transform:capitalize;font-size:0.85rem">${o.payment_provider || o.payment_method || '—'}</span></td>
                  <td><span style="font-family:monospace;font-size:0.8rem;background:var(--bg-input);padding:2px 8px;border-radius:4px">${o.transaction_id}</span></td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-sm btn-primary" onclick="AdminPage.approveTransaction(${o.id})">
                        <i class="fas fa-check"></i> Approve
                      </button>
                      <button class="btn btn-sm btn-secondary" style="border-color:var(--error);color:var(--error)" onclick="AdminPage.rejectTransaction(${o.id})">
                        <i class="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`}
      `;
    } catch (error) {
      console.error('Pending transactions error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load pending transactions', error.message);
    }
  },

  async viewOrder(orderId) {
    try {
      const order = await DB.getOrderDetail(orderId);
      if (!order) {
        Components.toast('Order not found', 'error');
        return;
      }

      Components.showModal(`Order #${order.id}`, `
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:0.8rem;color:var(--text-muted)">Date</div>
              <div>${new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.8rem;color:var(--text-muted)">Status</div>
              ${this.statusBadge(order.status)}
            </div>
          </div>
          ${order.customer_info ? (() => {
            const parts = order.customer_info.split(',').map(s => s.trim());
            const name = parts[0] || '';
            const email = parts[1] || '';
            const phone = parts[2] || '';
            const countryCode = parts[3] || '';
            const state = parts[4] || '';
            const countryName = countryCode ? (Countries.getName ? Countries.getName(countryCode) : countryCode) : '';
            return `
            <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm)">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px">Customer</div>
                  <div style="font-size:0.9rem;font-weight:600">${name}</div>
                </div>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px">Email</div>
                  <div style="font-size:0.9rem">${email || '—'}</div>
                </div>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px">Phone</div>
                  <div style="font-size:0.9rem">${phone || '—'}</div>
                </div>
                <div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px">Country</div>
                  <div style="font-size:0.9rem">${countryName || (countryCode || '—')}${state ? `, ${state}` : ''}</div>
                </div>
              </div>
            </div>`;
          })() : ''}
          ${order.transaction_id ? `
          <div style="padding:12px;background:rgba(0,102,204,0.06);border:1px solid rgba(0,102,204,0.1);border-radius:var(--radius-sm)">
            <div style="display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between">
                <span style="font-size:0.8rem;color:var(--text-muted)">Payment Provider</span>
                <span style="font-weight:600;font-size:0.9rem;text-transform:capitalize">${order.payment_provider || order.payment_method}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="font-size:0.8rem;color:var(--text-muted)">Transaction ID</span>
                <span style="font-family:monospace;font-weight:600;font-size:0.85rem">${order.transaction_id}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="font-size:0.8rem;color:var(--text-muted)">Approved</span>
                <span style="color:${order.transaction_approved ? 'var(--success)' : 'var(--warning)'}">
                  ${order.transaction_approved ? '✅ Yes' : '⏳ Pending'}
                </span>
              </div>
              ${order.download_link ? `
              <div style="display:flex;justify-content:space-between">
                <span style="font-size:0.8rem;color:var(--text-muted)">Download Link</span>
                <a href="${order.download_link}" target="_blank" style="color:var(--accent-1);font-size:0.85rem">
                  <i class="fas fa-external-link-alt"></i> Open
                </a>
              </div>` : ''}
            </div>
          </div>` : ''}
          <div>
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px">Items (${order.items?.length || 0})</div>
            ${(order.items || []).map(item => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light)">
                <img src="${item.product_image}" alt="${item.product_name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover">
                <div style="flex:1;font-size:0.85rem">${item.product_name} × ${item.quantity}</div>
                <div style="font-weight:600;font-size:0.9rem">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          <div style="border-top:1px solid var(--border-light);padding-top:12px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Subtotal</span>
              <span>$${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>

            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Tax</span>
              <span>$${parseFloat(order.tax || 0).toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1.1rem;font-weight:700;color:var(--accent-1)">
              <span>Total</span>
              <span>$${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
          
          ${order.transaction_id && !order.transaction_approved ? `
          <div style="display:flex;gap:8px;padding-top:8px;border-top:1px solid var(--border-light)">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="AdminPage.approveTransaction(${order.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-check"></i> Approve Transaction
            </button>
            <button class="btn btn-sm btn-secondary" style="flex:1;border-color:var(--error);color:var(--error)" onclick="AdminPage.rejectTransaction(${order.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>` : ''}
          
          ${order.transaction_approved && !order.download_link ? `
          <div style="padding:12px;background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.15);border-radius:var(--radius-sm)">
            <label style="font-size:0.85rem;font-weight:600;margin-bottom:8px;display:block">
              <i class="fas fa-link"></i> Send Download Link
            </label>
            <div style="display:flex;gap:8px">
              <input type="url" id="dlLink_${order.id}" placeholder="https://.../file.zip" style="flex:1">
              <button class="btn btn-primary btn-sm" onclick="AdminPage.sendDownloadLink(${order.id})">
                <i class="fas fa-paper-plane"></i> Send
              </button>
            </div>
          </div>` : ''}
          
          ${order.download_link ? `
          <div style="padding:12px;background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.15);border-radius:var(--radius-sm)">
            <div style="font-size:0.85rem;font-weight:600;color:var(--success);margin-bottom:4px">
              <i class="fas fa-check-circle"></i> Download Link Sent
            </div>
            <a href="${order.download_link}" target="_blank" style="color:var(--accent-1);font-size:0.85rem;word-break:break-all">
              ${order.download_link}
            </a>
          </div>` : ''}
        </div>
      `, '600px');
    } catch (error) {
      Components.toast('Failed to load order details', 'error');
    }
  },

  async approveTransaction(orderId) {
    try {
      await DB.approveTransaction(orderId);
      Components.toast(`Transaction #${orderId} approved!`, 'success');
      this.loadOrders();
    } catch (error) {
      Components.toast('Failed to approve transaction', 'error');
    }
  },

  async rejectTransaction(orderId) {
    try {
      await DB.rejectTransaction(orderId);
      Components.toast(`Transaction #${orderId} rejected`, 'info');
      this.loadOrders();
    } catch (error) {
      Components.toast('Failed to reject transaction', 'error');
    }
  },

  async sendDownloadLink(orderId) {
    const linkInput = document.getElementById(`dlLink_${orderId}`);
    if (!linkInput || !linkInput.value.trim()) {
      Components.toast('Please enter a download URL', 'error');
      return;
    }
    try {
      await DB.setDownloadLink(orderId, linkInput.value.trim());
      Components.toast(`Download link sent for Order #${orderId}!`, 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadOrders();
    } catch (error) {
      Components.toast('Failed to send download link', 'error');
    }
  },

  async cancelOrder(orderId) {
    if (!confirm('Cancel this order?')) return;
    try {
      await DB.updateOrderStatus(orderId, 'cancelled');
      Components.toast(`Order #${orderId} cancelled`, 'info');
      this.loadOrders();
    } catch (error) {
      Components.toast('Failed to cancel order', 'error');
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      await DB.updateOrderStatus(orderId, status);
      Components.toast(`Order #${orderId} status updated to ${status}`, 'success');
      this.loadOrders();
    } catch (error) {
      Components.toast('Failed to update order status', 'error');
    }
  },

  // ===================== USERS (Enhanced) =====================
  async loadUsers() {
    const container = document.getElementById('adminContent');

    try {
      const users = await DB.getAllUsers();

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">User Management</h3>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span style="color:var(--text-muted);font-size:0.85rem">${users.length} total</span>
            <button class="btn btn-primary btn-sm" onclick="AdminPage.showUserForm()">
              <i class="fas fa-plus"></i> Add User
            </button>
          </div>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width:40px">ID</th>
                <th style="width:50px">Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Additional Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.length === 0 ?
                '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">No users found</td></tr>' :
                users.map(u => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${u.id}</td>
                    <td>
                      ${u.avatar_url 
                        ? `<img src="${u.avatar_url}" alt="${u.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
                        : `<div style="width:36px;height:36px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:white">${u.name.charAt(0).toUpperCase()}</div>`
                      }
                    </td>
                    <td><span style="font-weight:600">${u.name}</span></td>
                    <td>${u.email}</td>
                    <td><span style="font-size:0.8rem;color:var(--text-muted)">${u.additional_email || '—'}</span></td>
                    <td>${u.phone || '—'}</td>
                    <td>
                      ${u.is_admin ? 
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:rgba(0,102,204,0.15);color:var(--accent-1)">Admin</span>' :
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;background:var(--bg-input);color:var(--text-muted)">User</span>'
                      }
                    </td>
                    <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="admin-action-btn" onclick="AdminPage.showUserForm(${u.id})" title="Edit User">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteUser(${u.id}, '${u.name.replace(/'/g, "\\'")}')" title="Delete User">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Users error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load users', error.message);
    }
  },

  async showUserForm(userId) {
    let user = null;
    if (userId) {
      user = await DB.getUserById(userId);
    }

    const isEdit = !!user;
    const currentUser = App.getUser();
    const isSelf = isEdit && currentUser && user.id === currentUser.id;

    Components.showModal(isEdit ? 'Edit User' : 'Add User', `
      <form id="userForm" onsubmit="AdminPage.saveUser(event, ${userId || 'null'})" style="display:flex;flex-direction:column;gap:14px">
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="uf_name" value="${isEdit ? user.name : ''}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="uf_email" value="${isEdit ? user.email : ''}" required>
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="uf_phone" value="${isEdit && user.phone ? user.phone : ''}" placeholder="Optional">
          </div>
          <div class="form-group">
            <label>Additional Email</label>
            <input type="email" id="uf_additional_email" value="${isEdit && user.additional_email ? user.additional_email : ''}" placeholder="Optional">
          </div>
        </div>
        ${!isEdit ? `
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="uf_password" placeholder="Min. 8 characters" minlength="8" required>
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="uf_confirm" placeholder="Confirm password" required>
          </div>
        </div>
        ` : ''}
        <div class="form-group">
          <label>Avatar URL</label>
          <input type="url" id="uf_avatar" value="${isEdit && user.avatar_url ? user.avatar_url : ''}" placeholder="https://...avatar.jpg">
        </div>
        <div class="admin-form-checkbox">
          <input type="checkbox" id="uf_is_admin" ${isEdit && user.is_admin ? 'checked' : ''}>
          <span>Administrator</span>
        </div>
        ${isSelf ? '<p style="font-size:0.8rem;color:var(--warning)"><i class="fas fa-info-circle"></i> Editing your own account. Changes apply immediately.</p>' : ''}
        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'user-plus'}"></i> ${isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    `);
  },

  async saveUser(event, userId) {
    event.preventDefault();
    const name = document.getElementById('uf_name').value.trim();
    const email = document.getElementById('uf_email').value.trim();
    const phone = document.getElementById('uf_phone').value.trim();
    const additionalEmail = document.getElementById('uf_additional_email').value.trim();
    const avatar_url = document.getElementById('uf_avatar').value.trim() || null;
    const is_admin = document.getElementById('uf_is_admin').checked ? 1 : 0;

    if (!name || !email) {
      Components.toast('Name and email are required', 'error');
      return;
    }

    try {
      if (userId) {
        await DB.updateUser(userId, { name, email, phone: phone || null, additional_email: additionalEmail || null, avatar_url, is_admin });
        // If editing own account, update local session
        const currentUser = App.getUser();
        if (currentUser && currentUser.id === userId) {
          const updated = await DB.getUserById(userId);
          localStorage.setItem('shop_user', JSON.stringify({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            is_admin: !!updated.is_admin,
            avatar_url: updated.avatar_url
          }));
          App.updateAuthUI();
        }
        Components.toast('User updated!', 'success');
      } else {
        const password = document.getElementById('uf_password').value;
        const confirm = document.getElementById('uf_confirm').value;
        if (password !== confirm) {
          Components.toast('Passwords do not match', 'error');
          return;
        }
        if (password.length < 8) {
          Components.toast('Password must be at least 8 characters', 'error');
          return;
        }
        await DB.createUser(name, email, password, is_admin);
        Components.toast('User created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.loadUsers();
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        Components.toast('This email is already registered', 'error');
      } else {
        Components.toast('Failed to save user: ' + error.message, 'error');
      }
    }
  },

  confirmDeleteUser(userId, userName) {
    const currentUser = App.getUser();
    if (currentUser && currentUser.id === userId) {
      Components.toast('You cannot delete your own account', 'error');
      return;
    }
    Components.showModal('Delete User', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete <strong>${userName}</strong>? Their orders, reviews, and messages will be unlinked (not deleted).
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteUser(${userId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteUser(userId) {
    try {
      await DB.deleteUser(userId);
      Components.toast('User deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadUsers();
    } catch (error) {
      Components.toast('Failed to delete user: ' + error.message, 'error');
    }
  },

  // ===================== MESSAGES =====================
  async loadMessages() {
    const container = document.getElementById('adminContent');

    try {
      const messages = await DB.getAllMessages();

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Inbox</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${messages.length} message${messages.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width:30px">#</th>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Reply</th>
                <th>Date</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${messages.length === 0 ?
                '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">No messages yet</td></tr>' :
                messages.map(m => `
                  <tr style="${!m.is_read && !m.admin_reply ? 'background:rgba(0,102,204,0.03)' : ''}${m.admin_reply ? 'opacity:0.7' : ''}">
                    <td style="color:var(--text-muted);font-size:0.85rem">#${m.id}</td>
                    <td>
                      <div style="font-weight:600;font-size:0.85rem">${m.name}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted)">${m.email}</div>
                    </td>
                    <td><span style="font-size:0.85rem;font-weight:500">${m.subject || '—'}</span></td>
                    <td>
                      <span style="font-size:0.85rem;color:var(--text-secondary);display:block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(m.message || '').replace(/"/g, '&quot;')}">
                        ${m.message ? m.message.substring(0, 60) + (m.message.length > 60 ? '...' : '') : '—'}
                      </span>
                    </td>
                    <td>
                      ${!m.is_read && !m.admin_reply 
                        ? '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.7rem;font-weight:600;background:rgba(245,158,11,0.15);color:var(--warning)">New</span>'
                        : m.admin_reply 
                          ? '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.7rem;font-weight:600;background:rgba(0,230,118,0.15);color:var(--success)">Replied</span>'
                          : '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.7rem;font-weight:600;background:var(--bg-input);color:var(--text-muted)">Read</span>'
                      }
                    </td>
                    <td>
                      ${m.admin_reply 
                        ? `<span style="font-size:0.8rem;color:var(--text-secondary);display:block;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(m.admin_reply || '').replace(/"/g, '&quot;')}">${m.admin_reply.substring(0, 30)}${m.admin_reply.length > 30 ? '...' : ''}</span>`
                        : '<span style="font-size:0.75rem;color:var(--text-muted)">—</span>'
                      }
                    </td>
                    <td style="font-size:0.8rem;color:var(--text-muted)">${new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="admin-action-btn" onclick="AdminPage.showMessageDetail(${m.id})" title="View & Reply">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteMessage(${m.id})" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Messages error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load messages', error.message);
    }
  },

  async showMessageDetail(messageId) {
    try {
      // Mark as read
      await DB.markMessageRead(messageId);

      const messages = await DB.query('SELECT * FROM contact_messages WHERE id = ?', [messageId]);
      const msg = messages[0];
      if (!msg) {
        Components.toast('Message not found', 'error');
        return;
      }

      Components.showModal(`Message from ${msg.name}`, `
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:2px">Name</div>
              <div style="font-weight:600">${msg.name}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:2px">Email</div>
              <div style="font-weight:600">${msg.email}</div>
            </div>
          </div>
          ${msg.subject ? `
          <div>
            <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:2px">Subject</div>
            <div style="font-weight:600">${msg.subject}</div>
          </div>` : ''}
          <div>
            <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:4px">Message</div>
            <div style="padding:14px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.9rem;line-height:1.7;white-space:pre-wrap">${msg.message}</div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted)">
            ${new Date(msg.created_at).toLocaleString()}
          </div>
          
          ${msg.admin_reply ? `
          <div style="padding:14px;background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.15);border-radius:var(--radius-sm)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <i class="fas fa-reply" style="color:var(--success)"></i>
              <span style="font-weight:600;font-size:0.85rem;color:var(--success)">Your Reply</span>
            </div>
            <div style="font-size:0.9rem;line-height:1.7;white-space:pre-wrap">${msg.admin_reply}</div>
            ${msg.replied_at ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px">Replied on ${new Date(msg.replied_at).toLocaleString()}</div>` : ''}
          </div>
          ` : `
          <div style="padding:16px;background:rgba(0,102,204,0.06);border:1px solid rgba(0,102,204,0.1);border-radius:var(--radius-sm)">
            <label style="font-weight:600;font-size:0.85rem;margin-bottom:8px;display:block">
              <i class="fas fa-reply"></i> Write a Reply
            </label>
            <textarea id="replyMessage_${msg.id}" rows="4" style="resize:vertical;margin-bottom:10px" placeholder="Type your reply here..."></textarea>
            <button class="btn btn-primary btn-sm" onclick="AdminPage.replyToMessage(${msg.id})">
              <i class="fas fa-paper-plane"></i> Send Reply
            </button>
          </div>
          `}
        </div>
      `, '540px');
    } catch (error) {
      Components.toast('Failed to load message details', 'error');
    }
  },

  async replyToMessage(messageId) {
    const replyInput = document.getElementById(`replyMessage_${messageId}`);
    if (!replyInput || !replyInput.value.trim()) {
      Components.toast('Please enter a reply', 'error');
      return;
    }

    const admin = App.getUser();
    if (!admin || !admin.is_admin) {
      Components.toast('You must be an admin to reply', 'error');
      return;
    }

    try {
      await DB.replyToMessage(messageId, replyInput.value.trim(), admin.id);
      Components.toast('Reply sent!', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadMessages();
    } catch (error) {
      Components.toast('Failed to send reply: ' + error.message, 'error');
    }
  },

  confirmDeleteMessage(messageId) {
    Components.showModal('Delete Message', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete this message? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteMessage(${messageId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteMessage(messageId) {
    try {
      await DB.deleteMessage(messageId);
      Components.toast('Message deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadMessages();
    } catch (error) {
      Components.toast('Failed to delete message', 'error');
    }
  },

  // ===================== SUBSCRIBERS =====================
  async loadSubscribers() {
    const container = document.getElementById('adminContent');

    try {
      const subscribers = await DB.getAllSubscribers();

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Newsletter Subscribers</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${subscribers.length} total</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Active</th>
                <th>Subscribed At</th>
                <th style="width:100px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${subscribers.length === 0 ?
                '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No subscribers yet</td></tr>' :
                subscribers.map(s => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${s.id}</td>
                    <td><span style="font-weight:600">${s.email}</span></td>
                    <td>${s.name || '—'}</td>
                    <td>
                      ${s.active ?
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:rgba(0,230,118,0.15);color:var(--success)">Active</span>' :
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;background:var(--bg-input);color:var(--text-muted)">Inactive</span>'
                      }
                    </td>
                    <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(s.subscribed_at).toLocaleString()}</td>
                    <td>
                      <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteSubscriber(${s.id}, '${s.email.replace(/'/g, "\\'")}')" title="Delete Subscriber">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Subscribers error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load subscribers', error.message);
    }
  },

  confirmDeleteSubscriber(id, email) {
    Components.showModal('Delete Subscriber', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete the subscriber <strong>${email}</strong>? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteSubscriber(${id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteSubscriber(id) {
    try {
      await DB.deleteSubscriber(id);
      Components.toast('Subscriber deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadSubscribers();
    } catch (error) {
      Components.toast('Failed to delete subscriber', 'error');
    }
  },

  // ===================== REVIEWS =====================
  async loadReviews() {
    const container = document.getElementById('adminContent');

    try {
      const reviews = await DB.getAllReviews();

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">All Reviews</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${reviews.length} total</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Author</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th style="width:100px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.length === 0 ?
                '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No reviews yet</td></tr>' :
                reviews.map(r => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${r.id}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        ${r.product_image ? `<img src="${r.product_image}" alt="${r.product_name || ''}" style="width:32px;height:32px;border-radius:6px;object-fit:cover">` : ''}
                        <span style="font-size:0.85rem;font-weight:500">${r.product_name || 'Deleted Product'}</span>
                      </div>
                    </td>
                    <td><span style="font-weight:600">${r.author_name}</span></td>
                    <td>
                      <span style="color:#ffc107">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    </td>
                    <td>
                      <span style="font-size:0.85rem;color:var(--text-secondary);display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(r.comment || '').replace(/"/g, '&quot;')}">
                        ${r.comment ? r.comment.substring(0, 80) + (r.comment.length > 80 ? '...' : '') : '—'}
                      </span>
                    </td>
                    <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteReview(${r.id}, '${r.author_name.replace(/'/g, "\\'")}')" title="Delete Review">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Reviews error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load reviews', error.message);
    }
  },

  confirmDeleteReview(id, authorName) {
    Components.showModal('Delete Review', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete the review by <strong>${authorName}</strong>? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteReview(${id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteReview(id) {
    try {
      await DB.deleteReview(id);
      Components.toast('Review deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadReviews();
    } catch (error) {
      Components.toast('Failed to delete review', 'error');
    }
  },

  // ===================== BLOG =====================
  async loadBlogPosts() {
    const container = document.getElementById('adminContent');
    try {
      const posts = await DB.getAllBlogPosts({});
      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Blog Posts</h3>
          <button class="btn btn-primary btn-sm" onclick="AdminPage.showBlogForm(null)">
            <i class="fas fa-plus"></i> New Post
          </button>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Read</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Date</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${posts.length === 0 ?
                '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">No blog posts yet</td></tr>' :
                posts.map(p => `
                  <tr>
                    <td style="color:var(--text-muted);font-size:0.85rem">#${p.id}</td>
                    <td><span style="font-weight:600;font-size:0.9rem">${p.title}</span></td>
                    <td><span style="font-size:0.8rem">${p.category || '—'}</span></td>
                    <td><span style="font-size:0.85rem">${p.author || 'PixabAnimation'}</span></td>
                    <td><span style="font-size:0.85rem">${p.reading_time || '—'} min</span></td>
                    <td>
                      ${p.published ? 
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:rgba(16,185,129,0.15);color:var(--success)">Published</span>' :
                        '<span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;background:var(--bg-input);color:var(--text-muted)">Draft</span>'
                      }
                    </td>
                    <td>
                      <button class="admin-toggle ${p.featured ? 'active' : ''}" 
                              onclick="AdminPage.toggleBlogFeatured(${p.id}, ${!p.featured})">
                        <div class="admin-toggle-knob"></div>
                      </button>
                    </td>
                    <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="admin-action-btn" onclick="AdminPage.showBlogForm(${p.id})" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <a href="#/blog/${p.slug}" target="_blank" class="admin-action-btn" title="Preview">
                          <i class="fas fa-eye"></i>
                        </a>
                        <button class="admin-action-btn delete" onclick="AdminPage.deleteBlogPost(${p.id}, '${p.title.replace(/'/g, "\\'")}')" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Blog error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load blog posts', error.message);
    }
  },

  async showBlogForm(postId) {
    let post = null;
    if (postId) {
      post = await DB.getBlogPostById(postId);
    }
    const isEdit = !!post;

    Components.showModal(isEdit ? 'Edit Post' : 'New Blog Post', `
      <form id="blogForm" onsubmit="AdminPage.saveBlogPost(event, ${postId || 'null'})" style="display:flex;flex-direction:column;gap:14px">
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" id="bf_title" value="${isEdit ? post.title : ''}" required>
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input type="text" id="bf_slug" value="${isEdit ? post.slug : ''}" placeholder="auto-generated">
          </div>
        </div>
        <div class="form-group">
          <label>Excerpt / Summary</label>
          <textarea id="bf_excerpt" rows="2" style="resize:vertical" placeholder="Brief summary for card preview...">${isEdit ? (post.excerpt || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label>Content * (Markdown supported: **bold**, *italic*, [links](url), !![image](url), ## headings)</label>
          <textarea id="bf_content" rows="12" style="resize:vertical;font-family:monospace;font-size:0.85rem">${isEdit ? (post.content || '') : ''}</textarea>
        </div>
        <div class="admin-form-grid-3">
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="bf_category" value="${isEdit ? (post.category || '') : ''}" placeholder="e.g. AI, Design, Freelancing">
          </div>
          <div class="form-group">
            <label>Author</label>
            <input type="text" id="bf_author" value="${isEdit ? (post.author || 'PixabAnimation') : 'PixabAnimation'}">
          </div>
          <div class="form-group">
            <label>Reading Time (min)</label>
            <input type="number" id="bf_reading_time" min="1" value="${isEdit ? (post.reading_time || 5) : 5}">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Cover Image URL</label>
            <input type="url" id="bf_cover" value="${isEdit ? (post.cover_image || '') : ''}" placeholder="https://...image.jpg">
          </div>
          <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" id="bf_tags" value="${isEdit ? (() => { try { return JSON.parse(post.tags || '[]').join(', '); } catch { return ''; } })() : ''}" placeholder="motion graphics, AI, tutorial">
          </div>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Meta Title (SEO)</label>
            <input type="text" id="bf_meta_title" value="${isEdit ? (post.meta_title || '') : ''}" placeholder="Defaults to post title">
          </div>
          <div class="form-group">
            <label>Meta Description (SEO)</label>
            <input type="text" id="bf_meta_description" value="${isEdit ? (post.meta_description || '') : ''}" placeholder="Defaults to excerpt">
          </div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;padding:4px 0">
          <label class="admin-form-checkbox">
            <input type="checkbox" id="bf_published" ${isEdit && post.published ? 'checked' : ''}>
            <span>Published</span>
          </label>
          <label class="admin-form-checkbox">
            <input type="checkbox" id="bf_featured" ${isEdit && post.featured ? 'checked' : ''}>
            <span>Featured</span>
          </label>
        </div>
        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'pen-fancy'}"></i> ${isEdit ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    `, '640px');

    // Auto-generate slug from title
    const slugField = document.getElementById('bf_slug');
    const titleField = document.getElementById('bf_title');
    if (!slugField.value) {
      titleField?.addEventListener('input', function() {
        if (!slugField.dataset.manual) {
          slugField.value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
        }
      });
    }
    slugField?.addEventListener('input', function() {
      this.dataset.manual = 'true';
    });
  },

  async saveBlogPost(event, postId) {
    event.preventDefault();
    const title = document.getElementById('bf_title').value.trim();
    const slug = document.getElementById('bf_slug').value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
    const excerpt = document.getElementById('bf_excerpt').value.trim();
    const content = document.getElementById('bf_content').value.trim();
    const category = document.getElementById('bf_category').value.trim();
    const author = document.getElementById('bf_author').value.trim() || 'PixabAnimation';
    const readingTime = parseInt(document.getElementById('bf_reading_time').value) || 5;
    const coverImage = document.getElementById('bf_cover').value.trim();
    const tagsStr = document.getElementById('bf_tags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    const metaTitle = document.getElementById('bf_meta_title').value.trim();
    const metaDescription = document.getElementById('bf_meta_description').value.trim();
    const published = document.getElementById('bf_published').checked ? 1 : 0;
    const featured = document.getElementById('bf_featured').checked ? 1 : 0;

    if (!title || !content) {
      Components.toast('Title and content are required', 'error');
      return;
    }

    const data = { title, slug, excerpt, content, category, author, reading_time: readingTime, cover_image: coverImage || null, tags, meta_title: metaTitle || null, meta_description: metaDescription || null, published, featured };

    try {
      if (postId) {
        await DB.updateBlogPost(postId, data);
        Components.toast('Post updated!', 'success');
      } else {
        await DB.createBlogPost(data);
        Components.toast('Post created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.loadBlogPosts();
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        Components.toast('A post with this slug already exists', 'error');
      } else {
        Components.toast('Failed to save post: ' + error.message, 'error');
      }
    }
  },

  async toggleBlogFeatured(postId, featured) {
    try {
      await DB.updateBlogPost(postId, { featured: featured ? 1 : 0 });
      Components.toast(featured ? 'Featured' : 'Unfeatured', 'success');
      this.loadBlogPosts();
    } catch (error) {
      Components.toast('Failed to update', 'error');
    }
  },

  async deleteBlogPost(postId, postTitle) {
    Components.showModal('Delete Post', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete <strong>${postTitle}</strong>? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.confirmDeleteBlogPost(${postId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async confirmDeleteBlogPost(postId) {
    try {
      await DB.deleteBlogPost(postId);
      Components.toast('Post deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadBlogPosts();
    } catch (error) {
      Components.toast('Failed to delete', 'error');
    }
  },

  // ===================== ADS MANAGEMENT =====================
  async loadAds() {
    const container = document.getElementById('adminContent');
    try {
      const ads = await DB.getAllAds();
      const blogPageFiles = [
        'ai-assistants-for-designers.html', 'ai-design-tools-creative-workflow.html',
        'ai-driven-personalization-digital-media.html', 'ai-motion-graphics-revolution.html',
        'ai-powered-voice-synthesis-video.html', 'ai-video-generation-2026.html',
        'building-interactive-data-visualizations.html', 'building-motion-design-portfolio.html',
        'building-personal-brand-designer.html', 'chatgpt-codex-vs-claude-coding.html',
        'claude-ai-coding-productivity.html', 'client-management-creative-freelancers.html',
        'color-theory-motion-designers.html', 'computer-vision-animation.html',
        'freelancing-tips-motion-designers.html', 'future-of-web-animation-2026.html',
        'generative-ai-copyright-creative-work.html', 'green-screen-compositing-tips.html',
        'kinetic-typography-video-production.html', 'large-language-models-creatives.html',
        'logo-animation-techniques.html', 'lottie-files-web-animation.html',
        'machine-learning-visual-effects.html', 'marketing-motion-design-business.html',
        'mastering-after-effects-expressions.html', 'motion-design-principles-beginners.html',
        'motion-graphics-stock-video-resources.html', 'neural-networks-image-processing.html',
        'performance-optimization-web-animations.html', 'pricing-animation-services.html',
        'remote-collaboration-creative-teams.html', 'responsive-design-creative-portfolios.html',
        'seamless-loop-animations.html', 'svg-animation-techniques.html',
        'threejs-3d-web-experiences.html', 'top-motion-design-tools-2026.html',
        'typography-trends-2026.html', 'understanding-diffusion-models.html',
        'visual-storytelling-data-animation.html', 'web-animation-css-javascript.html'
      ];

      container.innerHTML = `
        <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h3 style="font-size:1rem;font-weight:600;margin:0">Blog Advertisements</h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">Manage ads displayed across all 40 blog pages. ${ads.filter(a => a.is_active).length} active of ${ads.length} total.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="AdminPage.showAdForm(null, ${JSON.stringify(blogPageFiles).replace(/"/g, "'" )})">
            <i class="fas fa-plus"></i> Create Ad
          </button>
        </div>
        ${ads.length === 0 ? `
        <div style="text-align:center;padding:60px;border:2px dashed var(--border-light);border-radius:var(--radius-lg)">
          <i class="fas fa-bullhorn" style="font-size:3rem;color:var(--text-muted);margin-bottom:16px;display:block"></i>
          <h3 style="margin-bottom:8px">No ads yet</h3>
          <p style="color:var(--text-muted);margin-bottom:20px">Create your first blog advertisement to display across your blog pages.</p>
          <button class="btn btn-primary" onclick="AdminPage.showAdForm(null, ${JSON.stringify(blogPageFiles).replace(/"/g, "'" )})">
            <i class="fas fa-plus"></i> Create Your First Ad
          </button>
        </div>
        ` : `
        <div style="display:flex;flex-direction:column;gap:16px">
          ${ads.map(ad => `
            <div class="glass" style="padding:20px;border-radius:var(--radius-md);display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;opacity:${ad.is_active ? '1' : '0.5'}">
              <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                  <span style="font-size:1.2rem;color:var(--accent-1);width:28px;text-align:center"><i class="fas ${ad.icon || 'fa-cube'}"></i></span>
                  <div>
                    <span style="font-weight:600;font-size:0.95rem">${ad.name}</span>
                    <span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:rgba(0,102,204,0.1);color:var(--accent-1);margin-left:8px;text-transform:uppercase;letter-spacing:0.5px">${ad.ad_type}</span>
                    ${ad.is_active ? '<span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:rgba(16,185,129,0.15);color:var(--success);margin-left:4px">Active</span>' : '<span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:var(--bg-input);color:var(--text-muted);margin-left:4px">Inactive</span>'}
                  </div>
                </div>
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:2px">${ad.title}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px;line-height:1.4">${ad.description}</div>
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:0.75rem;color:var(--text-muted)">
                  <span><i class="fas fa-bullseye"></i> ${ad.cta_text} → ${ad.cta_url.substring(0, 40)}${ad.cta_url.length > 40 ? '...' : ''}</span>
                  <span><i class="fas fa-file"></i> Pages: ${ad.target_pages === 'all' ? 'All (40)' : JSON.parse(ad.target_pages || '[]').length + ' selected'}</span>
                  <span><i class="fas fa-sort"></i> Order: ${ad.sort_order || 0}</span>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-shrink:0">
                <button class="admin-action-btn" onclick="AdminPage.toggleAd(${ad.id}, ${!ad.is_active})" title="${ad.is_active ? 'Deactivate' : 'Activate'}" style="color:${ad.is_active ? 'var(--warning)' : 'var(--success)'}">
                  <i class="fas fa-${ad.is_active ? 'pause' : 'play'}"></i>
                </button>
                <button class="admin-action-btn" onclick="AdminPage.showAdForm(${ad.id}, ${JSON.stringify(blogPageFiles).replace(/"/g, "'" )})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="admin-action-btn delete" onclick="AdminPage.confirmDeleteAd(${ad.id}, '${ad.name.replace(/'/g, "\\'")}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        `}
      `;
    } catch (error) {
      console.error('Ads error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load ads', error.message);
    }
  },

  async showAdForm(adId, blogPageFiles) {
    let ad = null;
    if (adId) {
      ad = await DB.getAdById(adId);
    }
    const isEdit = !!ad;

    const pageOptions = blogPageFiles.map(f => ({
      value: f,
      label: f.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    // Sort page options by label
    pageOptions.sort((a, b) => a.label.localeCompare(b.label));

    const selectedPages = isEdit && ad.target_pages !== 'all' ? (() => {
      try { return JSON.parse(ad.target_pages); } catch { return []; }
    })() : [];
    const isAllPages = isEdit && ad.target_pages === 'all';

    Components.showModal(isEdit ? 'Edit Advertisement' : 'Create Advertisement', `
      <form id="adForm" onsubmit="AdminPage.saveAd(event, ${adId || 'null'})" style="display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto">
        <div class="form-group">
          <label>Ad Name (internal label)</label>
          <input type="text" id="af_name" value="${isEdit ? ad.name : ''}" placeholder="e.g. Summer Sale Banner" required>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Ad Position Type</label>
            <select id="af_ad_type">
              <option value="ad1" ${isEdit && ad.ad_type === 'ad1' ? 'selected' : ''}>Position 1 (After intro)</option>
              <option value="ad2" ${isEdit && ad.ad_type === 'ad2' ? 'selected' : ''}>Position 2 (Middle of article)</option>
              <option value="ad3" ${isEdit && ad.ad_type === 'ad3' ? 'selected' : ''}>Position 3 (Before tags)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Icon (Font Awesome class)</label>
            <input type="text" id="af_icon" value="${isEdit ? (ad.icon || 'fa-cube') : 'fa-cube'}" placeholder="fa-cube">
          </div>
        </div>
        <div class="form-group">
          <label>Headline</label>
          <input type="text" id="af_title" value="${isEdit ? ad.title : ''}" placeholder="e.g. Premium Motion Graphics Assets" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="af_description" rows="2" style="resize:vertical" placeholder="Compelling description..." required>${isEdit ? ad.description : ''}</textarea>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>CTA Button Text</label>
            <input type="text" id="af_cta_text" value="${isEdit ? (ad.cta_text || 'Learn More') : 'Browse Collection'}">
          </div>
          <div class="form-group">
            <label>CTA URL</label>
            <input type="url" id="af_cta_url" value="${isEdit ? ad.cta_url : 'https://pixabanimation.github.io/#/shop'}">
          </div>
        </div>
        <div class="form-group">
          <label>Sort Order (lower numbers appear first)</label>
          <input type="number" id="af_sort_order" min="0" value="${isEdit ? (ad.sort_order || 0) : 0}">
        </div>
        <div class="form-group">
          <label>Target Pages</label>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <input type="checkbox" id="af_all_pages" ${isAllPages || !isEdit ? 'checked' : ''} onchange="document.getElementById('af_page_selection').style.display = this.checked ? 'none' : 'block'">
            <label for="af_all_pages" style="margin:0;font-weight:500">All blog pages</label>
          </div>
          <div id="af_page_selection" style="display:${isAllPages || !isEdit ? 'none' : 'block'};max-height:200px;overflow-y:auto;border:1px solid var(--border-light);border-radius:var(--radius-sm);padding:8px">
            ${pageOptions.map(p => `
              <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.85rem;cursor:pointer">
                <input type="checkbox" value="${p.value}" ${selectedPages.includes(p.value) ? 'checked' : ''} style="width:auto">
                ${p.label}
              </label>
            `).join('')}
          </div>
        </div>
        <label class="admin-form-checkbox">
          <input type="checkbox" id="af_is_active" ${(!isEdit || (isEdit && ad.is_active)) ? 'checked' : ''}>
          <span>Active (visible on pages)</span>
        </label>
        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Save Changes' : 'Create Advertisement'}
          </button>
        </div>
      </form>
    `, '640px');
  },

  async saveAd(event, adId) {
    event.preventDefault();
    const name = document.getElementById('af_name').value.trim();
    const ad_type = document.getElementById('af_ad_type').value;
    const icon = document.getElementById('af_icon').value.trim() || 'fa-cube';
    const title = document.getElementById('af_title').value.trim();
    const description = document.getElementById('af_description').value.trim();
    const cta_text = document.getElementById('af_cta_text').value.trim();
    const cta_url = document.getElementById('af_cta_url').value.trim();
    const sort_order = parseInt(document.getElementById('af_sort_order').value) || 0;
    const isAllPages = document.getElementById('af_all_pages').checked;
    const is_active = document.getElementById('af_is_active').checked ? 1 : 0;

    let target_pages = 'all';
    if (!isAllPages) {
      const checkboxes = document.querySelectorAll('#af_page_selection input[type="checkbox"]:checked');
      target_pages = JSON.stringify(Array.from(checkboxes).map(cb => cb.value));
    }

    if (!name || !title || !description) {
      Components.toast('Name, headline, and description are required', 'error');
      return;
    }

    const data = { name, ad_type, icon, title, description, cta_text, cta_url, target_pages, is_active, sort_order };

    try {
      if (adId) {
        await DB.updateAd(adId, data);
        Components.toast('Ad updated!', 'success');
      } else {
        await DB.createAd(data);
        Components.toast('Ad created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.loadAds();
    } catch (error) {
      Components.toast('Failed to save ad: ' + error.message, 'error');
    }
  },

  async toggleAd(adId, isActive) {
    try {
      await DB.toggleAd(adId, isActive);
      Components.toast(isActive ? 'Ad activated' : 'Ad deactivated', 'success');
      this.loadAds();
    } catch (error) {
      Components.toast('Failed to toggle ad', 'error');
    }
  },

  confirmDeleteAd(adId, adName) {
    Components.showModal('Delete Advertisement', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete <strong>${adName}</strong>? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPage.deleteAd(${adId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteAd(adId) {
    try {
      await DB.deleteAd(adId);
      Components.toast('Ad deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.loadAds();
    } catch (error) {
      Components.toast('Failed to delete ad', 'error');
    }
  },

  // Helper to get all blog page filenames for ads
  getBlogPageFiles() {
    return [
      'ai-assistants-for-designers.html', 'ai-design-tools-creative-workflow.html',
      'ai-driven-personalization-digital-media.html', 'ai-motion-graphics-revolution.html',
      'ai-powered-voice-synthesis-video.html', 'ai-video-generation-2026.html',
      'building-interactive-data-visualizations.html', 'building-motion-design-portfolio.html',
      'building-personal-brand-designer.html', 'chatgpt-codex-vs-claude-coding.html',
      'claude-ai-coding-productivity.html', 'client-management-creative-freelancers.html',
      'color-theory-motion-designers.html', 'computer-vision-animation.html',
      'freelancing-tips-motion-designers.html', 'future-of-web-animation-2026.html',
      'generative-ai-copyright-creative-work.html', 'green-screen-compositing-tips.html',
      'kinetic-typography-video-production.html', 'large-language-models-creatives.html',
      'logo-animation-techniques.html', 'lottie-files-web-animation.html',
      'machine-learning-visual-effects.html', 'marketing-motion-design-business.html',
      'mastering-after-effects-expressions.html', 'motion-design-principles-beginners.html',
      'motion-graphics-stock-video-resources.html', 'neural-networks-image-processing.html',
      'performance-optimization-web-animations.html', 'pricing-animation-services.html',
      'remote-collaboration-creative-teams.html', 'responsive-design-creative-portfolios.html',
      'seamless-loop-animations.html', 'svg-animation-techniques.html',
      'threejs-3d-web-experiences.html', 'top-motion-design-tools-2026.html',
      'typography-trends-2026.html', 'understanding-diffusion-models.html',
      'visual-storytelling-data-animation.html', 'web-animation-css-javascript.html'
    ];
  },

  // ===================== COUPONS =====================
  async loadCoupons() {
    const container = document.getElementById('adminContent');

    try {
      const coupons = await DB.query(
        "SELECT *, CASE WHEN expires_at < datetime('now') THEN 'expired' WHEN current_uses >= max_uses THEN 'used_up' ELSE 'active' END as status FROM coupons ORDER BY created_at DESC"
      );

      container.innerHTML = `
        <div class="admin-toolbar">
          <h3 style="font-size:1rem;font-weight:600">Coupon Codes</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${coupons.length} coupons</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Purchase</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${coupons.length === 0 ?
                '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No coupons created</td></tr>' :
                coupons.map(c => {
                  const statusColors = { active: 'var(--success)', expired: 'var(--error)', used_up: 'var(--warning)' };
                  return `
                    <tr>
                      <td><span style="font-weight:700;font-family:monospace;font-size:0.95rem">${c.code}</span></td>
                      <td><span style="font-weight:600;color:var(--accent-1)">${c.discount_percent}% OFF</span></td>
                      <td>$${parseFloat(c.min_purchase || 0).toFixed(2)}</td>
                      <td>${c.current_uses || 0} / ${c.max_uses || '∞'}</td>
                      <td style="font-size:0.85rem;color:var(--text-muted)">${c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                      <td><span style="padding:2px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:${statusColors[c.status] || 'var(--text-muted)'}20;color:${statusColors[c.status] || 'var(--text-muted)'}">${c.status}</span></td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Coupons error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load coupons', error.message);
    }
  }
};
