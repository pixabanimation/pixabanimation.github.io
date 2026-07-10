// ============================================
// pixabanimation — Admin Popup Ads Manager
// ============================================

const AdminPopupAds = {
  async render() {
    const container = document.getElementById('adminContent');
    try {
      const ads = await DB.getPopupAds();

      container.innerHTML = `
        <div class="admin-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h3 style="font-size:1rem;font-weight:600;margin:0; color:rgba(0,0,0,0.55)">Popup Advertisements</h3>
            <p style="font-size:0.8rem;color:rgba(0,0,0,0.55);margin:4px 0 0">Manage popup ads shown site-wide. Visitors see 2 popups per visit, alternating between 2 groups of ads.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="AdminPopupAds.showForm(null)">
            <i class="fas fa-plus"></i> Create Popup Ad
          </button>
        </div>
        ${ads.length === 0 ? `
        <div style="text-align:center;padding:60px;border:2px dashed var(--border-light);border-radius:var(--radius-lg)">
          <i class="fas fa-window-restore" style="font-size:3rem;color:rgba(0,0,0,0.3);margin-bottom:16px;display:block"></i>
          <h3 style="margin-bottom:8px">No popup ads yet</h3>
          <p style="color:rgba(0,0,0,0.5);margin-bottom:20px">Create popup ads that appear to visitors with alternating groups.</p>
          <button class="btn btn-primary" onclick="AdminPopupAds.showForm(null)">
            <i class="fas fa-plus"></i> Create Your First Popup Ad
          </button>
        </div>
        ` : `
        <div style="display:flex;flex-direction:column;gap:16px">
          ${ads.map(ad => `
            <div class="admin-card" style="padding:20px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;opacity:${ad.is_active ? '1' : '0.5'}">
              <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                  <span style="font-size:1.2rem;color:rgba(0,0,0,0.6);width:28px;text-align:center"><i class="fas ${ad.icon || 'fa-bullhorn'}"></i></span>
                  <div>
                    <span style="font-weight:600;font-size:0.95rem">${ad.name}</span>
                    ${ad.is_animated ? '<span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:rgba(255,215,64,0.15);color:var(--warning);margin-left:8px">Animated</span>' : ''}
                    ${ad.is_active ? '<span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:rgba(16,185,129,0.15);color:var(--success);margin-left:4px">Active</span>' : '<span style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:rgba(255,255,255,0.05);color:rgba(0,0,0,0.45);margin-left:4px">Inactive</span>'}
                  </div>
                </div>
                <div style="font-size:0.85rem;font-weight:600;color:rgba(0,0,0,0.85);margin-bottom:2px">${ad.title}</div>
                <div style="font-size:0.8rem;color:rgba(0,0,0,0.85);margin-bottom:6px;line-height:1.4">${ad.description}</div>
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:0.75rem;color:rgba(0,0,0,0.5)">
                  <span><i class="fas fa-${ad.is_animated ? 'bolt' : 'pause'}"></i> ${ad.is_animated ? 'Auto-advance (10s)' : 'Manual (15s)'}</span>
                  <span><i class="fas fa-palette"></i> <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${ad.bg_color || '#0066cc'};vertical-align:middle;margin-right:2px"></span> ${ad.bg_color || '#0066cc'}</span>
                  ${ad.cta_url ? `<span><i class="fas fa-link"></i> ${ad.cta_url.substring(0, 30)}${ad.cta_url.length > 30 ? '...' : ''}</span>` : ''}
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <button class="admin-toggle ${ad.is_active ? 'active' : ''}" onclick="AdminPopupAds.toggleActive(${ad.id}, ${!ad.is_active})">
                  <div class="admin-toggle-knob"></div>
                </button>
                <button class="admin-action-btn" onclick="AdminPopupAds.showForm(${ad.id})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="admin-action-btn delete" onclick="AdminPopupAds.confirmDelete(${ad.id}, '${ad.name.replace(/'/g, "\\'")}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        `}
      `;
    } catch (error) {
      console.error('Popup Ads error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load popup ads', error.message);
    }
  },

  async showForm(adId) {
    let ad = null;
    if (adId) ad = await DB.getPopupAdById(adId);
    const isEdit = !!ad;

    Components.showModal(isEdit ? 'Edit Popup Ad' : 'New Popup Ad', `
      <form id="popupAdForm" onsubmit="AdminPopupAds.save(event, ${adId || 'null'})" style="display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto">
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Ad Name (internal)</label>
            <input type="text" id="paf_name" value="${isEdit ? ad.name : ''}" placeholder="e.g. PixabAnimation Promo" required>
          </div>
          <div class="form-group">
            <label>Sort Order</label>
            <input type="number" id="paf_sort" value="${isEdit ? ad.sort_order : '0'}" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" id="paf_title" value="${isEdit ? ad.title : ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="paf_desc" rows="3" style="resize:vertical" required>${isEdit ? (ad.description || '') : ''}</textarea>
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>CTA Text</label>
            <input type="text" id="paf_cta" value="${isEdit ? (ad.cta_text || 'Learn More') : 'Learn More'}">
          </div>
          <div class="form-group">
            <label>CTA URL</label>
            <input type="url" id="paf_url" value="${isEdit ? (ad.cta_url || '') : ''}" placeholder="https://...">
          </div>
        </div>
        <div class="form-group">
          <label>Font Awesome Icon</label>
          <input type="text" id="paf_icon" value="${isEdit ? (ad.icon || 'fa-bullhorn') : 'fa-bullhorn'}" placeholder="fa-bullhorn">
        </div>
        <div class="form-group">
          <label>Image URL (optional — replaces icon)</label>
          <input type="url" id="paf_image" value="${isEdit && ad.image_url ? ad.image_url : ''}" placeholder="https://...image.jpg">
        </div>
        <div class="admin-form-grid-2">
          <div class="form-group">
            <label>Background Color</label>
            <div class="admin-form-color-row">
              <input type="color" id="paf_bg_picker" value="${isEdit ? (ad.bg_color || '#0066cc') : '#0066cc'}" onchange="document.getElementById('paf_bg').value=this.value">
              <input type="text" id="paf_bg" value="${isEdit ? (ad.bg_color || '#0066cc') : '#0066cc'}" onchange="document.getElementById('paf_bg_picker').value=this.value">
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;padding:8px 0">
            <label class="admin-form-checkbox">
              <input type="checkbox" id="paf_animated" ${isEdit && ad.is_animated ? 'checked' : ''}>
              <span>Animated (countdown timer)</span>
            </label>
            <label class="admin-form-checkbox">
              <input type="checkbox" id="paf_active" ${!isEdit || ad.is_active ? 'checked' : ''}>
              <span>Active</span>
            </label>
          </div>
        </div>
        <div class="admin-form-actions">
          <button type="submit" class="btn btn-primary btn-block">
            <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${isEdit ? 'Update Popup Ad' : 'Create Popup Ad'}
          </button>
        </div>
      </form>
    `, '800px');
  },

  async save(event, adId) {
    event.preventDefault();
    const name = document.getElementById('paf_name').value.trim();
    const title = document.getElementById('paf_title').value.trim();
    const description = document.getElementById('paf_desc').value.trim();
    const cta_text = document.getElementById('paf_cta').value.trim() || 'Learn More';
    const cta_url = document.getElementById('paf_url').value.trim() || 'https://pixabanimation.github.io/#/shop';
    const icon = document.getElementById('paf_icon').value.trim() || 'fa-bullhorn';
    const image_url = document.getElementById('paf_image').value.trim() || null;
    const bg_color = document.getElementById('paf_bg').value.trim() || '#0066cc';
    const is_animated = document.getElementById('paf_animated').checked ? 1 : 0;
    const is_active = document.getElementById('paf_active').checked ? 1 : 0;
    const sort_order = parseInt(document.getElementById('paf_sort').value) || 0;

    if (!name || !title || !description) {
      Components.toast('Name, title, and description are required', 'error');
      return;
    }

    const data = { name, title, description, cta_text, cta_url, icon, image_url, bg_color, is_animated, is_active, sort_order };
    try {
      if (adId) {
        await DB.updatePopupAd(adId, data);
        Components.toast('Popup ad updated!', 'success');
      } else {
        await DB.createPopupAd(data);
        Components.toast('Popup ad created!', 'success');
      }
      document.querySelector('.modal-overlay')?.remove();
      this.render();
    } catch (error) {
      Components.toast('Failed to save: ' + error.message, 'error');
    }
  },

  async toggleActive(id, isActive) {
    try {
      await DB.togglePopupAd(id, isActive);
      Components.toast(isActive ? 'Activated' : 'Deactivated', 'success');
      this.render();
    } catch (error) {
      Components.toast('Failed to update', 'error');
    }
  },

  confirmDelete(id, name) {
    Components.showModal('Delete Popup Ad', `
      <p style="color:var(--text-secondary);margin-bottom:20px">Delete <strong>${name}</strong>? This cannot be undone.</p>
      <div style="display:flex;gap:12px">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="background:var(--error)" onclick="AdminPopupAds.doDelete(${id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `);
  },

  async doDelete(id) {
    try {
      await DB.deletePopupAd(id);
      Components.toast('Popup ad deleted', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.render();
    } catch (error) {
      Components.toast('Failed to delete', 'error');
    }
  }
};
