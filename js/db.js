// ============================================
// pixabanimation — Database Layer (Turso/libsql)
// ============================================

const DB = {
  client: null,

  init() {
    this.client = window.__tursoClient;
    if (!this.client) {
      console.error('Turso client not initialized');
    }
    return this;
  },

  async query(sql, params = []) {
    try {
      const result = await this.client.execute({ sql, args: params });
      return result.rows || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async execute(sql, params = []) {
    try {
      const result = await this.client.execute({ sql, args: params });
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  },

  // === Products ===
  async getProducts(filters = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      sql += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
      params.push(filters.category);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.featured) {
      sql += ' AND featured = 1';
    }
    if (filters.min_price) {
      sql += ' AND price >= ?';
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      sql += ' AND price <= ?';
      params.push(filters.max_price);
    }

    // Sorting
    const sortMap = {
      'newest': 'created_at DESC',
      'price-asc': 'price ASC',
      'price-desc': 'price DESC',
      'rating': 'rating DESC',
      'name': 'name ASC'
    };
    const orderBy = sortMap[filters.sort] || 'created_at DESC';
    sql += ` ORDER BY ${orderBy}`;

    // Pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.query(sql, params);
  },

  async getProduct(slug) {
    const products = await this.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
      [slug]
    );
    return products.length > 0 ? products[0] : null;
  },

  async getProductById(id) {
    const products = await this.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );
    return products.length > 0 ? products[0] : null;
  },

  async getFeaturedProducts() {
    return this.query('SELECT * FROM products WHERE featured = 1 ORDER BY rating DESC LIMIT 8');
  },

  async getProductsByCategory(categorySlug, limit = 4) {
    return this.query(
      `SELECT p.* FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE c.slug = ? 
       ORDER BY p.rating DESC 
       LIMIT ?`,
      [categorySlug, limit]
    );
  },

  // === Categories ===
  async getCategories() {
    const categories = await this.query('SELECT * FROM categories ORDER BY name');
    // Add product count
    for (let cat of categories) {
      const countResult = await this.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
        [cat.id]
      );
      cat.product_count = countResult[0]?.count || 0;
    }
    return categories;
  },

  async getCategory(slug) {
    const categories = await this.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return categories.length > 0 ? categories[0] : null;
  },

  async createCategory(data) {
    const { name, slug, image_url, description } = data;
    const result = await this.execute(
      'INSERT INTO categories (name, slug, image_url, description) VALUES (?, ?, ?, ?)',
      [name, slug, image_url || null, description || null]
    );
    return result.lastInsertRowid;
  },

  async updateCategory(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'slug', 'image_url', 'description'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    params.push(id);
    return this.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteCategory(id) {
    // Unlink products from this category first
    await this.execute('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
    return this.execute('DELETE FROM categories WHERE id = ?', [id]);
  },

  async getCategoryById(id) {
    const categories = await this.query('SELECT * FROM categories WHERE id = ?', [id]);
    return categories.length > 0 ? categories[0] : null;
  },

  // === Cart ===
  getSessionId() {
    let sessionId = localStorage.getItem('shop_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('shop_session_id', sessionId);
    }
    return sessionId;
  },

  async getCart() {
    const sessionId = this.getSessionId();
    return this.query(
      `SELECT ci.*, p.name, p.price, p.compare_price, p.image_url, p.stock 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.session_id = ?
       ORDER BY ci.created_at DESC`,
      [sessionId]
    );
  },

  async getCartCount() {
    const sessionId = this.getSessionId();
    const result = await this.query(
      'SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE session_id = ?',
      [sessionId]
    );
    return result[0]?.count || 0;
  },

  async getCartTotal() {
    const sessionId = this.getSessionId();
    const result = await this.query(
      `SELECT COALESCE(SUM(p.price * ci.quantity), 0) as total 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.session_id = ?`,
      [sessionId]
    );
    return result[0]?.total || 0;
  },

  async addToCart(productId, quantity = 1) {
    const sessionId = this.getSessionId();
    // Check if product already in cart
    const existing = await this.query(
      'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?',
      [sessionId, productId]
    );
    if (existing.length > 0) {
      return this.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE session_id = ? AND product_id = ?',
        [quantity, sessionId, productId]
      );
    } else {
      return this.execute(
        'INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)',
        [sessionId, productId, quantity]
      );
    }
  },

  async updateCartItem(id, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(id);
    }
    return this.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);
  },

  async removeFromCart(id) {
    return this.execute('DELETE FROM cart_items WHERE id = ?', [id]);
  },

  async clearCart() {
    const sessionId = this.getSessionId();
    return this.execute('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);
  },

  // === Wishlist ===
  async getWishlist() {
    const sessionId = this.getSessionId();
    return this.query(
      `SELECT w.*, p.name, p.price, p.compare_price, p.image_url, p.slug
       FROM wishlist_items w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.session_id = ?
       ORDER BY w.created_at DESC`,
      [sessionId]
    );
  },

  async getWishlistCount() {
    const sessionId = this.getSessionId();
    const result = await this.query(
      'SELECT COUNT(*) as count FROM wishlist_items WHERE session_id = ?',
      [sessionId]
    );
    return result[0]?.count || 0;
  },

  async toggleWishlist(productId) {
    const sessionId = this.getSessionId();
    const existing = await this.query(
      'SELECT * FROM wishlist_items WHERE session_id = ? AND product_id = ?',
      [sessionId, productId]
    );
    if (existing.length > 0) {
      await this.execute('DELETE FROM wishlist_items WHERE session_id = ? AND product_id = ?', [sessionId, productId]);
      return false; // removed
    } else {
      await this.execute('INSERT INTO wishlist_items (session_id, product_id) VALUES (?, ?)', [sessionId, productId]);
      return true; // added
    }
  },

  async isInWishlist(productId) {
    const sessionId = this.getSessionId();
    const result = await this.query(
      'SELECT * FROM wishlist_items WHERE session_id = ? AND product_id = ?',
      [sessionId, productId]
    );
    return result.length > 0;
  },

  // === Orders ===
  async createOrder(orderData) {
    const { total, subtotal, tax, customer_info, payment_method, transaction_id, payment_provider, items } = orderData;
    const sessionId = this.getSessionId();

    const result = await this.execute(
      `INSERT INTO orders (session_id, total, subtotal, tax, customer_info, payment_method, transaction_id, payment_provider, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [sessionId, total, subtotal, tax || 0, customer_info, payment_method, transaction_id || null, payment_provider || null]
    );

    const orderId = result.lastInsertRowid;

    // Insert order items
    for (const item of items) {
      await this.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image_url, item.quantity, item.price]
      );
    }

    // Clear the cart
    await this.clearCart();

    return orderId;
  },

  async getOrders() {
    const sessionId = this.getSessionId();
    return this.query(
      'SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC',
      [sessionId]
    );
  },

  async getOrderItems(orderId) {
    return this.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
  },

  async approveTransaction(orderId) {
    return this.execute(
      "UPDATE orders SET transaction_approved = 1, status = 'confirmed' WHERE id = ?",
      [orderId]
    );
  },

  async rejectTransaction(orderId) {
    return this.execute(
      "UPDATE orders SET status = 'cancelled' WHERE id = ?",
      [orderId]
    );
  },

  async setDownloadLink(orderId, downloadLink) {
    return this.execute(
      'UPDATE orders SET download_link = ?, status = ? WHERE id = ?',
      [downloadLink, 'delivered', orderId]
    );
  },

  async getPendingTransactions() {
    return this.query(
      "SELECT * FROM orders WHERE transaction_id IS NOT NULL AND transaction_approved = 0 AND status = 'pending' ORDER BY created_at DESC"
    );
  },

  // === Reviews ===
  async getProductReviews(productId) {
    return this.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
  },

  async addReview(productId, authorName, rating, comment) {
    return this.execute(
      'INSERT INTO reviews (product_id, author_name, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, authorName, rating, comment]
    );
  },

  // === Contact ===
  async submitContact(name, email, subject, message) {
    const user = App.getUser();
    const userId = user ? user.id : null;
    return this.execute(
      'INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, subject, message]
    );
  },

  async getUserMessages(userId) {
    return this.query(
      'SELECT * FROM contact_messages WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  },

  async getAllMessages() {
    return this.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
  },

  async replyToMessage(messageId, reply, adminId) {
    return this.execute(
      'UPDATE contact_messages SET admin_reply = ?, replied_by = ?, replied_at = CURRENT_TIMESTAMP, is_read = 1 WHERE id = ?',
      [reply, adminId, messageId]
    );
  },

  async deleteMessage(id) {
    return this.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
  },

  async markMessageRead(id) {
    return this.execute('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id]);
  },

  // === Newsletter ===
  async subscribeNewsletter(email, name = null) {
    try {
      await this.execute(
        'INSERT OR IGNORE INTO newsletter_subscribers (email, name, active) VALUES (?, ?, 1)',
        [email, name]
      );
      return true;
    } catch (error) {
      console.error('Newsletter subscribe error:', error);
      return false;
    }
  },

  async unsubscribeNewsletter(email) {
    return this.execute(
      'UPDATE newsletter_subscribers SET active = 0 WHERE email = ?',
      [email]
    );
  },

  async getAllSubscribers() {
    return this.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
  },

  async deleteSubscriber(id) {
    return this.execute('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
  },

  async getAllReviews() {
    return this.query(
      `SELECT r.*, p.name as product_name, p.image_url as product_image
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );
  },

  async deleteReview(id) {
    return this.execute('DELETE FROM reviews WHERE id = ?', [id]);
  },

  // === Search / Autocomplete ===
  async searchSuggestions(query, limit = 6) {
    if (!query || query.trim().length < 1) return [];
    const products = await this.query(
      `SELECT p.id, p.name, p.slug, p.price, p.compare_price, p.image_url, p.stock, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.slug LIKE ?
       ORDER BY 
         CASE 
           WHEN p.name LIKE ? THEN 0
           WHEN p.name LIKE ? THEN 1
           ELSE 2
         END,
         p.rating DESC
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `${query}%`, `%${query}%`, limit]
    );
    return products;
  },

  async searchCategories(query) {
    return this.query(
      `SELECT id, name, slug FROM categories WHERE name LIKE ? LIMIT 4`,
      [`%${query}%`]
    );
  },

  // === Coupons ===
  async validateCoupon(code) {
    const coupons = await this.query(
      `SELECT * FROM coupons WHERE code = ? AND (expires_at > datetime('now') OR expires_at IS NULL) AND current_uses < max_uses`,
      [code.toUpperCase()]
    );
    return coupons.length > 0 ? coupons[0] : null;
  },

  // === Admin: Analytics ===
  async getDashboardStats() {
    const productCount = await this.query('SELECT COUNT(*) as count FROM products');
    const orderCount = await this.query('SELECT COUNT(*) as count FROM orders');
    const userCount = await this.query('SELECT COUNT(*) as count FROM users');
    const revenueResult = await this.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'");
    
    return {
      totalProducts: productCount[0]?.count || 0,
      totalOrders: orderCount[0]?.count || 0,
      totalUsers: userCount[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0
    };
  },

  async getRecentOrders(limit = 10) {
    return this.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  },

  async getTopProducts(limit = 5) {
    return this.query(
      `SELECT p.*, COALESCE(SUM(oi.quantity), 0) as total_sold, COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
       GROUP BY p.id
       ORDER BY revenue DESC
       LIMIT ?`,
      [limit]
    );
  },

  async getDailySales(days = 7) {
    return this.query(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
       FROM orders 
       WHERE created_at >= datetime('now', '-${days} days') AND status != 'cancelled'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
  },

  async getCategoryDistribution() {
    return this.query(
      `SELECT c.name, c.slug, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY product_count DESC`
    );
  },

  async getOrdersByStatus() {
    return this.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC`
    );
  },

  // === Admin: Product Management ===
  async createProduct(data) {
    const { name, slug, description, price, compare_price, image_url, category_id, stock, featured, media_type, video_url, preview_url, preview_description, file_size, duration } = data;
    const result = await this.execute(
      `INSERT INTO products (name, slug, description, price, compare_price, image_url, category_id, stock, featured, media_type, video_url, preview_url, preview_description, file_size, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, price, compare_price || null, image_url, category_id || null, stock || 0, featured ? 1 : 0, media_type || 'physical', video_url || null, preview_url || null, preview_description || null, file_size || null, duration || null]
    );
    return result.lastInsertRowid;
  },

  async updateProduct(id, data) {
    const fields = [];
    const params = [];
    
    const allowedFields = ['name', 'slug', 'description', 'price', 'compare_price', 'image_url', 'images', 'category_id', 'stock', 'featured', 'rating', 'reviews_count', 'media_type', 'video_url', 'preview_url', 'preview_description', 'file_size', 'duration'];
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (fields.length === 0) return;
    
    params.push(id);
    return this.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  // === Video Products ===
  async createVideoProduct(data) {
    return this.createProduct({
      ...data,
      media_type: 'video',
      category_id: data.category_id || 7
    });
  },

  async getVideoProducts(filters = {}) {
    let sql = "SELECT * FROM products WHERE media_type = 'video'";
    const params = [];
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.featured) {
      sql += ' AND featured = 1';
    }
    sql += ' ORDER BY created_at DESC';
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    return this.query(sql, params);
  },

  async deleteProduct(id) {
    await this.execute('DELETE FROM cart_items WHERE product_id = ?', [id]);
    await this.execute('DELETE FROM wishlist_items WHERE product_id = ?', [id]);
    await this.execute('DELETE FROM reviews WHERE product_id = ?', [id]);
    await this.execute('DELETE FROM order_items WHERE product_id = ?', [id]);
    return this.execute('DELETE FROM products WHERE id = ?', [id]);
  },

  async getAllProducts(filters = {}) {
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category_id) {
      sql += ' AND p.category_id = ?';
      params.push(filters.category_id);
    }

    sql += ' ORDER BY p.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.query(sql, params);
  },

  // === Admin: Order Management ===
  async getAllOrders(filters = {}) {
    let sql = 'SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND o.status = ?';
      params.push(filters.status);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.query(sql, params);
  },

  async getOrderDetail(orderId) {
    const [order] = await this.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return null;
    order.items = await this.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return order;
  },

  async updateOrderStatus(orderId, status) {
    return this.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  },

  async getDownloadableOrders() {
    const sessionId = this.getSessionId();
    const orders = await this.query(
      "SELECT * FROM orders WHERE session_id = ? AND download_link IS NOT NULL AND download_link != '' ORDER BY created_at DESC",
      [sessionId]
    );
    // Attach order items for each downloadable order
    for (const order of orders) {
      order.items = await this.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    return orders;
  },

  // === Password Hashing ===
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // === User Management ===
  async createUser(name, email, password, isAdmin = 0) {
    const hashedPassword = await this.hashPassword(password);
    const result = await this.execute(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, isAdmin]
    );
    return result.lastInsertRowid;
  },

  async getAllUsers() {
    return this.query('SELECT id, name, email, phone, avatar_url, additional_email, is_admin, created_at FROM users ORDER BY created_at DESC');
  },

  async updateUser(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'email', 'phone', 'address', 'avatar_url', 'additional_email', 'is_admin'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    params.push(id);
    return this.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteUser(id) {
    // Clean up related data
    await this.execute('DELETE FROM cart_items WHERE user_id = ?', [id]);
    await this.execute('DELETE FROM wishlist_items WHERE user_id = ?', [id]);
    await this.execute('DELETE FROM reviews WHERE user_id = ?', [id]);
    await this.execute('UPDATE orders SET user_id = NULL WHERE user_id = ?', [id]);
    await this.execute('DELETE FROM admin_security WHERE user_id = ?', [id]);
    await this.execute('DELETE FROM contact_messages WHERE user_id = ?', [id]);
    return this.execute('DELETE FROM users WHERE id = ?', [id]);
  },

  // === Admin Password Management ===
  async getUserByEmail(email) {
    const users = await this.query('SELECT * FROM users WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
  },

  async getUserById(id) {
    const users = await this.query('SELECT * FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
  },

  async updateUserPassword(userId, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);
    return this.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  },

  async updateUserProfile(userId, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'email', 'phone', 'address', 'avatar_url', 'additional_email'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    params.push(userId);
    return this.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async storePasswordResetCode(email, code, expiresAt) {
    // Invalidate old codes
    await this.execute("UPDATE password_reset_codes SET used = 1 WHERE email = ? AND used = 0", [email]);
    return this.execute(
      'INSERT INTO password_reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );
  },

  async verifyResetCode(email, code) {
    const codes = await this.query(
      "SELECT * FROM password_reset_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')",
      [email, code]
    );
    return codes.length > 0 ? codes[0] : null;
  },

  async markResetCodeUsed(id) {
    return this.execute('UPDATE password_reset_codes SET used = 1 WHERE id = ?', [id]);
  },

  async setSecurityQuestion(userId, question, answerHash, recoveryEmail) {
    const existing = await this.query('SELECT * FROM admin_security WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      return this.execute(
        'UPDATE admin_security SET question = ?, answer_hash = ?, recovery_email = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [question, answerHash, recoveryEmail || null, userId]
      );
    } else {
      return this.execute(
        'INSERT INTO admin_security (user_id, question, answer_hash, recovery_email) VALUES (?, ?, ?, ?)',
        [userId, question, answerHash, recoveryEmail || null]
      );
    }
  },

  async getSecurityQuestion(email) {
    const result = await this.query(
      'SELECT s.question, s.recovery_email, u.email FROM admin_security s JOIN users u ON s.user_id = u.id WHERE u.email = ?',
      [email]
    );
    return result.length > 0 ? result[0] : null;
  },

  async verifySecurityAnswer(email, answerHash) {
    const result = await this.query(
      'SELECT s.*, u.id as user_id FROM admin_security s JOIN users u ON s.user_id = u.id WHERE u.email = ? AND s.answer_hash = ?',
      [email, answerHash]
    );
    return result.length > 0 ? result[0] : null;
  },

  // === Media Library ===
  async getMedia(filters = {}) {
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params = [];
    if (filters.media_type) {
      sql += ' AND media_type = ?';
      params.push(filters.media_type);
    }
    if (filters.search) {
      sql += ' AND (original_name LIKE ? OR filename LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ' ORDER BY created_at DESC';
    return this.query(sql, params);
  },

  async getMediaById(id) {
    const media = await this.query('SELECT * FROM media WHERE id = ?', [id]);
    return media.length > 0 ? media[0] : null;
  },

  async addMedia(data) {
    const { filename, original_name, url, secure_url, public_id, media_type, format, size, width, height, duration, thumbnail_url } = data;
    const result = await this.execute(
      'INSERT INTO media (filename, original_name, url, secure_url, public_id, media_type, format, size, width, height, duration, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [filename, original_name, url, secure_url, public_id, media_type, format || null, size || null, width || null, height || null, duration || null, thumbnail_url || null]
    );
    return result.lastInsertRowid;
  },

  async deleteMedia(id) {
    return this.execute('DELETE FROM media WHERE id = ?', [id]);
  },

  // === Blog ===
  async getBlogPosts(filters = {}) {
    let sql = 'SELECT * FROM blog_posts WHERE 1=1';
    const params = [];
    if (filters.published !== undefined) {
      sql += ' AND published = ?';
      params.push(filters.published ? 1 : 0);
    }
    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.featured) {
      sql += ' AND featured = 1';
    }
    if (filters.search) {
      sql += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    sql += ' ORDER BY created_at DESC';
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
    return this.query(sql, params);
  },

  async getBlogPost(slug) {
    const posts = await this.query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);
    return posts.length > 0 ? posts[0] : null;
  },

  async getBlogPostById(id) {
    const posts = await this.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    return posts.length > 0 ? posts[0] : null;
  },

  async createBlogPost(data) {
    const { title, slug, excerpt, content, author, cover_image, category, tags, reading_time, published, featured, meta_title, meta_description } = data;
    const result = await this.execute(
      `INSERT INTO blog_posts (title, slug, excerpt, content, author, cover_image, category, tags, reading_time, published, featured, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt || null, content, author || 'PixabAnimation', cover_image || null, category || null, JSON.stringify(tags || []), reading_time || 5, published ? 1 : 0, featured ? 1 : 0, meta_title || null, meta_description || null]
    );
    return result.lastInsertRowid;
  },

  async updateBlogPost(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['title', 'slug', 'excerpt', 'content', 'author', 'cover_image', 'category', 'tags', 'reading_time', 'published', 'featured', 'meta_title', 'meta_description'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        if (key === 'tags' && Array.isArray(value)) {
          fields.push('tags = ?');
          params.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          params.push(value);
        }
      }
    }
    if (fields.length === 0) return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    return this.execute(
      `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteBlogPost(id) {
    return this.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
  },

  async getBlogCategories() {
    return this.query(
      "SELECT category, COUNT(*) as count FROM blog_posts WHERE published = 1 AND category IS NOT NULL GROUP BY category ORDER BY count DESC"
    );
  },

  async getBlogTags(limit = 20) {
    // Extract tags from JSON arrays stored in blog_posts.tags
    const rows = await this.query(
      "SELECT tags FROM blog_posts WHERE published = 1 AND tags IS NOT NULL AND tags != '[]' ORDER BY created_at DESC"
    );
    const tagCounts = {};
    rows.forEach(row => {
      try {
        const tags = JSON.parse(row.tags || '[]');
        tags.forEach(t => {
          const tag = t.trim();
          if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      } catch (e) { /* skip malformed tags */ }
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  },

  async searchBlogSuggestions(query, limit = 6) {
    if (!query || query.trim().length < 1) return [];
    return this.query(
      `SELECT id, title, slug, category, cover_image, excerpt
       FROM blog_posts
       WHERE published = 1 AND (title LIKE ? OR excerpt LIKE ?)
       ORDER BY
         CASE
           WHEN title LIKE ? THEN 0
           WHEN title LIKE ? THEN 1
           ELSE 2
         END,
         created_at DESC
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `${query}%`, `%${query}%`, limit]
    );
  },

  async getRecentBlogPosts(limit = 5) {
    return this.query(
      "SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
  },

  async getFeaturedBlogPosts(limit = 3) {
    return this.query(
      "SELECT * FROM blog_posts WHERE published = 1 AND featured = 1 ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
  },

  async getAllBlogPosts(filters = {}) {
    return this.getBlogPosts(filters);
  },

  // === Popup Ads Management ===
  async getPopupAds(activeOnly = false) {
    let sql = 'SELECT * FROM popup_ads';
    if (activeOnly) sql += ' WHERE is_active = 1';
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    return this.query(sql);
  },

  async getPopupAdById(id) {
    const ads = await this.query('SELECT * FROM popup_ads WHERE id = ?', [id]);
    return ads.length > 0 ? ads[0] : null;
  },

  async createPopupAd(data) {
    const { name, title, description, cta_text, cta_url, icon, image_url, bg_color, is_animated, is_active, sort_order } = data;
    const result = await this.execute(
      `INSERT INTO popup_ads (name, title, description, cta_text, cta_url, icon, image_url, bg_color, is_animated, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, title, description, cta_text || 'Learn More', cta_url || 'https://pixabanimation.github.io/#/shop', icon || 'fa-bullhorn', image_url || null, bg_color || '#0066cc', is_animated !== undefined ? (is_animated ? 1 : 0) : 1, is_active !== undefined ? (is_active ? 1 : 0) : 1, sort_order || 0]
    );
    return result.lastInsertRowid;
  },

  async updatePopupAd(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'title', 'description', 'cta_text', 'cta_url', 'icon', 'image_url', 'bg_color', 'is_animated', 'is_active', 'sort_order'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    return this.execute(
      `UPDATE popup_ads SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deletePopupAd(id) {
    return this.execute('DELETE FROM popup_ads WHERE id = ?', [id]);
  },

  async togglePopupAd(id, isActive) {
    return this.execute('UPDATE popup_ads SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [isActive ? 1 : 0, id]);
  },

  // === Blog Ads Management ===
  async getAllAds() {
    return this.query('SELECT * FROM blog_ads ORDER BY sort_order ASC, created_at DESC');
  },

  async getAdById(id) {
    const ads = await this.query('SELECT * FROM blog_ads WHERE id = ?', [id]);
    return ads.length > 0 ? ads[0] : null;
  },

  async getActiveAdsForPage(pageName, adType) {
    let sql = "SELECT * FROM blog_ads WHERE is_active = 1";
    const params = [];
    if (adType) {
      sql += ' AND ad_type = ?';
      params.push(adType);
    }
    sql += " AND (target_pages = 'all' OR target_pages LIKE ?)";
    params.push(`%"${pageName}"%`);
    sql += ' ORDER BY sort_order ASC LIMIT 1';
    return this.query(sql, params);
  },

  async createAd(data) {
    const { name, ad_type, icon, title, description, cta_text, cta_url, target_pages, is_active, sort_order } = data;
    const result = await this.execute(
      `INSERT INTO blog_ads (name, ad_type, icon, title, description, cta_text, cta_url, target_pages, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, ad_type || 'ad1', icon || 'fa-cube', title, description, cta_text || 'Learn More', cta_url || 'https://pixabanimation.github.io/#/shop', target_pages || 'all', is_active !== undefined ? (is_active ? 1 : 0) : 1, sort_order || 0]
    );
    return result.lastInsertRowid;
  },

  async updateAd(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['name', 'ad_type', 'icon', 'title', 'description', 'cta_text', 'cta_url', 'target_pages', 'is_active', 'sort_order'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    return this.execute(
      `UPDATE blog_ads SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteAd(id) {
    return this.execute('DELETE FROM blog_ads WHERE id = ?', [id]);
  },

  async toggleAd(id, isActive) {
    return this.execute('UPDATE blog_ads SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [isActive ? 1 : 0, id]);
  },

  // === Quotations Management ===
  async getAllQuotations() {
    return this.query('SELECT * FROM quotations ORDER BY created_at DESC');
  },

  async getQuotationById(id) {
    const quotes = await this.query('SELECT * FROM quotations WHERE id = ?', [id]);
    return quotes.length > 0 ? quotes[0] : null;
  },

  async createQuotation(data) {
    const { quote_number, date, valid_until, client_name, client_email, client_phone, client_company, client_address, services, subtotal, tax_rate, tax_amount, total, terms, notes, status } = data;
    const user = App.getUser();
    const createdBy = user ? user.id : null;
    const result = await this.execute(
      `INSERT INTO quotations (quote_number, date, valid_until, client_name, client_email, client_phone, client_company, client_address, services, subtotal, tax_rate, tax_amount, total, terms, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quote_number, date, valid_until || null, client_name, client_email || null, client_phone || null, client_company || null, client_address || null, services, subtotal, tax_rate || 0, tax_amount || 0, total, terms || null, notes || null, status || 'draft', createdBy]
    );
    return result.lastInsertRowid;
  },

  async updateQuotation(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['quote_number', 'date', 'valid_until', 'client_name', 'client_email', 'client_phone', 'client_company', 'client_address', 'services', 'subtotal', 'tax_rate', 'tax_amount', 'total', 'terms', 'notes', 'status'];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    return this.execute(
      `UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteQuotation(id) {
    return this.execute('DELETE FROM quotations WHERE id = ?', [id]);
  },

  // === Invoices Management ===
  async getAllInvoices() {
    return this.query('SELECT * FROM invoices ORDER BY created_at DESC');
  },

  async getInvoiceById(id) {
    const invoices = await this.query('SELECT * FROM invoices WHERE id = ?', [id]);
    return invoices.length > 0 ? invoices[0] : null;
  },

  async createInvoice(data) {
    const {
      invoice_number, date, due_date,
      from_name, from_email, from_phone, from_address,
      to_name, to_email, to_phone, to_company, to_address,
      items, subtotal, tax_rate, tax_amount, discount, discount_amount,
      total, notes, terms, status
    } = data;
    const user = App.getUser();
    const createdBy = user ? user.id : null;
    const result = await this.execute(
      `INSERT INTO invoices (
        invoice_number, date, due_date,
        from_name, from_email, from_phone, from_address,
        to_name, to_email, to_phone, to_company, to_address,
        items, subtotal, tax_rate, tax_amount, discount, discount_amount,
        total, notes, terms, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number, date, due_date || null,
        from_name, from_email || null, from_phone || null, from_address || null,
        to_name, to_email || null, to_phone || null, to_company || null, to_address || null,
        items, subtotal, tax_rate || 0, tax_amount || 0, discount || 0, discount_amount || 0,
        total, notes || null, terms || null, status || 'draft', createdBy
      ]
    );
    return result.lastInsertRowid;
  },

  async updateInvoice(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = [
      'invoice_number', 'date', 'due_date',
      'from_name', 'from_email', 'from_phone', 'from_address',
      'to_name', 'to_email', 'to_phone', 'to_company', 'to_address',
      'items', 'subtotal', 'tax_rate', 'tax_amount', 'discount', 'discount_amount',
      'total', 'notes', 'terms', 'status'
    ];
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length === 0) return;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    return this.execute(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },

  async deleteInvoice(id) {
    return this.execute('DELETE FROM invoices WHERE id = ?', [id]);
  }
};


