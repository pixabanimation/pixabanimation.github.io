# PixabAnimation — Documentation

**Version:** 1.0.0  
**Last updated:** July 7, 2026  
**Repository:** [pixabanimation.github.io](https://github.com/pixabanimation/pixabanimation.github.io)

## Overview

PixabAnimation is a single-page application (SPA) marketplace for premium motion graphics, animation assets, 4K video clips, and professional editing templates. Built with vanilla JavaScript, HTML, and CSS, it features a hash-based SPA router, Turso/libSQL database backend, and an Apple-inspired design system.

## Documentation Contents

| Section | Description |
|---|---|
| [Architecture](architecture.md) | App architecture, file structure, and design patterns |
| [Pages](pages.md) | Complete page-by-page reference |
| [Components](components.md) | Reusable UI component library |
| [Database](database.md) | Schema, tables, and relationships |
| [Routing](routing.md) | SPA router and navigation system |
| [Admin Panel](admin.md) | Admin dashboard and management pages |
| [SEO & Structured Data](seo.md) | Meta tags, JSON-LD, and search optimization |
| [Deployment](deployment.md) | Hosting, configuration, and setup guide |

## Quick Start

```bash
# Serve locally (any static file server)
npx serve .
# or
python -m http.server 8000
# or
npx live-server
```

The site has no build step — it's a pure HTML/CSS/JS SPA. Open `index.html` in a browser or serve it via any static file server.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Vanilla JS** | Application logic, routing, components |
| **HTML5** | App shell, entry point |
| **CSS3** | Styling (Apple-inspired design system) |
| **Turso/libSQL** | Serverless edge database |
| **Cloudinary** | Media storage and optimization |
| **Payoneer / Skrill** | Payment processing |
| **GitHub Pages** | Hosting |
