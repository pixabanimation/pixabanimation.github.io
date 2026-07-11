#!/usr/bin/env node
/**
 * generate-blog-index.mjs
 *
 * Generates a premium static blog/index.html listing all 40 blog posts
 * with Apple/Medium-inspired design, SEO meta tags, structured data.
 *
 * Usage: node tools/generate-blog-index.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');
const outputPath = join(blogDir, 'index.html');

const BASE_URL = 'https://pixabanimation.github.io';
const COVER_BASE = `${BASE_URL}/assets/images/blog`;
const LOGO_URL = `${BASE_URL}/assets/pixabanimation-logo.png`;

// ─── Blog Data ───────────────────────────────────────────────────────────────
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
  { id: 40, slug: 'building-interactive-data-visualizations', title: 'Building Interactive Data Visualizations: A Developer\'s Guide', excerpt: 'Build engaging interactive data experiences with D3.js, animation, and performance optimization.', cover: 'building-interactive-data-visualizations', category: 'Web', tags: ['Data Visualization', 'D3.js', 'Interactive', 'Web Development', 'Animation', 'Charts'], reading_time: 9, date: '2026-03-08', author: 'PixabAnimation Team' },
  // ── Tech Reviews (IDs 41-65) ──
  { id: 41, slug: 'samsung-galaxy-s25-ultra-review-2025', featured: 1, title: 'Samsung Galaxy S25 Ultra Review: The Ultimate Flagship Phone of 2025', excerpt: 'Samsung Galaxy S25 Ultra full specifications: 200MP camera, Snapdragon 8 Elite, 6.9-inch Dynamic AMOLED 2X display, 5000mAh battery, titanium frame. Complete GSMArena-style review with benchmarks, camera samples, and pricing.', cover: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80', category: 'Mobile Phone', tags: ['Samsung Galaxy S25 Ultra', 'Flagship Phone 2025', 'Samsung Galaxy', '200MP Camera', 'Snapdragon 8 Elite', 'Galaxy AI', 'Titanium Frame'], reading_time: 14, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 42, slug: 'samsung-galaxy-s25-s25-plus-review', featured: 0, title: 'Samsung Galaxy S25 and S25+ Review: Premium Performance Without Compromise', excerpt: 'Samsung Galaxy S25 and S25+ complete specs: Snapdragon 8 Elite, 50MP cameras, 120Hz AMOLED, Galaxy AI features. Detailed comparison review with pricing.', cover: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', category: 'Mobile Phone', tags: ['Samsung Galaxy S25', 'Samsung Galaxy S25+', 'Snapdragon 8 Elite', 'Galaxy AI', 'Flagship Phone', 'Compact Flagship'], reading_time: 12, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 43, slug: 'samsung-galaxy-s25-edge-specs', featured: 0, title: 'Samsung Galaxy S25 Edge: The Thinnest Galaxy Phone Ever — Complete Review', excerpt: 'Samsung Galaxy S25 Edge complete specs: 5.8mm ultra-slim profile, Snapdragon 8 Elite, 6.6-inch 120Hz AMOLED, 50MP+12MP camera, titanium alloy frame, 3,900mAh battery, 25W charging.', cover: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', category: 'Mobile Phone', tags: ['Samsung Galaxy S25 Edge', 'Ultra-Slim Phone', 'Samsung Galaxy', 'Thin Smartphone', 'Design'], reading_time: 9, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 44, slug: 'apple-iphone-17-pro-max-specs-features', featured: 1, title: 'Apple iPhone 17 Pro Max: Complete Specifications and In-Depth Review', excerpt: 'Apple iPhone 17 Pro Max full specs: A19 Pro chip, 6.9-inch ProMotion OLED, 48MP triple camera system, Apple Intelligence, titanium design. Complete benchmarks and pricing.', cover: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80', category: 'Mobile Phone', tags: ['iPhone 17 Pro Max', 'Apple iPhone 2025', 'A19 Pro Chip', '48MP Triple Camera', 'Apple Intelligence', 'Titanium Design'], reading_time: 14, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 45, slug: 'apple-iphone-17-iphone-17-air-review', featured: 0, title: 'Apple iPhone 17 and iPhone 17 Air: ProMotion for Everyone — Complete Review', excerpt: 'iPhone 17 and iPhone 17 Air complete specs: A19 chip, 120Hz ProMotion on base model, 6.3-inch display, ultra-slim 6.5-inch design (17 Air), 48MP dual cameras, Apple Intelligence, $899 starting price.', cover: 'https://images.unsplash.com/photo-1574755393849-623942b9352c?w=800&q=80', category: 'Mobile Phone', tags: ['iPhone 17', 'iPhone 17 Air', 'Apple iPhone', 'A19 Chip', 'ProMotion', 'Apple Intelligence'], reading_time: 9, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 46, slug: 'google-pixel-10-pro-specs-ai-features', featured: 0, title: 'Google Pixel 10 Pro Review: The AI Photography Champion of 2025', excerpt: 'Google Pixel 10 Pro full specs: Tensor G5 chip, 50MP main camera, 48MP periscope telephoto, 16GB RAM, 4870mAh battery, Android 16, 7 years of updates.', cover: 'https://images.unsplash.com/photo-1635870723802-e88d76ae5b8e?w=800&q=80', category: 'Mobile Phone', tags: ['Google Pixel 10 Pro', 'Tensor G5', 'Pixel Camera', 'Android 16', 'AI Photography', 'Best Camera Phone'], reading_time: 12, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 47, slug: 'google-pixel-10-specs-price', featured: 0, title: 'Google Pixel 10: Best Value AI Phone of 2025 — Complete Review', excerpt: 'Google Pixel 10 full specs: Tensor G5 chip, 6.3-inch 120Hz OLED, 48MP main camera, 13MP ultrawide, 4,950mAh battery, 30W charging, 7 years of updates, $799 starting price.', cover: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&q=80', category: 'Mobile Phone', tags: ['Google Pixel 10', 'Tensor G5', 'Pixel Camera', 'Android 16', 'Best Value Phone', 'AI Phone'], reading_time: 9, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 48, slug: 'oneplus-13-review-specs-battery', featured: 1, title: 'OnePlus 13 Review: The 6,000mAh Battery and 100W Charging Champion', excerpt: 'OnePlus 13 full specs: 6,000mAh silicon-carbon battery, 100W SUPERVOOC, Snapdragon 8 Elite, triple 50MP Hasselblad cameras, 6.82-inch 120Hz AMOLED, IP69 rating.', cover: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80', category: 'Mobile Phone', tags: ['OnePlus 13', '6000mAh Battery', '100W Charging', 'Snapdragon 8 Elite', 'Hasselblad Camera', 'IP69'], reading_time: 12, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 49, slug: 'xiaomi-15-ultra-camera-specs-review', featured: 0, title: 'Xiaomi 15 Ultra Review: The 200MP Periscope Camera King', excerpt: 'Xiaomi 15 Ultra full specs: 200MP periscope telephoto, 1-inch 50MP main sensor, Leica Summilux optics, Snapdragon 8 Elite, 90W charging, 5410mAh battery.', cover: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&q=80', category: 'Mobile Phone', tags: ['Xiaomi 15 Ultra', '200MP Camera', 'Leica Camera', 'Snapdragon 8 Elite', 'Smartphone Photography'], reading_time: 11, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 50, slug: 'nothing-phone-3-specs-design', featured: 0, title: 'Nothing Phone (3): Transparent Design Meets True Flagship Power', excerpt: 'Nothing Phone (3) complete specs: flagship chipset, 6.7-inch LTPO OLED 120Hz, dual 50MP cameras, enhanced Glyph Interface, Nothing OS 3.0, 12GB RAM, 256GB storage.', cover: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80', category: 'Mobile Phone', tags: ['Nothing Phone 3', 'Nothing', 'Transparent Design', 'Glyph Interface', 'Flagship Phone', 'Nothing OS'], reading_time: 8, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 51, slug: 'motorola-edge-50-ultra-specs-review', featured: 0, title: 'Motorola Edge 50 Ultra: The Underrated Flagship of 2025 — Complete Review', excerpt: 'Motorola Edge 50 Ultra complete specs: Snapdragon 8 Elite, 200MP camera, 6.7-inch pOLED 144Hz, 125W TurboPower charging, 4,500mAh battery, clean Android 15, IP68.', cover: 'https://images.unsplash.com/photo-1586056141965-2f1ce5cd7aaa?w=800&q=80', category: 'Mobile Phone', tags: ['Motorola Edge 50 Ultra', 'Motorola', 'Flagship Phone', '200MP Camera', 'Clean Android', '125W Charging'], reading_time: 8, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 52, slug: 'ipad-pro-m5-2025-specs-features', featured: 1, title: 'iPad Pro M5 (2025): The Ultimate Creative and Professional Tablet', excerpt: 'iPad Pro M5 full specs: M5 chip with up to 16-core CPU/40-core GPU, Tandem OLED display (1600 nits peak), Thunderbolt 5, Apple Pencil Pro, Wi-Fi 7, up to 2TB storage.', cover: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', category: 'Tablet', tags: ['iPad Pro M5', 'Apple M5 Chip', 'Tandem OLED', 'Creative Tablet', 'Apple Intelligence', 'Professional Tablet'], reading_time: 11, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 53, slug: 'ipad-air-7th-gen-2025-specs', featured: 0, title: 'iPad Air 7th Gen (2025): Pro Power at a Better Price', excerpt: 'The 7th generation iPad Air brings the M4 chip, Liquid Retina display, Apple Pencil Pro support, and all-day battery life at a more accessible price point.', cover: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', category: 'Tablet', tags: ['iPad Air 7', 'Apple iPad 2025', 'M4 Chip', 'Mid-Range Tablet', 'Apple Pencil', 'iPad Air Review', 'Best Tablet 2025'], reading_time: 7, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 54, slug: 'samsung-galaxy-tab-s10-ultra-specs', featured: 0, title: 'Samsung Galaxy Tab S10 Ultra: The Ultimate Android Productivity Tablet', excerpt: 'Galaxy Tab S10 Ultra full specs: 14.6-inch Dynamic AMOLED 2X 120Hz, MediaTek Dimensity 9300+, 16GB RAM, 1TB storage, S Pen with Bluetooth, IP68, 11,200mAh battery, 5.4mm ultra-slim design.', cover: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', category: 'Tablet', tags: ['Galaxy Tab S10 Ultra', 'Samsung Tablet', 'AMOLED', 'S Pen', 'DeX Mode', 'Android Tablet'], reading_time: 11, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 55, slug: 'samsung-galaxy-tab-s10-plus-review', featured: 0, title: 'Samsung Galaxy Tab S10+ Review: Premium Android Tablet Sweet Spot', excerpt: 'Samsung Galaxy Tab S10+ offers a 12.4-inch Dynamic AMOLED 2X display, powerful processor, S Pen support, IP68 rating, and all-day battery life at a better price than the Ultra.', cover: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', category: 'Tablet', tags: ['Samsung Galaxy Tab S10+', 'Samsung Tablet', 'Android Tablet', 'AMOLED Display', 'S Pen', 'Mid-Range Premium Tablet', 'Tablet Review'], reading_time: 7, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 56, slug: 'macbook-air-m4-2025-review-specs', featured: 1, title: 'MacBook Air M4 (2025): Apple Intelligence for Everyone — Complete Review', excerpt: 'MacBook Air M4 full specs: M4 chip (10-core CPU/GPU), 16GB unified memory standard, 13.6-inch Liquid Retina display, 18-hour battery, 1.24kg weight, fanless design.', cover: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', category: 'Laptop', tags: ['MacBook Air M4', 'Apple Laptop', 'M4 Chip', 'Ultrabook', 'Apple Intelligence', 'Laptop Review'], reading_time: 11, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 57, slug: 'macbook-pro-m4-pro-max-specs-review', featured: 0, title: 'MacBook Pro M4 Pro and M4 Max: Professional Power Redefined', excerpt: 'MacBook Pro M4 Pro/Max full specs: Up to 16-core CPU, 40-core GPU, 128GB unified memory, 546 GB/s memory bandwidth, Liquid Retina XDR mini-LED, Thunderbolt 5, up to 22-hour battery.', cover: 'https://images.unsplash.com/photo-1611186871348-b1f696febbb3?w=800&q=80', category: 'Laptop', tags: ['MacBook Pro M4', 'M4 Pro', 'M4 Max', 'Professional Laptop', 'Creative Workstation', 'Apple'], reading_time: 12, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 58, slug: 'dell-xps-14-16-2025-review-specs', featured: 0, title: 'Dell XPS 14 and XPS 16 (2025): Premium Design Meets AI PC Performance', excerpt: 'Dell XPS 14 and XPS 16 full specs: Intel Core Ultra Series 2, NVIDIA RTX 50-series graphics, 14.5-inch/16.3-inch OLED options, CNC aluminum chassis, Copilot+ AI features.', cover: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80', category: 'Laptop', tags: ['Dell XPS 14', 'Dell XPS 16', 'Intel Core Ultra', 'NVIDIA RTX 50-Series', 'AI PC', 'Premium Laptop'], reading_time: 10, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 59, slug: 'microsoft-surface-pro-11-review-specs', featured: 0, title: 'Microsoft Surface Pro 11: The Ultimate Windows 2-in-1 with Snapdragon X Elite', excerpt: 'Surface Pro 11 full specs: Snapdragon X Elite/X Plus, 13-inch PixelSense Flow 120Hz, Copilot+ AI features, up to 32GB RAM, 1TB removable SSD, 14-hour battery, 895g weight.', cover: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&q=80', category: 'Laptop', tags: ['Surface Pro 11', 'Snapdragon X Elite', 'Copilot+ PC', 'Windows 2-in-1', 'ARM Laptop', 'Microsoft'], reading_time: 10, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 60, slug: 'microsoft-surface-laptop-7-specs', featured: 0, title: 'Microsoft Surface Laptop 7: The Sleek Copilot+ PC', excerpt: 'Surface Laptop 7 features Snapdragon X Elite processor, 13.8-inch PixelSense display, Copilot+ AI integration, premium aluminum design, and exceptional battery life.', cover: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80', category: 'Laptop', tags: ['Microsoft Surface Laptop 7', 'Surface Laptop', 'Snapdragon X Elite', 'Copilot+ PC', 'Windows Laptop', 'ARM Laptop', 'Premium Ultrabook'], reading_time: 7, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 61, slug: 'lenovo-thinkpad-x1-carbon-gen-13-review', featured: 0, title: 'Lenovo ThinkPad X1 Carbon Gen 13 Aura Edition: Business Laptop Excellence', excerpt: 'ThinkPad X1 Carbon Gen 13 Aura Edition: Intel Core Ultra, 14-inch OLED 2.8K, under 1.15kg, up to 64GB RAM, 2TB SSD, MIL-STD-810H certified, enterprise security.', cover: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', category: 'Laptop', tags: ['ThinkPad X1 Carbon Gen 13', 'Lenovo', 'Business Laptop', 'Intel Core Ultra', 'Enterprise Laptop'], reading_time: 10, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 62, slug: 'asus-rog-zephyrus-g14-2025-gaming-laptop', featured: 0, title: 'ASUS ROG Zephyrus G14 (2025): The Ultimate Gaming Ultrabook', excerpt: 'ASUS ROG Zephyrus G14 full specs: AMD Ryzen AI 9 HX 370, NVIDIA RTX 5080, 14-inch 3K OLED 120Hz, 32GB RAM, 2TB SSD, magnesium-aluminum chassis, 1.5kg weight.', cover: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80', category: 'Laptop', tags: ['ASUS ROG Zephyrus G14', 'Gaming Laptop', 'AMD Ryzen AI', 'RTX 5080', 'OLED 120Hz', 'Gaming'], reading_time: 10, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 63, slug: 'razer-blade-16-2025-gaming-laptop', featured: 0, title: 'Razer Blade 16 (2025): The Premium Gaming Powerhouse', excerpt: 'Razer Blade 16 full specs: AMD Ryzen AI 9 HX 370, NVIDIA RTX 5090, 16-inch QHD+ OLED 240Hz, 64GB RAM, 8TB SSD, CNC aluminum unibody, vapor chamber cooling.', cover: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&q=80', category: 'Laptop', tags: ['Razer Blade 16', 'Gaming Laptop', 'AMD Ryzen AI', 'RTX 5090', 'Premium Gaming', 'CNC Aluminum'], reading_time: 10, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 64, slug: 'apple-watch-series-11-features-specs', featured: 0, title: 'Apple Watch Series 11: Health, Fitness, and Connectivity Evolved', excerpt: 'Apple Watch Series 11 full specs: Blood pressure monitoring, sleep apnea detection, S11 chip, 40% brighter always-on display, fast charging, watchOS 12, new health sensors.', cover: 'https://res.cloudinary.com/pzyegeqn/image/upload/v1783617148/gzouqbxffssxd9az340a.jpg', category: 'Wearable', tags: ['Apple Watch Series 11', 'Smartwatch', 'Health Tracking', 'Blood Pressure', 'Fitness', 'Wearable'], reading_time: 9, date: '2026-07-09', author: 'PixabAnimation Team' },
  { id: 65, slug: 'samsung-galaxy-watch-7-specs', featured: 0, title: 'Samsung Galaxy Watch 7: The Ultimate Android Smartwatch with 3nm Chip', excerpt: 'Samsung Galaxy Watch 7 full specs: 3nm Exynos W1000 chip, BioActive Sensor 2, Wear OS 5, 3,000 nits Super AMOLED display, 32GB storage, MIL-STD-810H, 40-hour battery life.', cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', category: 'Wearable', tags: ['Samsung Galaxy Watch 7', 'Samsung Smartwatch', 'Wear OS', 'Health Tracking', 'Exynos W1000', 'Android Watch'], reading_time: 9, date: '2026-07-09', author: 'PixabAnimation Team' }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function coverUrl(cover) {
  return cover.startsWith('http') ? cover : `${COVER_BASE}/${cover}.png`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escAttr(s) {
  return esc(s);
}
function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const featured = BLOG_DATA.filter(p => p.featured).sort((a, b) => new Date(b.date) - new Date(a.date));
const sortedAll = [...BLOG_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
const recentPosts = sortedAll.slice(0, 6);

const catMap = {};
BLOG_DATA.forEach(p => { if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1; });
const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ category: k, count: v }));

const tagCounts = {};
BLOG_DATA.forEach(p => (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, v]) => ({ tag: k, count: v }));

// Category colors for visual variety
const CAT_COLORS = {
  'AI': '#0066cc',
  'Web': '#5856d6',
  'Animation': '#34c759',
  'Design': '#ff9500',
  'Freelancing': '#ff2d55',
  'Technology': '#5ac8fa',
  'Career': '#af52de',
  'VFX': '#ff6482',
  'Typography': '#00c7be',
  'Tools': '#ff9f0a',
  'Resources': '#64d2ff',
  'Mobile Phone': '#34c759',
  'Laptop': '#007aff',
  'Tablet': '#5856d6',
  'Wearable': '#ff9f0a'
};

// ─── Build Premium HTML ──────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PixabAnimation Blog — Motion Graphics, AI & Design Insights (65+ Articles)</title>
  <meta name="description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI in design, animation, typography, freelancing, and creative technology.  65+ articles from industry professionals.">
  <meta name="keywords" content="motion graphics, blog, animation, AI, design, typography, freelancing, After Effects, tutorials, creative insights">
  <meta name="author" content="PixabAnimation">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${BASE_URL}/blog/">

  <!-- Open Graph -->
  <meta property="og:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta property="og:description" content="Expert tutorials, creative insights, and industry trends on motion graphics, AI, design, animation, tech reviews, and creative technology. 65+ articles.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/blog/">
  <meta property="og:image" content="${LOGO_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="PixabAnimation">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="PixabAnimation Blog — Motion Graphics, AI & Design Insights">
  <meta name="twitter:description" content="Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, and gadgets. 65+ articles.">
  <meta name="twitter:image" content="${LOGO_URL}">

  <!-- Theme & Icons -->
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" type="image/png" href="${LOGO_URL}" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${LOGO_URL}" sizes="180x180">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="blog.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

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
  <!-- JSON-LD: ItemList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PixabAnimation Blog Articles",
    "description": "Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, and gadgets.",
    "url": "${BASE_URL}/blog/",
    "numberOfItems": ${BLOG_DATA.length},
    "itemListElement": [
${BLOG_DATA.map((p, i) => `      { "@type": "ListItem", "position": ${i + 1}, "url": "${BASE_URL}/blog/${p.slug}.html" }`).join(',\n')}
    ]
  }
  </script>
  <!-- JSON-LD: Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PixabAnimation",
    "url": "${BASE_URL}/",
    "logo": "${LOGO_URL}",
    "description": "Premium marketplace for motion graphics, animation assets, and creative tools for creators worldwide.",
    "sameAs": ["https://facebook.com/pixabanimation","https://twitter.com/pixabanimation","https://instagram.com/pixabanimation","https://pinterest.com/pixabanimation"]
  }
  </script>

  <style>
    /* ═══════════════════════════════════════════════
       Premium Blog Listing — Apple/Medium-Inspired
       ═══════════════════════════════════════════════ */

    /* --- Hero Section --- */
    .pl-hero {
      position: relative;
      padding: 80px 24px 60px;
      text-align: center;
      overflow: hidden;
      background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
    }
    .pl-hero::before {
      content: '';
      position: absolute;
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(0,102,204,0.04) 0%, transparent 70%);
      top: -200px; right: -150px;
      pointer-events: none;
    }
    .pl-hero::after {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(41,151,255,0.03) 0%, transparent 70%);
      bottom: -150px; left: -120px;
      pointer-events: none;
    }
    .pl-hero-inner { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }
    .pl-hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; background: rgba(0,102,204,0.08);
      border-radius: 9999px; font-size: 0.8rem; font-weight: 600;
      color: #0066cc; margin-bottom: 24px; letter-spacing: 0.02em;
    }
    .pl-hero-title {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 3.2rem; font-weight: 800; line-height: 1.1;
      margin-bottom: 16px; letter-spacing: -0.03em;
      background: linear-gradient(135deg, #1d1d1f 0%, #0066cc 50%, #2997ff 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .pl-hero-desc {
      font-size: 1.1rem; color: rgba(0,0,0,0.5);
      line-height: 1.7; max-width: 560px; margin: 0 auto 32px;
    }
    .pl-hero-stats {
      display: flex; justify-content: center; gap: 48px;
      margin-top: 32px; padding-top: 28px;
      border-top: 1px solid rgba(0,0,0,0.06);
    }
    .pl-hero-stat { text-align: center; }
    .pl-hero-stat-num {
      font-size: 1.6rem; font-weight: 800;
      background: linear-gradient(135deg, #0066cc, #2997ff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .pl-hero-stat-label {
      font-size: 0.8rem; color: rgba(0,0,0,0.4);
      margin-top: 2px; font-weight: 500;
    }

    /* --- Search --- */
    .pl-search-wrap {
      max-width: 480px; margin: 0 auto;
      display: flex; align-items: center;
      background: #fff; border: 1px solid rgba(0,0,0,0.08);
      border-radius: 9999px; padding: 4px 20px;
      transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .pl-search-wrap:focus-within {
      border-color: #0066cc;
      box-shadow: 0 4px 16px rgba(0,102,204,0.12);
    }
    .pl-search-wrap i { color: rgba(0,0,0,0.25); font-size: 0.85rem; }
    .pl-search-wrap input {
      border: none; background: transparent;
      padding: 12px 12px; font-size: 0.9rem; outline: none; width: 100%;
    }
    .pl-search-wrap input:focus { box-shadow: none; }

    /* --- Wrapper & Layout --- */
    .pl-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .pl-layout { display: grid; grid-template-columns: 1fr 300px; gap: 48px; align-items: start; padding: 40px 0; }
    @media (max-width: 960px) { .pl-layout { grid-template-columns: 1fr; } }
    .pl-main { min-width: 0; }

    /* --- Category Bar --- */
    .pl-cat-bar {
      display: flex; gap: 8px; flex-wrap: wrap;
      margin-bottom: 36px; padding-bottom: 4px;
      overflow-x: auto; -webkit-overflow-scrolling: touch;
    }
    .pl-cat-bar::-webkit-scrollbar { height: 0; }
    .pl-cat-chip {
      padding: 7px 18px; border-radius: 9999px;
      background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06);
      font-size: 0.82rem; font-weight: 500; color: rgba(0,0,0,0.55);
      cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
      text-decoration: none; font-family: inherit; display: inline-block;
    }
    .pl-cat-chip:hover {
      background: rgba(0,102,204,0.06);
      border-color: rgba(0,102,204,0.2); color: #0066cc;
    }
    .pl-cat-chip.active {
      background: #0066cc; border-color: #0066cc; color: #fff; font-weight: 600;
    }
    .pl-cat-chip.all-chip { background: #1d1d1f; border-color: #1d1d1f; color: #fff; font-weight: 600; }

    /* --- Section Headers --- */
    .pl-section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .pl-section-header h2 {
      font-size: 1.2rem; font-weight: 700; color: #1d1d1f;
      letter-spacing: -0.02em;
    }
    .pl-section-count {
      font-size: 0.8rem; color: rgba(0,0,0,0.35);
      font-weight: 500;
    }

    /* --- Featured Grid (1 large + 2 small) --- */
    .pl-featured-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; margin-bottom: 48px;
    }
    .pl-feat-hero {
      grid-row: span 2; position: relative;
      border-radius: 16px; overflow: hidden; display: block;
      text-decoration: none; min-height: 400px;
    }
    .pl-feat-hero-img { width: 100%; height: 100%; position: absolute; inset: 0; }
    .pl-feat-hero-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .pl-feat-hero:hover .pl-feat-hero-img img { transform: scale(1.05); }
    .pl-feat-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%);
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 32px;
    }
    .pl-feat-hero-cat {
      display: inline-block; padding: 4px 12px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
      border-radius: 9999px; font-size: 0.7rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: #fff; width: fit-content; margin-bottom: 12px;
    }
    .pl-feat-hero-title {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 1.5rem; font-weight: 700; color: #fff;
      line-height: 1.25; margin-bottom: 8px; letter-spacing: -0.02em;
    }
    .pl-feat-hero-meta {
      display: flex; align-items: center; gap: 12px;
      font-size: 0.8rem; color: rgba(255,255,255,0.7);
    }
    .pl-feat-side { position: relative; border-radius: 14px; overflow: hidden; display: block; text-decoration: none; min-height: 190px; }
    .pl-feat-side-img { width: 100%; height: 100%; position: absolute; inset: 0; }
    .pl-feat-side-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .pl-feat-side:hover .pl-feat-side-img img { transform: scale(1.06); }
    .pl-feat-side-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 20px;
    }
    .pl-feat-side-cat {
      display: inline-block; padding: 3px 10px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
      border-radius: 9999px; font-size: 0.6rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.4px;
      color: #fff; width: fit-content; margin-bottom: 8px;
    }
    .pl-feat-side-title { font-size: 1rem; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 4px; }
    .pl-feat-side-date { font-size: 0.72rem; color: rgba(255,255,255,0.6); }

    /* --- Article Grid --- */
    .pl-articles-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 20px; margin-bottom: 40px;
    }
    @media (max-width: 1024px) { .pl-articles-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .pl-articles-grid { grid-template-columns: 1fr; } }
    .pl-card {
      background: #fff; border: 1px solid rgba(0,0,0,0.06);
      border-radius: 14px; overflow: hidden; transition: all 0.3s ease;
      display: block; text-decoration: none; color: inherit;
    }
    .pl-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      border-color: rgba(0,102,204,0.15);
    }
    .pl-card-img-wrap {
      position: relative; aspect-ratio: 16/10;
      overflow: hidden; background: #f5f5f7;
    }
    .pl-card-img-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .pl-card:hover .pl-card-img-wrap img { transform: scale(1.06); }
    .pl-card-cat-badge {
      position: absolute; top: 10px; left: 10px;
      padding: 3px 10px; border-radius: 9999px;
      font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.4px; color: #fff;
    }
    .pl-card-body { padding: 16px 18px 18px; }
    .pl-card-meta-line {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.72rem; color: rgba(0,0,0,0.4); margin-bottom: 6px;
    }
    .pl-card-title {
      font-size: 0.95rem; font-weight: 700; line-height: 1.35;
      margin-bottom: 6px; color: #1d1d1f;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pl-card:hover .pl-card-title { color: #0066cc; }
    .pl-card-excerpt {
      font-size: 0.8rem; color: rgba(0,0,0,0.5);
      line-height: 1.55; margin-bottom: 10px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pl-card-footer {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.72rem; color: rgba(0,0,0,0.35);
    }
    .pl-card-footer .dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(0,0,0,0.2); }

    /* --- Newsletter CTA --- */
    .pl-newsletter {
      background: linear-gradient(135deg, #0066cc 0%, #2997ff 100%);
      border-radius: 20px; padding: 48px; text-align: center;
      color: #fff; margin-bottom: 40px; position: relative; overflow: hidden;
    }
    .pl-newsletter::before {
      content: ''; position: absolute;
      width: 400px; height: 400px;
      background: rgba(255,255,255,0.04); border-radius: 50%;
      top: -120px; right: -80px; pointer-events: none;
    }
    .pl-newsletter::after {
      content: ''; position: absolute;
      width: 250px; height: 250px;
      background: rgba(255,255,255,0.03); border-radius: 50%;
      bottom: -60px; left: -60px; pointer-events: none;
    }
    .pl-newsletter-inner { position: relative; z-index: 1; max-width: 520px; margin: 0 auto; }
    .pl-newsletter h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
    .pl-newsletter p { font-size: 0.9rem; opacity: 0.85; margin-bottom: 20px; line-height: 1.6; }
    .pl-newsletter-form {
      display: flex; gap: 8px; max-width: 420px; margin: 0 auto;
    }
    .pl-newsletter-form input {
      flex: 1; padding: 12px 18px; border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.12); color: #fff;
      font-size: 0.85rem; outline: none; font-family: inherit;
    }
    .pl-newsletter-form input::placeholder { color: rgba(255,255,255,0.5); }
    .pl-newsletter-form input:focus { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }
    .pl-newsletter-form button {
      padding: 12px 24px; border-radius: 9999px;
      background: #fff; color: #0066cc; border: none;
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
      transition: all 0.25s ease; font-family: inherit; white-space: nowrap;
    }
    .pl-newsletter-form button:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .pl-newsletter-note { font-size: 0.72rem; opacity: 0.5; margin-top: 10px; }

    /* --- Premium Sidebar --- */
    .pl-sidebar { position: sticky; top: 80px; }
    @media (max-width: 960px) { .pl-sidebar { position: static; margin-top: 32px; } }
    .pl-sb-widget {
      background: #fff; border: 1px solid rgba(0,0,0,0.06);
      border-radius: 16px; padding: 22px; margin-bottom: 18px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
    }
    .pl-sb-widget-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.6px; color: rgba(0,0,0,0.35);
      margin-bottom: 16px; padding-bottom: 10px;
      border-bottom: 2px solid #0066cc;
    }
    .pl-sb-post {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; text-decoration: none; color: inherit;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      transition: opacity 0.2s;
    }
    .pl-sb-post:last-child { border-bottom: none; }
    .pl-sb-post:hover { opacity: 0.7; }
    .pl-sb-post-img {
      width: 44px; height: 44px; border-radius: 10px;
      object-fit: cover; flex-shrink: 0; background: #f0f0f0;
    }
    .pl-sb-post-info { flex: 1; min-width: 0; }
    .pl-sb-post-title {
      font-size: 0.82rem; font-weight: 600; color: #1d1d1f;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .pl-sb-post-date { font-size: 0.7rem; color: rgba(0,0,0,0.35); margin-top: 2px; }
    .pl-sb-cat {
      display: flex; justify-content: space-between; align-items: center;
      padding: 7px 0; text-decoration: none; color: inherit;
      border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 0.82rem;
      transition: color 0.2s;
    }
    .pl-sb-cat:last-child { border-bottom: none; }
    .pl-sb-cat:hover { color: #0066cc; }
    .pl-sb-cat-name { display: flex; align-items: center; gap: 8px; }
    .pl-sb-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .pl-sb-cat-count { color: rgba(0,0,0,0.25); font-size: 0.78rem; }
    .pl-sb-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .pl-sb-tag {
      display: inline-block; padding: 4px 10px;
      background: rgba(0,102,204,0.05); border: 1px solid rgba(0,102,204,0.08);
      border-radius: 9999px; font-size: 0.72rem; color: #0066cc;
      text-decoration: none; transition: all 0.2s;
    }
    .pl-sb-tag:hover { background: rgba(0,102,204,0.1); }
    .pl-sb-author {
      display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
    }
    .pl-sb-author:last-child { margin-bottom: 0; }
    .pl-sb-author-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .pl-sb-author-name { font-size: 0.85rem; font-weight: 600; color: #1d1d1f; }
    .pl-sb-author-role { font-size: 0.7rem; color: rgba(0,0,0,0.35); }

    /* --- Responsive --- */
    @media (max-width: 768px) {
      .pl-hero { padding: 60px 20px 40px; }
      .pl-hero-title { font-size: 2rem; }
      .pl-hero-desc { font-size: 0.95rem; }
      .pl-hero-stats { gap: 28px; flex-wrap: wrap; }
      .pl-featured-grid { grid-template-columns: 1fr; }
      .pl-feat-hero { grid-row: span 1; min-height: 280px; }
      .pl-feat-side { min-height: 160px; }
      .pl-feat-hero-title { font-size: 1.2rem; }
      .pl-newsletter { padding: 32px 20px; border-radius: 14px; }
      .pl-newsletter h3 { font-size: 1.2rem; }
      .pl-newsletter-form { flex-direction: column; }
      .pl-sb-widget { padding: 16px; }
    }
    @media (max-width: 480px) {
      .pl-hero-title { font-size: 1.5rem; }
      .pl-hero-stat-num { font-size: 1.2rem; }
      .pl-feat-hero { min-height: 220px; }
      .pl-feat-hero-overlay { padding: 20px; }
      .pl-feat-hero-title { font-size: 1rem; }
      .pl-card-body { padding: 12px 14px; }
    }

    /* --- Back to Top / Home --- */
    .pl-home-cta {
      text-align: center; padding: 0 24px 48px;
    }
    .pl-home-cta a {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; background: linear-gradient(135deg, #0066cc, #0071e3);
      color: #fff; border-radius: 9999px; font-size: 0.9rem;
      font-weight: 600; text-decoration: none; transition: all 0.25s ease;
    }
    .pl-home-cta a:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,102,204,0.3);
    }

    /* Mobile cat bar scroll */
    @media (max-width: 768px) {
      .pl-cat-bar { flex-wrap: nowrap; }
    }
  </style>
</head>
<body>

  <!-- ═══ Navigation ═══ -->
  <nav class="blog-navbar" id="blogNavbar">
    <div class="blog-nav-container">
      <a href="${BASE_URL}/" class="blog-nav-brand">
        <img src="${LOGO_URL}" alt="PixabAnimation"> PixabAnimation
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

  <!-- ═══ Hero ═══ -->
  <section class="pl-hero">
    <div class="pl-hero-inner">
      <div class="pl-hero-badge">
        <i class="fas fa-newspaper"></i> Latest Insights
      </div>
      <h1 class="pl-hero-title">PixabAnimation Blog</h1>
      <p class="pl-hero-desc">Expert tutorials, creative insights, industry trends, and tech reviews — motion graphics, AI, design, animation, gadgets, and more. 65+ articles.</p>
      <div class="pl-search-wrap">
        <i class="fas fa-search"></i>
        <input type="search" id="plSearchInput" placeholder="Search articles..." aria-label="Search blog posts" oninput="plFilterArticles(this.value)">
      </div>
      <div class="pl-hero-stats">
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${BLOG_DATA.length}+</div>
          <div class="pl-hero-stat-label">Articles</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${categories.length}</div>
          <div class="pl-hero-stat-label">Categories</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">${tags.length}</div>
          <div class="pl-hero-stat-label">Topics</div>
        </div>
        <div class="pl-hero-stat">
          <div class="pl-hero-stat-num">15+</div>
          <div class="pl-hero-stat-label">Min Read Avg</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ Main Content ═══ -->
  <div class="pl-wrapper">
    <div class="pl-layout">
      <div class="pl-main">

        <!-- Featured Articles -->
        <div class="pl-section-header">
          <h2>Featured <span style="color:#0066cc">Articles</span></h2>
          <span class="pl-section-count">Editor's picks</span>
        </div>
        <div class="pl-featured-grid">
          <a href="${featured[0].slug}.html" class="pl-feat-hero">
            <div class="pl-feat-hero-img">
              <img src="${escAttr(coverUrl(featured[0].cover))}" alt="${escAttr(featured[0].title)}" loading="eager">
            </div>
            <div class="pl-feat-hero-overlay">
              <span class="pl-feat-hero-cat">${esc(featured[0].category)}</span>
              <h3 class="pl-feat-hero-title">${esc(featured[0].title)}</h3>
              <div class="pl-feat-hero-meta">
                <span>📅 ${fmtDate(featured[0].date)}</span>
                <span>📖 ${featured[0].reading_time} min read</span>
              </div>
            </div>
          </a>
          ${[1, 2].map(i => {
            const p = featured[i];
            if (!p) return '';
            return `<a href="${p.slug}.html" class="pl-feat-side">
              <div class="pl-feat-side-img">
                <img src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
              </div>
              <div class="pl-feat-side-overlay">
                <span class="pl-feat-side-cat">${esc(p.category)}</span>
                <h3 class="pl-feat-side-title">${esc(p.title)}</h3>
                <span class="pl-feat-side-date">${fmtDate(p.date)}</span>
              </div>
            </a>`;
          }).join('')}
        </div>

        <!-- Category Filter Bar -->
        <div class="pl-cat-bar" id="plCatBar">
          <a href="index.html" class="pl-cat-chip all-chip active" data-cat="all" onclick="return plFilterByCat('all', this)">All</a>
${categories.map(c => `<a href="index.html" class="pl-cat-chip" data-cat="${escAttr(c.category)}" onclick="return plFilterByCat('${escAttr(c.category)}', this)" style="--cat-color: ${CAT_COLORS[c.category] || '#0066cc'}">${esc(c.category)}</a>`).join('\n')}
        </div>

        <!-- All Articles -->
        <div class="pl-section-header">
          <h2>All <span style="color:#0066cc">Articles</span></h2>
          <span class="pl-section-count" id="plArticleCount">${BLOG_DATA.length} articles</span>
        </div>
        <div class="pl-articles-grid" id="plArticlesGrid">
${sortedAll.map(p => {
  const catColor = CAT_COLORS[p.category] || '#0066cc';
  return `          <a href="${p.slug}.html" class="pl-card" data-category="${escAttr(p.category)}" data-title="${escAttr(p.title.toLowerCase())}" data-excerpt="${escAttr(p.excerpt.toLowerCase())}">
            <div class="pl-card-img-wrap">
              <img src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
              <span class="pl-card-cat-badge" style="background:${catColor}">${esc(p.category)}</span>
            </div>
            <div class="pl-card-body">
              <div class="pl-card-meta-line">
                <span>${fmtDate(p.date)}</span>
                <span class="dot"></span>
                <span>${p.reading_time} min read</span>
              </div>
              <h3 class="pl-card-title">${esc(p.title)}</h3>
              <p class="pl-card-excerpt">${esc(p.excerpt)}</p>
              <div class="pl-card-footer">
                <i class="fas fa-user-circle" style="font-size:0.75rem"></i>
                ${esc(p.author)}
                <span class="dot"></span>
                <i class="far fa-clock" style="font-size:0.65rem"></i>
                ${p.reading_time} min
              </div>
            </div>
          </a>`;
}).join('\n')}
        </div>

        <div style="text-align:center;margin-bottom:40px">
          <span class="pl-section-count" style="font-size:0.85rem">Showing <span id="plVisibleCount" aria-live="polite">${BLOG_DATA.length}</span> of ${BLOG_DATA.length} articles</span>
        </div>

        <!-- Newsletter CTA -->
        <div class="pl-newsletter">
          <div class="pl-newsletter-inner">
            <h3>Stay in the Creative Loop</h3>
            <p>Get early access to new releases, exclusive discounts, and creative inspiration delivered to your inbox.</p>
            <form class="pl-newsletter-form" action="${BASE_URL}/" method="get" onsubmit="alert('Thanks for subscribing! 🎉');return false">
              <input type="email" placeholder="Enter your email" required aria-label="Email for newsletter">
              <button type="submit">Subscribe Free</button>
            </form>
            <p class="pl-newsletter-note">No spam. Unsubscribe anytime. Join 5,000+ creators.</p>
          </div>
        </div>

      </div>

      <!-- ═══ Premium Sidebar ═══ -->
      <aside class="pl-sidebar">

        <!-- Recent Posts -->
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Recent Posts</div>
${recentPosts.map(p => {
  return `          <a href="${p.slug}.html" class="pl-sb-post">
            <img class="pl-sb-post-img" src="${escAttr(coverUrl(p.cover))}" alt="${escAttr(p.title)}" loading="lazy">
            <div class="pl-sb-post-info">
              <div class="pl-sb-post-title">${esc(p.title)}</div>
              <div class="pl-sb-post-date">${fmtDate(p.date)} · ${p.reading_time} min</div>
            </div>
          </a>`;
}).join('\n')}
        </div>

        <!-- Categories -->
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Categories</div>
${categories.map(c => {
  const catColor = CAT_COLORS[c.category] || '#0066cc';
  return `          <a href="index.html" class="pl-sb-cat" onclick="return plFilterByCat('${escAttr(c.category)}')">
            <span class="pl-sb-cat-name">
              <span class="pl-sb-cat-dot" style="background:${catColor}"></span>
              ${esc(c.category)}
            </span>
            <span class="pl-sb-cat-count">${c.count}</span>
          </a>`;
}).join('\n')}
        </div>

        <!-- Popular Tags -->
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Popular Tags</div>
          <div class="pl-sb-tags">
${tags.map(t => `            <a href="index.html" class="pl-sb-tag" onclick="return plSearchTag('${escAttr(t.tag)}')">${esc(t.tag)}</a>`).join('\n')}
          </div>
        </div>

        <!-- Top Authors -->
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Top Authors</div>
          <div class="pl-sb-author">
            <div class="pl-sb-author-avatar" style="background:linear-gradient(135deg,#0066cc,#2997ff)">P</div>
            <div>
              <div class="pl-sb-author-name">PixabAnimation</div>
              <div class="pl-sb-author-role">Content Creator · ${BLOG_DATA.length} articles</div>
            </div>
          </div>
          <div class="pl-sb-author">
            <div class="pl-sb-author-avatar" style="background:linear-gradient(135deg,#5856d6,#af52de)">S</div>
            <div>
              <div class="pl-sb-author-name">SPurno</div>
              <div class="pl-sb-author-role">Motion Design Expert</div>
            </div>
          </div>
        </div>

        <!-- Mini Newsletter (sidebar) -->
        <div class="pl-sb-widget" style="background:linear-gradient(135deg,#f5f5f7,#fff);border-color:rgba(0,102,204,0.08)">
          <div class="pl-sb-widget-title" style="border-bottom-color:#0066cc">📬 Newsletter</div>
          <p style="font-size:0.8rem;color:rgba(0,0,0,0.5);margin-bottom:12px;line-height:1.5">Get the latest articles and creative insights.</p>
          <form onsubmit="alert('Thanks for subscribing! 🎉');return false" style="display:flex;gap:6px">
            <input type="email" placeholder="Your email" required style="flex:1;padding:8px 12px;border:1px solid rgba(0,0,0,0.08);border-radius:9999px;font-size:0.78rem;background:#fff;outline:none;font-family:inherit">
            <button type="submit" style="padding:8px 14px;border-radius:9999px;background:#0066cc;color:#fff;border:none;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap">Join</button>
          </form>
        </div>
      </aside>
    </div>
  </div>

  <!-- ═══ Home CTA ═══ -->
  <div class="pl-home-cta">
    <a href="${BASE_URL}/"><i class="fas fa-home"></i> Return to Homepage</a>
  </div>

  <!-- ═══ Footer ═══ -->
  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <div class="name"><img src="${LOGO_URL}" alt="" style="width:24px;height:20px"> PixabAnimation</div>
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
    // ── Navbar scroll effect ──
    window.addEventListener('scroll', function() {
      document.getElementById('blogNavbar').classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Category filtering (client-side, no reload) ──
    var plCurrentCat = 'all';

    function plFilterByCat(cat, el) {
      if (!el) {
        el = document.querySelector('#plCatBar [data-cat="' + cat + '"]');
      }
      // Update active chip
      document.querySelectorAll('#plCatBar .pl-cat-chip').forEach(function(c) { c.classList.remove('active'); });
      if (el) { el.classList.add('active'); }

      plCurrentCat = cat;
      plApplyFilters();
      return false;
    }

    function plSearchTag(tag) {
      var input = document.getElementById('plSearchInput');
      input.value = tag;
      // Reset category to 'all' when searching by tag
      plCurrentCat = 'all';
      document.querySelectorAll('#plCatBar .pl-cat-chip').forEach(function(c) { c.classList.remove('active'); });
      var allChip = document.querySelector('#plCatBar [data-cat="all"]');
      if (allChip) { allChip.classList.add('active'); }
      plApplyFilters();
      // Scroll to grid
      document.getElementById('plArticlesGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }

    function plApplyFilters() {
      var searchVal = (document.getElementById('plSearchInput').value || '').toLowerCase().trim();
      var cards = document.querySelectorAll('#plArticlesGrid .pl-card');
      var visible = 0;

      cards.forEach(function(card) {
        var cat = card.getAttribute('data-category') || '';
        var title = card.getAttribute('data-title') || '';
        var excerpt = card.getAttribute('data-excerpt') || '';
        var catMatch = plCurrentCat === 'all' || cat === plCurrentCat;
        var searchMatch = !searchVal || title.indexOf(searchVal) !== -1 || excerpt.indexOf(searchVal) !== -1;

        if (catMatch && searchMatch) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      document.getElementById('plVisibleCount').textContent = visible;
      document.getElementById('plArticleCount').textContent = visible + ' article' + (visible !== 1 ? 's' : '');
    }

    // Debounced search
    var plSearchTimer;
    function plFilterArticles(val) {
      clearTimeout(plSearchTimer);
      plSearchTimer = setTimeout(function() { plApplyFilters(); }, 200);
    }

    // ── Scroll animation for cards ──
    document.addEventListener('DOMContentLoaded', function() {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('#plArticlesGrid .pl-card').forEach(function(card, i) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease ' + (i * 0.04) + 's, transform 0.5s ease ' + (i * 0.04) + 's';
        observer.observe(card);
      });
    });
  </script>

</body>
</html>`;

// ─── Write Output ────────────────────────────────────────────────────────────
writeFileSync(outputPath, html, 'utf-8');
console.log(`✅ Generated blog/index.html (${(html.length / 1024).toFixed(1)} KB, ${BLOG_DATA.length} articles)`);
