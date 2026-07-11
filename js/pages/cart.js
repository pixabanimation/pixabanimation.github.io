// ============================================
// pixabanimation — Cart Page
// ============================================

const CartPage = {
  async render() {
    const content = document.getElementById('pageContent');

    content.innerHTML = `
      <div class="cart-page page-enter">
        <div style="text-align:center;margin-bottom:40px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:16px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
            <span class="ds-caption" style="font-weight:500;color:var(--ds-primary)">Shopping Cart</span>
          </div>
          <h1 class="ds-display-lg" style="color:#1d1d1f;margin-bottom:10px">Review Your <span class="text-gradient">Cart</span></h1>
          <p class="ds-body" style="color:rgba(0,0,0,0.56);max-width:480px;margin:0 auto">Check your items, apply any coupon codes, and proceed to checkout when ready.</p>
        </div>
        <div id="cartContent">
          <div style="text-align:center;padding:40px">
            <div class="loader-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this.loadCart();
  },

  async loadCart() {
    const container = document.getElementById('cartContent');

    try {
      const cartItems = await DB.getCart();
      const total = await DB.getCartTotal();

      if (cartItems.length === 0) {
        container.innerHTML = Components.emptyState(
          '🛒',
          'Your cart is empty',
          'Looks like you haven\'t added anything yet. Start shopping!',
          'Start Shopping',
          '#/shop'
        );
        return;
      }

      const subtotal = total;
      const tax = subtotal * 0.08;
      const grandTotal = subtotal + tax;

      container.innerHTML = `
        <div class="cart-content">
          <div class="cart-items">
            ${cartItems.map(item => Components.cartItem(item)).join('')}
          </div>
          <div style="border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:28px;position:sticky;top:calc(var(--nav-height) + 24px)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
              <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:var(--ds-primary);flex-shrink:0;background:rgba(0,102,204,0.06);border-radius:8px"><i class="fas fa-receipt"></i></div>
              <h3 class="ds-body-strong" style="color:#1d1d1f;margin:0">Order Summary</h3>
            </div>
            <div class="summary-row" style="color:rgba(0,0,0,0.64)"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row" style="color:rgba(0,0,0,0.64)"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
            <div class="summary-row" style="color:rgba(0,0,0,0.64)">
              <span>Coupon</span>
              <span><button class="btn btn-sm btn-secondary" onclick="CartPage.showCouponInput()" style="border-radius:9999px;padding:6px 14px;font-size:0.8rem">Apply Code</button></span>
            </div>
            <div id="couponSection" style="display:none;padding:12px 0">
              <div style="display:flex;gap:8px">
                <input type="text" id="couponInput" placeholder="Enter coupon code" style="text-transform:uppercase">
                <button class="btn btn-primary btn-sm" onclick="CartPage.applyCoupon()" style="border-radius:9999px">Apply</button>
              </div>
              <div id="couponMessage" class="ds-caption" style="margin-top:4px"></div>
            </div>
            <div class="summary-row total" style="padding-top:16px">
              <span style="font-weight:700;font-size:1.1rem">Total</span>
              <span style="font-weight:700;font-size:1.1rem;color:var(--ds-primary)" id="cartTotal">$${grandTotal.toFixed(2)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;margin-top:16px;background:rgba(0,102,204,0.06);border:1px solid rgba(0,102,204,0.1);border-radius:10px;font-size:0.8rem;color:var(--ds-primary)">
              <i class="fas fa-envelope" style="font-size:0.85rem;flex-shrink:0"></i>
              <span>No shipping needed — digital delivery to your email after purchase</span>
            </div>
            <a href="#/checkout" class="ds-pill-cta" style="justify-content:center;padding:14px 24px;font-size:15px;width:100%;margin-top:12px">
              <i class="fas fa-lock"></i> Proceed to Checkout
            </a>
            <div style="text-align:center;margin-top:12px">
              <a href="#/shop" class="ds-pill-cta-secondary" style="padding:8px 18px;font-size:13px">
                <i class="fas fa-arrow-left"></i> Continue Shopping
              </a>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;color:rgba(0,0,0,0.40);font-size:0.8rem">
              <i class="fas fa-shield-alt"></i> Secure Checkout
              <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
              <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Cart error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load cart', error.message);
    }
  },

  showCouponInput() {
    const section = document.getElementById('couponSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  },

  async applyCoupon() {
    const code = document.getElementById('couponInput').value.trim();
    const message = document.getElementById('couponMessage');

    if (!code) {
      message.textContent = 'Please enter a coupon code';
      message.style.color = 'var(--error)';
      return;
    }

    try {
      const coupon = await DB.validateCoupon(code);
      if (coupon) {
        message.textContent = `Coupon applied! ${coupon.discount_percent}% off`;
        message.style.color = 'var(--success)';
        // Recalculate with discount
        Components.toast(`Coupon "${coupon.code}" applied! ${coupon.discount_percent}% off`, 'success');
      } else {
        message.textContent = 'Invalid or expired coupon code';
        message.style.color = 'var(--error)';
      }
    } catch (e) {
      message.textContent = 'Error validating coupon';
      message.style.color = 'var(--error)';
    }
  }
};
