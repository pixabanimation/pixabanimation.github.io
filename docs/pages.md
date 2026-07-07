# Pages

## Route Map

| Route | Page Module | Description |
|---|---|---|
| `#/` | `HomePage` | Landing page with hero, featured products, testimonials, FAQ |
| `#/shop` | `ShopPage` | Full product catalog with filtering and search |
| `#/shop?category={slug}` | `ShopPage` | Category-filtered product listing |
| `#/shop?search={query}` | `ShopPage` | Search results |
| `#/product/{slug}` | `ProductPage` | Product detail with reviews, images, add-to-cart |
| `#/cart` | `CartPage` | Shopping cart with quantity controls and coupon |
| `#/checkout` | `CheckoutPage` | Payment form (Payoneer/Skrill) |
| `#/login` | `AuthPage` | Sign-in form |
| `#/register` | `AuthPage` | Registration form |
| `#/profile` | `ProfilePage` | User profile, orders, downloads, messages |
| `#/wishlist` | `WishlistPage` | Saved items |
| `#/contact` | `ContactPage` | Contact form with business info |
| `#/about` | `AboutPage` | Company story and values |
| `#/privacy-policy` | `PrivacyPolicyPage` | Privacy policy |
| `#/refund-policy` | `RefundPolicyPage` | Refund policy |
| `#/terms-of-use` | `TermsOfUsePage` | Terms of use |
| `#/admin` | `AdminPage` | Admin dashboard |
| `#/forgot-password` | `ForgotPasswordPage` | Password recovery |

## Home Page (`HomePage`)

Sections (top to bottom):
- **Hero** — Apple-inspired product tile with video player, floating badges (4K, instant download), stats (500+ assets, 10K+ creators)
- **Trust Bar** — Grid of 4 feature highlights (instant download, premium quality, 14-day guarantee, 24/7 support)
- **Featured Products** — Grid of top animation assets with "Load More" button
- **After Effects Plugins** — Category spotlight section (if products exist)
- **Category Slider** — Apple Cover Flow-style 3D carousel with scroll-snap, drag support, auto-scroll
- **Why PixabAnimation** — Value proposition cards
- **Worldwide Customer Countries** — Draggable flag slider (12 countries) with flagcdn.com images
- **Newsletter** — Email subscription CTA
- **Testimonials** — Draggable carousel with 10 customer reviews
- **FAQ** — 2-column grid accordion with 6 Q&As

## Shop Page (`ShopPage`)

Features:
- **Hero section** with category-specific title/description
- **Category chips** — Quick filter links
- **Sticky filter toolbar** — Category dropdown, sort select (newest, price, rating, name), clear filters button
- **Active filter tags** — Removable filter indicators
- **Product grid** — 8 items per page, lazy load more
- **Search** with debounced input
- **Structured data** — Dynamic CollectionPage JSON-LD

## Product Page (`ProductPage`)

Features:
- **Image gallery** — Main image with thumbnail switcher (or video player for video products)
- **Product info** — Category badge, name, rating, stock status, price with discount
- **Video metadata** — File size, duration, instant download badge
- **Preview section** — Video preview description
- **Purchase actions** — Add to cart + quantity (physical) / Purchase & Download (video), wishlist toggle
- **Product details** — Category, SKU, availability, delivery info
- **Reviews section** — Customer reviews + review submission form
- **Structured data** — Product JSON-LD + BreadcrumbList

## Cart Page (`CartPage`)

Features:
- **Cart items** — Image, name, quantity selector, price, remove button
- **Order summary** — Subtotal, tax (8%), coupon input, total
- **Proceed to checkout** button
- **Coupon validation** via database

## Checkout Page (`CheckoutPage`)

Features:
- **Customer information** — Name and email
- **Payment method** — Payoneer (default) or Skrill selection with account details
- **Transaction ID** input with instructions
- **Order summary** with itemized list
- **Place order** button
- **Success page** — Order # displayed, awaiting verification message

## Auth Pages (`AuthPage`)

- **Login** — Email/password with remember me, forgot password link
- **Register** — Name, email, password, confirm password, terms agreement
- SHA-256 password hashing on client side

## Profile Page (`ProfilePage`)

Tabs:
- **My Orders** — All orders with status, items, totals
- **My Downloads** — Orders with download links from admin
- **Account Details** — Edit name, email, phone, avatar (with media picker)
- **Messages** — User messages with admin replies, send message modal
- **Sign Out**

## Static Pages

- **About** — Company story, values (4 cards), stats numbers
- **Contact** — 4 info cards (visit, email, call, hours), contact form
- **Privacy Policy / Refund Policy / Terms of Use** — Legal content pages
