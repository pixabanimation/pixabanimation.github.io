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
import './db.js';
import './router.js';
import './components.js';

import './pages/home.js';
import './pages/shop.js';
import './pages/product.js';
import './pages/cart.js';
import './pages/checkout.js';
import './pages/auth.js';
import './pages/profile.js';
import './pages/wishlist.js';
import './pages/contact.js';
import './pages/about.js';
import './pages/privacy-policy.js';
import './pages/refund-policy.js';
import './pages/terms-of-use.js';

import './pages/admin.js';
import './pages/admin-media.js';
import './pages/admin-settings.js';
import './pages/forgot-password.js';

import './blog-data.js';
import './pages/blog.js';
import './pages/blog-post.js';
import './video-player.js';
import './blog-ads.js';
import './popup-ads.js';
import './pages/admin-popup-ads.js';
import './pages/admin-invoice.js';
import './pages/admin-quotation.js';

import './app.js';

// Initialize the Turso client (credentials are decrypted at runtime). Module
// scripts finish evaluating before DOMContentLoaded, so DB.init() in
// App.init() is guaranteed to see a ready client.
const _creds = await __getCredentials();
window.__tursoClient = createClient({
  url: _creds.url,
  authToken: _creds.authToken
});
console.log("Turso client initialized");
