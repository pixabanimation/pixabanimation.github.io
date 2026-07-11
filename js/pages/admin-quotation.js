// ============================================
// pixabanimation — Admin Quotation Generator
// For animation billing. Saves to database.
// ============================================

const AdminQuotation = {
  currentView: 'list', // 'list' | 'form'
  editingQuoteId: null,

  async render(view = 'list', quoteId = null) {
    this.editingQuoteId = quoteId;
    this.currentView = view;
    if (view === 'list') {
      await this.renderList();
    } else if (view === 'form') {
      await this.renderForm(quoteId);
    }
  },

  // ==================== LIST VIEW ====================
  async renderList() {
    const container = document.getElementById('adminContent');
    try {
      const quotes = await DB.getAllQuotations();

      container.innerHTML = `
        <div class="admin-quotation-page page-enter">
          <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
            <div>
              <h3 style="font-size:1.1rem;font-weight:600;margin:0">Animation Quotations</h3>
              <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">${quotes.length} quotation${quotes.length !== 1 ? 's' : ''}</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="AdminQuotation.render('form', null)">
              <i class="fas fa-plus"></i> New Quotation
            </button>
          </div>

          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Client</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style="width:140px">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${quotes.length === 0 ? 
                  '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">No quotations yet. Create your first animation quotation!</td></tr>' :
                  quotes.map(q => `
                    <tr>
                      <td><span style="font-weight:700;font-size:0.85rem">${q.quote_number}</span></td>
                      <td><span style="font-weight:600">${q.client_name}</span></td>
                      <td>${q.client_company || '—'}</td>
                      <td style="font-size:0.85rem;color:var(--text-muted)">${q.date ? new Date(q.date + 'T00:00:00').toLocaleDateString() : '—'}</td>
                      <td style="font-size:0.85rem;color:var(--text-muted)">${q.valid_until ? new Date(q.valid_until + 'T00:00:00').toLocaleDateString() : '—'}</td>
                      <td style="font-weight:700;color:var(--accent-1)">$${parseFloat(q.total).toFixed(2)}</td>
                      <td>${this.statusBadge(q.status)}</td>
                      <td>
                        <div style="display:flex;gap:6px">
                          <button class="admin-action-btn" onclick="AdminQuotation.render('form', ${q.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="admin-action-btn" onclick="AdminQuotation.exportQuotePDF(${q.id})" title="Export PDF">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <button class="admin-action-btn" onclick="AdminQuotation.viewQuote(${q.id})" title="View">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="admin-action-btn delete" onclick="AdminQuotation.confirmDelete(${q.id})" title="Delete">
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
      console.error('Quotations error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load quotations', error.message);
    }
  },

  statusBadge(status) {
    const colors = {
      'draft': { bg: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' },
      'sent': { bg: 'rgba(0,102,204,0.15)', color: 'var(--accent-1)' },
      'accepted': { bg: 'rgba(16,185,129,0.15)', color: 'var(--success)' },
      'rejected': { bg: 'rgba(239,68,68,0.15)', color: 'var(--error)' },
      'cancelled': { bg: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)' }
    };
    const c = colors[status] || colors.draft;
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:600;background:${c.bg};color:${c.color};text-transform:capitalize">${status}</span>`;
  },

  // ==================== FORM VIEW ====================
  async renderForm(quoteId) {
    const container = document.getElementById('adminContent');
    const isEdit = !!quoteId;
    let quote = null;

    if (isEdit) {
      quote = await DB.getQuotationById(quoteId);
    }

    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const quoteNum = isEdit ? quote.quote_number : 'QTN-' + Date.now().toString(36).toUpperCase();
    const services = isEdit ? (typeof quote.services === 'string' ? JSON.parse(quote.services) : quote.services || []) : [];

    container.innerHTML = `
      <div class="admin-quotation-page page-enter">
        <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h3 style="font-size:1.1rem;font-weight:600;margin:0">
              <i class="fas fa-arrow-left" style="cursor:pointer;margin-right:8px;font-size:0.9rem" onclick="AdminQuotation.render('list')"></i>
              ${isEdit ? 'Edit Quotation' : 'New Quotation'}
            </h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">Animation billing quotation</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="AdminQuotation.saveQuotation()">
              <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Quotation
            </button>
            ${isEdit ? `
            <button class="btn btn-secondary btn-sm" onclick="AdminQuotation.exportQuotePDF(${quoteId})">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>` : ''}
          </div>
        </div>

        <div class="admin-invoice-layout">
          <!-- Form Panel -->
          <div class="admin-invoice-form">
            <form id="quotationForm" onsubmit="AdminQuotation.saveQuotation();return false">
              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-hashtag"></i> Quote Info</h4>
                <div class="admin-form-grid-3">
                  <div class="form-group">
                    <label>Quote #</label>
                    <input type="text" id="qt_number" value="${quoteNum}" ${isEdit ? 'readonly' : ''}>
                  </div>
                  <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="qt_date" value="${isEdit ? (quote.date || today) : today}">
                  </div>
                  <div class="form-group">
                    <label>Valid Until</label>
                    <input type="date" id="qt_valid" value="${isEdit ? (quote.valid_until || validUntil) : validUntil}">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-user"></i> Client Information</h4>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" id="qt_client_name" value="${isEdit ? quote.client_name : ''}" required>
                  </div>
                  <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="qt_client_company" value="${isEdit ? (quote.client_company || '') : ''}" placeholder="Animation studio / brand">
                  </div>
                </div>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="qt_client_email" value="${isEdit ? (quote.client_email || '') : ''}" placeholder="client@studio.com">
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="qt_client_phone" value="${isEdit ? (quote.client_phone || '') : ''}" placeholder="+1 (555) 000-0000">
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" id="qt_client_address" value="${isEdit ? (quote.client_address || '') : ''}" placeholder="Street, City, Country">
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-film"></i> Animation Services</h4>
                <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 10px">Add animation-specific services, durations, and rates</p>
                <div id="quoteServicesContainer">
                  ${services.length > 0 
                    ? services.map((s, i) => this.generateServiceRow(i, s.description, s.duration, s.rate, s.amount)).join('')
                    : this.generateServiceRow(0, '', '', '', '')}
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminQuotation.addService()" style="margin-top:8px">
                  <i class="fas fa-plus"></i> Add Service
                </button>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-calculator"></i> Summary</h4>
                <div class="admin-form-grid-3">
                  <div class="form-group">
                    <label>Subtotal</label>
                    <input type="text" id="qt_subtotal" readonly style="font-weight:600;color:var(--accent-1)">
                  </div>
                  <div class="form-group">
                    <label>Tax Rate (%)</label>
                    <input type="number" id="qt_tax_rate" value="${isEdit ? quote.tax_rate : 0}" min="0" max="100" step="0.1" oninput="AdminQuotation.updateSummary()">
                  </div>
                  <div class="form-group">
                    <label>Status</label>
                    <select id="qt_status" onchange="AdminQuotation.updateSummary()">
                      <option value="draft" ${isEdit && quote.status === 'draft' ? 'selected' : ''}>Draft</option>
                      <option value="sent" ${isEdit && quote.status === 'sent' ? 'selected' : ''}>Sent</option>
                      <option value="accepted" ${isEdit && quote.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                      <option value="rejected" ${isEdit && quote.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                      <option value="cancelled" ${isEdit && quote.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </div>
                </div>
                <div class="admin-form-grid-2" style="margin-top:8px">
                  <div class="form-group">
                    <label>Tax Amount</label>
                    <input type="text" id="qt_tax_amount" readonly style="font-weight:600">
                  </div>
                  <div class="form-group">
                    <label>Total</label>
                    <input type="text" id="qt_total" readonly style="font-weight:700;color:var(--accent-1);font-size:1.1rem">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-file-contract"></i> Terms & Notes</h4>
                <div class="form-group">
                  <label>Terms & Conditions</label>
                  <textarea id="qt_terms" rows="2" style="resize:vertical" placeholder="Payment terms, delivery timeline, revisions policy...">${isEdit ? (quote.terms || '') : ''}</textarea>
                </div>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea id="qt_notes" rows="2" style="resize:vertical" placeholder="Additional notes for the client...">${isEdit ? (quote.notes || '') : ''}</textarea>
                </div>
              </div>

              <div style="text-align:right;padding:12px 0">
                <button type="button" class="btn btn-secondary" onclick="AdminQuotation.render('list')" style="margin-right:8px">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save"></i> ${isEdit ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>

          <!-- Preview Panel -->
          <div class="admin-invoice-preview-wrapper">
            <div class="admin-invoice-preview-header">
              <h4><i class="fas fa-eye"></i> Quotation Preview</h4>
              <span style="font-size:0.75rem;color:var(--text-muted)">Animation billing quote</span>
            </div>
            <div class="admin-invoice-preview-container" id="quotePreviewContainer">
              <div class="admin-invoice-preview landscape" id="quotePreview">
                ${this.generateQuotePreview(quote)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Auto-update preview on input
    document.querySelectorAll('#quotationForm input, #quotationForm textarea, #quotationForm select').forEach(el => {
      el.addEventListener('input', () => this.updateQuotePreview());
      el.addEventListener('change', () => this.updateQuotePreview());
    });

    this.updateSummary();
  },

  generateServiceRow(index, description = '', duration = '', rate = '', amount = '') {
    return `
      <div class="admin-quote-service-row" data-index="${index}" style="display:grid;grid-template-columns:1fr 80px 100px 80px 30px;gap:8px;align-items:end;margin-bottom:8px">
        <div class="form-group">
          <label>Service</label>
          <input type="text" class="qt-svc-desc" value="${description}" placeholder="e.g. Explainer Video Animation">
        </div>
        <div class="form-group">
          <label>Duration</label>
          <input type="text" class="qt-svc-duration" value="${duration}" placeholder="e.g. 2 weeks">
        </div>
        <div class="form-group">
          <label>Rate ($)</label>
          <input type="number" class="qt-svc-rate" value="${rate || 0}" min="0" step="0.01" oninput="AdminQuotation.updateSummary()">
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input type="text" class="qt-svc-amount" value="${amount ? `$${parseFloat(amount).toFixed(2)}` : '$0.00'}" readonly style="font-weight:600">
        </div>
        <button type="button" class="btn btn-sm" style="padding:8px;color:var(--error);font-size:0.8rem;margin-bottom:0" onclick="AdminQuotation.removeService(this)" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  },

  addService() {
    const container = document.getElementById('quoteServicesContainer');
    const index = container.children.length;
    container.insertAdjacentHTML('beforeend', this.generateServiceRow(index));
    this.updateSummary();
  },

  removeService(btn) {
    const row = btn.closest('.admin-quote-service-row');
    if (document.querySelectorAll('.admin-quote-service-row').length > 1) {
      row.remove();
      this.updateSummary();
    } else {
      Components.toast('Need at least one service', 'warning');
    }
  },

  getServices() {
    const rows = document.querySelectorAll('.admin-quote-service-row');
    return Array.from(rows).map(row => {
      const description = row.querySelector('.qt-svc-desc')?.value || '';
      const duration = row.querySelector('.qt-svc-duration')?.value || '';
      const rate = parseFloat(row.querySelector('.qt-svc-rate')?.value || 0);
      return { description, duration, rate, amount: rate };
    });
  },

  updateSummary() {
    const services = this.getServices();
    const subtotal = services.reduce((sum, s) => sum + s.amount, 0);
    const taxRate = parseFloat(document.getElementById('qt_tax_rate')?.value || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const subField = document.getElementById('qt_subtotal');
    const taxField = document.getElementById('qt_tax_amount');
    const totalField = document.getElementById('qt_total');
    if (subField) subField.value = `$${subtotal.toFixed(2)}`;
    if (taxField) taxField.value = `$${taxAmount.toFixed(2)}`;
    if (totalField) totalField.value = `$${total.toFixed(2)}`;

    // Update individual amounts
    services.forEach((s, i) => {
      const row = document.querySelectorAll('.admin-quote-service-row')[i];
      if (row) {
        const amtField = row.querySelector('.qt-svc-amount');
        if (amtField) amtField.value = `$${s.amount.toFixed(2)}`;
      }
    });

    this.updateQuotePreview();
  },

  updateQuotePreview() {
    const preview = document.getElementById('quotePreview');
    if (preview) {
      preview.innerHTML = this.generateQuotePreview(null);
    }
  },

  generateQuotePreview(quote) {
    const services = this.getServices();
    const subtotal = services.reduce((sum, s) => sum + s.amount, 0);
    const taxRate = parseFloat(document.getElementById('qt_tax_rate')?.value || (quote?.tax_rate || 0));
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const qtNum = document.getElementById('qt_number')?.value || (quote?.quote_number || 'QTN-001');
    const date = document.getElementById('qt_date')?.value || (quote?.date || '');
    const valid = document.getElementById('qt_valid')?.value || (quote?.valid_until || '');
    const client = document.getElementById('qt_client_name')?.value || (quote?.client_name || 'Client');
    const company = document.getElementById('qt_client_company')?.value || (quote?.client_company || '');
    const email = document.getElementById('qt_client_email')?.value || (quote?.client_email || '');
    const phone = document.getElementById('qt_client_phone')?.value || (quote?.client_phone || '');
    const addr = document.getElementById('qt_client_address')?.value || (quote?.client_address || '');
    const terms = document.getElementById('qt_terms')?.value || (quote?.terms || '');
    const notes = document.getElementById('qt_notes')?.value || (quote?.notes || '');

    const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    const servicesHTML = services.length === 0
      ? '<tr><td colspan="4" style="text-align:center;padding:20px;color:#999">Add animation services to generate preview</td></tr>'
      : services.map(s => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${s.description || '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${s.duration || '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">$${s.rate.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600">$${s.amount.toFixed(2)}</td>
        </tr>
      `).join('');

    return `
      <div style="width:100%;height:100%;background:#fff;color:#1d1d1f;font-family:'Inter',-apple-system,sans-serif;display:flex;flex-direction:column;position:relative">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 16px;border-bottom:3px solid #10b981">
          <div>
            <div style="font-size:1.5rem;font-weight:800;color:#10b981;letter-spacing:-0.02em">QUOTATION</div>
            <div style="font-size:11px;color:#999;margin-top:4px"># ${qtNum}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:700">PixabAnimation Studio</div>
            <div style="font-size:11px;color:#666;margin-top:2px">Animation & Motion Design</div>
            <div style="font-size:11px;color:#666">hello@pixabanimation.com</div>
          </div>
        </div>

        <!-- Info Bar -->
        <div style="display:flex;justify-content:space-between;padding:16px 28px;background:#f8f9fa;border-bottom:1px solid #eee">
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Date</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(date)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Valid Until</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${formatDate(valid)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Prepared For</div>
            <div style="font-size:13px;font-weight:600;margin-top:2px">${client}</div>
            ${company ? `<div style="font-size:11px;color:#666">${company}</div>` : ''}
            <div style="font-size:11px;color:#666">${email}</div>
            <div style="font-size:11px;color:#666">${phone}</div>
            <div style="font-size:11px;color:#666">${addr}</div>
          </div>
        </div>

        <!-- Services Table -->
        <div style="flex:1;padding:16px 28px">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#10b981;color:#fff">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Animation Service</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:80px">Duration</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:100px">Rate</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:110px">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
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
            ${taxRate > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
              <span style="color:#666">Tax (${taxRate}%)</span>
              <span>$${taxAmount.toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:2px solid #10b981;margin-top:4px;font-size:16px;font-weight:800;color:#10b981">
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

  // ==================== SAVE ====================
  async saveQuotation() {
    const services = this.getServices();
    const subtotal = services.reduce((sum, s) => sum + s.amount, 0);
    const taxRate = parseFloat(document.getElementById('qt_tax_rate')?.value || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const data = {
      quote_number: document.getElementById('qt_number')?.value || '',
      date: document.getElementById('qt_date')?.value || '',
      valid_until: document.getElementById('qt_valid')?.value || '',
      client_name: document.getElementById('qt_client_name')?.value || '',
      client_email: document.getElementById('qt_client_email')?.value || '',
      client_phone: document.getElementById('qt_client_phone')?.value || '',
      client_company: document.getElementById('qt_client_company')?.value || '',
      client_address: document.getElementById('qt_client_address')?.value || '',
      services: JSON.stringify(services),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      terms: document.getElementById('qt_terms')?.value || '',
      notes: document.getElementById('qt_notes')?.value || '',
      status: document.getElementById('qt_status')?.value || 'draft'
    };

    if (!data.client_name || !data.quote_number) {
      Components.toast('Client name and quote number are required', 'error');
      return;
    }

    try {
      if (this.editingQuoteId) {
        await DB.updateQuotation(this.editingQuoteId, data);
        Components.toast('Quotation updated!', 'success');
      } else {
        await DB.createQuotation(data);
        Components.toast('Quotation saved!', 'success');
      }

      await this.render('list');
    } catch (error) {
      console.error('Save quotation error:', error);
      Components.toast('Failed to save quotation: ' + error.message, 'error');
    }
  },

  // ==================== VIEW DETAILS ====================
  async viewQuote(quoteId) {
    try {
      const quote = await DB.getQuotationById(quoteId);
      if (!quote) {
        Components.toast('Quotation not found', 'error');
        return;
      }

      const services = typeof quote.services === 'string' ? JSON.parse(quote.services) : (quote.services || []);
      const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

      Components.showModal(`Quotation #${quote.quote_number}`, `
        <div style="display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Client</div>
              <div style="font-weight:600">${quote.client_name}</div>
              ${quote.client_company ? `<div style="font-size:0.85rem;color:var(--text-muted)">${quote.client_company}</div>` : ''}
            </div>
            <div style="text-align:right">
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Status</div>
              <div>${this.statusBadge(quote.status)}</div>
            </div>
          </div>
          <div style="display:flex;gap:20px;font-size:0.85rem;color:var(--text-muted)">
            <span><strong>Date:</strong> ${formatDate(quote.date)}</span>
            <span><strong>Valid Until:</strong> ${formatDate(quote.valid_until)}</span>
          </div>
          <div>
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px">Services</div>
            ${services.length === 0 ? '<p style="color:var(--text-muted)">No services listed</p>' :
              services.map(s => `
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-light);font-size:0.85rem">
                  <span>${s.description || '—'} ${s.duration ? `(${s.duration})` : ''}</span>
                  <span style="font-weight:600">$${parseFloat(s.rate || 0).toFixed(2)}</span>
                </div>
              `).join('')
            }
          </div>
          <div style="border-top:1px solid var(--border-light);padding-top:10px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Subtotal</span>
              <span>$${parseFloat(quote.subtotal).toFixed(2)}</span>
            </div>
            ${parseFloat(quote.tax_amount) > 0 ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.85rem">
              <span>Tax (${quote.tax_rate}%)</span>
              <span>$${parseFloat(quote.tax_amount).toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1.1rem;font-weight:700;color:var(--accent-1)">
              <span>Total</span>
              <span>$${parseFloat(quote.total).toFixed(2)}</span>
            </div>
          </div>
          ${quote.terms ? `<div style="padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.85rem"><strong>Terms:</strong> ${quote.terms}</div>` : ''}
          ${quote.notes ? `<div style="padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.85rem"><strong>Notes:</strong> ${quote.notes}</div>` : ''}
          <div style="display:flex;gap:8px;padding-top:8px">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="AdminQuotation.render('form', ${quote.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-secondary btn-sm" style="flex:1" onclick="AdminQuotation.exportQuotePDF(${quote.id});document.querySelector('.modal-overlay')?.remove()">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      `, '500px');
    } catch (error) {
      Components.toast('Failed to load quotation', 'error');
    }
  },

  // ==================== EXPORT PDF ====================
  async exportQuotePDF(quoteId) {
    try {
      const quote = await DB.getQuotationById(quoteId);
      if (!quote) {
        Components.toast('Quotation not found', 'error');
        return;
      }

      Components.toast('Generating PDF...', 'info');

      // Create a temporary preview element
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:1100px';
      tempDiv.innerHTML = this.generateQuotePreview(quote);
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
      pdf.save(`quotation-${quote.quote_number}.pdf`);
      Components.toast('PDF downloaded!', 'success');
    } catch (error) {
      console.error('Quote PDF export error:', error);
      Components.toast('Failed to export PDF: ' + error.message, 'error');
    }
  },

  // ==================== DELETE ====================
  confirmDelete(quoteId) {
    Components.showModal('Delete Quotation', `
      <p style="color:var(--text-secondary);margin-bottom:20px">
        Are you sure you want to delete this quotation? This action cannot be undone.
      </p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminQuotation.deleteQuote(${quoteId})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async deleteQuote(quoteId) {
    try {
      await DB.deleteQuotation(quoteId);
      Components.toast('Quotation deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.render('list');
    } catch (error) {
      Components.toast('Failed to delete quotation', 'error');
    }
  }
};
