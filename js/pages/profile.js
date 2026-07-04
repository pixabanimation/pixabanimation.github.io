// ============================================
// pixabanimation — Profile Page
// Profile pic, account details, password, messages
// ============================================

const ProfilePage = {
  async render() {
    const content = document.getElementById('pageContent');
    const user = App.getUser();

    if (!user) {
      content.innerHTML = Components.emptyState(
        '🔒',
        'Sign In Required',
        'Please sign in to view your profile.',
        'Sign In',
        '#/login'
      );
      return;
    }

    // Fetch fresh user data from DB
    let fullUser;
    try {
      fullUser = await DB.getUserById(user.id);
    } catch (e) {
      fullUser = user;
    }

    const avatarUrl = fullUser?.avatar_url || '';

    content.innerHTML = `
      <div class="profile-page page-enter">
        <div class="profile-header">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="${user.name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border-light)">`
            : `<div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>`
          }
          <div class="profile-info">
            <h1>${user.name}</h1>
            <p>${user.email}</p>
          </div>
        </div>

        <div class="profile-tabs">
          <button class="profile-tab active" onclick="ProfilePage.switchTab('orders', this)">My Orders</button>
          <button class="profile-tab" onclick="ProfilePage.switchTab('downloads', this)">
            <i class="fas fa-download"></i> My Downloads
          </button>
          <button class="profile-tab" onclick="ProfilePage.switchTab('details', this)">Account Details</button>
          <button class="profile-tab" onclick="ProfilePage.switchTab('messages', this)">
            <i class="fas fa-envelope"></i> Messages
          </button>
          <button class="profile-tab" onclick="ProfilePage.logout()" style="margin-left:auto;color:var(--error)">Sign Out</button>
        </div>

        <div class="profile-content" id="profileContent">
          <div style="text-align:center;padding:40px">
            <div class="loader-spinner"></div>
          </div>
        </div>
      </div>
    `;

    await this.loadOrders();
  },

  async loadOrders() {
    const container = document.getElementById('profileContent');

    try {
      const orders = await DB.getOrders();

      if (orders.length === 0) {
        container.innerHTML = Components.emptyState(
          '📦', 'No orders yet', 'Start shopping to see your orders here.',
          'Start Shopping', '#/shop'
        );
        return;
      }

      let html = '';
      for (const order of orders) {
        const items = await DB.getOrderItems(order.id);
        const statusColors = {
          'pending': 'var(--warning)',
          'confirmed': 'var(--info)',
          'shipped': 'var(--accent-1)',
          'delivered': 'var(--success)',
          'cancelled': 'var(--error)'
        };

        html += `
          <div style="padding:20px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
              <div>
                <strong style="font-size:1.1rem">Order #${order.id}</strong>
                <div style="font-size:0.85rem;color:var(--text-muted)">
                  ${new Date(order.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </div>
              </div>
              <div style="display:flex;gap:12px;align-items:center">
                <span style="color:${statusColors[order.status] || 'var(--text-muted)'};font-weight:600">
                  <i class="fas fa-circle" style="font-size:0.5rem;vertical-align:middle;margin-right:4px"></i>
                  ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span style="font-weight:700;color:var(--accent-1);font-size:1.1rem">
                  $${parseFloat(order.total).toFixed(2)}
                </span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${items.map(item => `
                <div style="display:flex;align-items:center;gap:12px;padding:8px;background:var(--bg-input);border-radius:var(--radius-sm)">
                  <img src="${item.product_image}" alt="${item.product_name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover">
                  <div style="flex:1;font-size:0.9rem">${item.product_name} × ${item.quantity}</div>
                  <div style="font-weight:600">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    } catch (error) {
      console.error('Orders error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load orders', error.message);
    }
  },

  async loadDownloads() {
    const container = document.getElementById('profileContent');

    try {
      const orders = await DB.getDownloadableOrders();

      if (orders.length === 0) {
        container.innerHTML = Components.emptyState(
          '📥', 'No downloads yet', 'When an admin sends you a download link for an approved order, it will appear here.',
          'Start Shopping', '#/shop'
        );
        return;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px" class="page-enter">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h3 style="font-size:1.1rem;font-weight:600">
              <i class="fas fa-download" style="color:var(--accent-1)"></i> Your Downloads
            </h3>
            <span style="font-size:0.85rem;color:var(--text-muted)">${orders.length} file${orders.length > 1 ? 's' : ''}</span>
          </div>
          ${orders.map(order => `
            <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);overflow:hidden">
              <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
                <div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-weight:700">Order #${order.id}</span>
                    <span style="font-size:0.75rem;padding:2px 10px;border-radius:var(--radius-full);background:rgba(0,230,118,0.15);color:var(--success);font-weight:600">
                      <i class="fas fa-check-circle"></i> Delivered
                    </span>
                  </div>
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
                    ${new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                <div style="font-weight:700;color:var(--accent-1);font-size:1.1rem">
                  $${parseFloat(order.total).toFixed(2)}
                </div>
              </div>
              <div style="padding:0 20px 16px 20px;display:flex;flex-direction:column;gap:8px">
                ${(order.items || []).map(item => `
                  <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-input);border-radius:var(--radius-sm)">
                    <img src="${item.product_image}" alt="${item.product_name}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:0.9rem">${item.product_name}</div>
                      <div style="font-size:0.8rem;color:var(--text-muted)">Qty: ${item.quantity}</div>
                    </div>
                    <a href="${order.download_link}" target="_blank" class="btn btn-primary btn-sm" style="display:flex;align-items:center;gap:6px;white-space:nowrap" download>
                      <i class="fas fa-download"></i> Download
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Downloads error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load downloads', error.message);
    }
  },

  switchTab(tab, btn) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const container = document.getElementById('profileContent');
    container.innerHTML = `<div style="text-align:center;padding:40px"><div class="loader-spinner"></div></div>`;

    if (tab === 'downloads') {
      this.loadDownloads();
    } else if (tab === 'details') {
      this.renderDetails();
    } else if (tab === 'messages') {
      this.renderMessages();
    } else {
      this.loadOrders();
    }
  },

  async renderDetails() {
    const container = document.getElementById('profileContent');
    const user = App.getUser();

    let fullUser;
    try {
      fullUser = await DB.getUserById(user.id);
    } catch (e) {
      fullUser = user;
    }

    const avatarUrl = fullUser?.avatar_url || '';
    const phone = fullUser?.phone || '';
    const additionalEmail = fullUser?.additional_email || '';

    container.innerHTML = `
      <div style="padding:32px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md)" class="page-enter">
        <h3 style="margin-bottom:24px">Account Details</h3>
        
        <!-- Profile Picture -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding:16px;background:var(--bg-input);border-radius:var(--radius-sm);flex-wrap:wrap">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="Profile" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--border-light)">`
            : `<div style="width:60px;height:60px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:white">${user.name.charAt(0).toUpperCase()}</div>`
          }
          <div style="flex:1;min-width:200px">
            <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px">Profile Picture</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input type="url" id="profileAvatarUrl" value="${avatarUrl}" placeholder="https://...avatar.jpg" style="flex:1;min-width:160px">
              <button type="button" class="btn btn-secondary btn-sm" onclick="Components.openMediaPickerFor('profileAvatarUrl', ProfilePage.saveAvatar)">
                <i class="fas fa-image"></i> Browse
              </button>
              <button class="btn btn-primary btn-sm" onclick="ProfilePage.saveAvatar()">
                <i class="fas fa-save"></i> Save
              </button>
            </div>
            <span style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;display:block">
              Click <strong>Browse</strong> to pick from uploaded images, or paste a URL.
            </span>
          </div>
        </div>

        <div style="display:grid;gap:16px;max-width:560px">
          <div class="admin-form-grid-2">
            <div class="form-group">
              <label>Name</label>
              <input type="text" id="profileName" value="${user.name}">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="profileEmail" value="${user.email}">
            </div>
          </div>
          <div class="admin-form-grid-2">
            <div class="form-group">
              <label>Additional Email</label>
              <input type="email" id="profileAdditionalEmail" value="${additionalEmail}" placeholder="Optional secondary email">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="profilePhone" value="${phone}" placeholder="+1 (555) 000-0000">
            </div>
          </div>
          <button class="btn btn-primary" style="align-self:flex-start" onclick="ProfilePage.saveDetails()">
            <i class="fas fa-save"></i> Save Changes
          </button>

          <hr style="border:none;border-top:1px solid var(--border-light);margin:8px 0">

          <h4 style="font-weight:600;font-size:1rem">Change Password</h4>
          <div class="admin-form-grid-2">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" id="profileCurrentPassword" placeholder="Enter current password">
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" id="profileNewPassword" placeholder="Min. 8 characters" minlength="8">
            </div>
          </div>
          <div class="form-group" style="max-width:270px">
            <label>Confirm New Password</label>
            <input type="password" id="profileConfirmPassword" placeholder="Confirm new password">
          </div>
          <button class="btn btn-primary" style="align-self:flex-start" onclick="ProfilePage.changePassword()">
            <i class="fas fa-key"></i> Update Password
          </button>
        </div>
      </div>
    `;
  },

  async saveAvatar() {
    const url = document.getElementById('profileAvatarUrl').value.trim();
    const user = App.getUser();
    if (!user) return;

    try {
      await DB.updateUserProfile(user.id, { avatar_url: url || null });
      const updated = await DB.getUserById(user.id);
      localStorage.setItem('shop_user', JSON.stringify({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        is_admin: !!updated.is_admin,
        avatar_url: updated.avatar_url
      }));
      Components.toast('Profile picture updated!', 'success');
      // Refresh the details view
      this.renderDetails();
    } catch (error) {
      Components.toast('Failed to update: ' + error.message, 'error');
    }
  },

  async saveDetails() {
    const user = App.getUser();
    if (!user) return;

    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const additionalEmail = document.getElementById('profileAdditionalEmail').value.trim();

    if (!name || !email) {
      Components.toast('Name and email are required', 'error');
      return;
    }

    try {
      await DB.updateUserProfile(user.id, {
        name,
        email,
        phone: phone || null,
        additional_email: additionalEmail || null
      });
      const updated = await DB.getUserById(user.id);
      localStorage.setItem('shop_user', JSON.stringify({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        is_admin: !!updated.is_admin,
        avatar_url: updated.avatar_url
      }));
      Components.toast('Profile updated!', 'success');
      App.updateAuthUI();
      this.renderDetails();
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        Components.toast('This email is already in use', 'error');
      } else {
        Components.toast('Failed to update: ' + error.message, 'error');
      }
    }
  },

  async changePassword() {
    const user = App.getUser();
    if (!user) return;

    const currentPw = document.getElementById('profileCurrentPassword').value;
    const newPw = document.getElementById('profileNewPassword').value;
    const confirmPw = document.getElementById('profileConfirmPassword').value;

    if (newPw !== confirmPw) {
      Components.toast('New passwords do not match', 'error');
      return;
    }
    if (newPw.length < 8) {
      Components.toast('Password must be at least 8 characters', 'error');
      return;
    }

    const userData = await DB.getUserByEmail(user.email);
    if (userData) {
      const hashedCurrent = await DB.hashPassword(currentPw);
      if (userData.password !== hashedCurrent) {
        Components.toast('Current password is incorrect', 'error');
        return;
      }
    }

    try {
      await DB.updateUserPassword(user.id, newPw);
      Components.toast('Password changed successfully!', 'success');
      document.getElementById('profileCurrentPassword').value = '';
      document.getElementById('profileNewPassword').value = '';
      document.getElementById('profileConfirmPassword').value = '';
    } catch (error) {
      Components.toast('Failed to change password: ' + error.message, 'error');
    }
  },

  async renderMessages() {
    const container = document.getElementById('profileContent');
    const user = App.getUser();

    try {
      const messages = await DB.getUserMessages(user.id);

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px" class="page-enter">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <h3 style="font-size:1.1rem;font-weight:600">
              <i class="fas fa-envelope" style="color:var(--accent-1)"></i> My Messages
            </h3>
            <button class="btn btn-primary btn-sm" onclick="ProfilePage.showSendMessage()">
              <i class="fas fa-paper-plane"></i> Send to Admin
            </button>
          </div>

          ${messages.length === 0 ? `
            <div style="text-align:center;padding:40px;color:var(--text-muted)">
              <i class="fas fa-envelope-open-text" style="font-size:3rem;margin-bottom:12px;display:block;opacity:0.3"></i>
              <p>No messages yet. Send a message to the admin team.</p>
            </div>
          ` : messages.map(m => `
            <div style="padding:16px 20px;background:var(--bg-card);border:1px solid ${m.admin_reply ? 'rgba(0,230,118,0.2)' : 'var(--border-light)'};border-radius:var(--radius-md)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:8px">
                <div>
                  <span style="font-weight:600;font-size:0.9rem">${m.subject || 'No subject'}</span>
                  ${m.admin_reply ? '<span style="margin-left:8px;padding:2px 8px;border-radius:var(--radius-full);font-size:0.65rem;font-weight:600;background:rgba(0,230,118,0.15);color:var(--success)">Replied</span>' : ''}
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted)">${new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;line-height:1.6;white-space:pre-wrap">${m.message}</div>
              ${m.admin_reply ? `
                <div style="padding:10px 14px;margin-top:8px;background:rgba(0,230,118,0.06);border-left:3px solid var(--success);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                  <div style="font-size:0.75rem;font-weight:600;color:var(--success);margin-bottom:4px">
                    <i class="fas fa-reply"></i> Admin Reply
                  </div>
                  <div style="font-size:0.85rem;line-height:1.6;white-space:pre-wrap">${m.admin_reply}</div>
                  ${m.replied_at ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">${new Date(m.replied_at).toLocaleString()}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Messages error:', error);
      container.innerHTML = Components.emptyState('😔', 'Failed to load messages', error.message);
    }
  },

  showSendMessage() {
    const user = App.getUser();

    Components.showModal('Send Message to Admin', `
      <form id="userMessageForm" onsubmit="ProfilePage.sendMessage(event)" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label>Subject</label>
          <input type="text" id="msg_subject" placeholder="How can we help you?" required>
        </div>
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="msg_name" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="msg_email" value="${user.email}" required>
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea id="msg_message" rows="5" placeholder="Write your message..." required style="resize:vertical"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">
          <i class="fas fa-paper-plane"></i> Send Message
        </button>
      </form>
    `);
  },

  async sendMessage(event) {
    event.preventDefault();
    const subject = document.getElementById('msg_subject').value.trim();
    const name = document.getElementById('msg_name').value.trim();
    const email = document.getElementById('msg_email').value.trim();
    const message = document.getElementById('msg_message').value.trim();

    try {
      await DB.submitContact(name, email, subject, message);
      Components.toast('Message sent! Admin will reply soon.', 'success');
      document.querySelector('.modal-overlay')?.remove();
      this.renderMessages();
    } catch (error) {
      Components.toast('Failed to send message: ' + error.message, 'error');
    }
  },

  logout() {
    AuthPage.logout();
  }
};
