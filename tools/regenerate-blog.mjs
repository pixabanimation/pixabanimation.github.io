#!/usr/bin/env node
/**
 * regenerate-blog.mjs
 *
 * Reads all existing blog HTML files, applies the new Editorial Tech Magazine
 * design template, generates TOC, adds related articles, and enhances thin
 * articles with additional content sections.
 *
 * Usage: node tools/regenerate-blog.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const blogDir = join(rootDir, 'blog');

const BASE_URL = 'https://pixabanimation.github.io';

// ─── Enhanced content for thin tech articles ─────────────────────────────────
// Key: slug (without .html), Value: additional HTML content to inject
const ENHANCED_CONTENT = {
  'samsung-galaxy-s25-edge-specs': {
    sections: [
      {
        heading: 'Design & Build Quality',
        content: `<p>The Galaxy S25 Edge represents Samsung's most ambitious design statement in years. At just 5.8mm thin, it's thinner than most USB-C ports, yet feels remarkably solid thanks to the titanium alloy frame that provides exceptional structural rigidity. The glass front uses Corning's latest Gorilla Glass Armor with an anti-reflective coating that significantly reduces glare in outdoor conditions.</p>
<p>The weight distribution is impressive — at 162 grams, the phone feels light without being insubstantial. The flat-edge design language echoes the iPhone's industrial aesthetic but with Samsung's own refinements, including slightly rounded corners that make one-handed use more comfortable than you'd expect from a 6.6-inch device. The matte titanium finish resists fingerprints better than the glossy glass backs found on competing flagships.</p>`
      },
      {
        heading: 'Display Quality',
        content: `<p>The 6.6-inch Dynamic AMOLED 2X display delivers the vibrant colors and deep blacks Samsung is known for, with a 120Hz adaptive refresh rate that smoothly scales down to preserve battery life. The FHD+ resolution (1080 x 2340) is sharp enough for most use cases, though content creators may notice the lack of QHD+ compared to the S25 Ultra.</p>
<p>HDR10+ support ensures excellent streaming quality on Netflix and YouTube, while the 120Hz panel makes scrolling and animations feel buttery smooth. The anti-reflective Gorilla Glass Armor coating is a practical touch that makes the display more usable in direct sunlight — a genuine improvement over previous Galaxy flagships.</p>`
      },
      {
        heading: 'Performance & Software',
        content: `<p>Powered by the Snapdragon 8 Elite for Galaxy (custom-tuned), the S25 Edge delivers flagship-tier performance that handles everything from intensive gaming to AI-powered photo editing without breaking a sweat. The 3nm process ensures excellent power efficiency, which is critical given the phone's slim profile and necessarily smaller battery.</p>
<p>One UI 8.0 on Android 15 brings Samsung's latest AI features including Circle to Search, Live Translate, and Generative Edit — all running smoothly on the dedicated NPU. The 8GB or 12GB of LPDDR5X RAM ensures smooth multitasking, while UFS 4.0 storage provides rapid app load times and file transfers.</p>`
      },
      {
        heading: 'Camera System',
        content: `<p>The 50MP main camera with OIS captures detailed, well-exposed photos in good lighting conditions, with Samsung's image processing delivering the saturated, punchy look Galaxy users expect. The 12MP ultrawide offers a useful 120-degree field of view for landscapes and group shots, though it understandably can't match the main sensor in low-light performance.</p>
<p>The 12MP selfie camera handles video calls and social media content well, with decent skin tone accuracy. It's worth noting that the S25 Edge sacrifices the telephoto lens found on the S25 and S25 Ultra — a reasonable trade-off to maintain the ultra-slim form factor, but something to consider if optical zoom is important to you.</p>`
      },
      {
        heading: 'Battery & Charging',
        content: `<p>The 3,900mAh battery is the most obvious compromise of the ultra-slim design. While the Snapdragon 8 Elite's efficiency helps extend usage, heavy users may find themselves reaching for the charger before dinner. The 25W wired charging is adequate but not class-leading — Samsung's conservative approach to charging speeds prioritizes battery longevity over speed.</p>
<p>Wireless charging support is included, which is impressive given the 5.8mm thickness. In real-world use, the battery comfortably lasts a full day of moderate use, but power users who game extensively or shoot lots of 4K video will want to keep a charger handy.</p>`
      }
    ],
    pros: [
      'Remarkably thin and lightweight at 5.8mm and 162g',
      'Premium titanium alloy build quality',
      'Snapdragon 8 Elite delivers flagship performance',
      'Excellent 120Hz AMOLED display with anti-reflective coating',
      'Full Galaxy AI feature suite',
      'IP68 dust and water resistance'
    ],
    cons: [
      '3,900mAh battery is small for heavy users',
      'Only 25W wired charging — not class-leading',
      'No telephoto camera lens',
      'FHD+ display instead of QHD+',
      'Starting at $899 is premium pricing'
    ],
    verdict: 'The Samsung Galaxy S25 Edge is a remarkable engineering achievement that proves thin and powerful can coexist. It\'s the perfect choice for users who prioritize design and portability without wanting to compromise on flagship performance. The titanium build, Snapdragon 8 Elite processor, and Galaxy AI features make it a genuinely compelling package — though the smaller battery and limited camera system mean it\'s best suited for design-conscious users rather than power users or mobile photography enthusiasts.'
  },

  'razer-blade-16-2025-gaming-laptop': {
    sections: [
      {
        heading: 'Build Quality & Design',
        content: `<p>The Razer Blade 16 continues to set the standard for premium gaming laptop construction. The CNC-machined aluminum unibody feels absolutely premium — there's zero flex in the keyboard deck, and the lid opens with a satisfying, well-damped hinge action. At 2.45 kg, it's not light, but the weight feels justified by the uncompromising build quality.</p>
<p>The design strikes an effective balance between gaming aesthetics and professional portability. The clean lines and anodized finish wouldn't look out of place in a boardroom, while the per-key RGB Chroma keyboard (with 16.8 million colors) adds customizable flair when you want it. The Mercury White option is particularly striking, though the Black variant remains the more practical choice for hiding fingerprints.</p>`
      },
      {
        heading: 'Display & Visual Experience',
        content: `<p>The 16-inch QHD+ OLED panel is breathtaking. With a 240Hz refresh rate, 0.2ms response time, and 100% DCI-P3 color coverage, it delivers both the speed competitive gamers need and the color accuracy creative professionals demand. The 16:10 aspect ratio provides extra vertical space that's genuinely useful for productivity work and gaming alike.</p>
<p>At 500 nits peak brightness, HDR content looks impressive, and the perfect blacks of the OLED panel make dark scenes in games and movies truly cinematic. The Calman Verified certification ensures color accuracy out of the box, meaning creative professionals can trust the display for color-critical work without additional calibration.</p>`
      },
      {
        heading: 'Gaming & Creative Performance',
        content: `<p>The AMD Ryzen AI 9 HX 370 processor paired with NVIDIA's flagship RTX 5090 laptop GPU (running at up to 160W TGP) delivers uncompromising performance. AAA games run beautifully at the panel's native QHD+ resolution — Cyberpunk 2077 with ray tracing, Alan Wake 2, and the latest Unreal Engine 5 titles all maintain smooth framerates with settings maxed out.</p>
<p>For creative work, the combination is equally impressive. 4K video editing in DaVinci Resolve, 3D rendering in Blender, and complex After Effects compositions all benefit from the 12-core CPU and massive GPU. The up to 64GB DDR5 RAM and dual M.2 slots (supporting up to 8TB total storage) ensure you'll never be bottlenecked by memory or storage.</p>`
      },
      {
        heading: 'Thermals & Cooling',
        content: `<p>Razer's vapor chamber cooling system with liquid metal thermal compound on both CPU and GPU does an admirable job managing the substantial heat output. Under sustained gaming loads, the keyboard area remains comfortable, and the fans — while audible at full tilt — produce a reasonable noise profile that won't dominate your gaming sessions.</p>
<p>The dual-fan system pulls air from the bottom and exhausts through the rear, with the vapor chamber spreading heat efficiently across the thermal assembly. Surface temperatures stay well-controlled during extended gaming sessions, which is a testament to the engineering in such a relatively slim chassis for a 16-inch gaming laptop.</p>`
      },
      {
        heading: 'Battery & Portability',
        content: `<p>The 95.2 Wh battery is one of the largest in a gaming laptop, though the power-hungry components mean you shouldn't expect all-day unplugged use. For productivity tasks — web browsing, document editing, light creative work — you can expect around 6-8 hours. Gaming on battery will significantly reduce this, and the 330W GaN adapter is required for full performance.</p>
<p>At $2,999 starting, the Razer Blade 16 is firmly in premium territory. But for users who want the best build quality, display, and performance in a gaming laptop without compromise, it delivers on that promise.</p>`
      }
    ],
    pros: [
      'Best-in-class CNC aluminum unibody construction',
      'Stunning 16-inch QHD+ OLED 240Hz display',
      'RTX 5090 delivers uncompromising gaming performance',
      'Vapor chamber cooling with liquid metal',
      'Per-key RGB Chroma keyboard with 16.8M colors',
      'Up to 64GB RAM and 8TB storage'
    ],
    cons: [
      'Starting at $2,999 — very expensive',
      '2.45 kg weight is hefty for daily carry',
      'Battery life is limited under gaming loads',
      '330W adapter is large and heavy',
      'Fan noise under sustained heavy loads'
    ],
    verdict: 'The Razer Blade 16 is the ultimate premium gaming laptop for those who demand the best build quality, display, and performance without compromise. The CNC aluminum construction, stunning QHD+ OLED panel, and RTX 5090 deliver a no-compromise experience that justifies the premium price for users who can afford it. It\'s not the most portable or the best value, but for pure quality and performance in a gaming laptop, it\'s nearly unmatched.'
  },

  'samsung-galaxy-watch-7-specs': {
    sections: [
      {
        heading: 'Design & Build',
        content: `<p>The Galaxy Watch 7 maintains Samsung's clean, circular design language while introducing subtle refinements. Available in 40mm and 44mm sizes, both feature Armor Aluminum construction with sapphire crystal display protection — a significant durability upgrade that resists scratches from daily wear. The MIL-STD-810H rating ensures it can handle drops, extreme temperatures, and environmental stress.</p>
<p>The lightweight design (30g for the 40mm, 35g for the 44mm) makes it comfortable for all-day wear, including sleep tracking. The digital bezel provides intuitive navigation without the mechanical complexity of a rotating bezel, though some users may miss the tactile feedback of the Classic model's physical bezel.</p>`
      },
      {
        heading: 'Display',
        content: `<p>The Super AMOLED display reaches an impressive 3,000 nits peak brightness — making it easily readable even in direct sunlight. The Always-On Display functionality ensures you can glance at your watch face without wrist gestures, while the vivid colors and deep blacks make watch faces and notifications look stunning.</p>
<p>With resolutions of 432 x 432 (40mm) and 480 x 480 (44mm), text and graphics appear sharp and detailed. The sapphire crystal protection means the display maintains its clarity over years of daily use, resisting the micro-scratches that can accumulate on lesser materials.</p>`
      },
      {
        heading: 'Health & Fitness Tracking',
        content: `<p>The BioActive Sensor 2 represents a meaningful upgrade in health tracking accuracy. The optical heart rate sensor, electrical heart sensor, and BIA (bioelectrical impedance analysis) work together to provide comprehensive health metrics including heart rate, blood oxygen, body composition, and stress levels. The addition of AI-powered sleep coaching analyzes your sleep patterns over time and provides personalized recommendations.</p>
<p>Samsung's health ecosystem integrates seamlessly with Samsung Health and can share data with popular fitness platforms. The automatic workout detection recognizes over 90 exercises, while dual-band GPS provides accurate route tracking for outdoor activities. The skin temperature sensor adds another dimension to health monitoring, particularly useful for cycle tracking.</p>`
      },
      {
        heading: 'Performance & Software',
        content: `<p>The 3nm Exynos W1000 chipset is the star of the show — delivering approximately 3x faster performance compared to the previous W930. App launches are snappy, animations are smooth, and the overall responsiveness makes the Watch 7 feel like a genuine generational leap. With 2GB RAM and 32GB storage, there's room for apps, music, and watch faces.</p>
<p>Wear OS 5 with One UI Watch 6 provides access to the Google Play Store, Samsung's health apps, and Google's suite of wearables including Google Maps, Google Wallet, and YouTube Music. The software experience is polished, intuitive, and benefits from both Google's and Samsung's ecosystem integration.</p>`
      }
    ],
    pros: [
      '3nm Exynos W1000 delivers 3x faster performance',
      '3,000-nit display is incredibly bright and readable',
      'BioActive Sensor 2 for comprehensive health tracking',
      'Armor Aluminum with sapphire crystal durability',
      'Wear OS 5 with full Google Play Store access',
      'Up to 40 hours battery life'
    ],
    cons: [
      'No rotating physical bezel (available on Classic)',
      'Samsung Health ecosystem can feel locked-in',
      'Battery life drops significantly with always-on display',
      'LTE version requires separate data plan',
      'Limited third-party watch face customization'
    ],
    verdict: 'The Samsung Galaxy Watch 7 is the best smartwatch for Android users, period. The 3nm chip delivers a massive performance leap, the 3,000-nit display is class-leading, and the BioActive Sensor 2 provides some of the most accurate consumer health tracking available. Combined with full Wear OS 5 and Google Play Store access, it\'s a comprehensive wellness companion that starts at just $299.'
  },

  'nothing-phone-3-specs-design': {
    sections: [
      {
        heading: 'The Glyph Interface',
        content: `<p>The Glyph Interface remains Nothing's most distinctive feature — a matrix of 900+ individually addressable LEDs on the back that serve as both notification system and creative expression. In the Phone 3, the Glyph system has been refined with smoother animations, more nuanced brightness control, and new patterns that respond to music, timers, and incoming calls.</p>
<p>Beyond aesthetics, the Glyph Interface is genuinely functional. Different contact patterns let you identify callers without looking at the screen, progress indicators show charging status, and the flashlight function is surprisingly useful. The Glyph Composer app lets you create custom patterns, turning the phone's back panel into a personal light show that's uniquely yours.</p>`
      },
      {
        heading: 'Design & Build',
        content: `<p>The Phone 3 continues Nothing's transparent design language with its distinctive industrial aesthetic. The exposed screws, ribbon cables, and internal components visible through the back panel create a look that's unlike any other smartphone on the market. The flat aluminum frame provides structural rigidity while maintaining the phone's clean lines.</p>
<p>At 190 grams, the Phone 3 feels substantial without being heavy. The IP54 rating provides splash and dust resistance — adequate for daily use but not as robust as the IP68 ratings of premium flagships. The dual-tone finish with its characteristic dot matrix pattern makes the Phone 3 instantly recognizable.</p>`
      },
      {
        heading: 'Display & Performance',
        content: `<p>The 6.7-inch LTPO AMOLED display with 120Hz adaptive refresh rate delivers smooth scrolling and vibrant colors. The flat panel avoids the accidental edge touches that can plague curved displays, while the punch-hole camera cutout is minimal and unobtrusive. Peak brightness is competitive, making the display usable in direct sunlight.</p>
<p>Powered by the Snapdragon 8s Gen 3, the Phone 3 delivers solid mid-range to flagship-tier performance. It handles everyday tasks, multitasking, and moderate gaming with ease. Nothing OS, based on Android 14, provides a clean, near-stock experience with Nothing's distinctive widgets and design touches — including those signature dot-matrix fonts and monochrome icons.</p>`
      },
      {
        heading: 'Camera & Battery',
        content: `<p>The dual-camera system features a 50MP main sensor that produces detailed, well-balanced photos in good lighting. Samsung's image processing delivers natural colors with good dynamic range. The 50MP ultrawide offers consistent color matching with the main sensor, making it useful for landscapes and group shots.</p>
<p>The 5,000mAh battery provides reliable all-day battery life, with 45W wired charging reaching 50% in about 20 minutes. Qi wireless charging adds convenience, and the battery's size ensures the Phone 3 can handle heavy use days without anxiety.</p>`
      }
    ],
    pros: [
      'Unique Glyph Interface with 900+ LEDs — genuinely functional',
      'Distinctive transparent design stands out from every other phone',
      'Clean Nothing OS with near-stock Android experience',
      '5,000mAh battery with 45W fast charging',
      'Competitive camera system with consistent color science',
      '120Hz LTPO AMOLED display'
    ],
    cons: [
      'IP54 rating instead of IP68',
      'Snapdragon 8s Gen 3 is not top-tier flagship',
      'No telephoto lens',
      'Limited availability in some markets',
      'Glyph Interface may not appeal to everyone'
    ],
    verdict: 'The Nothing Phone 3 is the most distinctive smartphone on the market, combining a genuinely useful Glyph Interface with solid performance and a clean software experience. It\'s not trying to compete with flagship specs — instead, it offers something rarer: a phone with real personality. For users who value design, uniqueness, and a clean Android experience over raw specs, the Phone 3 delivers something no other phone can match.'
  },

  'asus-rog-zephyrus-g14-2025-gaming-laptop': {
    sections: [
      {
        heading: 'Design & Portability',
        content: `<p>The ROG Zephyrus G14 has long been the benchmark for portable gaming laptops, and the 2025 model continues that tradition. The CNC-milled aluminum chassis is remarkably compact for a 14-inch gaming laptop, with thin bezels maximizing screen real estate while keeping the overall footprint manageable for daily carry. The AniMe Matrix LED display on the lid (select models) adds a unique touch of personality.</p>
<p>At around 1.72 kg, the G14 is light enough to carry in a backpack without causing fatigue, making it genuinely viable as a daily driver for students and professionals who also game. The build quality is excellent — minimal keyboard flex, a sturdy hinge, and a premium feel throughout that belies its relatively aggressive pricing.</p>`
      },
      {
        heading: 'Display',
        content: `<p>The 14-inch Nebula OLED display is a highlight — offering deep blacks, vibrant colors, and smooth motion with a 120Hz refresh rate. The OLED panel covers 100% DCI-P3 color space, making it excellent for both gaming and creative work. HDR support enhances compatible content, while the compact 14-inch form factor makes the pixel density particularly impressive.</p>
<p>For competitive gaming, the 120Hz refresh rate provides smooth gameplay, though esports enthusiasts may wish for a higher refresh option. The display's color accuracy and contrast make it equally capable for photo editing, video work, and content consumption — a true do-it-all panel.</p>`
      },
      {
        heading: 'Gaming Performance',
        content: `<p>The latest AMD Ryzen processor paired with NVIDIA's RTX graphics delivers impressive gaming performance for a 14-inch laptop. AAA titles run smoothly at the display's native resolution with medium to high settings, while esports titles easily take advantage of the 120Hz panel. The MUX switch allows the GPU to bypass the integrated graphics for maximum performance when plugged in.</p>
<p>ROG's intelligent cooling system with liquid metal thermal compound keeps temperatures in check during extended gaming sessions. The fans are audible under load but maintain a reasonable noise profile that won't dominate your environment — an important consideration for a laptop designed to be used in shared spaces.</p>`
      },
      {
        heading: 'Battery & Daily Use',
        content: `<p>The 76Wh battery provides solid all-day productivity battery life — expect around 8-10 hours for web browsing, document editing, and media consumption. Gaming on battery will significantly reduce this, but the G14's efficiency at lower power states makes it genuinely useful as a portable productivity machine that transforms into a gaming rig when plugged in.</p>
<p>The keyboard offers satisfying travel and responsive feedback, with per-key RGB lighting adding customization. The trackpad is spacious and accurate, and the port selection — including USB-C with power delivery, USB-A, HDMI, and a headphone jack — covers most connectivity needs without requiring dongles.</p>`
      }
    ],
    pros: [
      'Incredibly portable at 1.72 kg for a gaming laptop',
      'Stunning 14-inch Nebula OLED display',
      'Excellent gaming performance for the form factor',
      'Strong battery life for productivity tasks',
      'Premium CNC aluminum build quality',
      'MUX switch for maximum GPU performance'
    ],
    cons: [
      '120Hz display may not satisfy hardcore esports players',
      'Fan noise under sustained heavy loads',
      'Limited port selection compared to larger laptops',
      'Upgrading RAM/storage may require disassembly',
      'Premium pricing for the form factor'
    ],
    verdict: 'The ASUS ROG Zephyrus G14 remains the gold standard for portable gaming laptops. It delivers an exceptional balance of performance, portability, and build quality that\'s hard to match. The OLED display is gorgeous, the gaming performance is impressive for a 14-inch laptop, and the battery life makes it genuinely viable as a daily driver. For users who want one laptop that does everything well — from productivity to gaming to creative work — the G14 is an outstanding choice.'
  },

  'macbook-air-m4-2025-review-specs': {
    sections: [
      {
        heading: 'Design & Build',
        content: `<p>The MacBook Air M4 continues Apple's tradition of refined, minimalist design. The aluminum unibody construction remains best-in-class for laptop build quality, with zero flex in the keyboard deck and a perfectly balanced hinge that opens with one finger. Available in four colors — Midnight, Starlight, Space Gray, and Sky Blue — the Air maintains its iconic wedge-free, flat design.</p>
<p>At just 1.24 kg (M4 model), it's one of the lightest premium laptops available, making it genuinely effortless to carry all day. The fanless design means completely silent operation — a feature that's easy to underestimate until you've worked in a quiet library or recorded audio at your desk. The MagSafe charging port frees up the Thunderbolt ports for peripherals.</p>`
      },
      {
        heading: 'M4 Performance',
        content: `<p>The M4 chip represents a meaningful performance leap over the M3, with improved CPU cores delivering faster single-threaded and multi-threaded performance. Daily tasks like web browsing with dozens of tabs, document editing, and media consumption feel instantaneous. More demanding workloads like photo editing in Lightroom, 4K video editing in Final Cut Pro, and software compilation are handled with surprising capability for a fanless laptop.</p>
<p>The 10-core GPU provides enough graphics power for casual gaming, creative work, and driving external displays at high resolutions. The unified memory architecture (available in 16GB or 24GB configurations) means the system never feels memory-constrained during typical workflows, and the efficiency of Apple Silicon means these configurations are more capable than their specifications suggest.</p>`
      },
      {
        heading: 'Display & Audio',
        content: `<p>The 13.6-inch Liquid Retina display offers excellent color accuracy with P3 wide color gamut support, making it suitable for photo editing and content creation. The 500 nits brightness is adequate for most indoor environments, though the lack of ProMotion (120Hz) means scrolling isn't as fluid as on iPad Pro or MacBook Pro models.</p>
<p>The six-speaker system with force-cancelling woofers delivers surprisingly full sound for such a thin laptop. Spatial Audio support enhances movie watching and music listening, while the three-microphone array with directional beamforming provides clear voice quality for video calls. The 1080p FaceTime camera is improved over previous generations, with better low-light performance.</p>`
      },
      {
        heading: 'Battery & Connectivity',
        content: `<p>Battery life is where the M4 Air truly excels — expect 15-18 hours of real-world use for web browsing, document editing, and media consumption. This is a laptop that genuinely lasts all day without charger anxiety, making it ideal for students, travelers, and anyone who works away from their desk. The MagSafe fast charging can reach 50% in about 30 minutes.</p>
<p>Two Thunderbolt 4 ports (with USB-C), a MagSafe charging port, a 3.5mm headphone jack, and support for Wi-Fi 6E and Bluetooth 5.3 cover the connectivity essentials. The lack of USB-A ports means dongles or hubs for older peripherals, but this is increasingly standard across premium laptops.</p>`
      }
    ],
    pros: [
      'Incredibly thin, light, and silent (fanless) design',
      'M4 chip delivers impressive performance for a fanless laptop',
      '15-18 hour battery life — all-day and then some',
      'Excellent build quality and premium materials',
      'MagSafe charging with fast charge support',
      'Six-speaker system with Spatial Audio'
    ],
    cons: [
      'No ProMotion 120Hz display (still 60Hz)',
      'Limited to two Thunderbolt ports',
      'No USB-A ports — dongles required for some peripherals',
      'Base 16GB RAM may not be enough for very heavy workloads',
      'Starts at $1,099 — not the most affordable option'
    ],
    verdict: 'The MacBook Air M4 is the best laptop for most people. It delivers an exceptional combination of performance, battery life, build quality, and portability that\'s hard to beat at any price. The M4 chip makes it surprisingly capable for creative work, while the fanless design and 15+ hour battery life make it the ultimate everyday machine. Unless you need the ProMotion display or extra ports of the MacBook Pro, the Air is the smarter buy.'
  },

  'ipad-air-7th-gen-2025-specs': {
    sections: [
      {
        heading: 'Design & Display',
        content: `<p>The 7th-generation iPad Air maintains Apple's clean, functional design with its aluminum unibody construction and uniform bezels. Available in 11-inch and 13-inch sizes, both models feature Liquid Retina displays with P3 wide color gamut, True Tone, and anti-reflective coating. The 11-inch model strikes an excellent balance between portability and screen real estate, while the 13-inch option is ideal for multitasking and creative work.</p>
<p>At 462 grams (11-inch) and 617 grams (13-inch), both models are light enough for extended reading and note-taking sessions. The Touch ID sensor integrated into the top button provides quick, reliable authentication, and the USB-C port supports a wide range of accessories and external displays.</p>`
      },
      {
        heading: 'M4 Performance',
        content: `<p>The M4 chip brings the same performance benefits seen in the latest MacBooks to the iPad Air. Apps launch instantly, multitasking in Split View is smooth, and demanding apps like Procreate, LumaFusion, and Adobe Fresco run without compromise. The 10-core GPU provides enough power for complex illustrations, 3D modeling in Shapr3D, and casual gaming.</p>
<p>The M4's efficiency cores handle everyday tasks with minimal power draw, while the performance cores tackle heavier workloads when needed. Combined with 8GB or 16GB of unified memory, the iPad Air handles professional workflows that would choke lesser tablets. The neural engine accelerates machine learning tasks in apps like photo editors and AR experiences.</p>`
      },
      {
        heading: 'Apple Pencil & Accessories',
        content: `<p>The iPad Air supports Apple Pencil Pro, bringing squeeze gestures, barrel roll, and haptic feedback to the creative toolkit. The magnetic attachment and wireless charging keep the pencil ready for use, while the pixel-perfect precision makes it excellent for note-taking, illustration, and document annotation.</p>
<p>The Magic Keyboard attachment transforms the iPad Air into a capable laptop alternative, with a responsive trackpad, backlit keys, and a USB-C pass-through charging port. The combination of Apple Pencil Pro and Magic Keyboard makes the iPad Air one of the most versatile computing devices available — equally capable as a tablet, sketchpad, or laptop replacement.</p>`
      },
      {
        heading: 'Camera & Battery',
        content: `<p>The 12MP rear camera with Focus Pixels provides capable photo and document scanning, while the 12MP front camera with Center Stage keeps you centered during video calls. The landscape stereo speakers deliver clear audio for media consumption and video calls.</p>
<p>Battery life is rated at up to 10 hours of web browsing or video playback — enough for a full day of typical use. USB-C charging means you can use the same charger as your MacBook or iPhone, simplifying your travel kit. The iPad Air doesn't support MagSafe charging, which is one area where the iPad Pro pulls ahead.</p>`
      }
    ],
    pros: [
      'M4 chip delivers excellent performance for a tablet',
      'Apple Pencil Pro support with squeeze and barrel roll',
      'Magic Keyboard transforms it into a laptop alternative',
      'Two size options (11-inch and 13-inch)',
      'Excellent build quality and display',
      'Full-day battery life'
    ],
    cons: [
      'No ProMotion 120Hz display (still 60Hz)',
      'No MagSafe or wireless charging',
      'Base storage starts at 128GB',
      'Magic Keyboard and Apple Pencil sold separately',
      'No Face ID (Touch ID only)'
    ],
    verdict: 'The 7th-generation iPad Air is the best iPad for most users. The M4 chip delivers laptop-class performance, Apple Pencil Pro support makes it a creative powerhouse, and the Magic Keyboard transforms it into a capable laptop alternative. It lacks some Pro features like ProMotion and Face ID, but for the price, it delivers an exceptional combination of versatility, performance, and portability.'
  },

  'apple-watch-series-11-features-specs': {
    sections: [
      {
        heading: 'Design & Build',
        content: `<p>The Apple Watch Series 11 refines Apple's iconic wearable design with a slightly thinner profile and improved durability. Available in 42mm and 46mm sizes, the aluminum and titanium case options provide choices for different budgets and style preferences. The Always-On Retina display is brighter than ever, reaching up to 3,000 nits for excellent outdoor visibility.</p>
<p>The soft-touch textile bands and new Nike and Hermès collaborations provide extensive customization options. The redesigned Digital Crown with haptic feedback offers precise scrolling, while the side button provides quick access to recent apps and emergency features. Water resistance to 50 meters makes it suitable for swimming and water sports.</p>`
      },
      {
        heading: 'Health Features',
        content: `<p>Health tracking is where the Series 11 makes its biggest leap. The new optical heart sensor provides more accurate heart rate readings, while blood oxygen monitoring continues to offer valuable wellness insights. The temperature sensor enables cycle tracking and retrospective ovulation estimates, adding meaningful health data for women's health.</p>
<p>Sleep tracking has been enhanced with more detailed sleep stage analysis (REM, Core, Deep) and sleep coaching recommendations. The Crash Detection and Fall Detection features can automatically alert emergency services, while the Emergency SOS function provides peace of mind for users living alone or engaging in outdoor activities. The new mental health features include mood logging and assessments that can flag potential concerns.</p>`
      },
      {
        heading: 'watchOS & Performance',
        content: `<p>The S10 chip delivers smooth performance across all watchOS 11 features. Apps launch quickly, animations are fluid, and the dual-core processor handles health calculations, workout tracking, and smart notifications without lag. The 4-core neural engine accelerates on-device machine learning for features like sleep analysis and irregular heart rhythm notifications.</p>
<p>watchOS 11 introduces smarter widgets, improved Siri capabilities, and a more personalized watch face experience. The integration with iPhone remains seamless — notifications, calls, and messages flow effortlessly between devices, while the Watch app on iPhone makes customization and health data review intuitive.</p>`
      },
      {
        heading: 'Battery & Connectivity',
        content: `<p>Battery life remains at approximately 18 hours for typical use, with Low Power Mode extending this to up to 72 hours. Fast charging can reach 80% in about 45 minutes, making it easy to top up during a morning routine. The always-on display does impact battery life, but most users find it worth the trade-off for the convenience.</p>
<p>GPS, Bluetooth 5.3, Wi-Fi, and optional LTE provide comprehensive connectivity. The UWB chip enables precise location sharing with other Apple devices, while the built-in compass and altimeter support outdoor navigation and elevation tracking. The speaker and microphone enable phone calls directly from the wrist when your iPhone is nearby.</p>`
      }
    ],
    pros: [
      'Most accurate Apple health sensors to date',
      '3,000-nit Always-On Retina display',
      'Comprehensive crash and fall detection',
      'Excellent sleep tracking with detailed analysis',
      'Seamless iPhone integration',
      'Extensive band and case customization options'
    ],
    cons: [
      '18-hour battery requires daily charging',
      'Only works with iPhone — no Android support',
      'Health features are region-limited',
      'Cellular version requires additional data plan',
      'Premium pricing for titanium models'
    ],
    verdict: 'The Apple Watch Series 11 is the best smartwatch for iPhone users, offering the most comprehensive health tracking, seamless ecosystem integration, and a refined design. The improved health sensors, enhanced sleep tracking, and watchOS 11 features make it a genuine wellness companion rather than just a notification relay. If you use an iPhone and want a smartwatch that genuinely improves your daily health awareness, the Series 11 is an excellent investment.'
  },

  'xiaomi-15-ultra-camera-specs-review': {
    sections: [
      {
        heading: 'Camera System Deep Dive',
        content: `<p>The Xiaomi 15 Ultra's camera system is its headline feature, co-engineered with Leica to deliver one of the most capable mobile photography experiences available. The quad-camera array centers on a 1-inch type main sensor (50MP, f/1.63) that captures exceptional detail and dynamic range, particularly in challenging lighting conditions. The large sensor size provides natural bokeh that rivals dedicated cameras.</p>
<p>The periscope telephoto offers 5x optical zoom with a 120mm equivalent focal length, maintaining impressive detail and color accuracy even at high zoom levels. The ultrawide camera (50MP, f/2.2) provides consistent color matching with the main sensor, making it useful for architecture, landscapes, and group shots. The dedicated macro mode on the ultrawide captures impressive close-up detail.</p>`
      },
      {
        heading: 'Leica Color Science',
        content: `<p>The partnership with Leica extends beyond hardware — the image processing pipeline benefits from Leica's decades of color science expertise. Two distinct color modes are available: Leica Vibrant (saturated, punchy colors ideal for social media) and Leica Authentic (natural, film-like tones that preserve the scene's true character). Both modes produce excellent results, with the choice coming down to personal preference.</p>
<p>The Leica filters — including Summilux, Noctilux, and Miniature — add creative options that go beyond typical smartphone filters, mimicking the rendering characteristics of specific Leica lens families. Night mode leverages the large sensor and computational photography to produce bright, detailed low-light images with minimal noise.</p>`
      },
      {
        heading: 'Design & Display',
        content: `<p>The Xiaomi 15 Ultra features a premium design with a titanium frame and ceramic back option. The circular camera module is a distinctive design element that houses the quad-camera array, and while it does create some desk wobble, it's a reasonable trade-off for the camera capability it enables. At 229 grams, it's not light, but the weight feels justified by the camera hardware.</p>
<p>The 6.73-inch LTPO AMOLED display with 2K resolution and 120Hz refresh rate provides an excellent viewfinder and media consumption experience. The 3,000 nits peak brightness ensures visibility in all conditions, while the AMOLED panel's perfect blacks and vibrant colors make photos and videos look stunning.</p>`
      },
      {
        heading: 'Performance & Battery',
        content: `<p>The Snapdragon 8 Elite processor handles the camera's computational photography demands with ease, processing multi-frame HDR, night mode composites, and AI-enhanced shots quickly. The 16GB of RAM ensures smooth multitasking while editing photos in Lightroom Mobile or sharing to social media.</p>
<p>The 5,500mAh battery provides solid all-day battery life, even with heavy camera use. 90W wired charging and 50W wireless charging mean you can quickly top up between shooting sessions. The combination of large battery and efficient Snapdragon 8 Elite means the Xiaomi 15 Ultra can handle a full day of intensive photography without running out of charge.</p>`
      }
    ],
    pros: [
      '1-inch type main sensor — exceptional image quality',
      '5x optical periscope telephoto zoom',
      'Leica color science with two distinct modes',
      'Excellent night mode performance',
      '2K 120Hz AMOLED display with 3,000 nits',
      '5,500mAh battery with 90W fast charging'
    ],
    cons: [
      '229 grams is heavy for a smartphone',
      'Camera module creates desk wobble',
      'Leica partnership adds premium pricing',
      'MIUI software can feel bloated',
      'Limited global availability compared to Samsung/Apple'
    ],
    verdict: 'The Xiaomi 15 Ultra is the best camera phone for photography enthusiasts who prioritize image quality above all else. The 1-inch type main sensor, 5x periscope telephoto, and Leica color science combine to deliver mobile photography that genuinely rivals dedicated cameras in many conditions. If photography is your primary concern and you\'re comfortable with Xiaomi\'s software ecosystem, the 15 Ultra delivers an unparalleled mobile imaging experience.'
  },

  'samsung-galaxy-s25-s25-plus-review': {
    sections: [
      {
        heading: 'Display & Design',
        content: `<p>The Galaxy S25 and S25+ feature Samsung's refined design language with flatter edges, slimmer bezels, and a more premium feel than their predecessors. Both models use Armor Aluminum frames with Gorilla Glass Victus 2 on front and back, providing excellent durability. The S25's compact 6.2-inch form factor is particularly appealing for users who want a powerful phone that's comfortable to use one-handed.</p>
<p>The Dynamic AMOLED 2X displays on both models deliver stunning visuals with 120Hz adaptive refresh rates, HDR10+ support, and Samsung's signature vibrant color tuning. The S25+ steps up to a QHD+ resolution (vs FHD+ on the S25), providing noticeably sharper text and finer detail — a worthwhile upgrade for users who consume a lot of media or do creative work on their phone.</p>`
      },
      {
        heading: 'Galaxy AI Features',
        content: `<p>The Galaxy AI suite is a major differentiator for the S25 series. Circle to Search lets you identify anything on screen by drawing a circle around it — from landmarks to products to text in foreign languages. Live Translate provides real-time voice and text translation during calls, while Chat Assist helps refine your messaging tone across different apps.</p>
<p>Generative Edit allows sophisticated photo manipulation — moving objects, removing distractions, and filling in backgrounds with AI-generated content that's surprisingly convincing. The AI-powered keyboard suggestions, email summarization, and voice transcription features make the S25 series genuinely more productive than previous Galaxy generations.</p>`
      },
      {
        heading: 'Performance & Camera',
        content: `<p>The Snapdragon 8 Elite for Galaxy delivers excellent performance across both models, with the custom-tuned chip providing marginally better efficiency than the standard variant. Gaming, multitasking, and AI processing all feel snappy and responsive. The 12GB of RAM on the S25+ (8GB on S25) provides better headroom for heavy multitasking.</p>
<p>The camera system features a 50MP main sensor with improved image processing, a 12MP ultrawide, and a 10MP telephoto with 3x optical zoom on the S25 (the S25+ gets the same setup). Photos are detailed with good dynamic range and Samsung's characteristic punchy color science. Night mode has been improved with better noise reduction and more natural-looking results.</p>`
      },
      {
        heading: 'Battery & Value',
        content: `<p>The S25's 4,000mAh battery provides adequate all-day battery life for most users, while the S25+'s larger 4,900mAh cell offers more comfortable headroom for power users. Both support 25W wired charging and 15W wireless charging — adequate but not class-leading. The S25+ supports 45W fast charging, which is a meaningful upgrade for users who need quick top-ups.</p>
<p>Starting at $799 for the S25 and $999 for the S25+, both models offer strong value in the flagship smartphone market. The S25 is the better choice for users who prefer compact phones, while the S25+ suits those who want a larger display and bigger battery without jumping to the Ultra's premium price.</p>`
      }
    ],
    pros: [
      'Comprehensive Galaxy AI feature suite',
      'Snapdragon 8 Elite delivers excellent performance',
      'S25 offers a rare compact flagship option',
      'Improved camera system with better night mode',
      'Bright 120Hz AMOLED displays',
      '七年 of OS updates guaranteed'
    ],
    cons: [
      '25W charging is slower than Chinese competitors',
      'S25 base model only has 8GB RAM',
      'Design evolution is subtle — not a dramatic redesign',
      'No 100x Space Zoom (Ultra exclusive)',
      'Plastic back on base S25 (vs glass on S25+)'
    ],
    verdict: 'The Samsung Galaxy S25 and S25+ deliver a polished, AI-enhanced flagship experience that\'s hard to fault. The Galaxy AI features are genuinely useful productivity tools, the Snapdragon 8 Elite provides excellent performance, and the camera system captures great photos in most conditions. The S25\'s compact size makes it one of the few true compact flagships available, while the S25+ offers the larger display and battery that most users prefer. Both are excellent choices in the flagship smartphone market.'
  }
};

// ─── Parse existing HTML ─────────────────────────────────────────────────────
function parseArticle(html) {
  const meta = {};

  // Extract meta tags
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  meta.fullTitle = titleMatch ? titleMatch[1] : '';
  // Strip duplicate " — PixabAnimation" suffix if present
  meta.fullTitle = meta.fullTitle.replace(/\s*[—–-]\s*PixabAnimation\s*$/i, '').trim();

  const descMatch = html.match(/<meta name="description" content="(.*?)">/);
  meta.description = descMatch ? descMatch[1] : '';

  const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
  meta.ogTitle = ogTitleMatch ? ogTitleMatch[1].replace(/\s*[—–-]\s*PixabAnimation\s*$/i, '').trim() : meta.fullTitle;

  const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)">/);
  meta.ogImage = ogImageMatch ? ogImageMatch[1] : '';

  const ogUrlMatch = html.match(/<meta property="og:url" content="(.*?)">/);
  meta.ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';

  const pubDateMatch = html.match(/<meta property="article:published_time" content="(.*?)">/);
  meta.publishedDate = pubDateMatch ? pubDateMatch[1] : '';

  const modDateMatch = html.match(/<meta property="article:modified_time" content="(.*?)">/);
  meta.modifiedDate = modDateMatch ? modDateMatch[1] : meta.publishedDate;

  const authorMatch = html.match(/<meta property="article:author" content="(.*?)">/);
  meta.author = authorMatch ? authorMatch[1] : 'PixabAnimation Team';

  const sectionMatch = html.match(/<meta property="article:section" content="(.*?)">/);
  meta.category = sectionMatch ? sectionMatch[1] : 'Tech';

  const timeMatch = html.match(/"timeRequired":\s*"(\d+) min read"/);
  meta.readingTime = timeMatch ? parseInt(timeMatch[1]) : 8;

  // Extract slug from URL
  const slugMatch = meta.ogUrl.match(/\/blog\/(.+)\.html/);
  meta.slug = slugMatch ? slugMatch[1] : '';

  // Extract canonical
  const canonicalMatch = html.match(/<link rel="canonical" href="(.*?)">/);
  meta.canonical = canonicalMatch ? canonicalMatch[1] : '';

  // Extract keywords
  const kwMatch = html.match(/"keywords":\s*"(.*?)"/);
  meta.keywords = kwMatch ? kwMatch[1] : '';

  // Extract all article:tag values
  const tagMatches = [...html.matchAll(/<meta property="article:tag" content="(.*?)">/g)];
  meta.tags = tagMatches.map(m => m[1]);

  // Extract JSON-LD
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  meta.jsonLd = jsonLdMatches.map(m => m[1].trim());

  // Extract article body content - handle nested divs properly
  let bodyContent = '';
  const contentTag = '<div class="blog-content">';
  const contentStartIdx = html.indexOf(contentTag);
  if (contentStartIdx !== -1) {
    const afterStart = contentStartIdx + contentTag.length;
    let depth = 1;
    let pos = afterStart;
    while (pos < html.length && depth > 0) {
      const nextOpen = html.indexOf('<div', pos);
      const nextClose = html.indexOf('</div>', pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check if this is actually an opening div (not inside a string or attribute)
        depth++;
        pos = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          bodyContent = html.substring(afterStart, nextClose).trim();
        }
        pos = nextClose + 6;
      }
    }
  }
  meta.bodyContent = bodyContent;

  // Extract tags from HTML
  const tagSectionMatch = html.match(/<div class="tags-section">([\s\S]*?)<\/div>\s*<div class="share-section"/);
  meta.tagsHtml = tagSectionMatch ? tagSectionMatch[1] : '';

  // Extract share section
  const shareMatch = html.match(/<div class="share-section">([\s\S]*?)<\/div>\s*<div class="author-bio"/);
  meta.shareHtml = shareMatch ? shareMatch[1] : '';

  return meta;
}

// ─── Extract headings from content for TOC ────────────────────────────────────
function extractHeadings(content) {
  const headings = [];
  // Match h2 and h3 tags
  const h2Matches = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];
  const h3Matches = [...content.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];

  for (const m of h2Matches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    const id = text.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    headings.push({ level: 2, text, id });
  }
  for (const m of h3Matches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    const id = text.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    headings.push({ level: 3, text, id });
  }

  // Also detect <strong> tags used as subheadings in thin articles
  const strongMatches = [...content.matchAll(/<strong>(.*?)<\/strong>/g)];
  for (const m of strongMatches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    // Only include if it looks like a heading (short, no period)
    if (text.length > 3 && text.length < 80 && !text.includes('.') && !text.includes(',')) {
      const id = text.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
      if (!headings.find(h => h.id === id)) {
        headings.push({ level: 2, text, id });
      }
    }
  }

  return headings;
}

// ─── Assign heading IDs to content ────────────────────────────────────────────
function assignHeadingIds(content) {
  let result = content;
  // Add IDs to h2 tags
  result = result.replace(/<h2>(.*?)<\/h2>/g, (match, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const id = cleanText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    return `<h2 id="${id}">${text}</h2>`;
  });
  result = result.replace(/<h2 ([^>]*)>(.*?)<\/h2>/g, (match, attrs, text) => {
    if (attrs.includes('id=')) return match;
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const id = cleanText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    return `<h2 id="${id}" ${attrs}>${text}</h2>`;
  });
  // Add IDs to h3 tags
  result = result.replace(/<h3>(.*?)<\/h3>/g, (match, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const id = cleanText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
    return `<h3 id="${id}">${text}</h3>`;
  });
  return result;
}

// ─── Generate TOC HTML ────────────────────────────────────────────────────────
function generateTocHtml(headings) {
  if (headings.length === 0) return '';
  let html = '<ul class="toc-list">';
  for (const h of headings) {
    const cls = h.level === 3 ? ' class="toc-h3"' : '';
    html += `<li${cls}><a href="#${h.id}">${h.text}</a></li>`;
  }
  html += '</ul>';
  return html;
}

// ─── Format date helpers ──────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function fmtDateShort(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Category color mapping ──────────────────────────────────────────────────
const CAT_COLORS = {
  'AI': '#4338CA', 'Web': '#5856d6', 'Animation': '#059669', 'Design': '#D97706',
  'Freelancing': '#DC2626', 'Technology': '#0891B2', 'Career': '#7C3AED',
  'VFX': '#E11D48', 'Typography': '#0D9488', 'Tools': '#EA580C',
  'Resources': '#2563EB', 'Mobile Phone': '#059669', 'Laptop': '#2563EB',
  'Tablet': '#7C3AED', 'Wearable': '#D97706',
  'Artificial Intelligence & Motion Design': '#4338CA',
  'AI Technology': '#4338CA', 'AI & Design': '#4338CA',
  'AI & Video Production': '#4338CA', 'AI & Coding Tools': '#4338CA',
  'Animation Techniques': '#059669', 'Animation Fundamentals': '#059669',
  'Web Animation': '#5856d6', 'Web Design': '#5856d6',
  'Web Development': '#5856d6', 'Web Performance': '#5856d6',
};

function getCatColor(cat) {
  return CAT_COLORS[cat] || '#4338CA';
}

// ─── Generate enhanced content for thin articles ──────────────────────────────
function getEnhancedContent(slug, originalContent) {
  const enhancement = ENHANCED_CONTENT[slug];
  if (!enhancement) return null;
  // Skip if already enhanced (has verdict-box from previous run)
  if (originalContent.includes('verdict-box') || originalContent.includes('pros-cons-card')) {
    return null;
  }

  // Build enhanced content: insert sections before the verdict
  let enhanced = originalContent;

  // Convert <strong>Verdict</strong> to proper h2 + verdict box
  enhanced = enhanced.replace(/<strong>Verdict<\/strong>\s*<p>(.*?)<\/p>/s, (match, verdictText) => {
    const finalVerdict = enhancement.verdict || verdictText;
    return '<div class="verdict-box"><h3>Verdict</h3><p>' + finalVerdict + '</p></div>';
  });

  // Also handle case where verdict uses different text
  if (!enhanced.includes('verdict-box')) {
    enhanced = enhanced.replace(/<strong>([^<]*[Vv]erdict[^<]*)<\/strong>\s*<p>(.*?)<\/p>/is,
      (match, title, text) => {
        const finalVerdict = enhancement.verdict || text;
        return '<div class="verdict-box"><h3>Verdict</h3><p>' + finalVerdict + '</p></div>';
      }
    );
  }

  // If still no verdict box, just add one at the end
  if (!enhanced.includes('verdict-box') && enhancement.verdict) {
    enhanced += '\n<div class="verdict-box"><h3>Verdict</h3><p>' + enhancement.verdict + '</p></div>';
  }

  // Insert analysis sections before the spec tables
  let sectionsHtml = '';
  for (const section of enhancement.sections) {
    sectionsHtml += `\n<h2>${section.heading}</h2>\n${section.content}\n`;
  }

  // Insert pros/cons before verdict
  let prosConsHtml = '<div class="pros-cons-card"><div class="pros"><h4><i class="fas fa-check-circle"></i> Pros</h4><ul>';
  for (const pro of enhancement.pros) {
    prosConsHtml += `<li>${pro}</li>`;
  }
  prosConsHtml += '</ul></div><div class="cons"><h4><i class="fas fa-times-circle"></i> Cons</h4><ul>';
  for (const con of enhancement.cons) {
    prosConsHtml += `<li>${con}</li>`;
  }
  prosConsHtml += '</ul></div></div>';

  // Place analysis sections before the first spec table or <strong> specifications
  if (enhanced.includes('spec-table-wrap')) {
    enhanced = enhanced.replace(/(<strong>(?:Specifications?|Complete Specifications)[^<]*<\/strong>)/,
      sectionsHtml + '\n' + '$1'
    );
    // If no match on "Specifications", insert before first spec-table-wrap
    if (!enhanced.includes(sectionsHtml)) {
      enhanced = enhanced.replace(/(<style>[\s\S]*?<\/style>\s*<div class="spec-table-wrap")/,
        sectionsHtml + '\n$1'
      );
    }
  } else {
    // No spec tables — insert before verdict
    enhanced = enhanced.replace(/(<div class="verdict-box")/, sectionsHtml + '\n' + prosConsHtml + '\n$1');
    return enhanced;
  }

  // Insert pros/cons before verdict box — escape $ to prevent regex backreference
  enhanced = enhanced.replace(/(<div class="verdict-box")/, prosConsHtml.replace(/\$/g, '$$$$') + '\n$1');

  return enhanced;
}

// ─── All blog posts (for related articles) ────────────────────────────────────
let allPosts = [];

// ─── Generate full HTML page ──────────────────────────────────────────────────
function generatePage(meta, enhancedContent) {
  const content = assignHeadingIds(enhancedContent || meta.bodyContent);
  const headings = extractHeadings(content);
  const tocHtml = generateTocHtml(headings);

  // Find related articles (same category, different slug)
  const related = allPosts
    .filter(p => p.category === meta.category && p.slug !== meta.slug)
    .slice(0, 3);
  // If not enough same-category, fill from other posts
  if (related.length < 3) {
    const more = allPosts
      .filter(p => p.slug !== meta.slug && !related.find(r => r.slug === p.slug))
      .slice(0, 3 - related.length);
    related.push(...more);
  }

  const relatedHtml = related.length > 0 ? `
  <div class="related-articles">
    <h2 class="related-articles-title">Related Articles</h2>
    <div class="related-grid">
${related.map(p => `      <a href="${p.slug}.html" class="related-card">
        <img src="${p.coverImage}" alt="${esc(p.title)}" class="related-card-img" loading="lazy">
        <div class="related-card-body">
          <div class="related-card-cat">${esc(p.category)}</div>
          <div class="related-card-title">${esc(p.title)}</div>
          <div class="related-card-meta">${fmtDateShort(p.date)} · ${p.reading_time || 8} min read</div>
        </div>
      </a>`).join('\n')}
    </div>
  </div>` : '';

  // Build tag links
  const tagLinks = meta.tags.map(t => `<a href="index.html" class="tag">${esc(t)}</a>`).join('\n      ');

  // Get original share links from meta
  const shareUrl = meta.canonical || `${BASE_URL}/blog/${meta.slug}.html`;
  const shareTitle = encodeURIComponent(meta.ogTitle || meta.fullTitle.replace(/ — PixabAnimation$/, ''));
  const shareDesc = encodeURIComponent(meta.description);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(meta.fullTitle)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta property="og:title" content="${esc(meta.ogTitle)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:image" content="${esc(meta.ogImage)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(meta.ogUrl)}">
  <meta property="og:site_name" content="PixabAnimation">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="${meta.publishedDate}">
  <meta property="article:modified_time" content="${meta.modifiedDate}">
  <meta property="article:author" content="${esc(meta.author)}">
  <meta property="article:section" content="${esc(meta.category)}">
${meta.tags.map(t => `  <meta property="article:tag" content="${esc(t)}">`).join('\n')}
  <meta name="twitter:site" content="@pixabanimation">
  <meta name="twitter:creator" content="@pixabanimation">
  <meta name="twitter:title" content="${esc(meta.ogTitle)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${esc(meta.ogImage)}">
  <link rel="canonical" href="${esc(meta.canonical)}">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="blog.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${esc(meta.ogTitle)}",
  "description": "${esc(meta.description)}",
  "image": "${esc(meta.ogImage)}",
  "datePublished": "${meta.publishedDate}",
  "dateModified": "${meta.modifiedDate}",
  "author": {
    "@type": "Organization",
    "name": "${esc(meta.author)}",
    "url": "${BASE_URL}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PixabAnimation",
    "logo": {
      "@type": "ImageObject",
      "url": "${BASE_URL}/assets/pixabanimation-logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${esc(meta.ogUrl)}"
  },
  "keywords": "${esc(meta.keywords)}",
  "articleSection": "${esc(meta.category)}",
  "timeRequired": "${meta.readingTime} min read"
}
  </script>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "${BASE_URL}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "${BASE_URL}/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${esc(meta.ogTitle)}",
      "item": "${esc(meta.ogUrl)}"
    }
  ]
}
  </script>
  <link rel="icon" type="image/png" href="${BASE_URL}/assets/pixabanimation-logo.png" sizes="32x32">
  <link rel="apple-touch-icon" type="image/png" href="${BASE_URL}/assets/pixabanimation-logo.png" sizes="180x180">
  <meta name="msapplication-TileColor" content="#4338CA">
  <meta name="theme-color" content="#FAF8F5">
</head>
<body>
  <!-- Reading Progress Bar -->
  <div class="reading-progress" id="readingProgress"></div>

  <!-- Navigation -->
  <nav class="blog-navbar" id="navbar">
    <div class="blog-nav-container">
      <button class="blog-nav-toggle" id="navToggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="blog-nav-links" id="navLinks">
        <li><a href="${BASE_URL}/" class="blog-nav-brand">
          <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation" width="28" height="24">
          PixabAnimation
        </a></li>
        <li><a href="${BASE_URL}/">Home</a></li>
        <li><a href="${BASE_URL}/#/shop">Shop</a></li>
        <li><a href="${BASE_URL}/#/shop?category=videos">Videos</a></li>
        <li><a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">Plugins</a></li>
        <li><a href="index.html" class="active">Blog</a></li>
        <li><a href="${BASE_URL}/#/about">About</a></li>
        <li><a href="${BASE_URL}/#/contact">Contact</a></li>
      </ul>
      <div class="blog-nav-actions">
        <a href="${BASE_URL}/#/wishlist"><i class="fas fa-heart"></i></a>
        <a href="${BASE_URL}/#/cart"><i class="fas fa-shopping-bag"></i></a>
        <a href="${BASE_URL}/#/login" class="btn btn-sm btn-primary" style="background:var(--accent);color:#fff;padding:6px 16px;border-radius:9999px;font-size:.82rem;font-weight:600;text-decoration:none">Sign In</a>
      </div>
    </div>
  </nav>

  <!-- Breadcrumbs -->
  <div class="breadcrumb-bar">
    <a href="${BASE_URL}/">Home</a><span class="sep">/</span>
    <a href="index.html">Blog</a><span class="sep">/</span>
    <a href="index.html">${esc(meta.category)}</a><span class="sep">/</span>
    <span class="current">${esc(meta.ogTitle)}</span>
  </div>

  <!-- Blog Layout -->
  <div class="blog-wrapper">
    <article>
      <!-- Hero -->
      <div class="article-hero">
        <a href="index.html" class="article-category-badge"><i class="fas fa-tag" style="font-size:0.7rem"></i> ${esc(meta.category)}</a>
        <h1>${esc(meta.ogTitle)}</h1>
        <div class="article-meta-row">
          <span class="meta-item"><i class="fas fa-calendar-alt"></i> ${fmtDate(meta.publishedDate)}</span>
          <span class="meta-dot"></span>
          <span class="meta-item"><i class="fas fa-user"></i> ${esc(meta.author)}</span>
          <span class="meta-dot"></span>
          <span class="reading-time-badge"><i class="fas fa-clock"></i> ${meta.readingTime} min read</span>
        </div>
      </div>

      <!-- Cover Image -->
      <div class="blog-cover">
        <img src="${esc(meta.ogImage)}" alt="${esc(meta.ogTitle)}" loading="lazy">
      </div>

      <!-- Mobile TOC -->
      <div class="mobile-toc" id="mobileToc">
        <button class="mobile-toc-toggle" onclick="document.getElementById('mobileToc').classList.toggle('open')">
          <span><i class="fas fa-list" style="margin-right:8px"></i> Table of Contents</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        ${tocHtml}
      </div>

      <!-- Article Content -->
      <div class="blog-content">
${content}
      </div>

      <!-- Tags -->
      <div class="tags-section">
        <div class="label">Tags</div>
        ${tagLinks}
      </div>

      <!-- Share -->
      <div class="share-section">
        <span class="label">Share</span>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" class="share-btn" title="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}" target="_blank" class="share-btn" title="Share on X"><i class="fab fa-x-twitter"></i></a>
        <a href="https://www.pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareDesc}" target="_blank" class="share-btn" title="Share on Pinterest"><i class="fab fa-pinterest-p"></i></a>
        <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.innerHTML='<i class=\\'fas fa-check\\'></i>';setTimeout(()=>{this.innerHTML='<i class=\\'fas fa-link\\'></i>'},1500)})" title="Copy link"><i class="fas fa-link"></i></button>
      </div>

      <!-- Author Bio -->
      <div class="author-bio">
        <div class="author-avatar">P</div>
        <div class="author-info">
          <div class="name">${esc(meta.author)}</div>
          <div class="desc">PixabAnimation creates premium motion graphics, animation assets, and stock footage used by creators worldwide. Our team of motion designers and creative technologists explores the intersection of animation and emerging technology.</div>
        </div>
        <div class="author-social">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>

      <!-- Ad Slots -->
      <div id="ad-slot-1-article"></div>
      <div id="ad-slot-2-article" style="margin-top:16px"></div>
      <div id="ad-slot-3-article" style="margin-top:16px"></div>

      <!-- Useful Links -->
      <div class="useful-links">
        <div class="label">Useful Links</div>
        <div class="grid">
          <a href="${BASE_URL}/#/shop"><i class="fas fa-shopping-bag" style="margin-right:6px"></i> Shop Premium Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos"><i class="fas fa-video" style="margin-right:6px"></i> Motion Graphics Stock</a>
          <a href="${BASE_URL}/#/about"><i class="fas fa-info-circle" style="margin-right:6px"></i> About PixabAnimation</a>
          <a href="${BASE_URL}/"><i class="fas fa-home" style="margin-right:6px"></i> Return to Homepage</a>
        </div>
      </div>
    </article>

    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Reading Progress -->
      <div class="sidebar-section reading-progress-sidebar">
        <div class="progress-text" id="readingPercent">0%</div>
        <div class="progress-label">Read</div>
      </div>

      ${tocHtml ? `
      <!-- Table of Contents -->
      <div class="sidebar-section">
        <div class="sidebar-title">Contents</div>
        ${tocHtml}
      </div>` : ''}

      <!-- Recent Posts -->
      <div class="sidebar-section">
        <div class="sidebar-title">Recent Posts</div>
${allPosts.filter(p => p.slug !== meta.slug).slice(0, 4).map(p => `        <a href="${p.slug}.html" class="sidebar-post">
          <span class="icon"><i class="fas fa-file-alt" style="color:${getCatColor(p.category)}"></i></span>
          <div><div class="title">${esc(p.title)}</div><div class="date">${fmtDateShort(p.date)}</div></div>
        </a>`).join('\n')}
      </div>

      <!-- Popular Tags -->
      <div class="sidebar-section">
        <div class="sidebar-title">Popular Tags</div>
        <div class="sidebar-tags">
${getTopTags().map(t => `          <a href="index.html" class="sidebar-tag" onclick="return plSearchTag('${esc(t)}')">${esc(t)}</a>`).join('\n')}
        </div>
      </div>

      <!-- Authors -->
      <div class="sidebar-section">
        <div class="sidebar-title">Authors</div>
        <div class="sidebar-author">
          <div class="initial">P</div>
          <div><div class="name">PixabAnimation</div><div class="role">Content Creator</div></div>
        </div>
        <div class="sidebar-author">
          <div class="initial" style="background:linear-gradient(135deg,#7C3AED,#A78BFA)">S</div>
          <div><div class="name">SPurno</div><div class="role">Motion Design Expert</div></div>
        </div>
      </div>

      <!-- Ads -->
      <div class="sidebar-section">
        <div class="sidebar-title">Sponsored</div>
        <div id="ad-slot-1"><div class="blog-ad-container"><div class="blog-ad-inner"><span class="blog-ad-label">Ad</span><div class="blog-ad-content"><div class="blog-ad-icon"><i class="fas fa-cube"></i></div><div class="blog-ad-text"><h3>Premium Motion Graphics</h3><p>4000+ professional 4K motion backgrounds and templates.</p><a href="${BASE_URL}/#/shop" class="blog-ad-cta">Browse <i class="fas fa-arrow-right"></i></a></div></div></div></div></div>
        <div id="ad-slot-2" style="margin-top:12px"></div>
        <div id="ad-slot-3" style="margin-top:12px"></div>
      </div>
    </aside>

    ${relatedHtml}

    <!-- Back -->
    <div class="back-section">
      <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back to Blog</a>
    </div>
  </div>

  <!-- Footer -->
  <footer class="blog-footer">
    <div class="blog-footer-content">
      <div class="blog-footer-grid">
        <div class="blog-footer-brand">
          <img src="${BASE_URL}/assets/pixabanimation-logo.png" alt="PixabAnimation Logo" width="28" height="24" loading="lazy" style="filter:brightness(0) invert(1)">
          <span class="name">PixabAnimation</span>
          <p class="desc">Premium motion graphics, animation assets, and creative tools for editors, motion designers, and content creators worldwide.</p>
          <div class="blog-footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="blog-footer-col">
          <h4>Shop</h4>
          <a href="${BASE_URL}/#/shop">All Assets</a>
          <a href="${BASE_URL}/#/shop?category=videos">Animation & Video</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">AE Plugins</a>
          <a href="${BASE_URL}/#/shop?category=background-animation">Backgrounds</a>
        </div>
        <div class="blog-footer-col">
          <h4>Categories</h4>
          <a href="${BASE_URL}/#/shop?category=videos">Motion Graphics</a>
          <a href="${BASE_URL}/#/shop?category=adobe-after-effect-plugins">Plugins</a>
          <a href="${BASE_URL}/#/shop?category=green-screen-mockup">Green Screen</a>
          <a href="${BASE_URL}/#/shop?category=ads-design">Advertising</a>
        </div>
        <div class="blog-footer-col">
          <h4>Support</h4>
          <a href="${BASE_URL}/#/contact">Contact Us</a>
          <a href="${BASE_URL}/#/about">About Us</a>
          <a href="${BASE_URL}/#/privacy-policy">Privacy Policy</a>
          <a href="${BASE_URL}/#/terms-of-use">Terms of Use</a>
          <a href="index.html">Blog</a>
        </div>
        <div class="blog-footer-col blog-footer-col-newsletter">
          <h4>Stay in the Loop</h4>
          <p class="blog-footer-newsletter-text">Get early access to new releases and creative inspiration.</p>
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
          <a href="${BASE_URL}/#/refund-policy">Refunds</a>
          <a href="${BASE_URL}/#/terms-of-use">Terms</a>
          <a href="${BASE_URL}/#/contact">Support</a>
        </div>
        <p class="blog-footer-bottom-copy">&copy; 2026 PixabAnimation & SPurno. All rights reserved.</p>
        <div class="blog-footer-payment-icons">
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14"><rect width="20" height="20" rx="4" fill="#8622E7"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">S</text></svg> Skrill</span>
          <span class="payment-icon-text"><svg viewBox="0 0 20 20" width="14" height="14"><rect width="20" height="20" rx="4" fill="#2D9CDB"/><text x="10" y="14" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">P</text></svg> Payoneer</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
  // Navbar scroll
  window.addEventListener('scroll', function() {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
  // Mobile nav toggle
  document.addEventListener('click', function(e) {
    var toggle = e.target.closest('#navToggle');
    if (toggle) { document.getElementById('navLinks').classList.toggle('open'); return; }
    if (!e.target.closest('.blog-nav-links') && !e.target.closest('#navToggle')) {
      document.getElementById('navLinks').classList.remove('open');
    }
  });
  // Reading progress
  (function() {
    var bar = document.getElementById('readingProgress');
    var pct = document.getElementById('readingPercent');
    var article = document.querySelector('article');
    if (!bar || !article) return;
    function update() {
      var rect = article.getBoundingClientRect();
      var total = article.scrollHeight - window.innerHeight;
      var scrolled = -rect.top;
      var percent = Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)));
      bar.style.width = percent + '%';
      if (pct) pct.textContent = percent + '%';
    }
    window.addEventListener('scroll', update);
    update();
  })();
  // Active TOC highlighting
  (function() {
    var links = document.querySelectorAll('.toc-list a');
    if (links.length === 0) return;
    var ids = Array.from(links).map(function(a) { return a.getAttribute('href').slice(1); });
    function highlight() {
      var scrollY = window.scrollY + 100;
      var current = '';
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= scrollY) current = ids[i];
      }
      links.forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }
    window.addEventListener('scroll', highlight);
    highlight();
  })();
  </script>

  <!-- Popup Ad Container -->
  <div class="popup-ad-overlay" id="popupAdContainer"></div>

  <!-- Blog Ad Scripts -->
  <script src="../js/blog-ads.js"></script>
  <script src="../js/popup-ads.js"></script>
</body>
</html>`;
}

// ─── Helper: Escape HTML ──────────────────────────────────────────────────────
function esc(s) {
  if (typeof s !== 'string') s = String(s || '');
  // First decode any existing HTML entities to avoid double-escaping
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Then escape
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Helper: Get top tags across all posts ────────────────────────────────────
function getTopTags() {
  const count = {};
  allPosts.forEach(p => {
    (p.tags || []).forEach(t => { count[t] = (count[t] || 0) + 1; });
  });
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('Reading blog articles from blog/ directory...\n');

  const files = readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  console.log(`Found ${files.length} article files.\n`);

  // First pass: parse all articles to build the allPosts array
  for (const file of files) {
    const html = readFileSync(join(blogDir, file), 'utf-8');
    const meta = parseArticle(html);
    allPosts.push({
      slug: meta.slug || file.replace('.html', ''),
      title: meta.ogTitle || meta.fullTitle.replace(/ — PixabAnimation$/, ''),
      category: meta.category,
      date: meta.publishedDate,
      coverImage: meta.ogImage,
      reading_time: meta.readingTime,
      tags: meta.tags
    });
  }

  // Sort posts by date (newest first)
  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`Parsed ${allPosts.length} articles. Starting regeneration...\n`);

  // Second pass: regenerate each article
  let enhanced = 0;
  let regenerated = 0;

  for (const file of files) {
    const filepath = join(blogDir, file);
    const html = readFileSync(filepath, 'utf-8');
    const meta = parseArticle(html);

    // Try to enhance thin articles
    let content = meta.bodyContent;
    const slug = meta.slug || file.replace('.html', '');
    const enhancedContent = getEnhancedContent(slug, content);
    if (enhancedContent) {
      content = enhancedContent;
      enhanced++;
      console.log(`  ✨ Enhanced: ${file}`);
    }

    // Generate new page
    const newHtml = generatePage(meta, content);
    writeFileSync(filepath, newHtml, 'utf-8');
    regenerated++;
    console.log(`  ✅ Regenerated: ${file} (${(newHtml.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n📊 Summary: ${regenerated} regenerated, ${enhanced} enhanced with new content`);
  console.log('🎉 Blog redesign complete!');
}

main();
