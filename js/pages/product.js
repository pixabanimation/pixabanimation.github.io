// ============================================
// pixabanimation — Product Detail Page (Redesigned)
// ============================================

const ProductPage = {
  currentQty: 1,
  currentProduct: null,
  currentImages: [],
  lightboxIndex: 0,
  selectedRating: 5,
  stickyBarObserver: null,

  async render(params) {
    const content = document.getElementById('pageContent');
    const slug = params.params.slug;

    content.innerHTML = `
      <div class="product-page-wrap" style="padding:60px 24px;max-width:var(--max-width);margin:0 auto">
        ${Components.loadingSkeleton(1)}
      </div>
    `;

    try {
      const product = await DB.getProduct(slug);
      if (!product) {
        content.innerHTML = Components.emptyState(
          '🔍', 'Product Not Found', 'The product you are looking for does not exist.',
          'Continue Shopping', '#/shop'
        );
        return;
      }

      const reviews = await DB.getProductReviews(product.id);
      const isInWishlist = await DB.isInWishlist(product.id);
      const isVideo = product.media_type === 'video';
      let images = [];
      try {
        images = JSON.parse(product.images || '[]');
        if (!Array.isArray(images)) images = [];
      } catch (e) {
        images = [];
      }
      const allImages = [product.image_url, ...images.filter(i => i !== product.image_url)].filter(Boolean);
      const hasDiscount = product.compare_price && product.compare_price > product.price;
      const discountPct = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

      const formatDuration = (seconds) => {
        if (!seconds) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
      };

      // Store for later
      this.currentProduct = product;
      this.currentImages = allImages;
      this.currentQty = 1;
      this.selectedRating = 5;

      // Remove previous schema scripts
      document.querySelectorAll('#productSchema, #breadcrumbSchema').forEach(el => el.remove());

      // ── JSON-LD Schemas ──
      this._injectSchemas(product, reviews, allImages);

      // ── Build Review Stats ──
      const reviewStats = this._computeReviewStats(reviews);

      // ── Related Products ──
      let relatedProducts = [];
      try {
        if (product.category_slug) {
          const raw = await DB.getProductsByCategory(product.category_slug, 5);
          relatedProducts = (raw || []).filter(p => p.id !== product.id).slice(0, 4);
        }
      } catch (e) {
        relatedProducts = [];
      }

      // ── Render Page ──
      content.innerHTML = `
        <div class="product-body-pad">
          <div class="product-page-wrap page-enter">

            <!-- Breadcrumb -->
            <nav class="product-breadcrumb" aria-label="Breadcrumb">
              <a href="#/">Home</a>
              <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
              <a href="#/shop">Shop</a>
              ${product.category_name ? `
                <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
                <a href="#/shop?category=${product.category_slug || ''}">${product.category_name}</a>
              ` : ''}
              <span class="bc-sep"><i class="fas fa-chevron-right"></i></span>
              <span class="bc-current">${product.name}</span>
            </nav>

            <!-- Main Product Grid -->
            <div class="product-detail">

              <!-- Gallery Column -->
              <div class="product-gallery">
                ${isVideo ? this._renderVideoGallery(product, formatDuration) : this._renderImageGallery(product, allImages)}
              </div>

              <!-- Info Column -->
              <div class="product-info">
                <span class="product-card-category">
                  <i class="fas fa-tag"></i>
                  ${product.category_name || 'General'}
                </span>

                <h1>${product.name}</h1>

                <!-- Meta: Rating + Stock -->
                <div class="product-meta">
                  <div class="stars">${this._starsHtml(Math.round(product.rating || 0))}</div>
                  <span style="color:var(--text-muted);font-size:0.85rem">(${product.reviews_count || 0} reviews)</span>
                  <span class="meta-divider"></span>
                  <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    <i class="fas fa-${product.stock > 0 ? 'check-circle' : 'times-circle'}"></i>
                    ${product.stock > 0 ? 'In Stock' : 'Unavailable'}
                  </span>
                </div>

                <!-- Price -->
                <div class="product-price-block">
                  <span class="current-price text-gradient">$${parseFloat(product.price).toFixed(2)}</span>
                  ${hasDiscount ? `<span class="compare-price">$${parseFloat(product.compare_price).toFixed(2)}</span>` : ''}
                  ${hasDiscount ? `<span class="discount-badge"><i class="fas fa-bolt"></i> -${discountPct}%</span>` : ''}
                </div>

                <!-- Description -->
                <p class="product-description">${product.description || ''}</p>

                <!-- Video Specs -->
                ${isVideo && product.file_size ? this._renderVideoSpecs(product, formatDuration) : ''}

                <!-- Preview Block -->
                ${isVideo && product.preview_description ? `
                  <div class="product-preview-block">
                    <div class="preview-label"><i class="fas fa-eye"></i> Preview Information</div>
                    <p>${product.preview_description}</p>
                  </div>
                ` : ''}

                <!-- Actions -->
                <div class="product-actions">
                  ${isVideo ? `
                    <button class="btn btn-primary" onclick="ProductPage.addToCart()">
                      <i class="fas fa-download"></i> Purchase & Download
                    </button>
                  ` : `
                    <div class="quantity-selector">
                      <button onclick="ProductPage.changeQty(-1)" aria-label="Decrease quantity">−</button>
                      <span id="productQty">1</span>
                      <button onclick="ProductPage.changeQty(1)" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="btn btn-primary" onclick="ProductPage.addToCart()" ${product.stock <= 0 ? 'disabled' : ''}>
                      <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                  `}
                  <button class="btn btn-secondary btn-icon btn-lg wishlist-btn-lg ${isInWishlist ? 'active-wish' : ''}"
                          onclick="App.toggleWishlistById(${product.id})" id="wishlistBtn"
                          aria-label="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>

                <!-- Share Row -->
                <div class="product-share-row">
                  <span class="share-label">Share</span>
                  <a class="share-btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent('https://pixabanimation.github.io/#/product/' + product.slug)}" target="_blank" rel="noopener" aria-label="Share on Twitter"><i class="fab fa-x-twitter"></i></a>
                  <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://pixabanimation.github.io/#/product/' + product.slug)}" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
                  <a class="share-btn" href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent('https://pixabanimation.github.io/#/product/' + product.slug)}&media=${encodeURIComponent(product.image_url || '')}&description=${encodeURIComponent(product.name)}" target="_blank" rel="noopener" aria-label="Share on Pinterest"><i class="fab fa-pinterest-p"></i></a>
                  <button class="share-btn" onclick="ProductPage.copyLink()" aria-label="Copy link"><i class="fas fa-link"></i></button>
                </div>

                <!-- Trust Badges -->
                <div class="product-trust-row">
                  ${isVideo ? `
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-bolt"></i></div>
                      <div class="trust-text"><strong>Instant Access</strong><span>Download right after purchase</span></div>
                    </div>
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-shield-alt"></i></div>
                      <div class="trust-text"><strong>Secure File</strong><span>Watermark protected delivery</span></div>
                    </div>
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-headset"></i></div>
                      <div class="trust-text"><strong>Pro Support</strong><span>Dedicated help center</span></div>
                    </div>
                  ` : `
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-truck"></i></div>
                      <div class="trust-text"><strong>Free Shipping</strong><span>Orders over $50</span></div>
                    </div>
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-undo"></i></div>
                      <div class="trust-text"><strong>Easy Returns</strong><span>30-day policy</span></div>
                    </div>
                    <div class="product-trust-item">
                      <div class="trust-icon"><i class="fas fa-lock"></i></div>
                      <div class="trust-text"><strong>Secure Payment</strong><span>SSL encrypted checkout</span></div>
                    </div>
                  `}
                </div>

                <!-- Info Grid -->
                <div class="product-info-grid">
                  <div class="product-info-item">
                    <strong>Category</strong>
                    <a href="#/shop?category=${product.category_slug || ''}" style="color:var(--accent-1);text-decoration:none">
                      ${product.category_name || 'General'}
                    </a>
                  </div>
                  <div class="product-info-item">
                    <strong>SKU</strong>
                    SKU-${String(product.id).padStart(4, '0')}
                  </div>
                  <div class="product-info-item">
                    <strong>Availability</strong>
                    ${product.stock > 0 ? 'Digital download' : 'Unavailable'}
                  </div>
                  <div class="product-info-item">
                    <strong>Delivery</strong>
                    ${isVideo ? 'Instant download' : 'Free shipping available'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs Section -->
          <div class="product-tabs-section page-enter">
            <div class="product-tabs-header" role="tablist">
              <button class="product-tab-btn active" role="tab" onclick="ProductPage.switchTab('description', this)" aria-selected="true">Description</button>
              <button class="product-tab-btn" role="tab" onclick="ProductPage.switchTab('specifications', this)" aria-selected="false">Specifications</button>
              <button class="product-tab-btn" role="tab" onclick="ProductPage.switchTab('reviews', this)" aria-selected="false">
                Reviews <span class="product-tab-count">${reviews.length}</span>
              </button>
            </div>

            <!-- Description Tab -->
            <div class="product-tab-panel active" id="tab-description" role="tabpanel">
              <div style="max-width:720px;color:var(--text-secondary);line-height:1.8;font-size:0.95rem">
                <p>${product.description || 'No description available for this product.'}</p>
                ${isVideo && product.preview_description ? `
                  <div style="margin-top:20px;padding:18px;background:var(--bg-secondary);border-radius:var(--radius-lg)">
                    <strong style="color:var(--text-primary)">What's included:</strong>
                    <p style="margin-top:8px">${product.preview_description}</p>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Specifications Tab -->
            <div class="product-tab-panel" id="tab-specifications" role="tabpanel">
              <div style="max-width:560px">
                <div class="product-info-grid" style="border:1px solid var(--border-light)">
                  <div class="product-info-item"><strong>Product ID</strong> ${product.id}</div>
                  <div class="product-info-item"><strong>SKU</strong> SKU-${String(product.id).padStart(4, '0')}</div>
                  <div class="product-info-item"><strong>Category</strong> ${product.category_name || 'General'}</div>
                  <div class="product-info-item"><strong>Type</strong> ${isVideo ? 'Video / Digital' : 'Physical'}</div>
                  <div class="product-info-item"><strong>Price</strong> $${parseFloat(product.price).toFixed(2)}</div>
                  <div class="product-info-item"><strong>Availability</strong> ${product.stock > 0 ? 'In Stock' : 'Unavailable'}</div>
                  ${isVideo && product.file_size ? `<div class="product-info-item"><strong>File Size</strong> ${product.file_size} GB</div>` : ''}
                  ${isVideo && product.duration ? `<div class="product-info-item"><strong>Duration</strong> ${formatDuration(product.duration)}</div>` : ''}
                  <div class="product-info-item"><strong>Rating</strong> ${parseFloat(product.rating || 0).toFixed(1)} / 5.0</div>
                  <div class="product-info-item"><strong>Reviews</strong> ${product.reviews_count || 0}</div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div class="product-tab-panel" id="tab-reviews" role="tabpanel">
              ${reviews.length > 0 ? this._renderReviewsSummary(reviewStats) : ''}

              <div id="reviewsList">
                ${reviews.length === 0
                  ? '<p style="color:var(--text-muted);margin-bottom:24px;font-size:0.9rem">No reviews yet. Be the first to share your experience!</p>'
                  : reviews.map(r => Components.reviewCard(r)).join('')}
              </div>

              <!-- Write a Review -->
              <div class="review-form-wrap">
                <h3>Write a Review</h3>
                <form onsubmit="ProductPage.submitReview(event, ${product.id})" style="display:flex;flex-direction:column;gap:16px">
                  <div class="form-group">
                    <label style="font-weight:600;font-size:0.85rem;margin-bottom:6px;display:block">Your Name</label>
                    <input type="text" id="reviewName" placeholder="Your name" required style="width:100%">
                  </div>
                  <div class="form-group">
                    <label style="font-weight:600;font-size:0.85rem;margin-bottom:6px;display:block">Rating</label>
                    <div class="review-form-stars" id="reviewFormStars">
                      ${[1,2,3,4,5].map(i => `<span class="rf-star ${i <= 5 ? 'active' : ''}" data-rating="${i}" onclick="ProductPage.setReviewRating(${i})">&#9733;</span>`).join('')}
                    </div>
                    <input type="hidden" id="reviewRating" value="5">
                  </div>
                  <div class="form-group">
                    <label style="font-weight:600;font-size:0.85rem;margin-bottom:6px;display:block">Comment</label>
                    <textarea id="reviewComment" rows="3" placeholder="Share your experience..." style="resize:vertical;width:100%"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" style="align-self:flex-start">
                    <i class="fas fa-paper-plane"></i> Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Related Products -->
          ${relatedProducts.length > 0 ? `
            <div class="related-products-section page-enter">
              <div class="related-products-header">
                <h2>You May Also Like</h2>
                <a href="#/shop?category=${product.category_slug || ''}">View all <i class="fas fa-arrow-right"></i></a>
              </div>
              <div class="related-products-grid">
                ${relatedProducts.map((p, i) => Components.productCard(p, i)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Lightbox -->
          <div class="product-lightbox" id="productLightbox" onclick="ProductPage.closeLightbox(event)">
            <button class="product-lightbox-close" onclick="ProductPage.closeLightbox()" aria-label="Close lightbox"><i class="fas fa-times"></i></button>
            <button class="product-lightbox-nav product-lightbox-prev" onclick="ProductPage.navigateLightbox(-1);event.stopPropagation()" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
            <img id="lightboxImg" src="" alt="Product enlarged view">
            <button class="product-lightbox-nav product-lightbox-next" onclick="ProductPage.navigateLightbox(1);event.stopPropagation()" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            <div class="product-lightbox-counter" id="lightboxCounter"></div>
          </div>

          <!-- Sticky Mobile Purchase Bar -->
          <div class="product-sticky-bar" id="productStickyBar">
            <div class="product-sticky-bar-inner">
              <span class="sticky-price text-gradient">$${parseFloat(product.price).toFixed(2)}</span>
              <button class="sticky-btn" onclick="ProductPage.addToCart()">
                <i class="fas fa-${isVideo ? 'download' : 'shopping-bag'}"></i>
                ${isVideo ? 'Purchase' : 'Add to Cart'}
              </button>
              <button class="sticky-wishlist ${isInWishlist ? 'active-wish' : ''}" onclick="App.toggleWishlistById(${product.id})" id="stickyWishlistBtn" aria-label="Wishlist">
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Initialize video players
      VideoPlayer.init();

      // Setup sticky bar visibility observer
      this._setupStickyBar();

      // Initialize wishlist icon sync
      App.updateWishlistIcons?.();

    } catch (error) {
      console.error('Product page error:', error);
      content.innerHTML = Components.emptyState('😔', 'Failed to load product', error.message, 'Back to Shop', '#/shop');
    }
  },

  // ── Gallery Renderers ──

  _renderImageGallery(product, allImages) {
    return `
      <div class="product-main-image" id="mainImage" onclick="ProductPage.openLightbox()">
        <img src="${allImages[0] || product.image_url}" alt="${product.name} — PixabAnimation Premium Motion Graphic" width="600" height="600" loading="eager">
        <span class="zoom-hint"><i class="fas fa-expand"></i> Click to enlarge</span>
      </div>
      ${allImages.length > 1 ? `
        <div class="product-thumbnails">
          ${allImages.map((img, i) => `
            <div class="product-thumbnail ${i === 0 ? 'active' : ''}"
                 onclick="ProductPage.switchImage(this, '${img}', ${i})"
                 role="button" tabindex="0" aria-label="View image ${i + 1}">
              <img src="${img}" alt="${product.name} — View ${i + 1}" width="72" height="72" loading="lazy">
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  _renderVideoGallery(product, formatDuration) {
    return `
      <div class="product-main-image" style="background:#000;border-radius:var(--radius-xl)">
        ${product.preview_url ? VideoPlayer.render({
          src: product.preview_url,
          poster: product.image_url,
          height: '100%',
          controls: true
        }) : `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:350px;gap:16px;color:var(--text-muted)">
            <i class="fas fa-film" style="font-size:4rem;opacity:0.3"></i>
            <span>Preview video not available</span>
          </div>
        `}
        ${product.duration ? `
          <div style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.8);color:#fff;padding:4px 12px;border-radius:var(--radius-sm);font-size:0.8rem;backdrop-filter:blur(8px)">
            <i class="fas fa-clock"></i> ${formatDuration(product.duration)}
          </div>
        ` : ''}
      </div>
    `;
  },

  _renderVideoSpecs(product, formatDuration) {
    return `
      <div class="product-video-specs">
        <div class="product-video-spec">
          <div class="spec-icon"><i class="fas fa-file-video"></i></div>
          <div class="spec-value">${product.file_size} GB</div>
          <div class="spec-label">File Size</div>
        </div>
        ${product.duration ? `
          <div class="product-video-spec">
            <div class="spec-icon"><i class="fas fa-clock"></i></div>
            <div class="spec-value">${formatDuration(product.duration)}</div>
            <div class="spec-label">Duration</div>
          </div>
        ` : ''}
        <div class="product-video-spec">
          <div class="spec-icon"><i class="fas fa-download"></i></div>
          <div class="spec-value">Instant</div>
          <div class="spec-label">Download</div>
        </div>
      </div>
    `;
  },

  _renderReviewsSummary(stats) {
    const maxCount = Math.max(...Object.values(stats.distribution), 1);
    return `
      <div class="reviews-summary">
        <div class="reviews-summary-big">
          <div class="big-number">${stats.average.toFixed(1)}</div>
          <div class="big-stars">${this._starsHtml(Math.round(stats.average))}</div>
          <div class="big-count">${stats.total} review${stats.total !== 1 ? 's' : ''}</div>
        </div>
        <div class="reviews-bars">
          ${[5,4,3,2,1].map(n => `
            <div class="reviews-bar-row">
              <span class="bar-label">${n}</span>
              <div class="reviews-bar-track">
                <div class="reviews-bar-fill" style="width:${(stats.distribution[n] / maxCount) * 100}%"></div>
              </div>
              <span class="bar-count">${stats.distribution[n]}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ── Helpers ──

  _starsHtml(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  },

  _computeReviewStats(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach(r => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[rating]++;
      sum += rating;
    });
    return {
      total: reviews.length,
      average: reviews.length > 0 ? sum / reviews.length : 0,
      distribution
    };
  },

  _injectSchemas(product, reviews, allImages) {
    const productUrl = `https://pixabanimation.github.io/#/product/${product.slug}`;
    const uniqueImages = [...new Set(allImages.filter(Boolean))];

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': productUrl,
      'name': product.name,
      'description': product.description || `${product.name} — premium motion graphics asset from PixabAnimation.`,
      'url': productUrl,
      'sku': `SKU-${String(product.id).padStart(4, '0')}`,
      'mpn': `PIX-${product.id}`,
      'image': uniqueImages.length > 1 ? uniqueImages : (uniqueImages[0] || 'https://pixabanimation.github.io/assets/pixabanimation-logo.png'),
      'category': product.category_name || 'Motion Graphics',
      'keywords': [product.name, product.category_name, 'motion graphics', 'animation asset', 'premium template'].filter(Boolean).join(', '),
      'brand': { '@type': 'Brand', 'name': 'PixabAnimation', 'url': 'https://pixabanimation.github.io' },
      'manufacturer': { '@type': 'Organization', 'name': 'PixabAnimation' },
      'offers': {
        '@type': 'Offer',
        '@id': `${productUrl}#offer`,
        'url': productUrl,
        'priceCurrency': 'USD',
        'price': parseFloat(product.price),
        'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'itemCondition': 'https://schema.org/NewCondition',
        'seller': { '@type': 'Organization', 'name': 'PixabAnimation' }
      }
    };

    if (product.rating && product.reviews_count) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': Math.round(product.rating * 10) / 10,
        'bestRating': 5,
        'worstRating': 1,
        'ratingCount': product.reviews_count,
        'reviewCount': product.reviews_count
      };
    }

    if (reviews && reviews.length > 0) {
      productSchema.review = reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        'author': { '@type': 'Person', 'name': r.author_name || 'Verified Customer' },
        'datePublished': r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        'reviewBody': r.comment || '',
        'reviewRating': { '@type': 'Rating', 'ratingValue': r.rating || 5, 'bestRating': 5 }
      }));
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${productUrl}#breadcrumb`,
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://pixabanimation.github.io/#/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Shop', 'item': 'https://pixabanimation.github.io/#/shop' },
        ...(product.category_name ? [{ '@type': 'ListItem', 'position': 3, 'name': product.category_name, 'item': `https://pixabanimation.github.io/#/shop?category=${product.category_slug || ''}` }] : []),
        { '@type': 'ListItem', 'position': product.category_name ? 4 : 3, 'name': product.name }
      ]
    };

    const schemaScript = document.createElement('script');
    schemaScript.id = 'productSchema';
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(productSchema);
    document.head.appendChild(schemaScript);

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'breadcrumbSchema';
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
  },

  _setupStickyBar() {
    const actionsEl = document.querySelector('.product-actions');
    const stickyBar = document.getElementById('productStickyBar');
    if (!actionsEl || !stickyBar) return;

    if (this.stickyBarObserver) this.stickyBarObserver.disconnect();

    this.stickyBarObserver = new IntersectionObserver(
      ([entry]) => {
        stickyBar.classList.toggle('visible', !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' }
    );
    this.stickyBarObserver.observe(actionsEl);
  },

  // ── Tab Switching ──

  switchTab(tabId, btn) {
    document.querySelectorAll('.product-tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.product-tab-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + tabId);
    if (panel) panel.classList.add('active');
  },

  // ── Image Gallery ──

  switchImage(el, src, index) {
    document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const mainImg = document.querySelector('#mainImage img');
    if (mainImg) {
      mainImg.style.opacity = '0';
      mainImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
        mainImg.style.transform = 'scale(1)';
      }, 150);
    }
    this.lightboxIndex = index || 0;
  },

  // ── Lightbox ──

  openLightbox() {
    if (this.currentImages.length === 0) return;
    const lb = document.getElementById('productLightbox');
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (!lb || !img) return;

    img.src = this.currentImages[this.lightboxIndex] || this.currentImages[0];
    if (counter) counter.textContent = `${this.lightboxIndex + 1} / ${this.currentImages.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';

    this._lightboxKeyHandler = (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    };
    document.addEventListener('keydown', this._lightboxKeyHandler);
  },

  closeLightbox(e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.product-lightbox-close')) return;
    const lb = document.getElementById('productLightbox');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
    if (this._lightboxKeyHandler) {
      document.removeEventListener('keydown', this._lightboxKeyHandler);
      this._lightboxKeyHandler = null;
    }
  },

  navigateLightbox(dir) {
    if (this.currentImages.length <= 1) return;
    this.lightboxIndex = (this.lightboxIndex + dir + this.currentImages.length) % this.currentImages.length;
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (img) {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      setTimeout(() => {
        img.src = this.currentImages[this.lightboxIndex];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, 150);
    }
    if (counter) counter.textContent = `${this.lightboxIndex + 1} / ${this.currentImages.length}`;
  },

  // ── Review Rating Picker ──

  setReviewRating(rating) {
    this.selectedRating = rating;
    const input = document.getElementById('reviewRating');
    if (input) input.value = rating;
    document.querySelectorAll('.review-form-stars .rf-star').forEach(star => {
      const val = parseInt(star.dataset.rating);
      star.classList.toggle('active', val <= rating);
    });
  },

  // ── Actions ──

  changeQty(delta) {
    this.currentQty = Math.max(1, Math.min(99, this.currentQty + delta));
    const el = document.getElementById('productQty');
    if (el) {
      el.textContent = this.currentQty;
      el.style.transform = 'scale(1.2)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
    }
  },

  async addToCart() {
    let product = this.currentProduct;

    if (!product) {
      try {
        const slug = Router.currentRoute ? Router.currentRoute.split('/product/')[1] : null;
        if (slug) product = await DB.getProduct(decodeURIComponent(slug));
      } catch (e) {
        console.error('ProductPage.addToCart: route parse failed', e);
      }
    }

    if (!product) {
      Components.toast('Could not find product information. Please try refreshing the page.', 'error');
      return;
    }

    try {
      await DB.addToCart(product.id, this.currentQty);
      Components.toast(`${product.name} added to cart!`, 'success');
      App.updateCartBadge();
    } catch (error) {
      console.error('ProductPage.addToCart error:', error);
      Components.toast('Failed to add to cart. Please try again.', 'error');
    }
  },

  async submitReview(event, productId) {
    event.preventDefault();
    const name = document.getElementById('reviewName').value;
    const rating = this.selectedRating || parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value;

    try {
      await DB.addReview(productId, name, rating, comment);
      Components.toast('Review submitted! Thank you.', 'success');
      event.target.reset();
      this.setReviewRating(5);
    } catch (error) {
      Components.toast('Failed to submit review', 'error');
    }
  },

  copyLink() {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      Components.toast('Link copied to clipboard!', 'success');
    }).catch(() => {
      Components.toast('Failed to copy link', 'error');
    });
  },

  // ── Cleanup ──

  cleanup() {
    if (this.stickyBarObserver) {
      this.stickyBarObserver.disconnect();
      this.stickyBarObserver = null;
    }
    if (this._lightboxKeyHandler) {
      document.removeEventListener('keydown', this._lightboxKeyHandler);
      this._lightboxKeyHandler = null;
    }
    const lb = document.getElementById('productLightbox');
    if (lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  }
};

Router.beforeEach(() => {
  ProductPage.cleanup();
});
