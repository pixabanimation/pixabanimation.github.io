// ============================================
// pixabanimation — Single Entry Module
// ============================================
// Every script the app needs is loaded through ES module imports, so each
// HTML page only includes ONE <script type="module" src="js/main.js"> tag.
//
// Import order mirrors the previous classic <script> load order:
// dependencies first, app last.

import { createClient } from "https://esm.sh/@libsql/client@0.14.0/web";
import { __getCredentials } from './credentials.js';

import './country-data.js';
import { DB } from './db.js';
import { Router } from './router.js';
import { Components } from './components.js';

import { HomePage } from './pages/home.js';
import { ShopPage } from './pages/shop.js';
import { ProductPage } from './pages/product.js';
import { CartPage } from './pages/cart.js';
import { CheckoutPage } from './pages/checkout.js';
import { AuthPage } from './pages/auth.js';
import { ProfilePage } from './pages/profile.js';
import './pages/wishlist.js';
import { ContactPage } from './pages/contact.js';
import './pages/about.js';
import './pages/privacy-policy.js';
import './pages/refund-policy.js';
import './pages/terms-of-use.js';

import { AdminPage } from './pages/admin.js';
import { AdminMedia } from './pages/admin-media.js';
import { AdminSettings } from './pages/admin-settings.js';
import { ForgotPasswordPage } from './pages/forgot-password.js';

import './blog-data.js';
import { BlogPage } from './pages/blog.js';
import './pages/blog-post.js';
import './video-player.js';
import './blog-ads.js';
import { PopupAds } from './popup-ads.js';
import { AdminPopupAds } from './pages/admin-popup-ads.js';
import { AdminInvoice } from './pages/admin-invoice.js';
import { AdminQuotation } from './pages/admin-quotation.js';

import { App } from './app.js';

// Inline onclick/onchange handlers in rendered templates reference these
// objects as globals, so expose the modules on window (ES modules are scoped).
window.App = App;
window.Router = Router;
window.Components = Components;
window.PopupAds = PopupAds;
window.HomePage = HomePage;
window.ShopPage = ShopPage;
window.ProductPage = ProductPage;
window.CartPage = CartPage;
window.CheckoutPage = CheckoutPage;
window.ProfilePage = ProfilePage;
window.BlogPage = BlogPage;
window.ContactPage = ContactPage;
window.AuthPage = AuthPage;
window.ForgotPasswordPage = ForgotPasswordPage;
window.AdminPage = AdminPage;
window.AdminMedia = AdminMedia;
window.AdminSettings = AdminSettings;
window.AdminPopupAds = AdminPopupAds;
window.AdminInvoice = AdminInvoice;
window.AdminQuotation = AdminQuotation;
void DB;

// Initialize the Turso client (credentials are decrypted at runtime) and
// expose a readiness promise. DOMContentLoaded can fire before the async
// decryption completes, which used to leave DB.client undefined and break
// login. App.init() awaits this promise before touching the database, and
// DB.init() is called here so the client is available as early as possible.
window.__dbReady = (async () => {
  const _creds = await __getCredentials();
  window.__tursoClient = createClient({
    url: _creds.url,
    authToken: _creds.authToken
  });
  DB.init();
  console.log('Turso client initialized');
})();
