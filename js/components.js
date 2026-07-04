// ============================================
// pixabanimation — Reusable UI Components
// ============================================

const Components = {
  // Toast notification
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle'
    };
    
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Product Card
  productCard(product, index = 0) {
    const hasDiscount = product.compare_price && product.compare_price > product.price;
    const discountPercent = hasDiscount 
      ? Math.round((1 - product.price / product.compare_price) * 100) 
      : 0;

    return `
      <div class="product-card stagger-${(index % 6) + 1}" 
           style="animation-delay: ${index * 0.05}s"
           data-product-id="${product.id}">
        <div class="product-card-image" onclick="Router.navigate('#/product/${product.slug}')">
          <img src="${product.image_url}" alt="${product.name} — PixabAnimation Motion Graphic Asset" width="300" height="300" loading="lazy">
          <div class="product-card-badges">
            ${product.featured ? '<span class="product-card-badge badge-featured">Featured</span>' : ''}
            ${hasDiscount ? `<span class="product-card-badge badge-sale">-${discountPercent}%</span>` : ''}
          </div>
          <button class="product-card-wishlist" onclick="App.toggleWishlist(${product.id}, this)" 
                  data-product-id="${product.id}" aria-label="Add to wishlist">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="product-card-body" onclick="Router.navigate('#/product/${product.slug}')">
          <div class="product-card-category">${product.category_name || 'General'}</div>
          <h3 class="product-card-title">${product.name}</h3>
          <div class="product-card-rating">
            <span class="stars">${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
            <span class="rating-count">(${product.reviews_count || 0})</span>
          </div>
          <div class="product-card-price">
            <span class="current-price">$${parseFloat(product.price).toFixed(2)}</span>
            ${hasDiscount ? `<span class="compare-price">$${parseFloat(product.compare_price).toFixed(2)}</span>` : ''}
          </div>
        </div>
        <div class="product-card-footer">
          <button class="add-to-cart-btn" onclick="App.addToCart(${product.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  },

  // Category Card
  categoryCard(category, index = 0) {
    return `
      <div class="category-card stagger-${(index % 4) + 1}" 
           onclick="Router.navigate('#/shop?category=${category.slug}')">
        <img src="${category.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'}" 
             alt="${category.name}" loading="lazy">
        <div class="category-card-overlay">
          <div class="category-card-name">${category.name}</div>
          <div class="category-card-count">${category.product_count || 0} Products</div>
        </div>
      </div>
    `;
  },

  // Cart Item
  cartItem(item) {
    return `
      <div class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button onclick="App.updateCartQty(${item.id}, ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button onclick="App.updateCartQty(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <div style="font-weight:700;color:var(--accent-1);font-size:1.1rem">
            $${(parseFloat(item.price) * item.quantity).toFixed(2)}
          </div>
          <button class="cart-item-remove" onclick="App.removeFromCart(${item.id})">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </div>
      </div>
    `;
  },

  // Review Card
  reviewCard(review) {
    return `
      <div class="review-card">
        <div class="review-header">
          <div>
            <div class="review-author">${review.author_name}</div>
            <div class="stars" style="margin-top:4px">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          </div>
          <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
        </div>
        ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
      </div>
    `;
  },

  // Loading Skeleton
  loadingSkeleton(count = 4) {
    let html = '<div class="product-grid">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="product-card">
          <div class="product-card-image">
            <div class="skeleton" style="width:100%;height:100%"></div>
          </div>
          <div class="product-card-body">
            <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:80%;height:18px;margin-bottom:8px"></div>
            <div class="skeleton" style="width:40%;height:14px"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  },

  // Modal
  showModal(title, content, maxWidth) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content" style="${maxWidth ? `max-width:${maxWidth}` : ''}">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        ${content}
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  },

  // Media Picker — creates its own overlay without removing existing modals (e.g. when used inside a form modal)
  async openMediaPicker(onSelect) {
    // Prevent stacking multiple pickers if user double-clicks Browse
    if (document.querySelector('.media-picker-overlay')) return;
    try {
      const media = await DB.getMedia({ media_type: 'image' });

      let gridHtml = '';
      if (media.length === 0) {
        gridHtml = `
          <div style="text-align:center;padding:40px;color:var(--text-muted)">
            <i class="fas fa-image" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:0.3"></i>
            <p>No images in the Media Library yet.</p>
            <p style="font-size:0.85rem;margin-top:4px">Upload images in the Admin → Media tab first.</p>
          </div>
        `;
      } else {
        gridHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;max-height:400px;overflow-y:auto;padding:4px">`;
        media.forEach(m => {
          const url = m.secure_url || m.url;
          gridHtml += `
            <div onclick="Components.selectMediaItem('${url.replace(/'/g, "\\'")}')" 
                 style="cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid transparent;transition:border 0.2s;aspect-ratio:1"
                 onmouseover="this.style.borderColor='var(--accent-1)'" 
                 onmouseout="this.style.borderColor='transparent'"
                 title="${m.original_name || m.filename}">
              <img src="${url}" alt="${m.original_name || 'Image'}" 
                   style="width:100%;height:100%;object-fit:cover;display:block">
            </div>
          `;
        });
        gridHtml += `</div>`;
      }

      // Store the callback globally so onclick can reach it
      window.__mediaPickerCallback = onSelect;

      // Create a separate overlay that stacks on top of any existing form modal
      // NOTE: Do NOT use showModal() here — it removes all existing modals
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay media-picker-overlay';
      overlay.style.zIndex = '20000';
      overlay.innerHTML = `
        <div class="modal-content" style="max-width:520px">
          <div class="modal-header">
            <h2>Select Image</h2>
            <button class="modal-close" onclick="this.closest('.media-picker-overlay').remove();window.__mediaPickerCallback=null">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px">
              Choose an image from the Media Library. Only images are shown.
            </p>
            ${gridHtml}
            <div style="display:flex;gap:8px;margin-top:8px;padding-top:12px;border-top:1px solid var(--border-light)">
              <input type="url" id="mediaPickerUrl" placeholder="Or paste an image URL directly..." style="flex:1">
              <button class="btn btn-primary btn-sm" onclick="Components.useMediaPickerUrl()">
                <i class="fas fa-check"></i> Use URL
              </button>
            </div>
          </div>
        </div>
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
          window.__mediaPickerCallback = null;
        }
      });
      document.body.appendChild(overlay);
    } catch (error) {
      console.error('Media picker error:', error);
      this.toast('Failed to load media library', 'error');
    }
  },

  // Called when a media item is clicked in the picker
  selectMediaItem(url) {
    if (window.__mediaPickerCallback) {
      window.__mediaPickerCallback(url);
      window.__mediaPickerCallback = null;
    }
    // Only remove the picker overlay, not any underlying form modals
    document.querySelector('.media-picker-overlay')?.remove();
  },

  // Called when the user enters a custom URL
  useMediaPickerUrl() {
    const url = document.getElementById('mediaPickerUrl')?.value?.trim();
    if (!url) {
      this.toast('Please enter a URL or select an image', 'error');
      return;
    }
    if (window.__mediaPickerCallback) {
      window.__mediaPickerCallback(url);
      window.__mediaPickerCallback = null;
    }
    // Only remove the picker overlay, not any underlying form modals
    document.querySelector('.media-picker-overlay')?.remove();
  },

  // Reusable: open media picker and fill an input field by ID, with optional extra callback
  openMediaPickerFor(inputId, extraCallback) {
    const self = this;
    this.openMediaPicker(function(url) {
      const input = document.getElementById(inputId);
      if (input) input.value = url;
      if (typeof extraCallback === 'function') {
        extraCallback(url);
      } else if (typeof extraCallback === 'string') {
        // Support string references like 'AdminSettings.saveAvatar'
        const parts = extraCallback.split('.');
        let ctx = window;
        for (let i = 0; i < parts.length; i++) {
          ctx = ctx[parts[i]];
          if (!ctx) break;
        }
        if (typeof ctx === 'function') ctx(url);
      }
    });
  },

  // Reusable: generates HTML for an image URL input with a Browse Media Library button
  // extraCallback: optional function or dotted string (e.g. 'AdminSettings.saveAvatar') called after setting the value
  mediaField(inputId, currentValue, placeholder, extraCallback) {
    const callbackRef = extraCallback
      ? `'${inputId}', ${extraCallback}`
      : `'${inputId}'`;
    return `
      <div style="display:flex;gap:8px;align-items:center">
        <input type="url" id="${inputId}" value="${currentValue || ''}" placeholder="${placeholder || 'https://...'}" style="flex:1">
        <button type="button" class="btn btn-secondary btn-sm" onclick="Components.openMediaPickerFor(${callbackRef})" style="white-space:nowrap">
          <i class="fas fa-image"></i> Browse
        </button>
      </div>
      <span style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;display:block">
        Click <strong>Browse</strong> to pick from the Media Library, or paste a URL directly.
      </span>
    `;
  },

  // Stars HTML
  stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  },

  // Empty State
  emptyState(icon, title, message, buttonText, buttonLink) {
    return `
      <div class="empty-state page-enter">
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        ${buttonText ? `<a href="${buttonLink || '#/'}" class="btn btn-primary">${buttonText}</a>` : ''}
      </div>
    `;
  }
};
