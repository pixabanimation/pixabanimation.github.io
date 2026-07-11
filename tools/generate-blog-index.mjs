#!/usr/bin/env node
/**
 * generate-blog-index.mjs
 *
 * Generates a fully static blog/index.html listing all 40 blog posts
 * with SEO meta tags, structured data, and proper static links.
 *
 * Usage: node tools/generate-blog-index.mjs
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const outputPath = join(blogDir, 'index.html');

const BASE_URL = 'https://pixabanimation.github.io';
const TODAY = new Date().toISOString().split('T')[0];

// Blog data (mirrors js/blog-data.js)
const BLOG_DATA = [
  { id: 1, slug: 'ai-motion-graphics-revolution', featured: 1, title: 'The AI Revolution in Motion Graphics: What Every Designer Needs to Know in 2026', excerpt: 'Discover how artificial intelligence is transforming motion graphics in 2026. From AI-powered animation tools to automated workflows, learn what every motion designer needs to know.', cover: 'ai-motion-graphics-revolution', category: 'AI', tags: ['AI Motion Graphics', 'Artificial Intelligence', 'Motion Design', 'After Effects', 'Animation Tools', 'Creative Technology'], reading_time: 12, date: '2026-01-15', author: 'PixabAnimation Team' },
  { id: 2, slug: 'claude-ai-coding-productivity', featured: 1, title: 'Claude AI for Coding: Advanced Productivity Tips for Modern Developers', excerpt: 'Master Claude AI for coding with expert tips and techniques. Learn how to boost your development productivity using Claude\'s advanced capabilities.', cover: 'claude-ai-coding-productivity', category: 'AI', tags: ['Claude AI', 'AI Coding', 'Developer Productivity', 'Code Generation', 'Artificial Intelligence'], reading_time: 10, date: '2026-01-18', author: 'PixabAnimation Team' },
  { id: 3, slug: 'chatgpt-codex-vs-claude-coding', title: 'ChatGPT Codex vs Claude for Coding: Which AI Assistant Wins in 2026?', excerpt: 'In-depth comparison of ChatGPT Codex and Claude for coding tasks, strengths, weaknesses, and recommendations.', cover: 'chatgpt-codex-vs-claude-coding', category: 'AI', tags: ['ChatGPT', 'Claude', 'AI Coding', 'Codex', 'Developer Tools'], reading_time: 11, date: '2026-01-20', author: 'PixabAnimation Team' },
  { id: 4, slug: 'future-of-web-animation-2026', featured: 1, title: 'The Future of Web Animation in 2026: Trends, Technologies, and Tools', excerpt: 'Explore the cutting-edge trends shaping web animation in 2026, from AI-driven motion to WebGPU, scroll-driven animations, and immersive 3D experiences.', cover: 'future-of-web-animation-2026', category: 'Web', tags: ['Web Animation', 'CSS Animation', 'WebGPU', 'Three.js', 'Lottie', 'Motion Design', 'Frontend'], reading_time: 14, date: '2026-01-22', author: 'PixabAnimation Team' },
  { id: 5, slug: 'typography-trends-2026', title: 'Typography Trends 2026: Variable Fonts, Kinetic Type, and Motion-Driven Lettering', excerpt: 'Variable fonts, kinetic type, generative typography, and motion-driven lettering trends shaping design.', cover: 'typography-trends-2026', category: 'Design', tags: ['Typography', 'Variable Fonts', 'Kinetic Typography', 'Motion Design', 'Font Design', 'Design Trends'], reading_time: 10, date: '2026-01-25', author: 'PixabAnimation Team' },
  { id: 6, slug: 'ai-design-tools-creative-workflow', title: 'AI Design Tools Transforming Creative Workflows in 2026', excerpt: 'Explore the best AI design tools transforming creative workflows — Adobe Firefly, Figma AI, and more.', cover: 'ai-design-tools-creative-workflow', category: 'AI', tags: ['AI Design', 'Creative Tools', 'Adobe Firefly', 'Figma AI', 'Generative AI', 'Design Workflow'], reading_time: 11, date: '2026-01-28', author: 'PixabAnimation Team' },
  { id: 7, slug: 'freelancing-tips-motion-designers', title: 'Freelancing Tips for Motion Designers: Build a Thriving Creative Business', excerpt: 'Build a thriving freelance motion design business with expert tips on pricing, clients, and marketing.', cover: 'freelancing-tips-motion-designers', category: 'Freelancing', tags: ['Freelancing', 'Motion Design', 'Career Tips', 'Pricing', 'Client Management', 'Portfolio'], reading_time: 12, date: '2026-01-30', author: 'PixabAnimation Team' },
  { id: 8, slug: 'ai-video-generation-2026', title: 'AI Video Generation in 2026: The Complete Guide for Content Creators', excerpt: 'The complete guide to AI video generation — Sora, Runway Gen-3, Pika Labs, and how creators use them.', cover: 'ai-video-generation-2026', category: 'AI', tags: ['AI Video', 'Sora', 'Runway', 'Video Generation', 'Content Creation', 'Motion Graphics'], reading_time: 13, date: '2026-02-01', author: 'PixabAnimation Team' },
  { id: 9, slug: 'mastering-after-effects-expressions', title: 'Mastering After Effects Expressions: From Beginner to Advanced', excerpt: 'Master JavaScript-based animation automation in After Effects, from basics to advanced techniques.', cover: 'mastering-after-effects-expressions', category: 'Animation', tags: ['After Effects', 'Expressions', 'JavaScript', 'Animation', 'Motion Design', 'Tutorial'], reading_time: 15, date: '2026-02-03', author: 'PixabAnimation Team' },
  { id: 10, slug: 'large-language-models-creatives', title: 'Understanding Large Language Models: A Creative Professional\'s Guide', excerpt: 'A creative\'s guide to understanding large language models and how to leverage them in creative workflows.', cover: 'large-language-models-creatives', category: 'AI', tags: ['LLM', 'AI', 'Creative Tools', 'Language Models', 'Generative AI'], reading_time: 8, date: '2026-02-05', author: 'PixabAnimation Team' },
  { id: 11, slug: 'generative-ai-copyright-creative-work', title: 'Generative AI and Copyright: A Guide for Creative Professionals', excerpt: 'Navigate the complex landscape of generative AI copyright for creatives — ownership, licensing, and best practices.', cover: 'generative-ai-copyright-creative-work', category: 'AI', tags: ['AI Copyright', 'Generative AI', 'Creative Rights', 'Licensing', 'Legal'], reading_time: 10, date: '2026-02-07', author: 'PixabAnimation Team' },
  { id: 12, slug: 'machine-learning-visual-effects', title: 'Machine Learning for Visual Effects: Transforming the VFX Pipeline', excerpt: 'Discover how ML is transforming VFX — AI rotoscoping, neural rendering, and AI-assisted compositing.', cover: 'machine-learning-visual-effects', category: 'Technology', tags: ['Machine Learning', 'Visual Effects', 'VFX', 'AI', 'Deep Learning', 'Compositing'], reading_time: 9, date: '2026-02-08', author: 'PixabAnimation Team' },
  { id: 13, slug: 'color-theory-motion-designers', title: 'Color Theory for Motion Designers: A Comprehensive Guide', excerpt: 'Master color theory for motion design — harmonies, psychology, color grading, and accessibility.', cover: 'color-theory-motion-designers', category: 'Design', tags: ['Color Theory', 'Motion Design', 'Color Harmony', 'Color Psychology', 'Grading', 'Design'], reading_time: 10, date: '2026-02-09', author: 'PixabAnimation Team' },
  { id: 14, slug: 'motion-design-principles-beginners', title: 'The 12 Principles of Motion Design: A Beginner\'s Guide', excerpt: 'Learn the 12 principles of motion design — timing, spacing, easing, and animation fundamentals.', cover: 'motion-design-principles-beginners', category: 'Animation', tags: ['Motion Design', 'Animation', 'Animation Principles', 'Timing', 'Easing', 'Tutorial'], reading_time: 8, date: '2026-02-10', author: 'PixabAnimation Team' },
  { id: 15, slug: 'logo-animation-techniques', title: 'Logo Animation Techniques: Creating Memorable Brand Introductions', excerpt: 'Creating memorable brand introductions with reveal animations, morphing, and 3D logo animation.', cover: 'logo-animation-techniques', category: 'Animation', tags: ['Logo Animation', 'Motion Design', 'Brand Identity', 'Reveal Animation', 'Morphing', '3D Animation'], reading_time: 9, date: '2026-02-11', author: 'PixabAnimation Team' },
  { id: 16, slug: 'green-screen-compositing-tips', title: 'Green Screen Compositing Tips for Motion Designers', excerpt: 'Expert tips for keying, lighting, spill suppression, and professional compositing workflows.', cover: 'green-screen-compositing-tips', category: 'VFX', tags: ['Green Screen', 'Compositing', 'Keying', 'VFX', 'Chroma Key', 'Motion Design'], reading_time: 8, date: '2026-02-12', author: 'PixabAnimation Team' },
  { id: 17, slug: 'kinetic-typography-video-production', title: 'Kinetic Typography in Video Production: Making Words Move', excerpt: 'Techniques for animating text that captures attention and communicates effectively in video production.', cover: 'kinetic-typography-video-production', category: 'Typography', tags: ['Kinetic Typography', 'Typography', 'Motion Design', 'Video Production', 'Text Animation'], reading_time: 8, date: '2026-02-13', author: 'PixabAnimation Team' },
  { id: 18, slug: 'visual-storytelling-data-animation', title: 'Visual Storytelling with Data Animation: Transforming Numbers into Narratives', excerpt: 'Transform complex data into compelling animated visual narratives with effective data animation techniques.', cover: 'visual-storytelling-data-animation', category: 'Animation', tags: ['Data Animation', 'Visual Storytelling', 'Data Visualization', 'Infographic', 'Motion Design'], reading_time: 9, date: '2026-02-14', author: 'PixabAnimation Team' },
  { id: 19, slug: 'seamless-loop-animations', title: 'Creating Seamless Loop Animations: Design Patterns and Techniques', excerpt: 'Design patterns and techniques for creating infinite motion sequences without visible loop points.', cover: 'seamless-loop-animations', category: 'Animation', tags: ['Loop Animation', 'Motion Design', 'Animation Techniques', 'Seamless', 'Cinema 4D'], reading_time: 7, date: '2026-02-15', author: 'PixabAnimation Team' },
  { id: 20, slug: 'building-motion-design-portfolio', title: 'Building a Motion Design Portfolio That Attracts Clients in 2026', excerpt: 'Tips on showcasing work, case studies, platform selection, and attracting high-quality clients.', cover: 'building-motion-design-portfolio', category: 'Career', tags: ['Portfolio', 'Motion Design', 'Career', 'Freelancing', 'Client Acquisition'], reading_time: 9, date: '2026-02-16', author: 'PixabAnimation Team' },
  { id: 21, slug: 'top-motion-design-tools-2026', title: 'Top Motion Design Tools in 2026: The Complete Toolkit', excerpt: 'Comprehensive guide to After Effects, Cinema 4D, Blender, DaVinci Resolve, and AI-powered tools.', cover: 'top-motion-design-tools-2026', category: 'Tools', tags: ['Motion Design', 'After Effects', 'Cinema 4D', 'Blender', 'DaVinci Resolve', 'Animation Tools'], reading_time: 10, date: '2026-02-17', author: 'PixabAnimation Team' },
  { id: 22, slug: 'web-animation-css-javascript', title: 'Web Animation with CSS and JavaScript: A Complete Guide', excerpt: 'Complete guide to web animation — CSS transitions, JavaScript libraries, performance best practices.', cover: 'web-animation-css-javascript', category: 'Web', tags: ['Web Animation', 'CSS', 'JavaScript', 'GSAP', 'Frontend', 'Animation'], reading_time: 11, date: '2026-02-18', author: 'PixabAnimation Team' },
  { id: 23, slug: 'svg-animation-techniques', title: 'SVG Animation Techniques: Bringing Vector Graphics to Life', excerpt: 'Bring vector graphics to life with CSS, JavaScript, and GSAP SVG animation techniques.', cover: 'svg-animation-techniques', category: 'Web', tags: ['SVG', 'Vector Animation', 'CSS', 'JavaScript', 'GSAP', 'Web Animation'], reading_time: 8, date: '2026-02-19', author: 'PixabAnimation Team' },
  { id: 24, slug: 'lottie-files-web-animation', title: 'Lottie Files for Web Animation: The Complete Guide', excerpt: 'Complete guide to creating, optimizing, and integrating Lottie animations in web projects.', cover: 'lottie-files-web-animation', category: 'Web', tags: ['Lottie', 'Web Animation', 'After Effects', 'Motion Design', 'JSON Animation'], reading_time: 9, date: '2026-02-20', author: 'PixabAnimation Team' },
  { id: 25, slug: 'threejs-3d-web-experiences', title: 'Three.js for 3D Web Experiences: A Motion Designer\'s Guide', excerpt: 'Create immersive 3D web experiences — scene setup, animation, interactivity, and performance optimization.', cover: 'threejs-3d-web-experiences', category: 'Web', tags: ['Three.js', '3D Web', 'WebGL', '3D Animation', 'Web Development', 'Interactive'], reading_time: 10, date: '2026-02-21', author: 'PixabAnimation Team' },
  { id: 26, slug: 'performance-optimization-web-animations', title: 'Performance Optimization for Web Animations: The Developer\'s Guide', excerpt: 'Optimize web animation performance — GPU acceleration, layout thrashing prevention, and rendering tips.', cover: 'performance-optimization-web-animations', category: 'Web', tags: ['Performance', 'Web Animation', 'Optimization', 'GPU', 'Rendering', 'Frontend'], reading_time: 8, date: '2026-02-22', author: 'PixabAnimation Team' },
  { id: 27, slug: 'responsive-design-creative-portfolios', title: 'Responsive Design for Creative Portfolios: Showcasing Work Across Devices', excerpt: 'Build a responsive creative portfolio — layouts, typography, image optimization, and mobile-first design.', cover: 'responsive-design-creative-portfolios', category: 'Design', tags: ['Responsive Design', 'Portfolio', 'Web Design', 'Mobile-First', 'CSS'], reading_time: 9, date: '2026-02-23', author: 'PixabAnimation Team' },
  { id: 28, slug: 'pricing-animation-services', title: 'Pricing Your Animation Services: A Freelancer\'s Guide', excerpt: 'Learn pricing models, rates, quoting strategies, and negotiation tips for motion designers.', cover: 'pricing-animation-services', category: 'Freelancing', tags: ['Pricing', 'Freelancing', 'Motion Design', 'Business', 'Rates'], reading_time: 10, date: '2026-02-24', author: 'PixabAnimation Team' },
  { id: 29, slug: 'client-management-creative-freelancers', title: 'Client Management for Creative Freelancers: Building Lasting Relationships', excerpt: 'Master communication, feedback management, and long-term client relationship building.', cover: 'client-management-creative-freelancers', category: 'Freelancing', tags: ['Client Management', 'Freelancing', 'Communication', 'Business', 'Relationships'], reading_time: 9, date: '2026-02-25', author: 'PixabAnimation Team' },
  { id: 30, slug: 'building-personal-brand-designer', title: 'Building a Personal Brand as a Designer: Stand Out in 2026', excerpt: 'Stand out as a designer by defining your niche, creating consistent messaging, and authentic branding.', cover: 'building-personal-brand-designer', category: 'Career', tags: ['Personal Branding', 'Design Career', 'Marketing', 'Niche', 'Creative Business'], reading_time: 8, date: '2026-02-26', author: 'PixabAnimation Team' },
  { id: 31, slug: 'marketing-motion-design-business', title: 'Marketing Your Motion Design Business: A Comprehensive Guide', excerpt: 'Social media, content marketing, networking, and referral strategies for motion designers.', cover: 'marketing-motion-design-business', category: 'Freelancing', tags: ['Marketing', 'Motion Design', 'Social Media', 'Content Marketing', 'Business'], reading_time: 9, date: '2026-02-27', author: 'PixabAnimation Team' },
  { id: 32, slug: 'neural-networks-image-processing', title: 'Neural Networks in Image Processing: A Creative\'s Guide', excerpt: 'Super-resolution, style transfer, denoising, and AI-powered editing tools for creatives.', cover: 'neural-networks-image-processing', category: 'Technology', tags: ['Neural Networks', 'Image Processing', 'AI', 'Deep Learning', 'Style Transfer', 'Super-Resolution'], reading_time: 8, date: '2026-02-28', author: 'PixabAnimation Team' },
  { id: 33, slug: 'ai-powered-voice-synthesis-video', title: 'AI-Powered Voice Synthesis for Video: The Complete Guide', excerpt: 'Text-to-speech, voice cloning, and AI voiceover tools transforming video production.', cover: 'ai-powered-voice-synthesis-video', category: 'AI', tags: ['AI Voice', 'Voice Synthesis', 'Text-to-Speech', 'Video Production', 'Voice Cloning'], reading_time: 9, date: '2026-03-01', author: 'PixabAnimation Team' },
  { id: 34, slug: 'ai-assistants-for-designers', title: 'AI Assistants for Designers: Your Creative Copilot in 2026', excerpt: 'How AI assistants are transforming design workflows from ideation to production.', cover: 'ai-assistants-for-designers', category: 'AI', tags: ['AI Assistants', 'Design', 'Creative Tools', 'AI', 'Workflow'], reading_time: 8, date: '2026-03-02', author: 'PixabAnimation Team' },
  { id: 35, slug: 'computer-vision-animation', title: 'Computer Vision Applications in Animation', excerpt: 'Markerless motion capture, facial tracking, and gesture recognition for animation workflows.', cover: 'computer-vision-animation', category: 'Technology', tags: ['Computer Vision', 'Animation', 'Motion Capture', 'Facial Tracking', 'AI', 'VFX'], reading_time: 8, date: '2026-03-03', author: 'PixabAnimation Team' },
  { id: 36, slug: 'ai-driven-personalization-digital-media', title: 'AI-Driven Personalization in Digital Media: The Future of Content', excerpt: 'How machine learning creates personalized content experiences for audiences at scale.', cover: 'ai-driven-personalization-digital-media', category: 'AI', tags: ['AI Personalization', 'Digital Media', 'Machine Learning', 'Content', 'Personalization'], reading_time: 8, date: '2026-03-04', author: 'PixabAnimation Team' },
  { id: 37, slug: 'understanding-diffusion-models', title: 'Understanding Diffusion Models: The Technology Behind AI Image Generation', excerpt: 'The technology behind Stable Diffusion, DALL-E, Midjourney, and AI image generation explained.', cover: 'understanding-diffusion-models', category: 'AI', tags: ['Diffusion Models', 'AI Image Generation', 'Stable Diffusion', 'DALL-E', 'Midjourney', 'Deep Learning'], reading_time: 9, date: '2026-03-05', author: 'PixabAnimation Team' },
  { id: 38, slug: 'remote-collaboration-creative-teams', title: 'Remote Collaboration for Creative Teams: Workflows and Best Practices', excerpt: 'Tools, workflows, and best practices for motion design teams working remotely.', cover: 'remote-collaboration-creative-teams', category: 'Career', tags: ['Remote Work', 'Collaboration', 'Creative Teams', 'Workflow', 'Team Management'], reading_time: 8, date: '2026-03-06', author: 'PixabAnimation Team' },
  { id: 39, slug: 'motion-graphics-stock-video-resources', title: 'Best Motion Graphics Stock Video Resources in 2026', excerpt: 'Best platforms for motion backgrounds, animated templates, and stock footage in 2026.', cover: 'motion-graphics-stock-video-resources', category: 'Resources', tags: ['Stock Video', 'Motion Graphics', 'Resources', 'Stock Footage', 'Templates'], reading_time: 8, date: '2026-03-07', author: 'PixabAnimation Team' },
  { id: 40, slug: 'building-interactive-data-visualizations', title: 'Building Interactive Data Visualizations: A Developer\'s Guide', excerpt: 'Build engaging interactive data experiences with D3.js, animation, and performance optimization.', cover: 'building-interactive-data-visualizations', category: 'Web', tags: ['Data Visualization', 'D3.js', 'Interactive', 'Web Development', 'Animation', 'Charts'], reading_time: 9, date: '2026-03-08', author: 'PixabAnimation Team' }
];

// Compute categories and tags for sidebar
function getCategories() {
  const map = {};
  BLOG_DATA.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ category: k, count: v }));
}

function getTags(limit = 20) {
  const map = {};
  BLOG_DATA.forEach(p => (p.tags || []).forEach(t => { map[t] = (map[t] || 0) + 1; }));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, v]) => ({ tag: k, count: v }));
}

function getRecent(limit = 5) {
  return [...BLOG_DATA].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

const categories = getCategories();
const tags = getTags(20);
const recentPosts = getRecent(5);
const featuredPosts = BLOG_DATA.filter(p => p.featured);
const allTags = BLOG_DATA.reduce((acc, p) => { (p.tags || []).forEach(t => { if (!acc.includes(t)) acc.push(t); }); return acc; }, []);

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function escAttr(s) {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
}

const COVER_BASE = 'https://pixabanimation.github.io/assets/images/blog';

// Build the HTML
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PixabAnimation Blog — Motion Graphics, AI & Design Insights</title>
  <meta name="description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI in design, animation, typography, freelancing, and creative technology. 40+ articles from industry professionals.">
  <meta name="keywords" content="motion graphics, blog, animation, AI, design, typography, freelancing, After Effects, tutorials, creative insights">
  <meta name="author" content="PixabAnimation">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/blog/">

  <!-- Open Graph -->
  <meta property="og:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta property="og:description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI in design, animation, typography, freelancing, and creative technology.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/blog/">
  <meta property="og:image" content="${BASE_URL}/assets/pixabanimation-logo.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="PixabAnimation">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta name="twitter:description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI, design, and animation.">
  <meta name="twitter:image" content="${BASE_URL}/assets/pixabanimation-logo.png">

  <!-- Theme & Icons -->
  <meta name="theme-color" content="#ffffff">
  <meta name="msapplication-TileColor" content="#0066cc">
  <link rel="icon" type="image/png" href="${BASE_URL}/assets/pixabanimation-logo.png" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${BASE_URL}/assets/pixabanimation-logo.png" sizes="180x180">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="blog.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${BASE_URL}/blog/" }
    ]
  }
  </script>

  <!-- JSON-LD: ItemList (blog articles) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PixabAnimation Blog Articles",
    "description": "Expert tutorials, creative insights, and industry trends on motion graphics, AI, design, and animation.",
    "url": "${BASE_URL}/blog/",
    "numberOfItems": ${BLOG_DATA.length},
    "itemListElement": [
${BLOG_DATA.map((p, i) => `      {
        "@type": "ListItem",
        "position": ${i + 1},
        "url": "${BASE_URL}/blog/${p.slug}.html"
      }`).join(',\n')}
    ]
  }
  </script>

  <!-- JSON-LD: BlogPosting index (Organization) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PixabAnimation",
    "url": "${BASE_URL}/",
    "logo": "${BASE_URL}/assets/pixabanimation-logo.png",
    "description": "Premium marketplace for motion graphics, animation assets, and creative tools for creators worldwide.",
    "sameAs": [
      "https://facebook.com/pixabanimation",
      "https://twitter.com/pixabanimation",
      "https://instagram.com/pixabanimation",
      "https://pinterest.com/pixabanimation"
    ]
  }
  </script>

  <style>
    /* Blog listing page specific styles */
    .blog-hero { background: linear-gradient(135deg, #0066cc 0%, #2997ff 100%); color: #fff; padding: 60px 24px 48px; text-align: center; }
    .blog-hero h1 { font-size: 2.2rem; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.03em; }
    .blog-hero p { font-size: 1.05rem; opacity: 0.85; margin: 0; max-width: 600px; margin-left: auto; margin-right: auto; }
    .blog-listing-wrapper { max-width: 1200px; margin: 0 auto; padding: 32px 24px 48px; }
    .blog-listing-layout { display: grid; grid-template-columns: 1fr 300px; gap: 48px; align-items: start; }
    @media (max-width: 900px) { .blog-listing-layout { grid-template-columns: 1fr; } }
    .blog-posts-section h2 { font-size: 1.3rem; font-weight: 700; margin: 0 0 24px; color: #1d1d1f; }
    .blog-posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .blog-post-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; display: block; transition: all 0.25s ease; }
    .blog-post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); border-color: rgba(0,102,204,0.15); }
    .blog-post-card-img { width: 100%; height: 180px; object-fit: cover; background: #f5f5f7; }
    .blog-post-card-body { padding: 16px 20px 20px; }
    .blog-post-card-category { display: inline-block; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #0066cc; margin-bottom: 6px; }
    .blog-post-card-title { font-size: 1rem; font-weight: 700; line-height: 1.4; margin: 0 0 8px; color: #1d1d1f; }
    .blog-post-card:hover .blog-post-card-title { color: #0066cc; }
    .blog-post-card-excerpt { font-size: 0.85rem; color: rgba(0,0,0,0.55); line-height: 1.5; margin: 0 0 12px; }
    .blog-post-card-meta { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: rgba(0,0,0,0.4); flex-wrap: wrap; }
    .blog-post-card-meta span { display: flex; align-items: center; gap: 4px; }
    .blog-post-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(0,0,0,0.2); }

    /* Sidebar */
    .blog-sidebar { position: sticky; top: 80px; }
    @media (max-width: 900px) { .blog-sidebar { position: static; margin-top: 32px; } }
    .sidebar-widget { background: #fafafa; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    .sidebar-widget h3 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(0,0,0,0.4); margin: 0 0 14px; }
    .sidebar-post { display: flex; align-items: center; gap: 12px; padding: 8px 0; text-decoration: none; color: inherit; border-bottom: 1px solid rgba(0,0,0,0.04); transition: all 0.2s; }
    .sidebar-post:last-child { border-bottom: none; }
    .sidebar-post:hover { opacity: 0.7; }
    .sidebar-post-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #f0f0f0, #e8e8e8); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .sidebar-post-info { flex: 1; min-width: 0; }
    .sidebar-post-title { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar-post-date { font-size: 0.75rem; color: rgba(0,0,0,0.4); margin-top: 2px; }
    .sidebar-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .sidebar-tag { display: inline-block; padding: 4px 10px; background: rgba(0,102,204,0.06); border: 1px solid rgba(0,102,204,0.1); border-radius: 9999px; font-size: 0.75rem; color: #0066cc; text-decoration: none; transition: all 0.2s; }
    .sidebar-tag:hover { background: rgba(0,102,204,0.12); }
    .sidebar-category { display: flex; justify-content: space-between; padding: 7px 0; text-decoration: none; color: inherit; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 0.85rem; transition: all 0.2s; }
    .sidebar-category:hover { color: #0066cc; }
    .sidebar-category:last-child { border-bottom: none; }
    .sidebar-category-count { color: rgba(0,0,0,0.3); font-size: 0.8rem; }

    /* Featured section */
    .blog-featured-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
    @media (max-width: 700px) { .blog-featured-grid { grid-template-columns: 1fr; } }
    .blog-featured-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; display: block; transition: all 0.25s ease; position: relative; }
    .blog-featured-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
    .blog-featured-img { width: 100%; height: 140px; object-fit: cover; background: #f5f5f7; }
    .blog-featured-body { padding: 14px 16px 16px; }
    .blog-featured-tag { display: inline-block; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #0066cc; margin-bottom: 4px; }
    .blog-featured-title { font-size: 0.9rem; font-weight: 700; line-height: 1.35; margin: 0 0 4px; color: #1d1d1f; }
    .blog-featured-card:hover .blog-featured-title { color: #0066cc; }
    .blog-featured-date { font-size: 0.75rem; color: rgba(0,0,0,0.4); }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav class="blog-navbar" id="blogNavbar">
    <div class="blog-nav-container">
      <a href="${BASE_URL}/" class="blog-nav-brand">
        <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation">
        PixabAnimation
      </a>
      <button class="blog-nav-toggle" onclick="document.getElementById('blogNavLinks').classList.toggle('open')" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="blog-nav-links" id="blogNavLinks">
        <li><a href="${BASE_URL}/">Home</a></li>
        <li><a href="${BASE_URL}/#/shop">Shop</a></li>
        <li><a href="${BASE_URL}/#/shop?category=videos">Videos</a></li>
        <li><a href="${BASE_URL}/#/about">About</a></li>
        <li><a href="${BASE_URL}/#/contact">Contact</a></li>
        <li><a href="index.html">Blog</a></li>
      </ul>
      <div class="blog-nav-actions">
        <a href="${BASE_URL}/#/shop"><i class="fas fa-store"></i></a>
        <a href="${BASE_URL}/#/cart"><i class="fas fa-shopping-bag"></i></a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="blog-hero">
    <h1>PixabAnimation Blog</h1>
    <p>Expert tutorials, creative insights, and industry trends on motion graphics, AI, design, and animation.</p>
  </section>

  <div class="blog-listing-wrapper">
    <div class="blog-listing-layout">
      <div class="blog-posts-section">

        <!-- Featured Posts -->
        <h2>Featured Articles</h2>
        <div class="blog-featured-grid">
${featuredPosts.map(p => `          <a href="${p.slug}.html" class="blog-featured-card">
            <img class="blog-featured-img" src="${COVER_BASE}/${p.cover}.png" alt="${escAttr(p.title)}" loading="lazy">
            <div class="blog-featured-body">
              <div class="blog-featured-tag">${esc(p.category)}</div>
              <div class="blog-featured-title">${esc(p.title)}</div>
              <div class="blog-featured-date">${esc(new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))}</div>
            </div>
          </a>`).join('\n')}
        </div>

        <!-- All Posts -->
        <h2>All Articles (${BLOG_DATA.length})</h2>
        <div class="blog-posts-grid">
${BLOG_DATA.map(p => `          <a href="${p.slug}.html" class="blog-post-card">
            <img class="blog-post-card-img" src="${COVER_BASE}/${p.cover}.png" alt="${escAttr(p.title)}" loading="lazy">
            <div class="blog-post-card-body">
              <div class="blog-post-card-category">${esc(p.category)}</div>
              <div class="blog-post-card-title">${esc(p.title)}</div>
              <div class="blog-post-card-excerpt">${esc(p.excerpt)}</div>
              <div class="blog-post-card-meta">
                <span>📅 ${esc(new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))}</span>
                <span class="dot"></span>
                <span>📖 ${p.reading_time} min read</span>
                <span class="dot"></span>
                <span>✍️ ${esc(p.author)}</span>
              </div>
            </div>
          </a>`).join('\n')}
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="blog-sidebar">

        <!-- Recent Posts -->
        <div class="sidebar-widget">
          <h3>Recent Posts</h3>
${recentPosts.map(p => `          <a href="${p.slug}.html" class="sidebar-post">
            <div class="sidebar-post-icon">📄</div>
            <div class="sidebar-post-info">
              <div class="sidebar-post-title">${esc(p.title)}</div>
              <div class="sidebar-post-date">${esc(new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))}</div>
            </div>
          </a>`).join('\n')}
        </div>

        <!-- Categories -->
        <div class="sidebar-widget">
          <h3>Categories</h3>
${categories.map(c => `          <a href="${BASE_URL}/#/blog" class="sidebar-category">
            <span>${esc(c.category)}</span>
            <span class="sidebar-category-count">${c.count}</span>
          </a>`).join('\n')}
        </div>

        <!-- Popular Tags -->
        <div class="sidebar-widget">
          <h3>Popular Tags</h3>
          <div class="sidebar-tags">
${tags.map(t => `            <a href="${BASE_URL}/#/blog" class="sidebar-tag">${esc(t.tag)}</a>`).join('\n')}
          </div>
        </div>

        <!-- Top Authors -->
        <div class="sidebar-widget">
          <h3>Top Authors</h3>
          <div class="sidebar-post">
            <div class="sidebar-post-icon" style="background:linear-gradient(135deg,#0066cc,#2997ff);color:#fff">P</div>
            <div class="sidebar-post-info">
              <div class="sidebar-post-title">PixabAnimation</div>
              <div class="sidebar-post-date">Content Creator</div>
            </div>
          </div>
          <div class="sidebar-post">
            <div class="sidebar-post-icon" style="background:linear-gradient(135deg,#5856d6,#af52de);color:#fff">S</div>
            <div class="sidebar-post-info">
              <div class="sidebar-post-title">SPurno</div>
              <div class="sidebar-post-date">Motion Design Expert</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <!-- Back to Top / Home -->
  <div style="text-align:center;padding:0 24px 40px">
    <a href="${BASE_URL}/" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#0066cc;color:#fff;border-radius:9999px;font-size:0.9rem;font-weight:600;text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='#0071e3';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#0066cc';this.style.transform='none'">
      <i class="fas fa-home"></i> Return to Homepage
    </a>
  </div>

  <!-- Footer -->
  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <div class="name"><img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="" style="width:24px;height:20px"> PixabAnimation</div>
          <div class="desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</div>
          <div class="blog-footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="blog-footer-col">
          <h4>Shop</h4>
          <a href="${BASE_URL}/#/shop">All Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos">Animation &amp; Video</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">After Effects Plugins</a>
        </div>
        <div class="blog-footer-col">
          <h4>Categories</h4>
          <a href="${BASE_URL}/#/shop?category=videos">Motion Graphics</a>
          <a href="${BASE_URL}/#/shop?category=green-screen-mockup">Green Screen</a>
          <a href="${BASE_URL}/#/shop">View All</a>
        </div>
        <div class="blog-footer-col">
          <h4>Support</h4>
          <a href="${BASE_URL}/#/contact">Contact Us</a>
          <a href="${BASE_URL}/#/about">About Us</a>
          <a href="index.html">Blog</a>
          <a href="${BASE_URL}/#/privacy-policy">Privacy</a>
        </div>
        <div class="blog-footer-col blog-footer-col-newsletter">
          <h4>Stay in the Loop</h4>
          <p class="blog-footer-newsletter-text">Get early access to new releases, exclusive discounts, and creative inspiration.</p>
          <form class="blog-footer-newsletter-form" action="${BASE_URL}/" method="get">
            <input type="email" placeholder="Enter your email" required>
            <button type="submit" aria-label="Subscribe"><i class="fas fa-arrow-right"></i></button>
          </form>
          <p class="blog-footer-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
      <div class="blog-footer-bottom">
        <div class="blog-footer-bottom-links">
          <a href="${BASE_URL}/#/privacy-policy">Privacy</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/refund-policy">Refunds</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/terms-of-use">Terms</a>
          <span style="color:rgba(255,255,255,.3)">·</span>
          <a href="${BASE_URL}/#/contact">Support</a>
        </div>
        <p class="blog-footer-bottom-copy">&copy; 2026 PixabAnimation &amp; SPurno. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14" style="flex-shrink:0"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
        </div>
      </div>
    </div>
  </footer>

  <script>
    window.addEventListener('scroll', () => {
      document.getElementById('blogNavbar').classList.toggle('scrolled', window.scrollY > 50);
    });
  </script>
</body>
</html>`;

// Write the file
writeFileSync(outputPath, html, 'utf-8');
console.log(`✅ Generated blog/index.html (${(html.length / 1024).toFixed(1)} KB, ${BLOG_DATA.length} articles)`);
