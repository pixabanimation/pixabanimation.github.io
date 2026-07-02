// ============================================
// PixabAnimation — Checkout Page
// ============================================

const CheckoutPage = {
  async render() {
    const content = document.getElementById('pageContent');

    content.innerHTML = `
      <div class="checkout-page page-enter">
        <div style="text-align:center;margin-bottom:40px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:16px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
            <span class="ds-caption" style="font-weight:500;color:var(--ds-primary)">Secure Checkout</span>
          </div>
          <h1 class="ds-display-lg" style="color:#1d1d1f;margin-bottom:10px">Complete Your <span class="text-gradient">Order</span></h1>
          <p class="ds-body" style="color:rgba(0,0,0,0.56);max-width:480px;margin:0 auto">Fill in your details and submit your payment to complete the purchase.</p>
        </div>
        <div id="checkoutContent">
          <div style="text-align:center;padding:40px">
            <div class="loader-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this.loadCheckout();
  },

  getCountryStatesHtml(countryCode) {
    const states = Countries.getStates(countryCode);
    if (states.length === 0) {
      return `
        <div class="form-group full-width">
          <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">State / Province / Region</label>
          <input type="text" id="shipState" placeholder="Enter your state, province, or region" class="state-input">
        </div>
      `;
    }
    return `
      <div class="form-group full-width">
        <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">State / Province</label>
        <select id="shipState" required>
          <option value="">Select ${Countries.getName(countryCode)} ${countryCode === 'GB' ? 'region' : 'state'}</option>
          ${Countries.renderStateOptions(countryCode)}
        </select>
      </div>
    `;
  },

  async loadCheckout() {
    const container = document.getElementById('checkoutContent');

    try {
      const cartItems = await DB.getCart();
      if (cartItems.length === 0) {
        container.innerHTML = Components.emptyState(
          '🛒', 'Your cart is empty', 'Add some items before checkout.',
          'Start Shopping', '#/shop'
        );
        return;
      }

      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
      const shipping = subtotal >= 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const grandTotal = subtotal + shipping + tax;

      const defaultCountry = 'US';

      container.innerHTML = `
        <form class="checkout-form" onsubmit="CheckoutPage.placeOrder(event)">
          <!-- Shipping Information -->
          <div style="border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:28px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
              <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:var(--ds-primary);flex-shrink:0;background:rgba(0,102,204,0.06);border-radius:8px"><i class="fas fa-user"></i></div>
              <h3 class="ds-body-strong" style="color:#1d1d1f;margin:0">Shipping Information</h3>
            </div>
            <div class="checkout-grid">
              <div class="form-group full-width">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Full Name</label>
                <input type="text" id="shipName" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Email</label>
                <input type="email" id="shipEmail" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Phone</label>
                <input type="tel" id="shipPhone" placeholder="+1 (555) 000-0000">
              </div>
              <div class="form-group full-width">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Address</label>
                <input type="text" id="shipAddress" placeholder="123 Main Street, Apt 4B" required>
              </div>
              <div class="form-group full-width">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Country</label>
                <div style="position:relative">
                  <select id="shipCountry" onchange="CheckoutPage.onCountryChange()" required>
                    <option value="">🌍 Select your country</option>
                    ${Countries.renderOptions(defaultCountry)}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">City</label>
                <input type="text" id="shipCity" placeholder="New York" required>
              </div>
              <div class="form-group" id="stateFieldContainer">
                ${this.getCountryStatesHtml(defaultCountry)}
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">ZIP / Postal Code</label>
                <input type="text" id="shipZip" placeholder="10001" required>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div style="border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:28px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
              <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:var(--ds-primary);flex-shrink:0;background:rgba(0,102,204,0.06);border-radius:8px"><i class="fas fa-credit-card"></i></div>
              <h3 class="ds-body-strong" style="color:#1d1d1f;margin:0">Payment Method</h3>
            </div>
            <p class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:16px">
              Make your payment via <strong>Payoneer</strong> or <strong>Skrill</strong>, then enter the Transaction ID below to complete your order.
            </p>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px" id="paymentOptions">
              <label class="payment-option-label" style="display:flex;align-items:center;gap:14px;padding:18px 20px;border:2px solid var(--ds-primary);border-radius:12px;cursor:pointer;background:rgba(0,102,204,0.03)" onclick="document.querySelectorAll('.payment-option-label').forEach(l=>{l.style.border='2px solid rgba(0,0,0,0.06)';l.style.background='transparent'});this.style.border='2px solid var(--ds-primary)';this.style.background='rgba(0,102,204,0.03)';this.querySelector('input').checked=true">
                <input type="radio" name="payment" value="payoneer" checked style="width:auto;flex-shrink:0">
                <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#FF6B35;color:white;font-size:1.1rem;flex-shrink:0"><i class="fas fa-university"></i></div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.95rem;color:#1d1d1f">Payoneer</div>
                  <div class="ds-caption" style="color:rgba(0,0,0,0.50);margin-top:2px">
                    Send to: <strong style="color:var(--ds-primary);background:rgba(0,102,204,0.08);padding:2px 8px;border-radius:4px">any_dj@live.com</strong>
                  </div>
                </div>
              </label>
              <label class="payment-option-label" style="display:flex;align-items:center;gap:14px;padding:18px 20px;border:2px solid rgba(0,0,0,0.06);border-radius:12px;cursor:pointer;background:transparent" onclick="document.querySelectorAll('.payment-option-label').forEach(l=>{l.style.border='2px solid rgba(0,0,0,0.06)';l.style.background='transparent'});this.style.border='2px solid var(--ds-primary)';this.style.background='rgba(0,102,204,0.03)';this.querySelector('input').checked=true">
                <input type="radio" name="payment" value="skrill" style="width:auto;flex-shrink:0">
                <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#942B8B;color:white;font-size:1.1rem;flex-shrink:0"><i class="fas fa-money-bill-wave"></i></div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.95rem;color:#1d1d1f">Skrill <span style="font-size:0.7rem;font-weight:400;color:var(--ds-primary);background:rgba(0,102,204,0.08);padding:1px 8px;border-radius:9999px">Recommended</span></div>
                  <div class="ds-caption" style="color:rgba(0,0,0,0.50);margin-top:2px">
                    Send to: <strong style="color:#942B8B;background:rgba(148,43,139,0.08);padding:2px 8px;border-radius:4px">spurno@icloud.com</strong>
                  </div>
                </div>
              </label>
            </div>

            <div style="padding:16px 20px;background:rgba(0,102,204,0.04);border:1px solid rgba(0,102,204,0.1);border-radius:12px;margin-bottom:16px">
              <div class="ds-caption-strong" style="color:var(--ds-primary);margin-bottom:8px">
                <i class="fas fa-info-circle"></i> How to pay
              </div>
              <ol style="font-size:0.82rem;color:rgba(0,0,0,0.56);padding-left:16px;display:flex;flex-direction:column;gap:5px">
                <li>Transfer the total amount via <strong>Payoneer</strong> or <strong>Skrill</strong> to our account.</li>
                <li>After payment, copy the <strong>Transaction ID</strong> from your payment receipt.</li>
                <li>Paste the Transaction ID below and submit your order.</li>
                <li>Admin will verify the transaction and send your download link (for digital/video items).</li>
              </ol>
            </div>

            <div class="form-group">
              <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">
                <i class="fas fa-hashtag" style="color:var(--ds-primary)"></i> Transaction ID
              </label>
              <input type="text" id="transactionId" placeholder="Enter your Payoneer or Skrill Transaction ID" required>
              <span class="ds-caption" style="color:rgba(0,0,0,0.40);margin-top:2px">
                Enter the Transaction ID from your payment receipt. Your order will be verified by admin.
              </span>
            </div>
          </div>

          <!-- Order Summary -->
          <div style="border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:28px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
              <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:var(--ds-primary);flex-shrink:0;background:rgba(0,102,204,0.06);border-radius:8px"><i class="fas fa-shopping-bag"></i></div>
              <h3 class="ds-body-strong" style="color:#1d1d1f;margin:0">Order Summary</h3>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${cartItems.map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06)">
                  <div style="display:flex;align-items:center;gap:12px">
                    <img src="${item.image_url}" alt="${item.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid rgba(0,0,0,0.04)">
                    <div>
                      <div style="font-weight:500;font-size:0.9rem;color:#1d1d1f">${item.name}</div>
                      <div class="ds-caption" style="color:rgba(0,0,0,0.40)">Qty: ${item.quantity}</div>
                    </div>
                  </div>
                  <div style="font-weight:600;color:var(--ds-primary)">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:12px">
              <div class="summary-row" style="color:rgba(0,0,0,0.64)"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              <div class="summary-row" style="color:rgba(0,0,0,0.64)"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">FREE</span>' : `$${shipping.toFixed(2)}`}</span></div>
              <div class="summary-row" style="color:rgba(0,0,0,0.64)"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
              <div class="summary-row total"><span>Total</span><span class="amount">$${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          <button type="submit" class="ds-pill-cta" style="justify-content:center;padding:16px 28px;font-size:17px;width:100%">
            <i class="fas fa-lock"></i> Place Order — $${grandTotal.toFixed(2)}
          </button>
        </form>
      `;
    } catch (error) {
      console.error('Checkout error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load checkout', error.message);
    }
  },

  onCountryChange() {
    const countryCode = document.getElementById('shipCountry').value;
    const stateContainer = document.getElementById('stateFieldContainer');
    
    if (!countryCode) {
      stateContainer.innerHTML = `
        <div class="form-group full-width">
          <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">State / Province / Region</label>
          <input type="text" id="shipState" placeholder="Enter your state, province, or region">
        </div>
      `;
      return;
    }

    const states = Countries.getStates(countryCode);
    if (states.length === 0) {
      stateContainer.innerHTML = `
        <div class="form-group full-width">
          <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">State / Province / Region</label>
          <input type="text" id="shipState" placeholder="Enter your state, province, or region" class="state-input">
        </div>
      `;
    } else {
      stateContainer.innerHTML = `
        <div class="form-group full-width">
          <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">State / Province</label>
          <select id="shipState" required>
            <option value="">Select ${Countries.getName(countryCode)} ${countryCode === 'GB' ? 'region' : 'state'}</option>
            ${Countries.renderStateOptions(countryCode)}
          </select>
        </div>
      `;
    }
  },

  async placeOrder(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
      const cartItems = await DB.getCart();
      if (cartItems.length === 0) {
        Components.toast('Your cart is empty', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
        return;
      }

      const name = document.getElementById('shipName').value;
      const email = document.getElementById('shipEmail').value;
      const address = document.getElementById('shipAddress').value;
      const city = document.getElementById('shipCity').value;
      const countryCode = document.getElementById('shipCountry').value;
      const countryName = Countries.getName(countryCode) || countryCode;
      const countryFlag = Countries.getFlag(countryCode) || '';
      const stateEl = document.getElementById('shipState');
      const state = stateEl ? stateEl.value || stateEl.placeholder || '' : '';
      const zip = document.getElementById('shipZip').value;
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const transactionId = document.getElementById('transactionId').value.trim();

      if (!transactionId) {
        Components.toast('Please enter your Transaction ID from your payment receipt', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
        return;
      }

      if (!countryCode) {
        Components.toast('Please select your country', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
        return;
      }

      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
      const shipping = subtotal >= 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      const shippingAddress = `${name}, ${address}, ${city}${state ? ', ' + state : ''}, ${countryFlag} ${countryName}, ${zip}`;

      const orderId = await DB.createOrder({
        total,
        subtotal,
        shipping,
        tax,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_provider: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          image_url: item.image_url,
          quantity: item.quantity,
          price: item.price
        }))
      });

      Components.toast(`Order #${orderId} submitted for verification!`, 'success');
      
      // Show success page
      const container = document.getElementById('checkoutContent');
      container.innerHTML = `
        <div style="max-width:540px;margin:0 auto;text-align:center;padding:60px 24px" class="page-enter">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.15);border-radius:9999px;margin-bottom:16px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--success)"></span>
            <span class="ds-caption" style="font-weight:500;color:var(--success)">Order Submitted</span>
          </div>
          <div style="font-size:4rem;margin-bottom:20px">📋</div>
          <h2 class="ds-display-lg" style="color:#1d1d1f;margin-bottom:8px">Order <span class="text-gradient">Submitted</span>!</h2>
          <p class="ds-body" style="color:rgba(0,0,0,0.56);margin-bottom:4px">Order #${orderId} — awaiting verification</p>
          <div style="padding:24px;border:1px solid rgba(0,0,0,0.06);border-radius:14px;margin:24px 0;text-align:left">
            <p class="ds-caption" style="color:rgba(0,0,0,0.64);margin-bottom:12px">
              <span style="font-weight:600;color:#1d1d1f">Payment:</span> $${total.toFixed(2)} via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
            </p>
            <p class="ds-caption" style="color:rgba(0,0,0,0.64);margin-bottom:12px">
              <span style="font-weight:600;color:#1d1d1f">Transaction:</span> ${transactionId}
            </p>
            <p class="ds-caption" style="color:rgba(0,0,0,0.64);margin-bottom:12px">
              <span style="font-weight:600;color:#1d1d1f">Shipping to:</span> ${countryFlag} ${countryName}${state ? ', ' + state : ''}
            </p>
            <p class="ds-caption" style="color:rgba(0,0,0,0.50)">
              You will receive the download link once admin approves the transaction.
            </p>
          </div>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
            <a href="#/profile" class="ds-pill-cta" style="padding:12px 24px;font-size:15px">
              <i class="fas fa-user"></i> View Orders
            </a>
            <a href="#/" class="ds-pill-cta-secondary" style="padding:12px 24px;font-size:15px">
              <i class="fas fa-home"></i> Continue Shopping
            </a>
          </div>
        </div>
      `;

      App.updateCartBadge();
    } catch (error) {
      console.error('Order placement error:', error);
      Components.toast('Failed to place order. Please try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
    }
  }
};
