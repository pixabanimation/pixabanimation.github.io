#!/usr/bin/env node
/**
 * generate-static-pages.mjs
 *
 * Generates static HTML files for SPA routes by cloning index.html
 * and updating only the meta tags and initial hash route.
 * The full app shell (nav, main, footer) is preserved.
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf-8');

const BASE_URL = 'https://pixabanimation.github.io';

// Split index.html at the closing </head> so we can inject meta tags
const headClosePos = indexHtml.indexOf('</head>');
const beforeHead = indexHtml.slice(0, headClosePos);
const afterHead = indexHtml.slice(headClosePos);

const pages = [
  {
    file: 'shop.html',
    route: '#/shop',
    title: 'Shop Premium Motion Graphics & Animation Assets — PixabAnimation',
    description: 'Browse thousands of premium 4K motion graphics, animation assets, video clips, and After Effects templates. Download instantly for your next creative project.',
    canonical: `${BASE_URL}/shop`,
    ogTitle: 'Premium Motion Graphics Assets — PixabAnimation Shop',
    ogDescription: 'Discover premium motion graphics, animation assets, and creative templates for professional editors and motion designers.'
  },
  {
    file: 'about.html',
    route: '#/about',
    title: 'About PixabAnimation — Our Story & Mission',
    description: 'Learn about PixabAnimation, the premium marketplace for motion graphics and animation assets. Founded in 2024, we empower creators with 4K video clips, templates, and design resources.',
    canonical: `${BASE_URL}/about`,
    ogTitle: 'About PixabAnimation — Where Creativity Meets Motion',
    ogDescription: 'Premium marketplace for motion graphics, animation assets, and creative tools for editors worldwide.'
  },
  {
    file: 'contact.html',
    route: '#/contact',
    title: 'Contact PixabAnimation — Get in Touch',
    description: 'Contact PixabAnimation for support, questions, or collaboration. Email us at spurno@icloud.com or visit our office in Dhaka, Bangladesh.',
    canonical: `${BASE_URL}/contact`,
    ogTitle: 'Contact PixabAnimation — We\'d Love to Hear From You',
    ogDescription: 'Have a question, feedback, or just want to say hello? Contact the PixabAnimation team.'
  },
  {
    file: 'privacy-policy.html',
    route: '#/privacy-policy',
    title: 'Privacy Policy — PixabAnimation',
    description: 'PixabAnimation privacy policy explains how we collect, use, and protect your personal data when you use our marketplace for motion graphics and animation assets.',
    canonical: `${BASE_URL}/privacy-policy`,
    ogTitle: 'Privacy Policy — PixabAnimation',
    ogDescription: 'Learn how PixabAnimation collects, uses, and protects your personal data.'
  },
  {
    file: 'refund-policy.html',
    route: '#/refund-policy',
    title: 'Refund Policy — PixabAnimation',
    description: 'PixabAnimation offers a 14-day satisfaction guarantee on digital products. Learn about our refund policy, eligibility criteria, and how to request a refund.',
    canonical: `${BASE_URL}/refund-policy`,
    ogTitle: 'Refund Policy — PixabAnimation',
    ogDescription: '14-day satisfaction guarantee on digital products. Learn about refund eligibility.'
  },
  {
    file: 'terms-of-use.html',
    route: '#/terms-of-use',
    title: 'Terms of Use — PixabAnimation',
    description: 'PixabAnimation terms of use govern the use of our marketplace, including account registration, digital product licensing, payment terms, and user conduct.',
    canonical: `${BASE_URL}/terms-of-use`,
    ogTitle: 'Terms of Use — PixabAnimation',
    ogDescription: 'Terms governing the use of PixabAnimation marketplace and digital products.'
  }
];

for (const page of pages) {
  // Replace title
  let html = beforeHead.replace(
    /<title>[^<]*<\/title>/,
    `<title>${page.title}</title>`
  );

  // Replace or add meta description
  if (/<meta name="description" /.test(html)) {
    html = html.replace(
      /<meta name="description" [^>]*>/,
      `<meta name="description" content="${page.description}">`
    );
  }

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" [^>]*>/,
    `<link rel="canonical" href="${page.canonical}">`
  );

  // Replace OG title
  html = html.replace(
    /<meta property="og:title" [^>]*>/,
    `<meta property="og:title" content="${page.ogTitle}">`
  );

  // Replace OG description
  html = html.replace(
    /<meta property="og:description" [^>]*>/,
    `<meta property="og:description" content="${page.ogDescription}">`
  );

  // Replace OG URL
  html = html.replace(
    /<meta property="og:url" [^>]*>/,
    `<meta property="og:url" content="${page.canonical}">`
  );

  // Replace Twitter title
  html = html.replace(
    /<meta name="twitter:title" [^>]*>/,
    `<meta name="twitter:title" content="${page.ogTitle}">`
  );

  // Replace Twitter description
  html = html.replace(
    /<meta name="twitter:description" [^>]*>/,
    `<meta name="twitter:description" content="${page.ogDescription}">`
  );

  // Insert hash setter script right at the end of <head> (before the closing </head> tag)
  const hashScript = `\n<script>window.location.hash='${page.route}';</script>\n</head>`;

  // afterBody = everything after </head> (the <body> and everything inside)
  const afterBody = afterHead.slice(7); // skip '</head>'

  html += hashScript + afterBody;

  writeFileSync(join(rootDir, page.file), html, 'utf-8');
  console.log(`✓ ${page.file}`);
}

console.log('\n✅ All 6 static pages regenerated with full app shell!');
