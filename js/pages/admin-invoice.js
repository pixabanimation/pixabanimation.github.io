// ============================================
// pixabanimation — Admin Invoice Generator
// Supports: PDF export, JPG download, landscape preview
// ============================================

const AdminInvoice = {
  render() {
    const container = document.getElementById('adminContent');
    const today = new Date().toISOString().split('T')[0];
    const invoiceNum = 'INV-' + Date.now().toString(36).toUpperCase();

    container.innerHTML = `
      <div class="admin-invoice-page page-enter">
        <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h3 style="font-size:1.1rem;font-weight:600;margin:0">Invoice Generator</h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0">Create professional invoices with PDF & JPG export</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="AdminInvoice.exportPDF()">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.exportJPG()">
              <i class="fas fa-file-image"></i> Export JPG
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.printInvoice()">
              <i class="fas fa-print"></i> Print
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminInvoice.clearForm()">
              <i class="fas fa-undo"></i> Reset
            </button>
          </div>
        </div>

        <div class="admin-invoice-layout">
          <!-- Form Panel -->
          <div class="admin-invoice-form">
            <form id="invoiceForm" onsubmit="AdminInvoice.updatePreview(event)">
              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-hashtag"></i> Invoice Info</h4>
                <div class="admin-form-grid-3">
                  <div class="form-group">
                    <label>Invoice #</label>
                    <input type="text" id="inv_number" value="${invoiceNum}">
                  </div>
                  <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="inv_date" value="${today}">
                  </div>
                  <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="inv_due" value="${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-building"></i> From (Your Company)</h4>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" id="inv_from_name" value="PixabAnimation Studio" placeholder="Your company name">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="inv_from_email" value="hello@pixabanimation.com" placeholder="company@email.com">
                  </div>
                </div>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="inv_from_phone" value="+1 (555) 123-4567" placeholder="+1 (555) 000-0000">
                  </div>
                  <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="inv_from_address" value="123 Animation Lane, Creative City, CA 90210" placeholder="Street, City, Country">
                  </div>
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-user"></i> Bill To (Client)</h4>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" id="inv_to_name" placeholder="Client full name" required>
                  </div>
                  <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="inv_to_company" placeholder="Client company (optional)">
                  </div>
                </div>
                <div class="admin-form-grid-2">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="inv_to_email" placeholder="client@email.com">
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="inv_to_phone" placeholder="+1 (555) 000-0000">
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" id="inv_to_address" placeholder="Street, City, Country">
                </div>
              </div>

              <div class="admin-invoice-form-section">
                <h4><i class="fas fa-list"></i> Invoice Items</h4>
                <div id="invoiceItemsContainer">
                  ${this.generateItemRow(0)}
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
                    <input type="number" id="inv_tax_rate" value="0" min="0" max="100" step="0.1" oninput="AdminInvoice.updatePreview()">
                  </div>
                  <div class="form-group">
                    <label>Discount (%)</label>
                    <input type="number" id="inv_discount" value="0" min="0" max="100" step="1" oninput="AdminInvoice.updatePreview()">
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
                  <textarea id="inv_notes" rows="2" placeholder="Payment instructions, thank you notes..." style="resize:vertical"></textarea>
                </div>
                <div class="form-group">
                  <label>Terms & Conditions</label>
                  <textarea id="inv_terms" rows="2" placeholder="Payment terms, late fees..." style="resize:vertical">Payment due within 30 days. Late payments subject to 1.5% monthly interest.</textarea>
                </div>
              </div>

              <div style="text-align:right;padding:12px 0">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-sync-alt"></i> Update Preview
                </button>
              </div>
            </form>
          </div>

          <!-- Preview Panel -->
          <div class="admin-invoice-preview-wrapper">
            <div class="admin-invoice-preview-header">
              <h4><i class="fas fa-eye"></i> Preview</h4>
              <span style="font-size:0.75rem;color:var(--text-muted)">Landscape mode</span>
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

    this.updatePreview();
  },

  generateItemRow(index) {
    return `
      <div class="admin-invoice-item-row" data-index="${index}" style="display:grid;grid-template-columns:1fr 80px 100px 80px 30px;gap:8px;align-items:end;margin-bottom:8px">
        <div class="form-group">
          <label>Description</label>
          <input type="text" class="inv-item-desc" placeholder="Service / product">
        </div>
        <div class="form-group">
          <label>Qty</label>
          <input type="number" class="inv-item-qty" value="1" min="1" oninput="AdminInvoice.updatePreview()">
        </div>
        <div class="form-group">
          <label>Rate ($)</label>
          <input type="number" class="inv-item-rate" value="0" min="0" step="0.01" oninput="AdminInvoice.updatePreview()">
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
    container.insertAdjacentHTML('beforeend', this.generateItemRow(index));
    this.updatePreview();
  },

  removeItem(btn) {
    const row = btn.closest('.admin-invoice-item-row');
    if (document.querySelectorAll('.admin-invoice-item-row').length > 1) {
      row.remove();
      this.updatePreview();
    } else {
      Components.toast('Need at least one item', 'warning');
    }
  },

  updatePreview(event) {
    if (event) event.preventDefault();

    // Collect form data
    const items = this.getItems();
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

    // Update preview
    const preview = document.getElementById('invoicePreview');
    if (preview) {
      preview.innerHTML = this.generatePreviewHTML();
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

  generatePreviewHTML() {
    const items = this.getItems();
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

  async exportPDF() {
    this.updatePreview();
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;

    try {
      Components.toast('Generating PDF...', 'info');

      const { jsPDF } = window.jspdf;

      // Use html2canvas to capture the preview
      const canvas = await html2canvas(preview, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: preview.scrollWidth,
        height: preview.scrollHeight
      });

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
    this.updatePreview();
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
    this.updatePreview();
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

  clearForm() {
    if (!confirm('Reset the invoice form? This will clear all fields.')) return;
    // Simply re-render
    this.render();
    Components.toast('Form cleared', 'info');
  }
};
