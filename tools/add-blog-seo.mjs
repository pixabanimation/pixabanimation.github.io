/**
 * Batch script to add JSON-LD structured data and enhanced meta tags
 * to all 40 blog articles for better SEO.
 *
 * Usage: node tools/add-blog-seo.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogDir = join(__dirname, '..', 'blog');

// Mapping of filenames to article metadata
// Extracted from the actual blog content
const articleMeta = {
  'ai-motion-graphics-revolution.html': {
    date: '2026-01-15',
    category: 'Artificial Intelligence & Motion Design',
    tags: ['AI Motion Graphics', 'Artificial Intelligence', 'Motion Design', 'After Effects', 'Animation Tools', 'Creative Technology'],
    readingTime: '12 min read'
  },
  'claude-ai-coding-productivity.html': {
    date: '2026-01-18',
    category: 'AI & Developer Productivity',
    tags: ['Claude AI', 'AI Coding', 'Developer Tools', 'Productivity', 'AI Assistants', 'Software Development'],
    readingTime: '10 min read'
  },
  'chatgpt-codex-vs-claude-coding.html': {
    date: '2026-01-20',
    category: 'AI & Coding Tools',
    tags: ['ChatGPT', 'Codex', 'Claude', 'AI Coding', 'Developer Tools', 'AI Comparison'],
    readingTime: '11 min read'
  },
  'future-of-web-animation-2026.html': {
    date: '2026-01-22',
    category: 'Web Animation & Technology',
    tags: ['Web Animation', 'CSS Animation', 'JavaScript', 'WebGPU', '3D Web', 'Performance'],
    readingTime: '14 min read'
  },
  'typography-trends-2026.html': {
    date: '2026-01-25',
    category: 'Typography & Design',
    tags: ['Typography', 'Variable Fonts', 'Kinetic Type', 'Design Trends', 'Motion Design', 'Type Design'],
    readingTime: '10 min read'
  },
  'ai-design-tools-creative-workflow.html': {
    date: '2026-01-28',
    category: 'AI & Design Technology',
    tags: ['AI Design', 'Creative Tools', 'Adobe Firefly', 'Figma AI', 'Design Workflow', 'Generative Design'],
    readingTime: '11 min read'
  },
  'freelancing-tips-motion-designers.html': {
    date: '2026-01-30',
    category: 'Freelancing & Career',
    tags: ['Freelancing', 'Motion Design', 'Career Tips', 'Pricing', 'Client Management', 'Portfolio'],
    readingTime: '12 min read'
  },
  'ai-video-generation-2026.html': {
    date: '2026-02-01',
    category: 'AI Video & Content Creation',
    tags: ['AI Video', 'Sora', 'Runway', 'Video Generation', 'Content Creation', 'Motion Graphics'],
    readingTime: '13 min read'
  },
  'mastering-after-effects-expressions.html': {
    date: '2026-02-03',
    category: 'Animation & Scripting',
    tags: ['After Effects', 'Expressions', 'JavaScript', 'Animation Automation', 'Motion Design', 'Scripting'],
    readingTime: '15 min read'
  },
  'large-language-models-creatives.html': {
    date: '2026-02-05',
    category: 'AI Technology',
    tags: ['LLMs', 'Large Language Models', 'AI', 'Creative Technology', 'Machine Learning', 'AI Assistants'],
    readingTime: '8 min read'
  },
  'generative-ai-copyright-creative-work.html': {
    date: '2026-02-07',
    category: 'AI Ethics & Law',
    tags: ['AI Copyright', 'Generative AI', 'Copyright Law', 'Creative Rights', 'AI Ethics', 'Licensing'],
    readingTime: '10 min read'
  },
  'machine-learning-visual-effects.html': {
    date: '2026-02-08',
    category: 'Technology & VFX',
    tags: ['Machine Learning', 'Visual Effects', 'VFX', 'AI Rotoscoping', 'Neural Rendering', 'Compositing'],
    readingTime: '9 min read'
  },
  'color-theory-motion-designers.html': {
    date: '2026-02-09',
    category: 'Design Principles',
    tags: ['Color Theory', 'Motion Design', 'Color Harmony', 'Color Psychology', 'Grading', 'Design'],
    readingTime: '10 min read'
  },
  'motion-design-principles-beginners.html': {
    date: '2026-02-10',
    category: 'Animation Fundamentals',
    tags: ['Motion Design', 'Animation Principles', 'Timing', 'Easing', 'Animation Basics', 'Motion Graphics'],
    readingTime: '8 min read'
  },
  'logo-animation-techniques.html': {
    date: '2026-02-11',
    category: 'Animation Techniques',
    tags: ['Logo Animation', 'Motion Design', 'Brand Identity', 'Reveal Animation', 'Morphing', '3D Animation'],
    readingTime: '9 min read'
  },
  'green-screen-compositing-tips.html': {
    date: '2026-02-12',
    category: 'VFX & Compositing',
    tags: ['Green Screen', 'Compositing', 'Keying', 'Chroma Key', 'VFX', 'Video Production'],
    readingTime: '8 min read'
  },
  'kinetic-typography-video-production.html': {
    date: '2026-02-13',
    category: 'Typography & Motion',
    tags: ['Kinetic Typography', 'Motion Typography', 'Video Production', 'Text Animation', 'Motion Design'],
    readingTime: '8 min read'
  },
  'visual-storytelling-data-animation.html': {
    date: '2026-02-14',
    category: 'Data Visualization',
    tags: ['Data Animation', 'Visual Storytelling', 'Data Visualization', 'Infographic', 'Motion Design', 'Analytics'],
    readingTime: '9 min read'
  },
  'seamless-loop-animations.html': {
    date: '2026-02-15',
    category: 'Animation Techniques',
    tags: ['Loop Animation', 'Seamless Loops', 'Motion Design', 'Infinite Animation', 'Background Animation'],
    readingTime: '7 min read'
  },
  'building-motion-design-portfolio.html': {
    date: '2026-02-16',
    category: 'Career & Portfolio',
    tags: ['Portfolio', 'Motion Design', 'Career', 'Freelancing', 'Showcase', 'Creative Career'],
    readingTime: '9 min read'
  },
  'top-motion-design-tools-2026.html': {
    date: '2026-02-17',
    category: 'Tools & Software',
    tags: ['Motion Design Tools', 'After Effects', 'Cinema 4D', 'Blender', 'DaVinci Resolve', 'Software'],
    readingTime: '10 min read'
  },
  'web-animation-css-javascript.html': {
    date: '2026-02-18',
    category: 'Web Development',
    tags: ['Web Animation', 'CSS', 'JavaScript', 'GSAP', 'Frontend', 'Performance'],
    readingTime: '11 min read'
  },
  'svg-animation-techniques.html': {
    date: '2026-02-19',
    category: 'Web Graphics',
    tags: ['SVG', 'Animation', 'Vector Graphics', 'CSS Animation', 'JavaScript', 'Web Design'],
    readingTime: '8 min read'
  },
  'lottie-files-web-animation.html': {
    date: '2026-02-20',
    category: 'Web Animation',
    tags: ['Lottie', 'Web Animation', 'After Effects', 'Motion Design', 'JSON Animation', 'Web Performance'],
    readingTime: '9 min read'
  },
  'threejs-3d-web-experiences.html': {
    date: '2026-02-21',
    category: '3D Web Development',
    tags: ['Three.js', '3D Web', 'WebGL', '3D Animation', 'Web Development', 'Interactive'],
    readingTime: '10 min read'
  },
  'performance-optimization-web-animations.html': {
    date: '2026-02-22',
    category: 'Web Performance',
    tags: ['Performance', 'Web Animation', 'Optimization', 'GPU', 'Rendering', 'Frontend'],
    readingTime: '8 min read'
  },
  'responsive-design-creative-portfolios.html': {
    date: '2026-02-23',
    category: 'Web Design',
    tags: ['Responsive Design', 'Portfolio', 'Web Design', 'UI Design', 'Mobile First', 'Creative'],
    readingTime: '9 min read'
  },
  'pricing-animation-services.html': {
    date: '2026-02-24',
    category: 'Freelancing & Business',
    tags: ['Pricing', 'Animation Services', 'Freelancing', 'Business', 'Motion Design', 'Rates'],
    readingTime: '10 min read'
  },
  'client-management-creative-freelancers.html': {
    date: '2026-02-25',
    category: 'Freelancing & Client Work',
    tags: ['Client Management', 'Freelancing', 'Communication', 'Creative Business', 'Client Relations'],
    readingTime: '9 min read'
  },
  'building-personal-brand-designer.html': {
    date: '2026-02-26',
    category: 'Career & Branding',
    tags: ['Personal Brand', 'Design Career', 'Branding', 'Marketing', 'Creative', 'Freelancing'],
    readingTime: '8 min read'
  },
  'marketing-motion-design-business.html': {
    date: '2026-02-27',
    category: 'Business & Marketing',
    tags: ['Marketing', 'Motion Design', 'Business', 'Social Media', 'Content Marketing', 'Freelancing'],
    readingTime: '9 min read'
  },
  'neural-networks-image-processing.html': {
    date: '2026-02-28',
    category: 'AI Technology',
    tags: ['Neural Networks', 'Image Processing', 'Super Resolution', 'Style Transfer', 'AI', 'Deep Learning'],
    readingTime: '8 min read'
  },
  'ai-powered-voice-synthesis-video.html': {
    date: '2026-03-01',
    category: 'AI & Video Production',
    tags: ['AI Voice', 'Voice Synthesis', 'Text to Speech', 'Voice Cloning', 'Video Production', 'AI Tools'],
    readingTime: '9 min read'
  },
  'ai-assistants-for-designers.html': {
    date: '2026-03-02',
    category: 'AI & Design',
    tags: ['AI Assistants', 'Design Tools', 'Creative AI', 'Design Workflow', 'Productivity', 'AI Design'],
    readingTime: '8 min read'
  },
  'computer-vision-animation.html': {
    date: '2026-03-03',
    category: 'Technology & Animation',
    tags: ['Computer Vision', 'Animation', 'Motion Capture', 'Facial Tracking', 'AI', 'VFX'],
    readingTime: '8 min read'
  },
  'ai-driven-personalization-digital-media.html': {
    date: '2026-03-04',
    category: 'AI & Media',
    tags: ['AI Personalization', 'Digital Media', 'Machine Learning', 'Content', 'User Experience', 'AI'],
    readingTime: '8 min read'
  },
  'understanding-diffusion-models.html': {
    date: '2026-03-05',
    category: 'AI Technology',
    tags: ['Diffusion Models', 'AI', 'Image Generation', 'Stable Diffusion', 'Midjourney', 'Machine Learning'],
    readingTime: '9 min read'
  },
  'remote-collaboration-creative-teams.html': {
    date: '2026-03-06',
    category: 'Team & Collaboration',
    tags: ['Remote Work', 'Collaboration', 'Creative Teams', 'Motion Design', 'Workflow', 'Team Management'],
    readingTime: '8 min read'
  },
  'motion-graphics-stock-video-resources.html': {
    date: '2026-03-07',
    category: 'Resources & Stock',
    tags: ['Stock Video', 'Motion Graphics', 'Resources', 'Stock Footage', 'Templates', 'Creative Assets'],
    readingTime: '8 min read'
  },
  'building-interactive-data-visualizations.html': {
    date: '2026-03-08',
    category: 'Data Visualization',
    tags: ['Data Visualization', 'D3.js', 'Interactive', 'Web Development', 'Animation', 'JavaScript'],
    readingTime: '9 min read'
  }
};

const siteUrl = 'https://pixabanimation.github.io';
const siteName = 'PixabAnimation';
const twitterHandle = '@pixabanimation';
const author = {
  name: 'PixabAnimation Team',
  url: siteUrl
};

function buildJsonLd(filename, meta, title, description, imageUrl) {
  const url = `${siteUrl}/blog/${filename}`;

  const articleJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "datePublished": meta.date,
    "dateModified": meta.date,
    "author": {
      "@type": "Organization",
      "name": author.name,
      "url": author.url
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/assets/pixabanimation-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": meta.tags.join(', '),
    "articleSection": meta.category,
    "wordCount": 2200,
    "timeRequired": meta.readingTime
  };

  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": url
      }
    ]
  };

  return `  <script type="application/ld+json">\n${JSON.stringify(articleJson, null, 2)}\n  </script>\n  <script type="application/ld+json">\n${JSON.stringify(breadcrumbJson, null, 2)}\n  </script>`;
}

function buildMetaTags(filename, meta, title, description, imageUrl) {
  const url = `${siteUrl}/blog/${filename}`;
  return `
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="${meta.date}">
  <meta property="article:modified_time" content="${meta.date}">
  <meta property="article:author" content="${author.name}">
  <meta property="article:section" content="${meta.category}">
  ${meta.tags.map(t => `<meta property="article:tag" content="${t}">`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${twitterHandle}">
  <meta name="twitter:creator" content="${twitterHandle}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">`;
}

function processFile(filepath) {
  const filename = filepath.split(/[\\/]/).pop();
  
  if (!articleMeta[filename]) {
    console.log(`  ⏭️  Skipping (no metadata): ${filename}`);
    return;
  }

  const meta = articleMeta[filename];
  let content = readFileSync(filepath, 'utf-8');

  // Check if JSON-LD already exists
  if (content.includes('"@type":"BlogPosting"') || content.includes('"@type": "BlogPosting"')) {
    console.log(`  ⏭️  Already has JSON-LD: ${filename}`);
    return;
  }

  // Extract title from <title> tag
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch) {
    console.log(`  ❌ No title found: ${filename}`);
    return;
  }
  const fullTitle = titleMatch[1];
  const articleTitle = fullTitle.replace(/ — PixabAnimation$/, '');

  // Extract description from meta description
  const descMatch = content.match(/<meta name="description" content="([^"]+)">/);
  const description = descMatch ? descMatch[1] : '';

  // Extract image from og:image
  const imgMatch = content.match(/<meta property="og:image" content="([^"]+)">/);
  const imageUrl = imgMatch ? imgMatch[1] : '';

  // Build the enhanced meta tags
  const metaBlock = buildMetaTags(filename, meta, articleTitle, description, imageUrl);

  // Build JSON-LD
  const jsonLdBlock = buildJsonLd(filename, meta, articleTitle, description, imageUrl);

  // Insert enhanced meta tags after the last existing meta tag (before link[rel=canonical])
  // Find the canonical link line and insert before it
  const canonicalRegex = /<link rel="canonical"/;
  
  // Insert enhanced meta tags before the canonical link
  content = content.replace(canonicalRegex, `${metaBlock}\n  $&`);

  // Insert JSON-LD before the closing </head>
  content = content.replace('</head>', `${jsonLdBlock}\n</head>`);

  writeFileSync(filepath, content, 'utf-8');
  console.log(`  ✅ Updated: ${filename}`);
}

function main() {
  const files = readdirSync(blogDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();
  
  console.log(`Found ${files.length} blog articles to process...\n`);
  
  let count = 0;
  for (const file of files) {
    processFile(join(blogDir, file));
    count++;
  }
  
  console.log(`\nProcessed ${count} articles.`);
}

main();
