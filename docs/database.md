# Database

## Technology

**Turso** — Serverless edge database built on libSQL (SQLite-compatible). The database is hosted on Turso's edge network and accessed via HTTP from the browser using `@libsql/client` web SDK.

## Connection

The database client is initialized in `index.html` using an ESM import from `https://esm.sh/@libsql/client@0.14.0/web`. Credentials are XOR-obfuscated in `js/credentials.js` and decoded at runtime.

```js
window.__tursoClient = createClient({
  url: _CREDENTIALS.url,
  authToken: _CREDENTIALS.authToken
});
```

## Entity Relationship Diagram

```
users ──┬── admin_security (1:1)
         ├── cart_items (1:N)
         ├── wishlist_items (1:N)
         ├── orders (1:N)
         ├── contact_messages (as sender + replier)
         └── reviews (1:N)

categories ──┬── products (1:N)

products ──┬── cart_items (1:N)
           ├── wishlist_items (1:N)
           ├── order_items (1:N)
           └── reviews (1:N)

orders ──┬── order_items (1:N)

password_reset_codes (standalone)
coupons (standalone)
media (standalone)
newsletter_subscribers (standalone)
```

## Tables

### `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT NOT NULL | Display name |
| `slug` | TEXT NOT NULL UNIQUE | URL-friendly identifier |
| `description` | TEXT | Category description |
| `image_url` | TEXT | Category cover image |
| `created_at` | DATETIME | Default CURRENT_TIMESTAMP |

Seed categories: Home & Living, Sports & Outdoors, Books & Media, Beauty & Health, Animation & Video, After Effects Plugin.

### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT NOT NULL | Product name |
| `slug` | TEXT NOT NULL UNIQUE | URL slug |
| `description` | TEXT | Product description |
| `price` | REAL NOT NULL | Current price |
| `compare_price` | REAL | Original/compare price |
| `image_url` | TEXT | Primary thumbnail |
| `images` | TEXT | JSON array of image URLs |
| `category_id` | INTEGER FK → categories | Product category |
| `stock` | INTEGER | Inventory count (999 = unlimited digital) |
| `rating` | REAL | Average rating |
| `reviews_count` | INTEGER | Review count |
| `featured` | INTEGER BOOL | 0/1 featured flag |
| `media_type` | TEXT | `physical`, `digital`, or `video` |
| `video_url` | TEXT | Full video file URL |
| `preview_url` | TEXT | Preview clip URL |
| `preview_description` | TEXT | Preview description text |
| `file_size` | REAL | File size in GB |
| `duration` | INTEGER | Duration in seconds |
| `created_at` | DATETIME | Default CURRENT_TIMESTAMP |

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT NOT NULL | Display name |
| `email` | TEXT NOT NULL UNIQUE | Login email |
| `password` | TEXT NOT NULL | SHA-256 hashed |
| `avatar_url` | TEXT | Profile picture URL |
| `phone` | TEXT | Phone number |
| `address` | TEXT | Physical address |
| `additional_email` | TEXT | Secondary email |
| `is_admin` | INTEGER BOOL | Admin flag |
| `created_at` | DATETIME | Registration date |

### `cart_items`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | INTEGER FK | Optional logged-in user |
| `session_id` | TEXT | Guest session identifier |
| `product_id` | INTEGER FK NOT NULL | Product reference |
| `quantity` | INTEGER | Default 1 |
| `created_at` | DATETIME | |

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | INTEGER FK | Linked user |
| `session_id` | TEXT | Guest session |
| `status` | TEXT | `pending`, `confirmed`, `delivered`, `cancelled` |
| `total` | REAL NOT NULL | Grand total |
| `subtotal` | REAL NOT NULL | Pre-tax total |
| `tax` | REAL | Tax amount |
| `customer_info` | TEXT | JSON: name, email |
| `payment_method` | TEXT | payoneer or skrill |
| `transaction_id` | TEXT | Payment reference |
| `payment_provider` | TEXT | Provider name |
| `download_link` | TEXT | Admin-provided download URL |
| `transaction_approved` | INTEGER BOOL | Admin approval flag |
| `created_at` | DATETIME | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `order_id` | INTEGER FK NOT NULL | Parent order |
| `product_id` | INTEGER FK NOT NULL | Product reference |
| `product_name` | TEXT NOT NULL | Snapshot of name |
| `product_image` | TEXT | Snapshot of image |
| `quantity` | INTEGER NOT NULL | |
| `price` | REAL NOT NULL | Unit price at time of order |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `product_id` | INTEGER FK NOT NULL | |
| `user_id` | INTEGER FK | Linked user |
| `author_name` | TEXT NOT NULL | Display name |
| `rating` | INTEGER NOT NULL | 1–5 |
| `comment` | TEXT | Review text |
| `created_at` | DATETIME | |

### `wishlist_items`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK | |
| `session_id` | TEXT | Guest session |
| `product_id` | INTEGER FK NOT NULL | |
| `created_at` | DATETIME | |

### `contact_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | INTEGER FK | Sender (if logged in) |
| `name` | TEXT NOT NULL | |
| `email` | TEXT NOT NULL | |
| `subject` | TEXT | |
| `message` | TEXT NOT NULL | |
| `admin_reply` | TEXT | Reply content |
| `replied_by` | INTEGER FK | Admin user ID |
| `replied_at` | DATETIME | |
| `is_read` | INTEGER BOOL | Default 0 |
| `created_at` | DATETIME | |

### `newsletter_subscribers`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `email` | TEXT NOT NULL UNIQUE | |
| `name` | TEXT | |
| `active` | INTEGER BOOL | Default 1 |
| `subscribed_at` | DATETIME | |

### `coupons`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `code` | TEXT NOT NULL UNIQUE | Uppercase code |
| `discount_percent` | REAL NOT NULL | Discount % |
| `min_purchase` | REAL | Minimum order amount |
| `max_uses` | INTEGER | Usage limit |
| `current_uses` | INTEGER | Current usage count |
| `expires_at` | DATETIME | Expiration date |
| `created_at` | DATETIME | |

### `media`
For Cloudinary-uploaded media files.

### `password_reset_codes`
For forgot-password flow (not currently used — security question flow is used instead).

### `admin_security`
Security questions for admin password recovery.

## Database Initialization

Run via Node.js:
```bash
node database/init.mjs
```

This script:
1. Reads `schema.sql` and creates tables
2. Runs column migrations for backward compatibility
3. Runs `seed.sql` to populate initial data
4. Hashes any existing plaintext passwords
5. Fixes broken image URLs and JSON data

## DB API (`js/db.js`)

The `DB` object wraps all database queries with methods organized by domain:

- **Products:** `getProducts()`, `getProduct()`, `getProductById()`, `getFeaturedProducts()`, `getProductsByCategory()`, CRUD methods
- **Categories:** `getCategories()`, `getCategory()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
- **Cart:** `getCart()`, `getCartCount()`, `getCartTotal()`, `addToCart()`, `updateCartItem()`, `removeFromCart()`, `clearCart()`
- **Wishlist:** `getWishlist()`, `getWishlistCount()`, `toggleWishlist()`, `isInWishlist()`
- **Orders:** `createOrder()`, `getOrders()`, `getOrderItems()`, approval methods
- **Reviews:** `getProductReviews()`, `addReview()`
- **Contact:** `submitContact()`, `getAllMessages()`, `replyToMessage()`
- **Newsletter:** `subscribeNewsletter()`, `unsubscribeNewsletter()`
- **Users:** `createUser()`, `getUserByEmail()`, `getUserById()`, `updateUser()`, `deleteUser()`
- **Admin Analytics:** `getDashboardStats()`, `getTopProducts()`, `getDailySales()`, `getCategoryDistribution()`
- **Search:** `searchSuggestions()`, `searchCategories()`
- **Media:** `getMedia()`, `addMedia()`, `deleteMedia()`
- **Security:** `hashPassword()`, `verifyResetCode()`, `setSecurityQuestion()`
