-- Seed Data for Ecommerce Database

-- Categories will be created through the admin panel.
-- Products will be added through the admin panel.

-- Demo user (password: "password123" — SHA-256 hashed)
INSERT OR IGNORE INTO users (id, name, email, password, avatar_url, phone, additional_email, is_admin) VALUES
(1, 'Demo User', 'demo@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', '+1 (555) 123-4567', 'demo.alternate@example.com', 0);

-- Admin user (password: "admin123" — SHA-256 hashed)
INSERT OR IGNORE INTO users (id, name, email, password, avatar_url, phone, additional_email, is_admin) VALUES
(2, 'Admin', 'admin@pixabanimation.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', '+1 (555) 987-6543', 'admin.secondary@pixabanimation.com', 1);

-- Sample reviews for video products
INSERT OR IGNORE INTO reviews (id, product_id, author_name, rating, comment) VALUES
(1, 13, 'Alex M.', 5, 'Absolutely stunning footage! The 4K quality is incredible and the variety of scenes is amazing.'),
(2, 13, 'Sarah K.', 4, 'Beautiful nature footage. Would love even more scenes, but what is included is top quality.'),
(3, 15, 'James R.', 5, 'Best motion graphics pack I have ever purchased. So many useful elements!'),
(4, 16, 'Emma L.', 5, 'The logo reveal templates saved me hours of work. Client was blown away!'),
(5, 18, 'Michael P.', 4, 'Great typography pack. Easy to customize and looks professional out of the box.'),
(6, 14, 'Olivia W.', 5, 'The urban time-lapse compilation is breathtaking. The day-to-night transitions are incredible!'),
(7, 14, 'Tom H.', 4, 'Great quality footage. The 4K HDR really makes the city lights pop at night.'),
(8, 15, 'Nina P.', 5, 'Worth every penny. The fluid shapes are perfect for my music visualizer project.'),
(9, 16, 'Chris B.', 5, 'These logo reveals look so professional. My clients are always impressed.'),
(10, 17, 'Maya S.', 4, 'The story templates are trendy and easy to customize. Great for Instagram.'),
(11, 18, 'Ryan T.', 5, 'The kinetic text animations are smooth and polished. Highly recommend!'),
(12, 19, 'Sophia L.', 5, 'Over 100 particle effects and they all look amazing. The fire effects are so realistic.'),
(13, 20, 'Daniel C.', 4, 'Really smooth transitions. The glitch effects are my favorite.'),
(14, 22, 'Emily R.', 5, 'This vlog pack is a game changer. Everything I need in one bundle.'),
(15, 25, 'Lucas M.', 5, 'The animated charts make my data presentations actually interesting to watch.');

-- Sample coupon
INSERT OR IGNORE INTO coupons (id, code, discount_percent, min_purchase, expires_at) VALUES
(1, 'WELCOME10', 10, 50, '2027-12-31 23:59:59'),
(2, 'SAVE20', 20, 100, '2027-12-31 23:59:59');

-- Sample newsletter subscribers
INSERT OR IGNORE INTO newsletter_subscribers (id, email, name, active) VALUES
(1, 'sarah.johnson@email.com', 'Sarah Johnson', 1),
(2, 'unsubscribed.user@email.com', NULL, 0);

-- Blog Ads (3 default placements matching all 40 blog pages)
INSERT OR IGNORE INTO blog_ads (id, name, ad_type, icon, title, description, cta_text, cta_url, target_pages, is_active, sort_order) VALUES
(1, 'Premium Motion Graphics Assets', 'ad1', 'fa-cube', 'Premium Motion Graphics Assets', 'Browse 500+ professional 4K motion backgrounds, animated templates, and stock footage — crafted for creators who demand the best.', 'Browse Collection', 'https://pixabanimation.github.io/#/shop', 'all', 1, 0),
(2, '4K Video Clips & Templates', 'ad2', 'fa-film', '4K Video Clips & Templates', 'Royalty-free motion graphics, lower thirds, and title animations for your next project.', 'Explore Library', 'https://pixabanimation.github.io/#/shop?category=videos', 'all', 1, 0),
(3, 'After Effects Templates', 'ad3', 'fa-layer-group', 'After Effects Templates', 'Professional logo reveals, typography animations, and infographic templates designed to make an impact.', 'View Collection', 'https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins', 'all', 1, 0);

-- Sample contact messages with admin replies
INSERT OR IGNORE INTO contact_messages (id, user_id, name, email, subject, message, admin_reply, replied_by, replied_at, is_read) VALUES
(1, 2, 'John Smith', 'john.smith@email.com', 'Question about licensing', 'I am interested in using your nature reel for a commercial project. Can you tell me more about the licensing options?', 'Hi John! All our assets come with a Standard License that covers commercial use in client projects. For broadcast/film use, please reach out about our Extended License. Let me know if you have more questions!', 2, '2026-06-15 10:30:00', 1),
(2, NULL, 'Rachel Green', 'rachel.green@email.com', 'Custom animation request', 'Hi there! I am looking for a custom animated logo for my startup. Do you offer custom animation services?', NULL, NULL, NULL, 0),
(3, 1, 'David Kim', 'david.kim@email.com', 'Download issue', 'I purchased the Abstract Motion Graphics Pack but the download link does not seem to be working. Can you help?', 'I have resent the download link to your email. Please check your inbox and let us know if you have any further issues!', 2, '2026-06-14 14:15:00', 1);
