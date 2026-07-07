# Routing

## Overview

The router (`js/router.js`) is a custom hash-based SPA router. It monitors `window.location.hash` changes and maps URL patterns to page handler functions.

## Router API

### `Router.register(path, handler)`
Register a route and its handler function.

```js
Router.register('/', (params) => HomePage.render(params));
Router.register('/product/:slug', (params) => ProductPage.render(params));
Router.register('/shop', (params) => ShopPage.render(params));
```

### `Router.navigate(hash, pushState)`
Programmatically navigate to a route.

| Param | Type | Default | Description |
|---|---|---|---|
| `hash` | string | — | Route hash (e.g., `#/shop?category=videos`) |
| `pushState` | boolean | `true` | Whether to update `window.location.hash` |

### `Router.beforeEach(hook)`
Register a before-route hook (called before every navigation). Used for cleanup.

```js
Router.beforeEach(() => {
  ShopPage.cleanup();
});
```

### `Router.start()`
Start the router — listens for `hashchange` events and processes the initial route.

## Route Matching

The router supports two types of matching:

1. **Exact match** — `'/'` matches `#/`, `'/shop'` matches `#/shop`
2. **Pattern match** — `'/product/:slug'` matches `#/product/cinematic-nature-reel`, extracting `{ slug: 'cinematic-nature-reel' }`

Query parameters are parsed from the hash and passed to handlers:
```js
// URL: #/shop?category=videos&sort=price-asc
// params.query = { category: 'videos', sort: 'price-asc' }
```

## Navigation Flow

```
hashchange / Router.navigate()
    └── Router.navigate(hash, pushState)
        ├── beforeHooks (cleanup)
        ├── Show loader + start progress bar
        ├── Match route (exact → pattern)
        ├── Parse query params
        ├── Call handler: PageModule.render({ params, query, path })
        ├── Update active nav link
        ├── Hide loader + complete progress bar
        └── Scroll to top (smooth)
```

## Progress Bar

A thin progress bar (`#navProgressBar`) animates during route transitions:
1. Quickly jumps to 60% width
2. When route completes, jumps to 100%
3. Fades out after 300ms
4. Resets to 0% after fade transition

## Page Handler Pattern

Each page handler receives a params object:
```js
{
  params: { slug: 'product-slug' },  // URL pattern params
  query: { category: 'videos' },      // Query string params
  path: '/shop?category=videos'       // Full relative path
}
```

Pages must render content into `document.getElementById('pageContent')`.
