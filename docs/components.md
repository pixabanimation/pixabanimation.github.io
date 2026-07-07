# Components

All reusable UI components are defined in `js/components.js` under the global `Components` object.

## API Reference

### `Components.toast(message, type, duration)`
Display a sliding toast notification.

| Param | Type | Default | Description |
|---|---|---|---|
| `message` | string | — | Notification text |
| `type` | string | `'info'` | One of: `success`, `error`, `info`, `warning` |
| `duration` | number | `3000` | Display duration in ms |

### `Components.productCard(product, index)`
Render a product card for grid display.

| Param | Type | Description |
|---|---|---|
| `product` | object | Product data from DB (id, name, slug, price, compare_price, image_url, rating, reviews_count, category_name, stock, featured) |
| `index` | number | Position index for stagger animation |

Returns HTML string with:
- Product image (clickable)
- Badges (featured, sale %)
- Wishlist heart button
- Category label
- Product name (h3)
- Star rating with count
- Price with optional compare price
- Add to Cart button

### `Components.categoryCard(category, index)`
Render a category card with overlay.

| Param | Type | Description |
|---|---|---|
| `category` | object | Category data (name, slug, image_url, product_count) |
| `index` | number | Position index |

Returns HTML string with image overlay card.

### `Components.cartItem(item)`
Render a cart item row.

| Param | Type | Description |
|---|---|---|
| `item` | object | Cart item with product join data (id, name, price, image_url, quantity) |

Returns HTML string with image, name, quantity selector (+/−), line total, remove button.

### `Components.reviewCard(review)`
Render a customer review card.

| Param | Type | Description |
|---|---|---|
| `review` | object | Review data (author_name, rating, comment, created_at) |

Returns HTML string with author, stars, date, comment.

### `Components.loadingSkeleton(count)`
Render loading skeleton placeholders.

| Param | Type | Default | Description |
|---|---|---|---|
| `count` | number | `4` | Number of skeleton cards |

Returns HTML string.

### `Components.showModal(title, content, maxWidth)`
Display a modal overlay with header.

| Param | Type | Description |
|---|---|---|
| `title` | string | Modal header title |
| `content` | string | HTML for modal body |
| `maxWidth` | string | Optional CSS max-width value |

### `Components.openMediaPicker(onSelect)`
Open the media library picker overlay.

| Param | Type | Description |
|---|---|---|
| `onSelect` | function | Callback receiving selected URL |

### `Components.openMediaPickerFor(inputId, extraCallback)`
Open media picker and fill an input field.

| Param | Type | Description |
|---|---|---|
| `inputId` | string | ID of the input to fill |
| `extraCallback` | function/string | Optional callback or dotted method path |

### `Components.mediaField(inputId, currentValue, placeholder, extraCallback)`
Generates HTML for an image URL input with a Browse Media Library button.

### `Components.stars(rating)`
Generate star rating HTML string.

### `Components.emptyState(icon, title, message, buttonText, buttonLink)`
Generate an empty state placeholder with optional CTA button.

## Component Dependencies

- `Components.toast()` is used by every page for user feedback
- `Components.productCard()` is used by Home, Shop, and Wishlist pages
- `Components.modal()` is used by Admin pages for CRUD forms
- `Components.mediaField()` is used by Admin product/category forms
- `Components.emptyState()` is used by every page as error/empty fallback

## Global Utility Methods

### `Components.selectMediaItem(url)` / `Components.useMediaPickerUrl()`
Internal methods for media picker callbacks. Accessed via `onclick` in generated HTML.

### `App` Utility Methods (used across components)
- `App.addToCart(productId)` — Add product to cart
- `App.toggleWishlist(productId, btn)` — Toggle wishlist state
- `App.toggleWishlistById(productId)` — Toggle by ID (product page)
- `App.updateWishlistIcons()` — Sync heart icons
- `App.updateCartBadge()` / `App.updateWishlistBadge()` — Update nav badges
