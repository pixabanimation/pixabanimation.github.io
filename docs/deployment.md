# Deployment & Configuration

## Hosting

The site is hosted on **GitHub Pages** from the `pixabanimation.github.io` repository. The site is a pure static site — no server-side processing required.

### Deployment Steps

```bash
# 1. Make changes locally
# 2. Test with local server
npx serve .

# 3. Commit and push to main branch
git add .
git commit -m "Description of changes"
git push origin main

# GitHub Pages automatically deploys from main branch
```

### Custom Domain

If using a custom domain, configure it in the repo Settings → Pages → Custom domain and add a `CNAME` file (or configure via the settings UI).

## Database Setup

### Turso (libSQL)

1. Create a Turso account at [turso.tech](https://turso.tech)
2. Create a database:
   ```bash
   turso db create pixabanimation
   ```
3. Get the database URL and auth token:
   ```bash
   turso db show pixabanimation
   turso db tokens create pixabanimation
   ```
4. Initialize the database:
   ```bash
   node database/init.mjs
   ```
5. Encrypt credentials using the tool:
   ```bash
   node tools/encrypt-credentials.mjs
   ```
6. Update `js/credentials.js` with the encrypted credentials

### Credential Security

Database credentials are XOR-obfuscated in `js/credentials.js` using a secret key. The `tools/encrypt-credentials.mjs` script handles obfuscation. This prevents casual credential theft from the source code but is not cryptographically secure (XOR is reversible with known plaintext).

## Cloudinary Configuration

Media uploads in the admin panel use Cloudinary's unsigned upload preset. Configuration is auto-configured when the Media page loads:

```js
{
  cloudName: 'pzyegeqn',
  apiKey: '799412167264845',
  uploadPreset: 'animation_studio'
}
```

To change Cloudinary configuration:
1. Go to Cloudinary Settings → Upload
2. Create an unsigned upload preset
3. Update the config in `js/pages/admin-media.js`

## Environment Variables

The site uses no server-side environment variables. All configuration is client-side:

| Variable | Location | Description |
|---|---|---|
| Turso URL | `js/credentials.js` (encoded) | Database endpoint |
| Turso Auth Token | `js/credentials.js` (encoded) | Database auth token |
| Cloudinary Config | `js/pages/admin-media.js` | Media upload settings |

## Local Development

```bash
# Option 1: VS Code Live Server
# Install "Live Server" extension, right-click index.html → Open with Live Server

# Option 2: Python
python -m http.server 8000

# Option 3: Node.js
npx serve .
# or
npx live-server

# Option 4: PHP
php -S localhost:8000
```

## Troubleshooting

### Site not loading
- Check browser console for JavaScript errors
- Verify Turso credentials are correct
- Ensure `index.html` has all script tags in correct order

### Database connection failed
- Regenerate Turso auth token
- Re-encrypt credentials
- Run `node database/init.mjs` to reset schema

### Admin not working
- Ensure `admin@pixabanimation.com` account exists and has `is_admin = 1`
- Re-run seed if admin account was deleted

### Media upload fails
- Check Cloudinary upload preset exists and is unsigned
- Verify Cloudinary cloud name is correct
- File must be under 100MB
