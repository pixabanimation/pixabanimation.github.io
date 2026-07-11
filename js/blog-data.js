// ============================================
// pixabanimation — Static Blog Posts Data
// Metadata extracted from blog/*.html files
// Used as fallback when DB has no blog posts
// ============================================

const BLOG_DATA = [
  {
    id: 1, slug: 'ai-motion-graphics-revolution', featured: 1,
    title: 'The AI Revolution in Motion Graphics: What Every Designer Needs to Know in 2026',
    excerpt: 'Discover how artificial intelligence is transforming motion graphics in 2026. From AI-powered animation tools to automated workflows, learn what every motion designer needs to know.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-motion-graphics-revolution.png',
    category: 'AI',
    tags: ['AI Motion Graphics', 'Artificial Intelligence', 'Motion Design', 'After Effects', 'Animation Tools', 'Creative Technology'],
    reading_time: 12,
    created_at: '2026-01-15T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 2, slug: 'claude-ai-coding-productivity', featured: 1,
    title: 'Claude AI for Coding: Advanced Productivity Tips for Modern Developers',
    excerpt: 'Master Claude AI for coding with expert tips and techniques. Learn how to boost your development productivity using Claude\'s advanced capabilities.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/claude-ai-coding-productivity.png',
    category: 'AI',
    tags: ['Claude AI', 'AI Coding', 'Developer Productivity', 'Code Generation', 'Artificial Intelligence'],
    reading_time: 10,
    created_at: '2026-01-18T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 3, slug: 'chatgpt-codex-vs-claude-coding',
    title: 'ChatGPT Codex vs Claude for Coding: Which AI Assistant Wins in 2026?',
    excerpt: 'In-depth comparison of ChatGPT Codex and Claude for coding tasks, strengths, weaknesses, and recommendations.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/chatgpt-codex-vs-claude-coding.png',
    category: 'AI',
    tags: ['ChatGPT', 'Claude', 'AI Coding', 'Codex', 'Developer Tools'],
    reading_time: 11,
    created_at: '2026-01-20T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 4, slug: 'future-of-web-animation-2026', featured: 1,
    title: 'The Future of Web Animation in 2026: Trends, Technologies, and Tools',
    excerpt: 'Explore the cutting-edge trends shaping web animation in 2026, from AI-driven motion to WebGPU, scroll-driven animations, and immersive 3D experiences.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/future-of-web-animation-2026.png',
    category: 'Web',
    tags: ['Web Animation', 'CSS Animation', 'WebGPU', 'Three.js', 'Lottie', 'Motion Design', 'Frontend'],
    reading_time: 14,
    created_at: '2026-01-22T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 5, slug: 'typography-trends-2026',
    title: 'Typography Trends 2026: Variable Fonts, Kinetic Type, and Motion-Driven Lettering',
    excerpt: 'Variable fonts, kinetic type, generative typography, and motion-driven lettering trends shaping design.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/typography-trends-2026.png',
    category: 'Design',
    tags: ['Typography', 'Variable Fonts', 'Kinetic Typography', 'Motion Design', 'Font Design', 'Design Trends'],
    reading_time: 10,
    created_at: '2026-01-25T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 6, slug: 'ai-design-tools-creative-workflow',
    title: 'AI Design Tools Transforming Creative Workflows in 2026',
    excerpt: 'Explore the best AI design tools transforming creative workflows — Adobe Firefly, Figma AI, and more.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-design-tools-creative-workflow.png',
    category: 'AI',
    tags: ['AI Design', 'Creative Tools', 'Adobe Firefly', 'Figma AI', 'Generative AI', 'Design Workflow'],
    reading_time: 11,
    created_at: '2026-01-28T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 7, slug: 'freelancing-tips-motion-designers',
    title: 'Freelancing Tips for Motion Designers: Build a Thriving Creative Business',
    excerpt: 'Build a thriving freelance motion design business with expert tips on pricing, clients, and marketing.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/freelancing-tips-motion-designers.png',
    category: 'Freelancing',
    tags: ['Freelancing', 'Motion Design', 'Career Tips', 'Pricing', 'Client Management', 'Portfolio'],
    reading_time: 12,
    created_at: '2026-01-30T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 8, slug: 'ai-video-generation-2026',
    title: 'AI Video Generation in 2026: The Complete Guide for Content Creators',
    excerpt: 'The complete guide to AI video generation — Sora, Runway Gen-3, Pika Labs, and how creators use them.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-video-generation-2026.png',
    category: 'AI',
    tags: ['AI Video', 'Sora', 'Runway', 'Video Generation', 'Content Creation', 'Motion Graphics'],
    reading_time: 13,
    created_at: '2026-02-01T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 9, slug: 'mastering-after-effects-expressions',
    title: 'Mastering After Effects Expressions: From Beginner to Advanced',
    excerpt: 'Master JavaScript-based animation automation in After Effects, from basics to advanced techniques.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/mastering-after-effects-expressions.png',
    category: 'Animation',
    tags: ['After Effects', 'Expressions', 'JavaScript', 'Animation', 'Motion Design', 'Tutorial'],
    reading_time: 15,
    created_at: '2026-02-03T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 10, slug: 'large-language-models-creatives',
    title: 'Understanding Large Language Models: A Creative Professional\'s Guide',
    excerpt: 'A creative\'s guide to understanding large language models and how to leverage them in creative workflows.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/large-language-models-creatives.png',
    category: 'AI',
    tags: ['LLM', 'AI', 'Creative Tools', 'Language Models', 'Generative AI'],
    reading_time: 8,
    created_at: '2026-02-05T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 11, slug: 'generative-ai-copyright-creative-work',
    title: 'Generative AI and Copyright: A Guide for Creative Professionals',
    excerpt: 'Navigate the complex landscape of generative AI copyright for creatives — ownership, licensing, and best practices.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/generative-ai-copyright-creative-work.png',
    category: 'AI',
    tags: ['AI Copyright', 'Generative AI', 'Creative Rights', 'Licensing', 'Legal'],
    reading_time: 10,
    created_at: '2026-02-07T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 12, slug: 'machine-learning-visual-effects',
    title: 'Machine Learning for Visual Effects: Transforming the VFX Pipeline',
    excerpt: 'Discover how ML is transforming VFX — AI rotoscoping, neural rendering, and AI-assisted compositing.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/machine-learning-visual-effects.png',
    category: 'Technology',
    tags: ['Machine Learning', 'Visual Effects', 'VFX', 'AI', 'Deep Learning', 'Compositing'],
    reading_time: 9,
    created_at: '2026-02-08T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 13, slug: 'color-theory-motion-designers',
    title: 'Color Theory for Motion Designers: A Comprehensive Guide',
    excerpt: 'Master color theory for motion design — harmonies, psychology, color grading, and accessibility.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/color-theory-motion-designers.png',
    category: 'Design',
    tags: ['Color Theory', 'Motion Design', 'Color Harmony', 'Color Psychology', 'Grading', 'Design'],
    reading_time: 10,
    created_at: '2026-02-09T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 14, slug: 'motion-design-principles-beginners',
    title: 'The 12 Principles of Motion Design: A Beginner\'s Guide',
    excerpt: 'Learn the 12 principles of motion design — timing, spacing, easing, and animation fundamentals.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/motion-design-principles-beginners.png',
    category: 'Animation',
    tags: ['Motion Design', 'Animation', 'Animation Principles', 'Timing', 'Easing', 'Tutorial'],
    reading_time: 8,
    created_at: '2026-02-10T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 15, slug: 'logo-animation-techniques',
    title: 'Logo Animation Techniques: Creating Memorable Brand Introductions',
    excerpt: 'Creating memorable brand introductions with reveal animations, morphing, and 3D logo animation.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/logo-animation-techniques.png',
    category: 'Animation',
    tags: ['Logo Animation', 'Motion Design', 'Brand Identity', 'Reveal Animation', 'Morphing', '3D Animation'],
    reading_time: 9,
    created_at: '2026-02-11T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 16, slug: 'green-screen-compositing-tips',
    title: 'Green Screen Compositing Tips for Motion Designers',
    excerpt: 'Expert tips for keying, lighting, spill suppression, and professional compositing workflows.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/green-screen-compositing-tips.png',
    category: 'VFX',
    tags: ['Green Screen', 'Compositing', 'Keying', 'VFX', 'Chroma Key', 'Motion Design'],
    reading_time: 8,
    created_at: '2026-02-12T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 17, slug: 'kinetic-typography-video-production',
    title: 'Kinetic Typography in Video Production: Making Words Move',
    excerpt: 'Techniques for animating text that captures attention and communicates effectively in video production.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/kinetic-typography-video-production.png',
    category: 'Typography',
    tags: ['Kinetic Typography', 'Typography', 'Motion Design', 'Video Production', 'Text Animation'],
    reading_time: 8,
    created_at: '2026-02-13T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 18, slug: 'visual-storytelling-data-animation',
    title: 'Visual Storytelling with Data Animation: Transforming Numbers into Narratives',
    excerpt: 'Transform complex data into compelling animated visual narratives with effective data animation techniques.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/visual-storytelling-data-animation.png',
    category: 'Animation',
    tags: ['Data Animation', 'Visual Storytelling', 'Data Visualization', 'Infographic', 'Motion Design'],
    reading_time: 9,
    created_at: '2026-02-14T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 19, slug: 'seamless-loop-animations',
    title: 'Creating Seamless Loop Animations: Design Patterns and Techniques',
    excerpt: 'Design patterns and techniques for creating infinite motion sequences without visible loop points.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/seamless-loop-animations.png',
    category: 'Animation',
    tags: ['Loop Animation', 'Motion Design', 'Animation Techniques', 'Seamless', 'Cinema 4D'],
    reading_time: 7,
    created_at: '2026-02-15T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 20, slug: 'building-motion-design-portfolio',
    title: 'Building a Motion Design Portfolio That Attracts Clients in 2026',
    excerpt: 'Tips on showcasing work, case studies, platform selection, and attracting high-quality clients.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/building-motion-design-portfolio.png',
    category: 'Career',
    tags: ['Portfolio', 'Motion Design', 'Career', 'Freelancing', 'Client Acquisition'],
    reading_time: 9,
    created_at: '2026-02-16T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 21, slug: 'top-motion-design-tools-2026',
    title: 'Top Motion Design Tools in 2026: The Complete Toolkit',
    excerpt: 'Comprehensive guide to After Effects, Cinema 4D, Blender, DaVinci Resolve, and AI-powered tools.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/top-motion-design-tools-2026.png',
    category: 'Tools',
    tags: ['Motion Design', 'After Effects', 'Cinema 4D', 'Blender', 'DaVinci Resolve', 'Animation Tools'],
    reading_time: 10,
    created_at: '2026-02-17T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 22, slug: 'web-animation-css-javascript',
    title: 'Web Animation with CSS and JavaScript: A Complete Guide',
    excerpt: 'Complete guide to web animation — CSS transitions, JavaScript libraries, performance best practices.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/web-animation-css-javascript.png',
    category: 'Web',
    tags: ['Web Animation', 'CSS', 'JavaScript', 'GSAP', 'Frontend', 'Animation'],
    reading_time: 11,
    created_at: '2026-02-18T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 23, slug: 'svg-animation-techniques',
    title: 'SVG Animation Techniques: Bringing Vector Graphics to Life',
    excerpt: 'Bring vector graphics to life with CSS, JavaScript, and GSAP SVG animation techniques.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/svg-animation-techniques.png',
    category: 'Web',
    tags: ['SVG', 'Vector Animation', 'CSS', 'JavaScript', 'GSAP', 'Web Animation'],
    reading_time: 8,
    created_at: '2026-02-19T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 24, slug: 'lottie-files-web-animation',
    title: 'Lottie Files for Web Animation: The Complete Guide',
    excerpt: 'Complete guide to creating, optimizing, and integrating Lottie animations in web projects.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/lottie-files-web-animation.png',
    category: 'Web',
    tags: ['Lottie', 'Web Animation', 'After Effects', 'Motion Design', 'JSON Animation'],
    reading_time: 9,
    created_at: '2026-02-20T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 25, slug: 'threejs-3d-web-experiences',
    title: 'Three.js for 3D Web Experiences: A Motion Designer\'s Guide',
    excerpt: 'Create immersive 3D web experiences — scene setup, animation, interactivity, and performance optimization.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/threejs-3d-web-experiences.png',
    category: 'Web',
    tags: ['Three.js', '3D Web', 'WebGL', '3D Animation', 'Web Development', 'Interactive'],
    reading_time: 10,
    created_at: '2026-02-21T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 26, slug: 'performance-optimization-web-animations',
    title: 'Performance Optimization for Web Animations: The Developer\'s Guide',
    excerpt: 'Optimize web animation performance — GPU acceleration, layout thrashing prevention, and rendering tips.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/performance-optimization-web-animations.png',
    category: 'Web',
    tags: ['Performance', 'Web Animation', 'Optimization', 'GPU', 'Rendering', 'Frontend'],
    reading_time: 8,
    created_at: '2026-02-22T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 27, slug: 'responsive-design-creative-portfolios',
    title: 'Responsive Design for Creative Portfolios: Showcasing Work Across Devices',
    excerpt: 'Build a responsive creative portfolio — layouts, typography, image optimization, and mobile-first design.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/responsive-design-creative-portfolios.png',
    category: 'Design',
    tags: ['Responsive Design', 'Portfolio', 'Web Design', 'Mobile-First', 'CSS'],
    reading_time: 9,
    created_at: '2026-02-23T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 28, slug: 'pricing-animation-services',
    title: 'Pricing Your Animation Services: A Freelancer\'s Guide',
    excerpt: 'Learn pricing models, rates, quoting strategies, and negotiation tips for motion designers.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/pricing-animation-services.png',
    category: 'Freelancing',
    tags: ['Pricing', 'Freelancing', 'Motion Design', 'Business', 'Rates'],
    reading_time: 10,
    created_at: '2026-02-24T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 29, slug: 'client-management-creative-freelancers',
    title: 'Client Management for Creative Freelancers: Building Lasting Relationships',
    excerpt: 'Master communication, feedback management, and long-term client relationship building.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/client-management-creative-freelancers.png',
    category: 'Freelancing',
    tags: ['Client Management', 'Freelancing', 'Communication', 'Business', 'Relationships'],
    reading_time: 9,
    created_at: '2026-02-25T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 30, slug: 'building-personal-brand-designer',
    title: 'Building a Personal Brand as a Designer: Stand Out in 2026',
    excerpt: 'Stand out as a designer by defining your niche, creating consistent messaging, and authentic branding.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/building-personal-brand-designer.png',
    category: 'Career',
    tags: ['Personal Branding', 'Design Career', 'Marketing', 'Niche', 'Creative Business'],
    reading_time: 8,
    created_at: '2026-02-26T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 31, slug: 'marketing-motion-design-business',
    title: 'Marketing Your Motion Design Business: A Comprehensive Guide',
    excerpt: 'Social media, content marketing, networking, and referral strategies for motion designers.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/marketing-motion-design-business.png',
    category: 'Freelancing',
    tags: ['Marketing', 'Motion Design', 'Social Media', 'Content Marketing', 'Business'],
    reading_time: 9,
    created_at: '2026-02-27T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 32, slug: 'neural-networks-image-processing',
    title: 'Neural Networks in Image Processing: A Creative\'s Guide',
    excerpt: 'Super-resolution, style transfer, denoising, and AI-powered editing tools for creatives.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/neural-networks-image-processing.png',
    category: 'Technology',
    tags: ['Neural Networks', 'Image Processing', 'AI', 'Deep Learning', 'Style Transfer', 'Super-Resolution'],
    reading_time: 8,
    created_at: '2026-02-28T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 33, slug: 'ai-powered-voice-synthesis-video',
    title: 'AI-Powered Voice Synthesis for Video: The Complete Guide',
    excerpt: 'Text-to-speech, voice cloning, and AI voiceover tools transforming video production.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-powered-voice-synthesis-video.png',
    category: 'AI',
    tags: ['AI Voice', 'Voice Synthesis', 'Text-to-Speech', 'Video Production', 'Voice Cloning'],
    reading_time: 9,
    created_at: '2026-03-01T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 34, slug: 'ai-assistants-for-designers',
    title: 'AI Assistants for Designers: Your Creative Copilot in 2026',
    excerpt: 'How AI assistants are transforming design workflows from ideation to production.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-assistants-for-designers.png',
    category: 'AI',
    tags: ['AI Assistants', 'Design', 'Creative Tools', 'AI', 'Workflow'],
    reading_time: 8,
    created_at: '2026-03-02T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 35, slug: 'computer-vision-animation',
    title: 'Computer Vision Applications in Animation',
    excerpt: 'Markerless motion capture, facial tracking, and gesture recognition for animation workflows.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/computer-vision-animation.png',
    category: 'Technology',
    tags: ['Computer Vision', 'Animation', 'Motion Capture', 'Facial Tracking', 'AI', 'VFX'],
    reading_time: 8,
    created_at: '2026-03-03T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 36, slug: 'ai-driven-personalization-digital-media',
    title: 'AI-Driven Personalization in Digital Media: The Future of Content',
    excerpt: 'How machine learning creates personalized content experiences for audiences at scale.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/ai-driven-personalization-digital-media.png',
    category: 'AI',
    tags: ['AI Personalization', 'Digital Media', 'Machine Learning', 'Content', 'Personalization'],
    reading_time: 8,
    created_at: '2026-03-04T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 37, slug: 'understanding-diffusion-models',
    title: 'Understanding Diffusion Models: The Technology Behind AI Image Generation',
    excerpt: 'The technology behind Stable Diffusion, DALL-E, Midjourney, and AI image generation explained.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/understanding-diffusion-models.png',
    category: 'AI',
    tags: ['Diffusion Models', 'AI Image Generation', 'Stable Diffusion', 'DALL-E', 'Midjourney', 'Deep Learning'],
    reading_time: 9,
    created_at: '2026-03-05T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 38, slug: 'remote-collaboration-creative-teams',
    title: 'Remote Collaboration for Creative Teams: Workflows and Best Practices',
    excerpt: 'Tools, workflows, and best practices for motion design teams working remotely.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/remote-collaboration-creative-teams.png',
    category: 'Career',
    tags: ['Remote Work', 'Collaboration', 'Creative Teams', 'Workflow', 'Team Management'],
    reading_time: 8,
    created_at: '2026-03-06T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 39, slug: 'motion-graphics-stock-video-resources',
    title: 'Best Motion Graphics Stock Video Resources in 2026',
    excerpt: 'Best platforms for motion backgrounds, animated templates, and stock footage in 2026.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/motion-graphics-stock-video-resources.png',
    category: 'Resources',
    tags: ['Stock Video', 'Motion Graphics', 'Resources', 'Stock Footage', 'Templates'],
    reading_time: 8,
    created_at: '2026-03-07T00:00:00.000Z',
    author: 'PixabAnimation Team'
  },
  {
    id: 40, slug: 'building-interactive-data-visualizations',
    title: 'Building Interactive Data Visualizations: A Developer\'s Guide',
    excerpt: 'Build engaging interactive data experiences with D3.js, animation, and performance optimization.',
    cover_image: 'https://pixabanimation.github.io/assets/images/blog/building-interactive-data-visualizations.png',
    category: 'Web',
    tags: ['Data Visualization', 'D3.js', 'Interactive', 'Web Development', 'Animation', 'Charts'],
    reading_time: 9,
    created_at: '2026-03-08T00:00:00.000Z',
    author: 'PixabAnimation Team'
  }
];

// Helper functions that mirror DB.* methods for static blog data
const BlogData = {
  getAll() {
    return BLOG_DATA;
  },

  getPublished() {
    return BLOG_DATA;
  },

  getPosts(filters = {}) {
    let posts = [...BLOG_DATA];
    if (filters.category) {
      posts = posts.filter(p => p.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (filters.featured) {
      posts = posts.filter(p => p.featured);
    }
    // Sort by date descending
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // Paginate
    const offset = filters.offset || 0;
    const limit = filters.limit || posts.length;
    return posts.slice(offset, offset + limit);
  },

  getPost(slug) {
    return BLOG_DATA.find(p => p.slug === slug) || null;
  },

  getFeatured(limit = 3) {
    return BLOG_DATA.filter(p => p.featured).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  },

  getRecent(limit = 5) {
    return [...BLOG_DATA].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  },

  getCategories() {
    const catMap = {};
    BLOG_DATA.forEach(p => {
      if (p.category) {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      }
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  },

  getTags(limit = 20) {
    const tagCounts = {};
    BLOG_DATA.forEach(p => {
      if (p.tags) {
        p.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  },

  searchSuggestions(query, limit = 6) {
    if (!query || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return BLOG_DATA
      .filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, limit)
      .map(p => ({ id: p.id, title: p.title, slug: p.slug, category: p.category, cover_image: p.cover_image, excerpt: p.excerpt }));
  }
};
