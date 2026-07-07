# SEO & Structured Data

## Meta Tags

Defined in `index.html` `<head>`:

- **Title** — `PixabAnimation — Premium Motion Graphics Assets Marketplace`
- **Description** — Detailed description with keywords
- **Keywords** — Motion graphics, animation assets, 4K video clips, After Effects templates, etc.
- **Author** — PixabAnimation
- **Robots** — `index, follow`
- **Canonical URL** — `https://pixabanimation.github.io/`

## Open Graph / Facebook

- `og:title`, `og:description`, `og:type` (website), `og:url`, `og:image` (1200×630), `og:locale`, `og:site_name`

## Twitter Card

- `twitter:card` (summary_large_image), `twitter:site` (@pixabanimation), `twitter:title`, `twitter:description`, `twitter:image`

## JSON-LD Structured Data

### Global (in `index.html`)

#### Organization
- Name, URL, logo, description, founding date (2025)
- Social profiles (Facebook, Twitter, Instagram, Pinterest)
- ContactPoint (customer support email)

#### WebSite
- Name, URL, SearchAction with target URL template

#### ItemList (Featured Products)
- Name, description, URL, numberOfItems, itemListOrder

#### BreadcrumbList
- Home → Shop → About → Contact

### Dynamic (injected by page scripts)

#### Home Page (`home.js`)
- **FAQPage** — 6 Q&A pairs matching the FAQ accordion, cleaned up on re-render

#### Contact Page (`contact.js`)
- **Organization** (detailed) — Full address (Dhanmondi 32, Dhaka), phone, email, sameAs (5 profiles), 2 ContactPoints (support + sales), OpeningHoursSpecification (weekdays 9-6, Saturday 10-4)

#### Shop Page (`shop.js`)
- **CollectionPage** — Dynamic name, description, URL based on category/search filters

#### Product Page (`product.js`)
- **Product** — Full product schema with SKU, MPN, brand, manufacturer, offers (price, availability, condition), aggregateRating (if reviews exist), individual reviews (up to 5)
- **BreadcrumbList** — Home → Shop → [Category] → Product

## Sitemap

`sitemap.xml` includes:
- Home, Shop, About, Contact
- Static pages: Privacy Policy, Refund Policy, Terms of Use
- User pages: Wishlist, Cart, Profile

## Robots.txt

- Allows all crawlers
- Disallows: `/admin`, `/login`, `/register`, `/forgot-password`, `/checkout`
- Points to sitemap

## 404 Page

Custom `404.html` with:
- Clean gradient design
- Navigation options (Go Home, Browse Shop)
- Quick links to About, Contact, Privacy Policy, Terms of Use
- Search hint text

## Performance

- Font Awesome loaded with `media="print" onload="this.media='all'"` (non-blocking)
- Preconnect + DNS-prefetch for external resources (fonts, CDN)
- Preload critical CSS
- Images use `loading="lazy"` (except hero image)
- Responsive images with `srcset` for flags
- Video previews instead of full files
