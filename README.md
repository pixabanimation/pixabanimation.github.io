# PixabAnimation — Premium Motion Graphics Assets Marketplace

A single-page application marketplace for premium motion graphics, 4K video clips, animation assets, and professional editing templates. Built with vanilla JavaScript — no frameworks, no build steps.

🔗 **Live site:** [pixabanimation.github.io](https://pixabanimation.github.io)

---


## ✨ Features

- **🎬 Full-featured SPA marketplace** — Home, Shop, Product Detail, Cart, Checkout, Auth, Profile, Wishlist
- **🛒 Complete e-commerce workflow** — Product browsing, cart management, wishlist, coupon codes, order processing
- **🎥 Custom video player** — Watermarked preview player with play/pause, progress, volume, fullscreen, keyboard shortcuts
- **📱 Responsive design** — Apple-inspired UI with 3D category carousel, draggable sliders, and scroll-snap
- **🔐 User authentication** — Login/register with SHA-256 password hashing, admin accounts
- **📊 Admin dashboard** — Full CRUD for products, categories, users, orders, media uploads, messages, reviews
- **🔍 Search with autocomplete** — Debounced search with category + product suggestions
- **💰 Manual payment processing** — Payoneer & Skrill integration with transaction verification workflow
- **📨 Newsletter subscription** — Email capture with database storage
- **🌍 International flags** — Country list with 140+ countries, state/province data for major countries
- **🔒 AES-256-GCM encrypted credentials** — Turso database credentials encrypted with a split-secret scheme (ciphertext and key in separate files)
- **📈 SEO optimized** — JSON-LD structured data (Organization, WebSite, Product, FAQPage, CollectionPage, BreadcrumbList), Open Graph, Twitter Cards, sitemap, robots.txt


## 🏗 Tech Stack

| Technology | Purpose |
|---|---|
| **Vanilla JavaScript** | Application logic, SPA routing, templating |
| **HTML5 + CSS3** | App shell, Apple-inspired design system |
| **Turso (libSQL)** | Serverless edge database |
| **Cloudinary** | Media storage and optimization |
| **Payoneer / Skrill** | Payment processing |
| **GitHub Pages** | Hosting |
| **flagcdn.com** | Country flag images |

## 📁 Project Structure

```
├── index.html             # App entry point with all script imports
├── 404.html               # GitHub Pages 404 fallback
├── css/style.css          # Single stylesheet
├── js/
│   ├── app.js             # Main application controller
│   ├── router.js          # SPA hash-based router
│   ├── components.js      # Reusable UI components
│   ├── db.js              # Database abstraction layer
│   ├── credentials.js       # AES-GCM encrypted Turso credentials (ciphertext)
│   ├── credentials-key.js   # AES-256 key (split from the ciphertext)
│   ├── country-data.js    # 140+ countries with flags & states
│   ├── video-player.js    # Custom watermarked video player
│   └── pages/             # Page-specific modules (17 pages)
├── database/
│   ├── schema.sql         # Full database schema
│   ├── seed.sql           # Initial seed data
│   └── init.mjs           # Database initialization script
├── assets/                # Static assets (images, videos, logos)
├── tools/                 # Utility scripts
├── docs/                  # Full documentation
└── DESIGN.md              # Design system tokens
```

## 🔐 Security

- **Never commit secrets.** All credentials live in the gitignored `.env` file at the repo root (copy `.env.example` → `.env`). `tools/lib/env.mjs` loads `TURSO_URL` / `TURSO_AUTH_TOKEN` / OpenRouter vars from there or from the process environment (CI).
- **Browser credentials are encrypted.** `js/credentials.js` holds only AES-256-GCM ciphertext; the key is generated fresh into `js/credentials-key.js` on every run of `node tools/encrypt-credentials.mjs` (which reads the plaintext from `.env`).
- **Rotate on any leak.** Because this is a static site, both encrypted files ship to the browser, so encryption here is *obfuscation-grade*, not a substitute for a rotated token. If a token was ever committed to git history, revoke it in the Turso console and update `.env`, then re-run the encrypt script.
- **CI secrets.** GitHub Actions uses repository secrets (`OPENROUTER_API_KEY`, `GITHUB_TOKEN`) — never literal keys in workflows.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
