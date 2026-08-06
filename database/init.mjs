import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getTurso } from "../tools/lib/env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient(getTurso());

async function main() {
  console.log("🚀 Initializing pixabanimation database...");

  // Read schema (paths resolved relative to this script, not the CWD)
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  const seed = readFileSync(join(__dirname, "seed.sql"), "utf-8");

  // Execute schema
  console.log("📦 Creating tables...");
  const statements = schema.split(";").filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      await client.execute(stmt.trim() + ";");
    } catch (err) {
      if (!err.message.includes("already exists")) {
        console.error(`Error executing: ${stmt.substring(0, 50)}...`);
        console.error(err.message);
      }
    }
  }

  // Migration: Add additional_email to users table
  console.log("🔄 Running user table migrations...");
  const userMigrations = [
    "ALTER TABLE users ADD COLUMN additional_email TEXT",
    "ALTER TABLE users ADD COLUMN avatar_url TEXT"
  ];
  for (const migration of userMigrations) {
    try {
      await client.execute(migration);
      console.log(`  ✅ User migration: ${migration.substring(0, 50)}...`);
    } catch (err) {
      if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
        console.error(`  ⚠️ User migration: ${migration.substring(0, 50)}... (might already exist)`);
      }
    }
  }

  // Migration: Add admin reply columns to contact_messages table
  console.log("🔄 Running contact_messages migrations...");
  const contactMigrations = [
    "ALTER TABLE contact_messages ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE contact_messages ADD COLUMN admin_reply TEXT",
    "ALTER TABLE contact_messages ADD COLUMN replied_by INTEGER REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE contact_messages ADD COLUMN replied_at DATETIME",
    "ALTER TABLE contact_messages ADD COLUMN is_read INTEGER DEFAULT 0"
  ];
  for (const migration of contactMigrations) {
    try {
      await client.execute(migration);
      console.log(`  ✅ Contact migration: ${migration.substring(0, 50)}...`);
    } catch (err) {
      if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
        console.error(`  ⚠️ Contact migration: ${migration.substring(0, 50)}... (might already exist)`);
      }
    }
  }

  // Migration: Add admin_messages table for admin-to-user messaging (compose)
  console.log("🔄 Adding admin_messages table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS admin_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      from_admin_id INTEGER,
      subject TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (from_admin_id) REFERENCES users(id) ON DELETE SET NULL
    );`);
    console.log("  ✅ admin_messages table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create admin_messages table:", err.message);
  }

  // Migration: Rename shipping_address to customer_info and drop shipping column
  console.log("🔄 Running orders table schema migrations...");
  const orderRenameMigrations = [
    "ALTER TABLE orders RENAME COLUMN shipping_address TO customer_info",
    "ALTER TABLE orders DROP COLUMN shipping"
  ];
  for (const migration of orderRenameMigrations) {
    try {
      await client.execute(migration);
      console.log(`  ✅ Order migration: ${migration.substring(0, 50)}...`);
    } catch (err) {
      if (!err.message.includes('duplicate column') && !err.message.includes('no such column')) {
        console.error(`  ⚠️ Order migration: ${migration.substring(0, 50)}... (might already be applied)`);
      }
    }
  }

  // Migration: Add transaction columns to existing orders table
  const orderMigrations = [
    "ALTER TABLE orders ADD COLUMN transaction_id TEXT",
    "ALTER TABLE orders ADD COLUMN payment_provider TEXT",
    "ALTER TABLE orders ADD COLUMN download_link TEXT",
    "ALTER TABLE orders ADD COLUMN transaction_approved INTEGER DEFAULT 0"
  ];
  for (const migration of orderMigrations) {
    try {
      await client.execute(migration);
      console.log(`  ✅ Order migration: ${migration.substring(0, 50)}...`);
    } catch (err) {
      if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
        console.error(`  ⚠️ Order migration: ${migration.substring(0, 50)}... (might already exist)`);
      }
    }
  }

  // Migration: Add order_tracking table for order tracking history
  console.log("🔄 Adding order_tracking table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS order_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );`);
    console.log("  ✅ order_tracking table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create order_tracking table:", err.message);
  }

  // Migration: Backfill tracking history for existing orders based on their current status
  console.log("🔄 Backfilling order tracking history...");
  try {
    const existingOrders = await client.execute("SELECT id, status, created_at FROM orders");
    for (const order of existingOrders.rows) {
      const existing = await client.execute(
        "SELECT COUNT(*) as count FROM order_tracking WHERE order_id = ?",
        [order.id]
      );
      if (existing.rows[0].count > 0) continue;

      await client.execute(
        "INSERT INTO order_tracking (order_id, status, note, created_at) VALUES (?, 'pending', 'Order placed', ?)",
        [order.id, order.created_at]
      );
      const status = order.status;
      if (status === 'confirmed' || status === 'shipped' || status === 'delivered') {
        await client.execute(
          "INSERT INTO order_tracking (order_id, status, note) VALUES (?, 'confirmed', 'Payment verified by admin')",
          [order.id]
        );
      }
      if (status === 'shipped' || status === 'delivered') {
        await client.execute(
          "INSERT INTO order_tracking (order_id, status, note) VALUES (?, 'shipped', 'Order is being prepared')",
          [order.id]
        );
      }
      if (status === 'delivered') {
        await client.execute(
          "INSERT INTO order_tracking (order_id, status, note) VALUES (?, 'delivered', 'Download link sent')",
          [order.id]
        );
      }
      if (status === 'cancelled') {
        await client.execute(
          "INSERT INTO order_tracking (order_id, status, note) VALUES (?, 'cancelled', 'Order cancelled')",
          [order.id]
        );
      }
    }
    console.log("  ✅ Order tracking history backfilled");
  } catch (err) {
    console.error("  ⚠️ Order tracking backfill error:", err.message);
  }

  // Migration: Add media_type and video columns to existing products table
  console.log("🔄 Running migrations...");
  const migrations = [
    "ALTER TABLE products ADD COLUMN media_type TEXT DEFAULT 'physical' CHECK(media_type IN ('physical','digital','video'))",
    "ALTER TABLE products ADD COLUMN video_url TEXT",
    "ALTER TABLE products ADD COLUMN preview_url TEXT",
    "ALTER TABLE products ADD COLUMN preview_description TEXT",
    "ALTER TABLE products ADD COLUMN file_size REAL",
    "ALTER TABLE products ADD COLUMN duration INTEGER"
  ];
  for (const migration of migrations) {
    try {
      await client.execute(migration);
      console.log(`  ✅ Migration: ${migration.substring(0, 50)}...`);
    } catch (err) {
      if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
        console.error(`  ⚠️ Migration: ${migration.substring(0, 50)}... (might already exist)`);
      }
    }
  }

  // Migration: Add popup_ads table if it doesn't exist
  console.log("🔄 Adding popup_ads table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS popup_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      cta_text TEXT DEFAULT 'Learn More',
      cta_url TEXT DEFAULT 'https://pixabanimation.github.io/#/shop',
      icon TEXT DEFAULT 'fa-bullhorn',
      image_url TEXT,
      bg_color TEXT DEFAULT '#0066cc',
      is_animated INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log("  ✅ popup_ads table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create popup_ads table:", err.message);
  }

  // Migration: Add blog_ads table if it doesn't exist
  console.log("🔄 Adding blog_ads table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS blog_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ad_type TEXT NOT NULL DEFAULT 'ad1' CHECK(ad_type IN ('ad1','ad2','ad3')),
      icon TEXT DEFAULT 'fa-cube',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      cta_text TEXT DEFAULT 'Learn More',
      cta_url TEXT DEFAULT 'https://pixabanimation.github.io/#/shop',
      target_pages TEXT DEFAULT 'all',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log("  ✅ blog_ads table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create blog_ads table:", err.message);
  }

  // Migration: Hash any existing plaintext passwords
  console.log("🔄 Hashing existing plaintext passwords...");
  try {
    const existingUsers = await client.execute("SELECT id, password FROM users;");
    for (const user of existingUsers.rows) {
      const pw = user.password;
      // If the password is NOT a 64-char hex string (not already SHA-256 hashed)
      if (pw && !/^[0-9a-f]{64}$/i.test(pw)) {
        const hash = createHash("sha256").update(pw).digest("hex");
        await client.execute("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]);
        console.log(`  ✅ Hashed password for user #${user.id}`);
      }
    }
  } catch (err) {
    console.error("  ⚠️ Password migration error:", err.message);
  }

  // Migration: Fix images JSON column — strip literal backslash-escaped quotes from bad seed data
  console.log("🔄 Fixing images JSON format in products table...");
  try {
    const allProducts = await client.execute("SELECT id, images FROM products WHERE images IS NOT NULL AND images != '[]'");
    for (const row of allProducts.rows) {
      const raw = row.images;
      if (raw && typeof raw === 'string') {
        // Try to clean backslash-escaped quotes: \" -> "
        const cleaned = raw.replace(/\\"/g, '"');
        if (cleaned !== raw) {
          await client.execute("UPDATE products SET images = ? WHERE id = ?", [cleaned, row.id]);
          console.log(`  ✅ Fixed images JSON for product #${row.id}`);
        }
      }
    }
  } catch (err) {
    console.error("  ⚠️ Images JSON fix error:", err.message);
  }

  // Migration: Add invoices table
  console.log("🔄 Adding invoices table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      due_date TEXT,
      from_name TEXT NOT NULL,
      from_email TEXT,
      from_phone TEXT,
      from_address TEXT,
      to_name TEXT NOT NULL,
      to_email TEXT,
      to_phone TEXT,
      to_company TEXT,
      to_address TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      notes TEXT,
      terms TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent','paid','overdue','cancelled')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );`);
    console.log("  ✅ invoices table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create invoices table:", err.message);
  }

  // Migration: Link invoices to source orders
  console.log("🔄 Adding order_id to invoices table...");
  try {
    await client.execute("ALTER TABLE invoices ADD COLUMN order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL");
    console.log("  ✅ invoices.order_id migration done");
  } catch (err) {
    if (!err.message.includes('duplicate column') && !err.message.includes('already exists')) {
      console.error("  ⚠️ Could not add order_id to invoices:", err.message);
    }
  }

  // Migration: Add quotations table
  console.log("🔄 Adding quotations table...");
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_number TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      valid_until TEXT,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT,
      client_company TEXT,
      client_address TEXT,
      services TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      terms TEXT,
      notes TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','sent','accepted','rejected','cancelled')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );`);
    console.log("  ✅ quotations table ready");
  } catch (err) {
    console.error("  ⚠️ Could not create quotations table:", err.message);
  }

  // Migration: Fix broken product thumbnail URLs
  console.log("🔄 Fixing broken product thumbnail URLs...");
  const imageFixes = [
    { id: 2, old: "photo-1546868871-af0de0ae72b7", newUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", images: '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80"]' },
    { id: 4, old: "photo-1507473885765-e6ed057ab6bc", newUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", images: '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80","https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80"]' },
    { id: 7, old: "photo-1570194065650-d99fb4b8ccb0", newUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", images: '["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80","https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80"]' },
    { id: 12, old: "photo-1590658268037-6bf12f032f55", newUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80", images: '["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80","https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80"]' },
    { id: 13, old: "photo-1536240478700-b869070f9279", newUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80", images: '["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80","https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"]' }
  ];
  for (const fix of imageFixes) {
    try {
      // Update image_url (direct column)
      await client.execute("UPDATE products SET image_url = ? WHERE id = ? AND image_url LIKE ?", [fix.newUrl, fix.id, `%${fix.old}%`]);
      // Update within the images JSON array via REPLACE (preserves other entries)
      await client.execute(
        `UPDATE products SET images = REPLACE(images, ? || '"', ? || '"') WHERE id = ? AND images LIKE ?`,
        [fix.old, fix.newUrl, fix.id, `%${fix.old}%`]
      );
      // Recovery: if images column was corrupted (not a valid JSON array), restore it fully
      await client.execute(
        `UPDATE products SET images = ? WHERE id = ? AND (images NOT LIKE '[%' OR images IS NULL)`,
        [fix.images, fix.id]
      );
      console.log(`  ✅ Fixed image for product #${fix.id}`);
    } catch (err) {
      if (!err.message.includes("no such column")) {
        console.error(`  ⚠️ Could not fix image for product #${fix.id}: ${err.message}`);
      }
    }
  }
  // Fix category 7 image
  try {
    await client.execute("UPDATE categories SET image_url = ? WHERE id = 7 AND image_url LIKE ?", ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80", "%photo-1536240478700-b869070f9279%"]);
    console.log("  ✅ Fixed image for category #7 (Videos)");
  } catch (err) {
    console.error("  ⚠️ Could not fix category image:", err.message);
  }

  // Migration: Remove old electronics/fashion products and categories
  console.log("🔄 Removing old electronics/fashion products and categories...");
  try {
    // Delete old products from categories 1 (Electronics) and 2 (Fashion)
    const oldCategoryIds = [1, 2];
    // Product IDs from old seed that are NOT in the new seed
    const oldProductIds = [5, 7, 10];
    // Delete related records for all products being removed
    const productIdsToDelete = [...oldProductIds];
    // Get products in old categories
    const catProducts = await client.execute("SELECT id FROM products WHERE category_id IN (1,2)");
    for (const row of catProducts.rows) {
      productIdsToDelete.push(row.id);
    }
    // Also get products that are in Sports (4) or Beauty (6) but not in the new seed
    const remainingOldProducts = await client.execute("SELECT id FROM products WHERE category_id IN (4,6) AND id NOT IN (4,9,11,13,15,16,17,18,19,20,21,22,23,24,25)");
    for (const row of remainingOldProducts.rows) {
      if (!productIdsToDelete.includes(row.id)) {
        productIdsToDelete.push(row.id);
      }
    }
    
    if (productIdsToDelete.length > 0) {
      const idList = productIdsToDelete.join(',');
      await client.execute(`DELETE FROM order_items WHERE product_id IN (${idList})`);
      await client.execute(`DELETE FROM reviews WHERE product_id IN (${idList})`);
      await client.execute(`DELETE FROM cart_items WHERE product_id IN (${idList})`);
      await client.execute(`DELETE FROM wishlist_items WHERE product_id IN (${idList})`);
      await client.execute(`DELETE FROM products WHERE id IN (${idList})`);
      console.log(`  ✅ Removed ${productIdsToDelete.length} old products and related records`);
    }
    // Delete old categories (Electronics=1, Fashion=2)
    await client.execute("DELETE FROM categories WHERE id IN (1,2)");
    console.log("  ✅ Removed Electronics and Fashion categories");
  } catch (err) {
    console.error("  ⚠️ Could not remove old categories:", err.message);
  }

  // Migration: Rename category 7 from 'Videos' to 'Animation & Video'
  try {
    await client.execute("UPDATE categories SET name = 'Animation & Video', description = 'Premium animation clips, motion graphics, and video assets' WHERE id = 7");
    console.log("  ✅ Renamed category #7 to 'Animation & Video'");
  } catch (err) {
    console.error("  ⚠️ Could not rename category #7:", err.message);
  }

  // Migration: Update existing product 11 (book) with new seed data since INSERT OR IGNORE won't update it
  console.log("🔄 Updating existing product data from new seed...");
  try {
    // Update product 11 with the new name/description/price from seed
    await client.execute("UPDATE products SET name = 'Creative Business Book', slug = 'creative-business-book', description = 'The ultimate guide to building a creative career. Learn the strategies, mindsets, and workflows used by top animators, designers, and content creators to turn passion into profit.', price = 24.99, compare_price = 29.99, image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', images = '[\"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80\",\"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80\]', stock = 200 WHERE id = 11");
    // Also update product 4 and 9 to ensure they match seed data
    await client.execute("UPDATE products SET images = '[\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80\",\"https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80\]', slug = 'desk-lamp', compare_price = 119.99 WHERE id = 4");
    await client.execute("UPDATE products SET images = '[\"https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80\",\"https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80\]', slug = 'office-chair', compare_price = 749.99 WHERE id = 9");
    console.log("  ✅ Updated existing product data (4, 9, 11) to match new seed");
  } catch (err) {
    console.error("  ⚠️ Could not update product data:", err.message);
  }

  // Execute seed
  console.log("🌱 Seeding data...");
  const seedStatements = seed.split(";").filter(s => s.trim().length > 0);
  for (const stmt of seedStatements) {
    try {
      await client.execute(stmt.trim() + ";");
    } catch (err) {
      if (!err.message.includes("UNIQUE constraint") && !err.message.includes("already exists")) {
        console.error(`Error executing: ${stmt.substring(0, 50)}...`);
        console.error(err.message);
      }
    }
  }

  // Verify
  console.log("✅ Verifying...");
  const productCount = await client.execute("SELECT COUNT(*) as count FROM products;");
  const categoryCount = await client.execute("SELECT COUNT(*) as count FROM categories;");
  
  console.log(`📊 Categories: ${categoryCount.rows[0].count}`);
  console.log(`📊 Products: ${productCount.rows[0].count}`);
  console.log("✅ Database initialization complete!");
  
  // Show some sample products
  const sample = await client.execute("SELECT id, name, price FROM products LIMIT 5;");
  console.log("\n📋 Sample products:");
  for (const row of sample.rows) {
    console.log(`   #${row.id} ${row.name} - $${row.price}`);
  }
}

main().catch(console.error);
