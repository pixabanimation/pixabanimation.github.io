// ============================================
// PixabAnimation — Checkout Page (Redesigned)
// ============================================

const CheckoutPage = {
  cartItems: [],
  subtotal: 0,
  tax: 0,
  grandTotal: 0,

  async render() {
    const content = document.getElementById('pageContent');

    content.innerHTML = `
      <div class="checkout-page page-enter">
        <div class="checkout-hero">
          <div class="checkout-hero-badge">
            <span class="pulse-dot"></span>
            Secure Checkout
          </div>
          <h1>Complete Your <span class="text-gradient">Order</span></h1>
          <p>Fill in your details below to finish your purchase.</p>
        </div>

        <!-- Step Indicator -->
        <div class="checkout-steps">
          <div class="checkout-step active" id="step1">
            <span class="step-num">1</span>
            <span class="step-label">Details</span>
          </div>
          <div class="checkout-step-line" id="stepLine1"></div>
          <div class="checkout-step" id="step2">
            <span class="step-num">2</span>
            <span class="step-label">Payment</span>
          </div>
          <div class="checkout-step-line" id="stepLine2"></div>
          <div class="checkout-step" id="step3">
            <span class="step-num">3</span>
            <span class="step-label">Confirm</span>
          </div>
        </div>

        <div id="checkoutContent">
          <div style="text-align:center;padding:60px 0">
            <div class="loader-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this.loadCheckout();
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

      this.cartItems = cartItems;
      this.subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
      this.tax = this.subtotal * 0.08;
      this.grandTotal = this.subtotal + this.tax;

      container.innerHTML = `
        <div class="checkout-grid-layout">
          <!-- Form Column -->
          <div class="checkout-form-col">
            <form class="checkout-form" onsubmit="CheckoutPage.placeOrder(event)">

              <!-- Customer Information -->
              <div class="checkout-section-card" id="sectionCustomer">
                <div class="checkout-section-header">
                  <div class="checkout-section-icon"><i class="fas fa-user"></i></div>
                  <h3>Customer Information</h3>
                  <span class="section-step-num">Step 1</span>
                </div>
                <div class="checkout-form-grid">
                  <div class="checkout-field full-width">
                    <label for="shipName">Full Name</label>
                    <input type="text" id="shipName" placeholder="John Doe" required autocomplete="name">
                  </div>
                  <div class="checkout-field full-width">
                    <label for="shipEmail">Email Address</label>
                    <input type="email" id="shipEmail" placeholder="john@example.com" required autocomplete="email">
                  </div>
                  <div class="checkout-field full-width">
                    <label for="shipPhone">Phone Number</label>
                    <input type="tel" id="shipPhone" placeholder="+1 (555) 123-4567" required autocomplete="tel">
                  </div>
                  <div class="checkout-field full-width">
                    <label for="shipCountry">Country</label>
                    <select id="shipCountry" onchange="CheckoutPage.onCountryChange()" required>
                      <option value="">Select your country</option>
                      ${Countries.renderOptions()}
                    </select>
                  </div>
                  <div class="checkout-field full-width" id="stateField" style="display:none">
                    <label for="shipState">State / Province</label>
                    <select id="shipState">
                      <option value="">Select state/province</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="checkout-section-card" id="sectionPayment">
                <div class="checkout-section-header">
                  <div class="checkout-section-icon"><i class="fas fa-credit-card"></i></div>
                  <h3>Payment Method</h3>
                  <span class="section-step-num">Step 2</span>
                </div>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px">
                  Make your payment via <strong style="color:var(--text-primary)">Payoneer</strong> or <strong style="color:var(--text-primary)">Skrill</strong>, then enter the Transaction ID below.
                </p>

                <div class="checkout-payment-options" id="paymentOptions">
                  <label class="checkout-payment-card selected" onclick="CheckoutPage.selectPayment(this, 'skrill')">
                    <input type="radio" name="payment" value="skrill" checked>
                    <div class="checkout-payment-icon" style="background:#942B8B"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="checkout-payment-info">
                      <div class="checkout-payment-name">
                        Skrill
                        <span class="recommended-tag">Recommended</span>
                      </div>
                      <div class="checkout-payment-email">Send to: <strong>spurno@icloud.com</strong></div>
                    </div>
                  </label>
                  <label class="checkout-payment-card" onclick="CheckoutPage.selectPayment(this, 'payoneer')">
                    <input type="radio" name="payment" value="payoneer">
                    <div class="checkout-payment-icon" style="background:#FF6B35"><i class="fas fa-university"></i></div>
                    <div class="checkout-payment-info">
                      <div class="checkout-payment-name">Payoneer</div>
                      <div class="checkout-payment-email">Send to: <strong>any_dj@live.com</strong></div>
                    </div>
                  </label>
                </div>

                <div class="checkout-howto">
                  <div class="checkout-howto-title"><i class="fas fa-info-circle"></i> How to pay</div>
                  <ol>
                    <li>Transfer the total amount via <strong>Payoneer</strong> or <strong>Skrill</strong> to our account.</li>
                    <li>After payment, copy the <strong>Transaction ID</strong> from your payment receipt.</li>
                    <li>Paste the Transaction ID below and submit your order.</li>
                    <li>Admin will verify the transaction and send your download link.</li>
                  </ol>
                </div>

                <div class="checkout-field">
                  <label for="transactionId">Transaction ID</label>
                  <div class="checkout-tx-field">
                    <i class="fas fa-hashtag tx-icon"></i>
                    <input type="text" id="transactionId" placeholder="Enter your Payoneer or Skrill Transaction ID" required>
                  </div>
                  <div class="field-hint">Enter the Transaction ID from your payment receipt. Your order will be verified by admin.</div>
                </div>
              </div>

              <!-- Submit (mobile: inside form, desktop: hidden via summary) -->
              <button type="submit" class="checkout-submit-btn checkout-submit-mobile" style="display:none">
                <i class="fas fa-lock"></i> Place Order — $${this.grandTotal.toFixed(2)}
              </button>
            </form>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="checkout-summary-col">
            <div class="checkout-summary-card">
              <div class="checkout-summary-title">
                <i class="fas fa-receipt" style="color:var(--accent-1)"></i>
                <h3>Order Summary</h3>
                <span class="item-count">${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}</span>
              </div>

              <div class="checkout-summary-items">
                ${cartItems.map(item => `
                  <div class="checkout-summary-item">
                    <div class="checkout-summary-item-img">
                      <img src="${item.image_url}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="checkout-summary-item-info">
                      <div class="checkout-summary-item-name">${item.name}</div>
                      <div class="checkout-summary-item-meta">Qty: ${item.quantity}</div>
                    </div>
                    <div class="checkout-summary-item-price">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                `).join('')}
              </div>

              <div class="checkout-summary-totals">
                <div class="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>$${this.subtotal.toFixed(2)}</span>
                </div>
                <div class="checkout-summary-row">
                  <span>Tax (8%)</span>
                  <span>$${this.tax.toFixed(2)}</span>
                </div>
                <div class="checkout-summary-row total">
                  <span>Total</span>
                  <span class="total-amount">$${this.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" class="checkout-submit-btn" style="margin-top:24px" onclick="document.querySelector('.checkout-form').requestSubmit()">
                <i class="fas fa-lock"></i> Place Order — $${this.grandTotal.toFixed(2)}
              </button>

              <div class="checkout-trust-strip">
                <div class="checkout-trust-item">
                  <i class="fas fa-lock"></i>
                  <strong>SSL</strong>
                  Encrypted
                </div>
                <div class="checkout-trust-item">
                  <i class="fas fa-shield-alt"></i>
                  <strong>Secure</strong>
                  Payment
                </div>
                <div class="checkout-trust-item">
                  <i class="fas fa-headset"></i>
                  <strong>Support</strong>
                  24/7 Help
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Submit buttons: CSS media queries handle mobile vs desktop visibility
      // (.checkout-submit-mobile shown on mobile, .checkout-summary-col button shown on desktop)

    } catch (error) {
      console.error('Checkout error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load checkout', error.message);
    }
  },

  selectPayment(card, method) {
    document.querySelectorAll('.checkout-payment-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input[type="radio"]').checked = true;
  },

  onCountryChange() {
    const countryCode = document.getElementById('shipCountry').value;
    const stateField = document.getElementById('stateField');
    const stateSelect = document.getElementById('shipState');

    if (!countryCode || !Countries.getStates(countryCode).length) {
      stateField.style.display = 'none';
      return;
    }

    stateField.style.display = 'block';
    stateSelect.innerHTML = Countries.renderStateOptions(countryCode);
  },

  async placeOrder(event) {
    event.preventDefault();
    const allBtns = document.querySelectorAll('.checkout-submit-btn');
    allBtns.forEach(b => {
      b.disabled = true;
      b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    });

    try {
      const cartItems = await DB.getCart();
      if (cartItems.length === 0) {
        Components.toast('Your cart is empty', 'error');
        this._resetButtons();
        return;
      }

      const name = document.getElementById('shipName').value.trim();
      const email = document.getElementById('shipEmail').value.trim();
      const phone = document.getElementById('shipPhone').value.trim();
      const countryCode = document.getElementById('shipCountry').value;
      const countryName = countryCode ? Countries.getName(countryCode) : '';
      const state = document.getElementById('shipState') ? document.getElementById('shipState').value : '';
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const transactionId = document.getElementById('transactionId').value.trim();

      if (!transactionId) {
        Components.toast('Please enter your Transaction ID from your payment receipt', 'error');
        this._resetButtons();
        document.getElementById('transactionId').focus();
        return;
      }

      if (!countryCode) {
        Components.toast('Please select your country', 'error');
        this._resetButtons();
        return;
      }

      if (!name || !email || !phone) {
        Components.toast('Please fill in all customer information', 'error');
        this._resetButtons();
        return;
      }

      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      // Mark all steps completed
      this._setStepsCompleted();

      const orderId = await DB.createOrder({
        total,
        subtotal,
        tax,
        customer_info: `${name}, ${email}, ${phone}, ${countryCode}, ${state}`,
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
      this._showSuccess(orderId, total, paymentMethod, transactionId, email, phone, countryName, state);

      App.updateCartBadge();
    } catch (error) {
      console.error('Order placement error:', error);
      Components.toast('Failed to place order. Please try again.', 'error');
      this._resetButtons();
    }
  },

  _resetButtons() {
    document.querySelectorAll('.checkout-submit-btn').forEach(b => {
      b.disabled = false;
      b.innerHTML = `<i class="fas fa-lock"></i> Place Order — $${this.grandTotal.toFixed(2)}`;
    });
  },

  _setStepsCompleted() {
    ['step1', 'step2', 'step3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('completed'); el.classList.remove('active'); }
    });
    ['stepLine1', 'stepLine2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('completed');
    });
  },

  _showSuccess(orderId, total, paymentMethod, transactionId, email, phone, countryName, state) {
    const container = document.getElementById('checkoutContent');
    container.innerHTML = `
      <div class="checkout-success page-enter">
        <div class="checkout-success-check">
          <i class="fas fa-check"></i>
        </div>
        <h2>Order <span class="text-gradient">Submitted</span>!</h2>
        <p class="success-subtitle">Your order has been received and is being reviewed.</p>
        <p class="success-order-id">Order #${orderId}</p>

        <div class="checkout-success-details">
          <div class="detail-row">
            <span class="detail-label">Payment</span>
            <span class="detail-value">$${total.toFixed(2)} via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction ID</span>
            <span class="detail-value">${transactionId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">${email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">${phone}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${countryName}${state ? `, ${state}` : ''}</span>
          </div>
        </div>

        <div class="checkout-success-note">
          <i class="fas fa-info-circle"></i>
          <span>You will receive the download link once admin approves the transaction. Check your email for updates.</span>
        </div>

        <div class="checkout-success-actions">
          <a href="#/profile" class="ds-pill-cta" style="padding:14px 28px;font-size:0.9rem">
            <i class="fas fa-user"></i> View My Orders
          </a>
          <a href="#/" class="ds-pill-cta-secondary" style="padding:14px 28px;font-size:0.9rem">
            <i class="fas fa-home"></i> Continue Shopping
          </a>
        </div>
      </div>
    `;
  },

  cleanup() {
    // No dynamic listeners to clean up — CSS handles mobile/desktop layout
  }
};

Router.beforeEach(() => {
  CheckoutPage.cleanup();
});
