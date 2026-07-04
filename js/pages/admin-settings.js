// ============================================
// pixabanimation — Admin Settings
// Full account management: name, email, profile pic, password
// ============================================

const AdminSettings = {
  async render() {
    const container = document.getElementById('adminContent');
    const user = App.getUser();

    if (!user) {
      container.innerHTML = Components.emptyState('🔒', 'Not logged in', 'Please sign in to access settings.');
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
    const additionalEmail = fullUser?.additional_email || '';
    const phone = fullUser?.phone || '';

    container.innerHTML = `
      <div class="admin-settings page-enter">
        <!-- Profile Picture & Basic Info -->
        <div class="settings-card glass">
          <div class="settings-card-header">
            <i class="fas fa-user-circle"></i>
            <h3>Profile Picture</h3>
          </div>
          <div class="settings-card-body">
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
              <div style="position:relative">
                ${avatarUrl 
                  ? `<img src="${avatarUrl}" alt="Profile" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border-light)">`
                  : `<div style="width:80px;height:80px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:white">${user.name.charAt(0).toUpperCase()}</div>`
                }
              </div>
              <div style="flex:1;min-width:200px">
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <input type="url" id="settings_avatar_url" value="${avatarUrl}" placeholder="https://...avatar.jpg" style="flex:1;min-width:180px">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Components.openMediaPickerFor('settings_avatar_url', AdminSettings.saveAvatar)">
                    <i class="fas fa-image"></i> Browse Media
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="AdminSettings.saveAvatar()">
                    <i class="fas fa-save"></i> Save
                  </button>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;display:block">
                  Click <strong>Browse Media</strong> to pick from uploaded images, or paste a URL directly.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="settings-card glass">
          <div class="settings-card-header">
            <i class="fas fa-user-shield"></i>
            <h3>Account Information</h3>
          </div>
          <div class="settings-card-body">
            <form onsubmit="AdminSettings.saveAccount(event)" style="display:flex;flex-direction:column;gap:14px;max-width:560px">
              <div class="admin-form-grid-2">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="settings_name" value="${user.name || ''}" required>
                </div>
                <div class="form-group">
                  <label>Login Email</label>
                  <input type="email" id="settings_email" value="${user.email || ''}" required>
                </div>
              </div>
              <div class="admin-form-grid-2">
                <div class="form-group">
                  <label>Additional Email</label>
                  <input type="email" id="settings_additional_email" value="${additionalEmail}" placeholder="Optional secondary email">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" id="settings_phone" value="${phone}" placeholder="+1 (555) 000-0000">
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="align-self:flex-start">
                <i class="fas fa-save"></i> Save Changes
              </button>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="settings-card glass">
          <div class="settings-card-header">
            <i class="fas fa-key"></i>
            <h3>Change Password</h3>
          </div>
          <div class="settings-card-body">
            <form onsubmit="AdminSettings.changePassword(event)" style="display:flex;flex-direction:column;gap:14px;max-width:460px">
              <div class="form-group">
                <label>Current Password</label>
                <div class="input-with-icon">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="settings_current_password" placeholder="Enter current password" required>
                </div>
              </div>
              <div class="form-group">
                <label>New Password</label>
                <div class="input-with-icon">
                  <i class="fas fa-key"></i>
                  <input type="password" id="settings_new_password" placeholder="Min. 8 characters" minlength="8" required>
                </div>
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <div class="input-with-icon">
                  <i class="fas fa-check-circle"></i>
                  <input type="password" id="settings_confirm_password" placeholder="Confirm new password" required>
                </div>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Update Password
              </button>
            </form>
          </div>
        </div>

        <!-- Security Question -->
        <div class="settings-card glass">
          <div class="settings-card-header">
            <i class="fas fa-shield-alt"></i>
            <h3>Security Question</h3>
          </div>
          <div class="settings-card-body">
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px">
              Set a security question and answer to recover your password if you forget it.
            </p>
            <form onsubmit="AdminSettings.saveSecurityQuestion(event)" style="display:flex;flex-direction:column;gap:14px;max-width:460px">
              <div class="form-group">
                <label>Security Question</label>
                <select id="settings_security_question" style="padding:12px 16px">
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                  <option value="What city were you born in?">What city were you born in?</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What was the name of your first school?">What was the name of your first school?</option>
                  <option value="What is your favorite book?">What is your favorite book?</option>
                  <option value="What was the make of your first car?">What was the make of your first car?</option>
                  <option value="What is the name of your childhood best friend?">What is the name of your childhood best friend?</option>
                </select>
              </div>
              <div class="form-group">
                <label>Your Answer</label>
                <input type="text" id="settings_security_answer" placeholder="Enter your answer" required>
              </div>
              <div class="form-group">
                <label>Recovery Email (optional)</label>
                <input type="email" id="settings_recovery_email" placeholder="email@example.com">
                <span style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">
                  A recovery code can be sent here if you forget your password
                </span>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Security Question
              </button>
            </form>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-card glass" style="border-color:rgba(255,82,82,0.2)">
          <div class="settings-card-header" style="color:var(--error)">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Danger Zone</h3>
          </div>
          <div class="settings-card-body">
            <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px">
              Sign out from the admin panel. You will need to sign in again.
            </p>
            <button class="btn btn-secondary" style="border-color:var(--error);color:var(--error)" onclick="AdminSettings.logout()">
              <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    // Check if user has existing security question
    await this.checkExistingSecurity(user);
  },

  async checkExistingSecurity(user) {
    try {
      const users = await DB.query('SELECT id FROM admin_security WHERE user_id = ?', [user.id]);
      if (users.length > 0) {
        const info = document.querySelector('.settings-card:nth-child(4) .settings-card-body p');
        if (info) {
          info.innerHTML = '✅ Security question is configured. You can update it below.';
          info.style.color = 'var(--success)';
        }
      }
    } catch (e) {
      // Table might not exist yet
    }
  },

  async saveAvatar() {
    const avatarUrl = document.getElementById('settings_avatar_url').value.trim();
    const user = App.getUser();
    if (!user) return;

    try {
      await DB.updateUserProfile(user.id, { avatar_url: avatarUrl || null });
      // Update local session
      const stored = App.getUser();
      stored.avatar_url = avatarUrl || null;
      localStorage.setItem('shop_user', JSON.stringify(stored));
      Components.toast('Profile picture updated!', 'success');
    } catch (error) {
      Components.toast('Failed to update profile picture: ' + error.message, 'error');
    }
  },

  async saveAccount(event) {
    event.preventDefault();
    const user = App.getUser();
    if (!user) return;

    const name = document.getElementById('settings_name').value.trim();
    const email = document.getElementById('settings_email').value.trim();
    const additionalEmail = document.getElementById('settings_additional_email').value.trim();
    const phone = document.getElementById('settings_phone').value.trim();

    if (!name) {
      Components.toast('Name is required', 'error');
      return;
    }
    if (!email) {
      Components.toast('Email is required', 'error');
      return;
    }

    try {
      await DB.updateUserProfile(user.id, {
        name,
        email,
        additional_email: additionalEmail || null,
        phone: phone || null
      });
      // Update local session
      const stored = App.getUser();
      stored.name = name;
      stored.email = email;
      localStorage.setItem('shop_user', JSON.stringify(stored));
      Components.toast('Account information updated!', 'success');
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        Components.toast('This email is already in use by another account', 'error');
      } else {
        Components.toast('Failed to update account: ' + error.message, 'error');
      }
    }
  },

  async changePassword(event) {
    event.preventDefault();
    const currentPw = document.getElementById('settings_current_password').value;
    const newPw = document.getElementById('settings_new_password').value;
    const confirmPw = document.getElementById('settings_confirm_password').value;

    if (newPw !== confirmPw) {
      Components.toast('New passwords do not match', 'error');
      return;
    }

    if (newPw.length < 8) {
      Components.toast('New password must be at least 8 characters', 'error');
      return;
    }

    const user = App.getUser();
    if (!user) {
      Components.toast('You must be logged in', 'error');
      return;
    }

    // Verify current password
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
      event.target.reset();
    } catch (error) {
      console.error('Password change error:', error);
      Components.toast('Failed to change password: ' + error.message, 'error');
    }
  },

  async saveSecurityQuestion(event) {
    event.preventDefault();
    const question = document.getElementById('settings_security_question').value;
    const answer = document.getElementById('settings_security_answer').value.trim().toLowerCase();
    const recoveryEmail = document.getElementById('settings_recovery_email').value.trim();

    if (!answer) {
      Components.toast('Please enter your answer', 'error');
      return;
    }

    const user = App.getUser();
    if (!user) {
      Components.toast('You must be logged in', 'error');
      return;
    }

    try {
      const answerHash = this.hashAnswer(answer);
      await DB.setSecurityQuestion(user.id, question, answerHash, recoveryEmail || null);
      Components.toast('Security question saved successfully!', 'success');

      const info = document.querySelector('.settings-card:nth-child(4) .settings-card-body p');
      if (info) {
        info.innerHTML = '✅ Security question is configured. You can update it below.';
        info.style.color = 'var(--success)';
      }
    } catch (error) {
      console.error('Security question error:', error);
      Components.toast('Failed to save security question: ' + error.message, 'error');
    }
  },

  hashAnswer(answer) {
    let hash = 0;
    const str = answer.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  },

  logout() {
    AuthPage.logout();
  }
};
