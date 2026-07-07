# Architecture

## Overview

PixabAnimation is a **client-side single-page application (SPA)** built entirely with vanilla JavaScript. There is no framework, no build step, and no server-side rendering. All routing, templating, and state management happen in the browser.

## File Structure

```
├── index.html                 # App shell — nav, footer, script imports
├── 404.html                   # GitHub Pages 404 fallback
├── assets/                    # Static assets
│   ├── images/                # Thumbnails, posters
│   ├── videos/                # Demo/promo videos
│   ├── logo.ai / logo300.ai   # Source design files
├── css/
│   └── style.css              # Single stylesheet (~4000 lines)
├── js/
│   ├── app.js                 # Main controller — init, nav, cart, search
│   ├── router.js              # Hash-based SPA router
│   ├── components.js          # Reusable UI components
│   ├── db.js                  # Database abstraction layer
│   ├── country-data.js        # Country list with flags & states
│   ├── credentials.js         # XOR-obfuscated DB credentials
│   ├── video-player.js        # Custom video player with watermark
│   └── pages/                 # Page-specific modules
│       ├── home.js
│       ├── shop.js
│       ├── product.js
│       ├── cart.js
│       ├── checkout.js
│       ├── auth.js
│       ├── profile.js
│       ├── wishlist.js
│       ├── contact.js
│       ├── about.js
│       ├── admin.js
│       ├── admin-media.js
│       ├── admin-settings.js
│       ├── forgot-password.js
│       ├── privacy-policy.js
│       ├── refund-policy.js
│       └── terms-of-use.js
├── database/
│   ├── schema.sql             # Full database schema
│   ├── seed.sql               # Initial seed data
│   └── init.mjs               # DB initialization script
├── tools/
│   ├── encrypt-credentials.mjs # Credential obfuscation tool
│   ├── fix-init.mjs / fix-init2.mjs
├── docs/                      # Documentation (this directory)
├── DESIGN.md                  # Design system documentation
├── robots.txt                 # Search engine crawl rules
├── sitemap.xml                # XML sitemap
└── package.json
```

## Initialization Flow

```
DOMContentLoaded
    └── App.init()
        ├── DB.init()               # Initialize Turso client
        ├── Router.register()       # Register all routes
        ├── setupNavigation()       # Nav toggle, search, scroll effects
        ├── setupTheme()            # Dark mode enforcement
        ├── updateAuthUI()          # Login/logout button states
        ├── updateCartBadge()       # Cart count in nav
        ├── updateWishlistBadge()   # Wishlist count in nav
        ├── VideoPlayer.init()      # Initialize custom video players
        ├── startNavClock()         # Live clock in navigation
        └── Router.start()          # Start hashchange listener
```

## Key Design Patterns

### Global Objects (Namespace Pattern)
All major modules are defined as global objects attached to `window`:
- `App` — Application controller
- `Router` — SPA router
- `DB` — Database layer
- `Components` — Reusable UI
- `VideoPlayer` — Custom video player
- `HomePage`, `ShopPage`, `ProductPage`, etc. — Page modules

### Page Rendering Pattern
Each page module follows a consistent pattern:
1. `render(params)` — Sets innerHTML of `#pageContent`, fetches data, builds DOM
2. Optional `cleanup()` — Removes event listeners, restores state
3. Async data loading with try/catch error handling
4. Loading skeletons shown during data fetch

### Routing Pattern
- Routes are registered in `App.init()` via `Router.register(path, handler)`
- Before-route hooks registered via `Router.beforeEach(hook)` handle cleanup
- Querystring params parsed and passed to page handlers
- Navigation progress bar animates during route transitions

## Design System

The design system is fully documented in [DESIGN.md](../DESIGN.md) at the project root. Key tokens:
- **Primary color:** `#0066cc` (Action Blue)
- **Font:** Inter, system-ui sans-serif
- **Rounded:** Pill (9999px), SM (8px), MD (11px), LG (18px)
- **Dark theme only** (`data-theme="dark"` enforced)
