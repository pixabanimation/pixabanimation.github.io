#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add popup ads, blog ad slots, and required scripts to blog generators.
"""
import os, sys

sys.stdout.reconfigure(encoding='utf-8')

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.join(script_dir, '..')

# The scripts and containers to inject
SCRIPTS_BLOCK = '''  <!-- Popup Ad Container -->
  <div class="popup-ad-overlay" id="popupAdContainer"></div>

  <!-- Ad Scripts -->
  <script src="../js/credentials.js"></script>
  <script type="module">
    import { createClient } from "https://esm.sh/@libsql/client@0.14.0/web";
    window.__tursoClient = createClient({
      url: "libsql://ecommercelog-spurno.aws-us-east-1.turso.io",
      authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI4Mzg4MjUsImlkIjoiMDE5ZjE5NzItZmQwMS03ZDBkLWFkNWMtNWQ5YTkzZWI0NzBlIiwia2lkIjoiY3dfWmw5T3NsV2FnNFFkUjVHZUN0Nll2b19MTkdlUmY1STY1bEZVMXRCOCIsInJpZCI6ImVjYzBjNjcxLWUyMmMtNDA0Yy1hZjNmLWYzZDNlNjE4OTk5ZiJ9.4otvGu6MrGbhOb7JppDQwSXHXXsWDKf5miDw43Oba8M33U5wRNtK8DC8Zv2D-M-21nE6fo2cdazBjAgB4mgDAQ"
    });
    console.log("Turso client initialized");
  </script>
  <script src="../js/db.js"></script>
  <script src="../js/blog-ads.js"></script>
  <script src="../js/popup-ads.js"></script>'''

# Ad slot placeholder (3 slots in sidebar, 3 in article)
SIDEBAR_ADS = '''      <div class="sidebar-section">
        <div class="sidebar-title">Ad</div>
        <div id="ad-slot-1"></div>
        <div id="ad-slot-2" style="margin-top:16px"></div>
        <div id="ad-slot-3" style="margin-top:16px"></div>
      </div>'''

IN_ARTICLE_ADS = '''      <div id="ad-slot-1-article"></div>
      <div id="ad-slot-2-article" style="margin-top:16px"></div>
      <div id="ad-slot-3-article" style="margin-top:16px"></div>'''


def add_ads_to_posts_generator():
    """Update generate-blog-posts.mjs"""
    filepath = os.path.join(root_dir, 'tools', 'generate-blog-posts.mjs')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 1. Add ad slots in sidebar (after Top Authors section)
    old_sidebar_end = '''    <div class="sidebar-section">
      <div class="sidebar-title">Top Authors</div>
      <div class="sidebar-author" style="margin-bottom:12px">
        <div class="initial">P</div>
        <div><div class="name">PixabAnimation</div><div class="role">Content Creator</div></div>
      </div>
      <div class="sidebar-author">
        <div class="initial" style="background:linear-gradient(135deg,#5856d6,#af52de)">S</div>
        <div><div class="name">SPurno</div><div class="role">Motion Design Expert</div></div>
      </div>
    </div>'''

    new_sidebar_end = '''    <div class="sidebar-section">
      <div class="sidebar-title">Top Authors</div>
      <div class="sidebar-author" style="margin-bottom:12px">
        <div class="initial">P</div>
        <div><div class="name">PixabAnimation</div><div class="role">Content Creator</div></div>
      </div>
      <div class="sidebar-author">
        <div class="initial" style="background:linear-gradient(135deg,#5856d6,#af52de)">S</div>
        <div><div class="name">SPurno</div><div class="role">Motion Design Expert</div></div>
      </div>
    </div>
''' + SIDEBAR_ADS

    if old_sidebar_end in content:
        content = content.replace(old_sidebar_end, new_sidebar_end)
        print("[OK] Posts: sidebar ad slots added")
        changes += 1
    else:
        print("[FAIL] Posts: sidebar not found!")
        idx = content.find('Top Authors')
        if idx >= 0:
            print(f"  Found 'Top Authors' at {idx}")

    # 2. Add in-article ad slots (before Useful Links section)
    old_in_article = '''    <div class="useful-links">
      <div class="label">Useful Links</div>
      <div class="grid">'''

    new_in_article = IN_ARTICLE_ADS + '''

    <div class="useful-links">
      <div class="label">Useful Links</div>
      <div class="grid">'''

    if old_in_article in content:
        content = content.replace(old_in_article, new_in_article)
        print("[OK] Posts: in-article ad slots added")
        changes += 1
    else:
        print("[FAIL] Posts: in-article slot not found!")
        idx = content.find('Useful Links')
        if idx >= 0:
            print(f"  Found 'Useful Links' at {idx}")

    # 3. Add popup container and scripts before </body>
    old_body_end = '  </body>\n</html>'
    
    new_body_end = SCRIPTS_BLOCK + '\n</body>\n</html>'

    if old_body_end in content:
        content = content.replace(old_body_end, new_body_end)
        print("[OK] Posts: scripts added")
        changes += 1
    else:
        print("[FAIL] Posts: body end not found!")

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Saved posts generator ({changes} changes)")
    else:
        print("[WARN] No changes to posts generator")


def add_ads_to_index_generator():
    """Update generate-blog-index.mjs"""
    filepath = os.path.join(root_dir, 'tools', 'generate-blog-index.mjs')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 1. Add ad slots in the new blog-sidebar widget area (after authors sidebar widget)
    old_sidebar_end = '''        <div class="pl-sb-widget" style="background:linear-gradient(135deg,#f5f5f7,#fff);border-color:rgba(0,102,204,.08)">
          <div class="pl-sb-widget-title" style="border-bottom-color:#06c">📬 Newsletter</div>
          <p style="font-size:.8rem;color:rgba(0,0,0,.5);margin-bottom:12px;line-height:1.5">Get the latest articles and creative insights.</p>
          <form onsubmit="alert('Thanks for subscribing! 🎉');return false" style="display:flex;gap:6px">
            <input type="email" placeholder="Your email" required style="flex:1;padding:8px 12px;border:1px solid rgba(0,0,0,.08);border-radius:9999px;font-size:.78rem;background:#fff;outline:none;font-family:inherit">
            <button type="submit" style="padding:8px 14px;border-radius:9999px;background:#06c;color:#fff;border:none;font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap">Join</button>
          </form>
        </div>'''

    new_sidebar_end = '''        <div class="pl-sb-widget" style="background:linear-gradient(135deg,#f5f5f7,#fff);border-color:rgba(0,102,204,.08)">
          <div class="pl-sb-widget-title" style="border-bottom-color:#06c">📬 Newsletter</div>
          <p style="font-size:.8rem;color:rgba(0,0,0,.5);margin-bottom:12px;line-height:1.5">Get the latest articles and creative insights.</p>
          <form onsubmit="alert('Thanks for subscribing! 🎉');return false" style="display:flex;gap:6px">
            <input type="email" placeholder="Your email" required style="flex:1;padding:8px 12px;border:1px solid rgba(0,0,0,.08);border-radius:9999px;font-size:.78rem;background:#fff;outline:none;font-family:inherit">
            <button type="submit" style="padding:8px 14px;border-radius:9999px;background:#06c;color:#fff;border:none;font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap">Join</button>
          </form>
        </div>
        <div class="pl-sb-widget">
          <div class="pl-sb-widget-title">Ad</div>
          <div id="ad-slot-1"></div>
          <div id="ad-slot-2" style="margin-top:16px"></div>
          <div id="ad-slot-3" style="margin-top:16px"></div>
        </div>'''

    if old_sidebar_end in content:
        content = content.replace(old_sidebar_end, new_sidebar_end)
        print("[OK] Index: sidebar ad slots added")
        changes += 1
    else:
        print("[FAIL] Index: sidebar not found!")
        idx = content.find('Newsletter')
        if idx >= 0:
            print(f"  Found 'Newsletter' at {idx}")

    # 2. Add popup container and scripts before </body>
    old_body_end = '  </body>\n</html>'
    
    new_body_end = SCRIPTS_BLOCK + '\n</body>\n</html>'

    if old_body_end in content:
        content = content.replace(old_body_end, new_body_end)
        print("[OK] Index: scripts added")
        changes += 1
    else:
        print("[FAIL] Index: body end not found!")

    # 3. Fix scroll event handler - it still has blogNavbar reference
    # This was already fixed in a previous step, just checking

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Saved index generator ({changes} changes)")
    else:
        print("[WARN] No changes to index generator")


print("=" * 50)
print("Updating generate-blog-posts.mjs")
print("=" * 50)
add_ads_to_posts_generator()

print("\n" + "=" * 50)
print("Updating generate-blog-index.mjs")
print("=" * 50)
add_ads_to_index_generator()

print("\n✅ Both generators updated!")
