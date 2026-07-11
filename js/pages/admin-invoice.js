// ============================================
// pixabanimation — Admin Invoice Generator
// Supports: DB save/load, live preview, PDF/JPG export, landscape preview
// ============================================

const AdminInvoice = {
  currentView: 'list', // 'list' | 'form'
  editingInvoiceId: null,

  async render(view = 'list', invoiceId = null) {
    this.editingInvoiceId = invoiceId;
    this.currentView = view;
    if (view === 'list') {
      await this.renderList();
    } else if (view === 'form') {
      await this.renderForm(invoiceId);
    }
  },

  // ==================== LIST VIEW ====================
  async renderList() {
    const container = document.getElementById('adminContent');
    try {
      const invoices = await DB.getAllInvoices();

      container.innerHTML = `
        <div class="admin-invoice-page page-enter">
          <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
            <div>
              <h3 style="font-size:1.1rem;font-weight:600;margin:0">Invoice Generator</h3>
              <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="AdminInvoice.render('form', null)">
              <i class="fas fa-plus"></i> New Invoice
            </button>
          </div>

          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style="width:160px">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.length === 0 ?
                  '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No invoices yet. Create your first invoice!</td></tr>' :
                  invoices.map(inv => `
                    <tr>
                      <td><span style="font-weight:700;font-size:0.85rem">${inv.invoice_number}</span></td>
                      <td><span style="font-weight:600">${inv.to_name}</span></td>
                      <td style="font-size:0.85rem;color:var(--text-muted)">${inv.date ? new Date(inv.date + 'T00:00:00').toLocaleDateString() : '—'}</td>
                      <td style="font-size:0.85rem;color:var(--text-muted)">${inv.due_date ? new Date(inv.due_date + 'T00:00:00').toLocaleDateString() : '—'}</td>
                      <td style="font-weight:700;color:var(--accent-1)">$${parseFloat(inv.total).toFixed(2)}</td>
                      <td>${this.statusBadge(inv.status)}</td>
                      <td>
                        <div style="display:flex;gap:6px">
                          <button class="admin-action-btn" onclick="AdminInvoice.render('form', ${inv.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="admin-action-btn" onclick="AdminInvoice.viewInvoice(${inv.id})" title="View">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="admin-action-btn" onclick="AdminInvoice.exportInvoicePDF(${inv.id})" title="Export PDF">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <button class="admin-action-btn delete" onclick="AdminInvoice.confirmDelete(${inv.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Invoices error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load invoices', error.message);
    }
  },

  statusBadge(status) {
    const colors = {
      'draft': { bg: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' },
      'sent': { bg: 'rgba(0,102,204,0.15)', color: 'var(--accent-1)' },
      'paid': { bg: 'rgba(16,185,129,0.15)', color: 'var(--success)' },
      'overdue': { bg: 'rgba(239,68,68,0.15)', color: 'var(--error)' },
      'cancelled': { bg: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }
    };
    const c = colors[status] || colors.draft;
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:${c.bg};color:${c.color};text-transform:capitalize">${status}</span>`;
  },

  // ==================== FORM VIEW ====================
  async renderForm(invoiceId) {
    const container = document.getElementById('adminContent');
    const isEdit = !!invoiceId;
    let invoice = null;

    if (isEdit) {
      invoice = await DB.getInvoiceById(invoiceId);
    }

    const today = new Date().toISOString().split('T')[0];
    const invoiceNum = isEdit ? invoice.invoice_number : 'INV-' + Date.now().toString(36).toUpperCase();
    const dueDate = isEdit ? (invoice.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]) : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const items = isEdit ? (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items || []) : [];

    container.innerHTML = `
      <div class="admin-invoice-page page-enter">
        <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h3 style="font-size:1.1rem;font-weight:600;margin:0">
              <i class="fas fa-arrow-left" style="cursor:pointer;margin-right:8px;font-size:0.9rem" onclick="AdminInvoice.render('list')"></i>
              ${isEdit ? 'Edit Invoice' : 'New Invoice'}
            </h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">Create professional invoices with PDF & JPG export</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="AdminInvoice.saveInvoice()">
              <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Invoice
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.exportPDF()">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.exportJPG()">
              <i class="fas fa-file-image"></i> Export JPG
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.printInvoice()">
              <i class="fas fa-print"></i> Print
            </button>
          </div>
        </div>

        <div class="admin-invoice-layout">
          <!-- Form Panel -->
          <div class="admin-invoice-form">
            <form id="invoiceForm">
              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-hashtag"></i> Invoice Info</h4>
                <div class="admin-form-grid-3">
                  <div class="form-group">
                    <label>Invoice #</label>
                    <input type="text" id="inv_number" value="${invoiceNum}" ${isEdit ? 'readonly' : ''}>
                  </div>
                  <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="inv_date" value="${isEdit ? (invoice.date || today) : today}">
                  </div>
                  <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="inv_due" value="${isEdit ? (invoice.due_date || dueDate) : dueDate}">
                  </div>
                </div>
                <div class="admin-form-grid-3" style="margin-top:8px">
                  <div class="form-group">
                    <label>Status</label>
                    <select id="inv_status">
                      <option value="draft" ${isEdit && invoice.status === 'draft' ? 'selected' : ''}>Draft</option>
                      <option value="sent" ${isEdit && invoice.status === 'sent' ? 'selected' : ''}>Sent</option>
                      <option value="paid" ${isEdit && invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                      <option value="overdue" ${isEdit && invoice.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                      <option value="cancelled" ${isEdit && invoice.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-building"></i> From (Your Company)</h4>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" id="inv_from_name" value="${isEdit ? (invoice.from_name || '') : 'PixabAnimation Studio'}" placeholder="Your company name">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="inv_from_email" value="${isEdit ? (invoice.from_email || '') : 'spurno@icloud.com'}" placeholder="spurno@icloud.com">
                  </div>
                </div>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="inv_from_phone" value="${isEdit ? (invoice.from_phone || '') : '+880 1521211774'}" placeholder="+8801 521211774">
                  </div>
                  <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="inv_from_address" value="${isEdit ? (invoice.from_address || '') : 'Dhanmondi, Dhaka'}" placeholder="Dhanmondi, Dhaka">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-user"></i> Bill To (Client)</h4>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" id="inv_to_name" value="${isEdit ? (invoice.to_name || '') : ''}" placeholder="Client full name" required>
                  </div>
                  <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="inv_to_company" value="${isEdit ? (invoice.to_company || '') : ''}" placeholder="Client company (optional)">
                  </div>
                </div>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="inv_to_email" value="${isEdit ? (invoice.to_email || '') : ''}" placeholder="client@email.com">
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="inv_to_phone" value="${isEdit ? (invoice.to_phone || '') : ''}" placeholder="+1 (555) 000-0000">
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" id="inv_to_address" value="${isEdit ? (invoice.to_address || '') : ''}" placeholder="Street, City, Country">
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-list"></i> Invoice Items</h4>
                <div id="invoiceItemsContainer">
                  ${items.length > 0
                    ? items.map((item, i) => this.generateItemRow(i, item.description, item.quantity, item.rate)).join('')
                    : this.generateItemRow(0, '', 1, 0)}
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminInvoice.addItem()" style="margin-top:8px">
                  <i class="fas fa-plus"></i> Add Item
                </button>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-calculator"></i> Summary</h4>
                <div class="admin-form-grid-3">
                  <div class="form-group">
                    <label>Subtotal</label>
                    <input type="text" id="inv_subtotal" readonly style="font-weight:600;color:var(--accent-1)">
                  </div>
                  <div class="form-group">
                    <label>Tax Rate (%)</label>
                    <input type="number" id="inv_tax_rate" value="${isEdit ? invoice.tax_rate : 0}" min="0" max="100" step="0.1">
                  </div>
                  <div class="form-group">
                    <label>Discount (%)</label>
                    <input type="number" id="inv_discount" value="${isEdit ? invoice.discount : 0}" min="0" max="100" step="1">
                  </div>
                </div>
                <div class="admin-form-grid-2" style="margin-top:8px">
                  <div class="form-group">
                    <label>Tax Amount</label>
                    <input type="text" id="inv_tax_amount" readonly style="font-weight:600">
                  </div>
                  <div class="form-group">
                    <label>Total</label>
                    <input type="text" id="inv_total" readonly style="font-weight:700;color:var(--accent-1);font-size:1.1rem">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-sticky-note"></i> Additional</h4>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea id="inv_notes" rows="2" placeholder="Payment instructions, thank you notes..." style="resize:vertical">${isEdit ? (invoice.notes || '') : ''}</textarea>
                </div>
                <div class="form-group">
                  <label>Terms & Conditions</label>
                  <textarea id="inv_terms" rows="2" placeholder="Payment terms, late fees..." style="resize:vertical">${isEdit ? (invoice.terms || '') : 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.'}</textarea>
                </div>
              </div>

              <div style="text-align:right;padding:12px 0;display:flex;gap:8px;justify-content:flex-end">
                <button type="button" class="btn btn-secondary" onclick="AdminInvoice.render('list')">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="button" class="btn btn-primary" onclick="AdminInvoice.saveInvoice()">
                  <i class="fas fa-save"></i> ${isEdit ? 'Update Invoice' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>

          <!-- Preview Panel -->
          <div class="admin-invoice-preview-wrapper">
            <div class="admin-invoice-preview-header">
              <h4><i class="fas fa-eye"></i> Preview</h4>
              <span style="font-size:0.75rem;color:var(--text-muted)">Live — updates as you type</span>
            </div>
            <div class="admin-invoice-preview-container" id="invoicePreviewContainer">
              <div class="admin-invoice-preview landscape" id="invoicePreview">
                ${this.generatePreviewHTML()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach real-time input listeners for live preview
    this.attachLivePreviewListeners();
    const initialItems = this.getItems();
    this.updateSummary(initialItems);
    this.updateLivePreview(initialItems);
  },

  attachLivePreviewListeners() {
    const refresh = () => {
      const items = this.getItems();
      this.updateSummary(items);
      this.updateLivePreview(items);
    };

    // All inputs, textareas, and selects in the invoice form trigger live preview
    document.querySelectorAll('#invoiceForm input, #invoiceForm textarea, #invoiceForm select').forEach(el => {
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
    });

    this._liveRefresh = refresh;
    // Attach listeners to initial item rows
    this.attachItemRowListeners();
  },

  attachItemRowListeners() {
    document.querySelectorAll('.inv-item-desc, .inv-item-qty, .inv-item-rate').forEach(el => {
      el.addEventListener('input', this._liveRefresh || (() => {
        const items = this.getItems();
        this.updateSummary(items);
        this.updateLivePreview(items);
      }));
    });
  },

  generateItemRow(index, description = '', quantity = 1, rate = 0) {
    return `
      <div class="admin-invoice-item-row" data-index="${index}" style="display:grid;grid-template-columns:1fr 80px 100px 80px 30px;gap:8px;align-items:end;margin-bottom:8px">
        <div class="form-group">
          <label>Description</label>
          <input type="text" class="inv-item-desc" value="${description}" placeholder="Service / product">
        </div>
        <div class="form-group">
          <label>Qty</label>
          <input type="number" class="inv-item-qty" value="${quantity}" min="1">
        </div>
        <div class="form-group">
          <label>Rate ($)</label>
          <input type="number" class="inv-item-rate" value="${rate}" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input type="text" class="inv-item-amount" readonly style="font-weight:600">
        </div>
        <button type="button" class="btn btn-sm" style="padding:8px;color:var(--error);font-size:0.8rem;margin-bottom:0" onclick="AdminInvoice.removeItem(this)" title="Remove item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  },

  addItem() {
    const container = document.getElementById('invoiceItemsContainer');
    const index = container.children.length;
    container.insertAdjacentHTML('beforeend', this.generateItemRow(index, '', 1, 0));
    // Attach listeners to the new row's inputs
    const newRow = container.lastElementChild;
    newRow.querySelectorAll('.inv-item-desc, .inv-item-qty, .inv-item-rate').forEach(el => {
      el.addEventListener('input', this._liveRefresh || (() => {
        const items = this.getItems();
        this.updateSummary(items);
        this.updateLivePreview(items);
      }));
    });
    const items = this.getItems();
    this.updateSummary(items);
    this.updateLivePreview(items);
  },

  removeItem(btn) {
    const row = btn.closest('.admin-invoice-item-row');
    if (document.querySelectorAll('.admin-invoice-item-row').length > 1) {
      row.remove();
      this.updateSummary();
      this.updateLivePreview();
    } else {
      Components.toast('Need at least one item', 'warning');
    }
  },

  getItems() {
    const rows = document.querySelectorAll('.admin-invoice-item-row');
    return Array.from(rows).map(row => {
      const desc = row.querySelector('.inv-item-desc')?.value || '';
      const qty = parseFloat(row.querySelector('.inv-item-qty')?.value || 1);
      const rate = parseFloat(row.querySelector('.inv-item-rate')?.value || 0);
      return { description: desc, quantity: qty, rate: rate, amount: qty * rate };
    });
  },

  updateSummary(items) {
    items = items || this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(document.getElementById('inv_tax_rate')?.value || 0);
    const discount = parseFloat(document.getElementById('inv_discount')?.value || 0);
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    // Update readonly fields
    const subtotalField = document.getElementById('inv_subtotal');
    const taxAmountField = document.getElementById('inv_tax_amount');
    const totalField = document.getElementById('inv_total');
    if (subtotalField) subtotalField.value = `$${subtotal.toFixed(2)}`;
    if (taxAmountField) taxAmountField.value = `$${taxAmount.toFixed(2)}`;
    if (totalField) totalField.value = `$${total.toFixed(2)}`;

    // Update item amounts
    items.forEach((item, i) => {
      const row = document.querySelectorAll('.admin-invoice-item-row')[i];
      if (row) {
        const amtField = row.querySelector('.inv-item-amount');
        if (amtField) amtField.value = `$${item.amount.toFixed(2)}`;
      }
    });
  },

  updateLivePreview(items) {
    const preview = document.getElementById('invoicePreview');
    if (preview) {
      preview.innerHTML = this.generatePreviewHTML(items);
    }
  },

  generatePreviewHTML(items) {
    items = items || this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(document.getElementById('inv_tax_rate')?.value || 0);
    const discount = parseFloat(document.getElementById('inv_discount')?.value || 0);
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    const invNum = document.getElementById('inv_number')?.value || 'INV-001';
    const date = document.getElementById('inv_date')?.value || '';
    const dueDate = document.getElementById('inv_due')?.value || '';
    const fromName = document.getElementById('inv_from_name')?.value || '';
    const fromEmail = document.getElementById('inv_from_email')?.value || '';
    const fromPhone = document.getElementById('inv_from_phone')?.value || '';
    const fromAddr = document.getElementById('inv_from_address')?.value || '';
    const toName = document.getElementById('inv_to_name')?.value || 'Client Name';
    const toCompany = document.getElementById('inv_to_company')?.value || '';
    const toEmail = document.getElementById('inv_to_email')?.value || '';
    const toPhone = document.getElementById('inv_to_phone')?.value || '';
    const toAddr = document.getElementById('inv_to_address')?.value || '';
    const notes = document.getElementById('inv_notes')?.value || '';
    const terms = document.getElementById('inv_terms')?.value || '';

    const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    const itemsHTML = items.length === 0
      ? '<tr><td colspan="4" style="text-align:center;padding:20px;color:#999">No items added yet</td></tr>'
      : items.map(item => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${item.description || '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">$${item.rate.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600">$${item.amount.toFixed(2)}</td>
        </tr>
      `).join('');

    return `
      <div style="width:100%;height:100%;background:#fff;color:#1d1d1f;font-family:'Inter',-apple-system,sans-serif;display:flex;flex-direction:column;position:relative">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 16px;border-bottom:3px solid #0066cc">
          <div>
            <div style="font-size:1.5rem;font-weight:800;color:#0066cc;letter-spacing:-0.02em">INVOICE</div>
            <div style="font-size:11px;color:#999;margin-top:4px"># ${invNum}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:14px;font-weight:700">${fromName}</div>
            <div style="font-size:11px;color:#666;margin-top:2px">${fromEmail}</div>
            <div style="font-size:11px;color:#666">${fromPhone}</div>
            <div style="font-size:11px;color:#666">${fromAddr}</div>
          </div>
        </div>

        <!-- Dates & Bill To -->
        <div style="display:flex;justify-content:space-between;padding:16px 28px;background:#f8f9fa;border-bottom:1px solid #eee">
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Date</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(date)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Due Date</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(dueDate)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Bill To</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${toName}</div>
            ${toCompany ? `<div style="font-size:11px;color:#666">${toCompany}</div>` : ''}
            <div style="font-size:11px;color:#666">${toEmail}</div>
            <div style="font-size:11px;color:#666">${toPhone}</div>
            <div style="font-size:11px;color:#666">${toAddr}</div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="flex:1;padding:16px 28px">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#0066cc;color:#fff">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Description</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:60px">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:100px">Rate</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:110px">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="padding:12px 28px 16px;border-top:2px solid #333;display:flex;justify-content:flex-end">
          <div style="width:280px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:#666">Subtotal</span>
              <span style="font-weight:600">$${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:#666">Discount (${discount}%)</span>
              <span style="color:#ef4444">−$${discountAmount.toFixed(2)}</span>
            </div>` : ''}
            ${taxRate > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:#666">Tax (${taxRate}%)</span>
              <span>$${taxAmount.toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:2px solid #0066cc;margin-top:4px;font-size:16px;font-weight:800;color:#0066cc">
              <span>Total</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:12px 28px 20px;border-top:1px solid #eee;font-size:11px;color:#999">
          ${notes ? `<div style="margin-bottom:6px"><strong style="color:#666">Notes:</strong> ${notes}</div>` : ''}
          ${terms ? `<div><strong style="color:#666">Terms:</strong> ${terms}</div>` : ''}
        </div>
      </div>
    `;
  },

  // ==================== SAVE TO DB ====================
  async saveInvoice() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(document.getElementById('inv_tax_rate')?.value || 0);
    const discount = parseFloat(document.getElementById('inv_discount')?.value || 0);
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    const data = {
      invoice_number: document.getElementById('inv_number')?.value || '',
      date: document.getElementById('inv_date')?.value || '',
      due_date: document.getElementById('inv_due')?.value || null,
      from_name: document.getElementById('inv_from_name')?.value || '',
      from_email: document.getElementById('inv_from_email')?.value || '',
      from_phone: document.getElementById('inv_from_phone')?.value || '',
      from_address: document.getElementById('inv_from_address')?.value || '',
      to_name: document.getElementById('inv_to_name')?.value || '',
      to_email: document.getElementById('inv_to_email')?.value || '',
      to_phone: document.getElementById('inv_to_phone')?.value || '',
      to_company: document.getElementById('inv_to_company')?.value || '',
      to_address: document.getElementById('inv_to_address')?.value || '',
      items: JSON.stringify(items),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount,
      discount_amount: discountAmount,
      total,
      notes: document.getElementById('inv_notes')?.value || '',
      terms: document.getElementById('inv_terms')?.value || '',
      status: document.getElementById('inv_status')?.value || 'draft'
    };

    if (!data.to_name || !data.invoice_number) {
      Components.toast('Client name and invoice number are required', 'error');
      return;
    }

    try {
      if (this.editingInvoiceId) {
        await DB.updateInvoice(this.editingInvoiceId, data);
        Components.toast('Invoice updated!', 'success');
      } else {
        await DB.createInvoice(data);
        Components.toast('Invoice saved!', 'success');
      }

      await this.render('list');
    } catch (error) {
      console.error('Save invoice error:', error);
      Components.toast('Failed to save invoice: ' + error.message, 'error');
    }
  },

  // ==================== VIEW DETAILS ====================
  async viewInvoice(invoiceId) {
    try {
      const invoice = await DB.getInvoiceById(invoiceId);
      if (!invoice) {
        Components.toast('Invoice not found', 'error');
        return;
      }

      const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);
      const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

      Components.showModal(`Invoice #${invoice.invoice_number}`, `
        <div style="display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Bill To</div>
              <div style="font-weight:600">${invoice.to_name}</div>
              ${invoice.to_company ? `<div style="font-size:0.85rem;color:var(--text-muted)">${invoice.to_company}</div>` : ''}
            </div>
            <div style="text-align:right">
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Status</div>
              <div>${this.statusBadge(invoice.status)}</div>
            </div>
          </div>
          <div style="display:flex;gap:20px;font-size:0.85rem;color:var(--text-muted)">
            <span><strong>Date:</strong> ${formatDate(invoice.date)}</span>
            <span><strong>Due:</strong> ${formatDate(invoice.due_date)}</span>
          </div>
          <div>
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px">Items</div>
            ${items.length === 0 ? '<p style="color:var(--text-muted)">No items</p>' :
              items.map(item => `
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-light);font-size:0.85rem">
                  <span>${item.description || '—'} × ${item.quantity}</span>
                  <span style="font-weight:600">$${parseFloat(item.rate || 0).toFixed(2)}</span>
                </div>
              `).join('')
            }
          </div>
          <div style="border-top:1px solid var(--border-light);padding-top:10px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Subtotal</span>
              <span>$${parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            ${parseFloat(invoice.discount_amount) > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Discount (${invoice.discount}%)</span>
              <span style="color:#ef4444">−$${parseFloat(invoice.discount_amount).toFixed(2)}</span>
            </div>` : ''}
            ${parseFloat(invoice.tax_amount) > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Tax (${invoice.tax_rate}%)</span>
              <span>$${parseFloat(invoice.tax_amount).toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1.1rem;font-weight:700;color:var(--accent-1)">
              <span>Total</span>
              <span>$${parseFloat(invoice.total).toFixed(2)}</span>
            </div>
          </div>
          ${invoice.notes ? `<div style="padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.85rem"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
          ${invoice.terms ? `<div style="padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.85rem"><strong>Terms:</strong> ${invoice.terms}</div>` : ''}
          <div style="display:flex;gap:8px;padding-top:8px">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="AdminInvoice.render('form', ${invoice.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-secondary btn-sm" style="flex:1" onclick="AdminInvoice.exportInvoicePDF(${invoice.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      `, '500px');
    } catch (error) {
      Components.toast('Failed to load invoice', 'error');
    }
  },

  // ==================== EXPORT PDF (from stored data) ====================
  async exportInvoicePDF(invoiceId) {
    try {
      const invoice = await DB.getInvoiceById(invoiceId);
      if (!invoice) {
        Components.toast('Invoice not found', 'error');
        return;
      }

      Components.toast('Generating PDF...', 'info');

      // Temporarily render the preview to capture it
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:1100px';

      // Populate a temporary structure with the invoice data for preview
      const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);
      const previewHTML = this.generatePreviewFromData(invoice, items);
      tempDiv.innerHTML = previewHTML;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      });

      document.body.removeChild(tempDiv);

      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
      Components.toast('PDF downloaded!', 'success');
    } catch (error) {
      console.error('Invoice PDF export error:', error);
      Components.toast('Failed to export PDF: ' + error.message, 'error');
    }
  },

  generatePreviewFromData(invoice, items) {
    const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const subtotal = parseFloat(invoice.subtotal) || 0;
    const discount = parseFloat(invoice.discount) || 0;
    const discountAmount = parseFloat(invoice.discount_amount) || 0;
    const taxRate = parseFloat(invoice.tax_rate) || 0;
    const taxAmount = parseFloat(invoice.tax_amount) || 0;
    const total = parseFloat(invoice.total) || 0;

    const itemsHTML = items.length === 0
      ? '<tr><td colspan="4" style="text-align:center;padding:20px;color:#999">No items</td></tr>'
      : items.map(item => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${item.description || '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">$${parseFloat(item.rate || 0).toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600">$${parseFloat(item.amount || item.rate * item.quantity || 0).toFixed(2)}</td>
        </tr>
      `).join('');

    return `
      <div style="width:1100px;height:auto;background:#fff;color:#1d1d1f;font-family:'Inter',-apple-system,sans-serif;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 16px;border-bottom:3px solid #0066cc">
          <div>
            <div style="font-size:1.5rem;font-weight:800;color:#0066cc;letter-spacing:-0.02em">INVOICE</div>
            <div style="font-size:11px;color:#999;margin-top:4px"># ${invoice.invoice_number}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:14px;font-weight:700">${invoice.from_name}</div>
            <div style="font-size:11px;color:#666;margin-top:2px">${invoice.from_email}</div>
            <div style="font-size:11px;color:#666">${invoice.from_phone}</div>
            <div style="font-size:11px;color:#666">${invoice.from_address}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:16px 28px;background:#f8f9fa;border-bottom:1px solid #eee">
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Date</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(invoice.date)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Due Date</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(invoice.due_date)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Bill To</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${invoice.to_name}</div>
            ${invoice.to_company ? `<div style="font-size:11px;color:#666">${invoice.to_company}</div>` : ''}
            <div style="font-size:11px;color:#666">${invoice.to_email}</div>
            <div style="font-size:11px;color:#666">${invoice.to_phone}</div>
            <div style="font-size:11px;color:#666">${invoice.to_address}</div>
          </div>
        </div>
        <div style="flex:1;padding:16px 28px">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#0066cc;color:#fff">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Description</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:60px">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:100px">Rate</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:110px">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
        </div>
        <div style="padding:12px 28px 16px;border-top:2px solid #333;display:flex;justify-content:flex-end">
          <div style="width:280px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:#666">Subtotal</span>
              <span style="font-weight:600">$${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span style="color:#666">Discount (${discount}%)</span><span style="color:#ef4444">−$${discountAmount.toFixed(2)}</span></div>` : ''}
            ${taxRate > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span style="color:#666">Tax (${taxRate}%)</span><span>$${taxAmount.toFixed(2)}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:2px solid #0066cc;margin-top:4px;font-size:16px;font-weight:800;color:#0066cc">
              <span>Total</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style="padding:12px 28px 20px;border-top:1px solid #eee;font-size:11px;color:#999">
          ${invoice.notes ? `<div style="margin-bottom:6px"><strong style="color:#666">Notes:</strong> ${invoice.notes}</div>` : ''}
          ${invoice.terms ? `<div><strong style="color:#666">Terms:</strong> ${invoice.terms}</div>` : ''}
        </div>
      </div>
    `;
  },

  // ==================== EXPORT PDF (from live form) ====================
  async exportPDF() {
    this.updateLivePreview();
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;

    try {
      Components.toast('Generating PDF...', 'info');

      const canvas = await html2canvas(preview, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: preview.scrollWidth,
        height: preview.scrollHeight
      });

      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${document.getElementById('inv_number')?.value || 'export'}.pdf`);
      Components.toast('PDF downloaded!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      Components.toast('Failed to export PDF: ' + error.message, 'error');
    }
  },

  async exportJPG() {
    this.updateLivePreview();
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;

    try {
      Components.toast('Generating JPG...', 'info');

      const canvas = await html2canvas(preview, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: preview.scrollWidth,
        height: preview.scrollHeight
      });

      const link = document.createElement('a');
      link.download = `invoice-${document.getElementById('inv_number')?.value || 'export'}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      Components.toast('JPG downloaded!', 'success');
    } catch (error) {
      console.error('JPG export error:', error);
      Components.toast('Failed to export JPG: ' + error.message, 'error');
    }
  },

  printInvoice() {
    this.updateLivePreview();
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>Invoice - ${document.getElementById('inv_number')?.value || 'Export'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
          @media print {
            body { padding: 0; }
            @page { size: landscape; margin: 0.5in; }
          }
        </style>
      </head>
      <body>${preview.outerHTML}</body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 1000);
    }, 500);
  },

  // ==================== DELETE ====================
  confirmDelete(invoiceId) {
    Components.showModal('Delete Invoice', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete this invoice? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminInvoice.deleteInvoice(${invoiceId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteInvoice(invoiceId) {
    try {
      await DB.deleteInvoice(invoiceId);
      Components.toast('Invoice deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.render('list');
    } catch (error) {
      Components.toast('Failed to delete invoice', 'error');
    }
  }
};
