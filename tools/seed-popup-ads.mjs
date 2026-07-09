// ============================================
// Seed Script — 4 Default Popup Ads for PixabAnimation
// ============================================

import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://ecommercelog-spurno.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ"
});

const popupAds = [
  {
    name: "PixabAnimation Promo",
    title: "🎬 Premium Motion Graphics & Animation Assets",
    description: "Discover 500+ professional 4K motion backgrounds, animated templates, and stock footage. Elevate your creative projects today!",
    cta_text: "Browse Collection",
    cta_url: "https://pixabanimation.github.io/#/shop",
    icon: "fa-cube",
    bg_color: "#0066cc",
    is_animated: 1,
    is_active: 1,
    sort_order: 0
  },
  {
    name: "SPurno Portfolio",
    title: "🚀 Explore SPurno Studio Portfolio",
    description: "Check out stunning motion design, 3D animation, and visual effects projects by SPurno. Award-winning creative work for global brands.",
    cta_text: "View Portfolio",
    cta_url: "https://spurno.github.io",
    icon: "fa-star",
    bg_color: "#7c3aed",
    is_animated: 1,
    is_active: 1,
    sort_order: 1
  },
  {
    name: "Buy After Effects Plugin",
    title: "⚡ Supercharge After Effects with Motion Blur Pro",
    description: "Cinema-grade motion blur plugin with pixel-accurate rendering, AI-powered edge detection, and GPU acceleration. Transform your animations today.",
    cta_text: "Get Plugin - $49.99",
    cta_url: "https://pixabanimation.github.io/#/product/motion-blur-pro",
    icon: "fa-bolt",
    bg_color: "#dc2626",
    is_animated: 0,
    is_active: 1,
    sort_order: 2
  },
  {
    name: "Shop Adobe & Shutterstock",
    title: "🛒 Professional Creative Assets at Your Fingertips",
    description: "Find the best motion design assets across top marketplaces. Buy from Adobe Stock, Shutterstock, or directly from PixabAnimation — your choice!",
    cta_text: "Start Shopping",
    cta_url: "https://pixabanimation.github.io/#/shop?category=adobe-after-effect-plugins",
    icon: "fa-shopping-cart",
    bg_color: "#059669",
    is_animated: 0,
    is_active: 1,
    sort_order: 3
  }
];

async function main() {
  console.log("🚀 Seeding popup ads...\n");

  // First ensure the table exists
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
    console.log("  ✅ Table ensured\n");
  } catch (err) {
    console.log("  ⚠️ Table already exists\n");
  }

  let inserted = 0;
  let skipped = 0;

  for (const ad of popupAds) {
    try {
      await client.execute(
        `INSERT INTO popup_ads (name, title, description, cta_text, cta_url, icon, bg_color, is_animated, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ad.name, ad.title, ad.description, ad.cta_text, ad.cta_url, ad.icon, ad.bg_color, ad.is_animated, ad.is_active, ad.sort_order]
      );
      console.log(`  ✅ Inserted: ${ad.name}`);
      inserted++;
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        // Update existing instead (use name as unique-ish identifier)
        try {
          await client.execute(
            `UPDATE popup_ads SET title=?, description=?, cta_text=?, cta_url=?, icon=?, bg_color=?, is_animated=?, is_active=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE name=?`,
            [ad.title, ad.description, ad.cta_text, ad.cta_url, ad.icon, ad.bg_color, ad.is_animated, ad.is_active, ad.sort_order, ad.name]
          );
          console.log(`  🔄 Updated: ${ad.name}`);
          skipped++;
        } catch (updateErr) {
          console.log(`  ❌ Error updating ${ad.name}: ${updateErr.message}`);
        }
      } else {
        console.log(`  ❌ Error inserting ${ad.name}: ${err.message}`);
      }
    }
  }

  // Verify
  const result = await client.execute("SELECT COUNT(*) as count FROM popup_ads");
  const count = result.rows[0].count;

  console.log(`\n📊 Total popup ads in database: ${count}`);
  console.log(`   Inserted: ${inserted}, Skipped/Updated: ${skipped}`);
  console.log("✅ Done!");
}

main().catch(console.error);
