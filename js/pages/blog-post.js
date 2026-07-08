// ============================================
// PixabAnimation — Blog Post Page
// Design follows spurno.github.io/blog/3d-infographic.html
// ============================================

const BlogPostPage = {
  async render(params) {
    const content = document.getElementById('pageContent');
    const slug = params.params?.slug;

    if (!slug) {
      content.innerHTML = Components.emptyState('🔍', 'Post not found', 'No blog post specified.');
      return;
    }

    content.innerHTML = `
      <div class="blog-post-page page-enter">
        <div style="text-align:center;padding:60px">
          <div class="loader-spinner"></div>
        </div>
      </div>
    `;

    try {
      const post = await DB.getBlogPost(slug);
      if (!post) {
        content.innerHTML = Components.emptyState('🔍', 'Post not found', 'This article doesn\'t exist or has been removed.', 'Back to Blog', '#/blog');
        return;
      }

      const tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
      this.updateMeta(post);

      // Get data for sidebar
      const [recentPosts, allPosts] = await Promise.all([
        DB.getRecentBlogPosts(4),
        DB.getBlogPosts({ published: true })
      ]);
      
      // Get categories with counts
      const categories = await DB.getBlogCategories();

      // Collect all unique tags from all posts
      const allTags = [...new Set(allPosts.flatMap(p => {
        const t = typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []);
        return t;
      }))].slice(0, 8);

      const relatedPosts = allPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

      // Format date
      const pubDate = new Date(post.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });

      content.innerHTML = `
        <div class="blog-post-wrapper" style="max-width:1200px;margin:0 auto;padding:40px 24px">
          <div style="display:grid;grid-template-columns:1fr 300px;gap:48px;align-items:start">
            
            <!-- Main Article -->
            <article class="blog-article-main">
              <!-- Header with badge -->
              <div style="margin-bottom:24px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                  <span style="font-size:1.2rem">✦</span>
                  <span style="font-size:0.85rem;font-weight:600;color:var(--ds-primary);text-transform:uppercase;letter-spacing:0.5px">${post.category || 'Insights & Tutorials'}</span>
                </div>
                <h1 style="font-size:2.2rem;font-weight:700;line-height:1.15;color:#1d1d1f;margin-bottom:16px">${post.title}</h1>
                <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:0.9rem;color:rgba(0,0,0,0.5)">
                  <span>📅 ${pubDate}</span>
                  <span>•</span>
                  <span>👁️ ${(Math.floor(Math.random() * 500) + 100).toLocaleString()}+ Views</span>
                  <span>•</span>
                  <span>📝 ${post.author || 'PixabAnimation'}</span>
                </div>
              </div>

              <!-- Cover Image -->
              ${post.cover_image ? `
              <div style="border-radius:14px;overflow:hidden;margin-bottom:32px;background:#f5f5f7">
                <img src="${post.cover_image}" alt="${post.title}" style="width:100%;display:block" loading="lazy">
              </div>` : `
              <div style="border-radius:14px;overflow:hidden;margin-bottom:32px;background:linear-gradient(135deg,var(--ds-primary),#2997ff);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center">
                <span style="font-size:4rem">✦</span>
              </div>`}

              <!-- Content -->
              <div class="blog-article-content" style="font-size:1.05rem;line-height:1.8;color:rgba(0,0,0,0.7)">
                ${this.renderContent(post.content)}
              </div>

              <!-- Tags -->
              ${tags.length > 0 ? `
              <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(0,0,0,0.06)">
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:12px">Tags</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  ${tags.map(t => `<a href="#/blog" style="display:inline-block;padding:6px 14px;background:rgba(0,102,204,0.06);border:1px solid rgba(0,102,204,0.1);border-radius:9999px;font-size:0.8rem;color:var(--ds-primary);text-decoration:none;transition:all 0.2s ease" onmouseover="this.style.background='rgba(0,102,204,0.12)'" onmouseout="this.style.background='rgba(0,102,204,0.06)'">${t}</a>`).join('')}
                </div>
              </div>` : ''}

              <!-- Share -->
              <div style="margin-top:24px;display:flex;align-items:center;gap:12px">
                <span style="font-size:0.85rem;font-weight:600;color:#1d1d1f">Share</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.4);text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='#1877f2';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'"><span style="font-size:0.85rem">f</span></a>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.4);text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='#000';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'">𝕏</a>
                <a href="https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(post.title)}" target="_blank" style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.4);text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='#e60023';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'">P</a>
                <button onclick="navigator.clipboard.writeText(window.location.href);Components.toast('Link copied!','success')" style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.4);cursor:pointer;border:none;transition:all 0.2s;font-size:0.85rem" onmouseover="this.style.background='rgba(0,102,204,0.1)';this.style.color='var(--ds-primary)'" onmouseout="this.style.background='rgba(0,0,0,0.04)';this.style.color='rgba(0,0,0,0.4)'"><i class="fas fa-link"></i></button>
              </div>

              <!-- Author Bio -->
              <div style="margin-top:32px;padding:24px;background:#fafafa;border:1px solid rgba(0,0,0,0.06);border-radius:14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:#fff;flex-shrink:0">${(post.author || 'P').charAt(0).toUpperCase()}</div>
                <div style="flex:1;min-width:200px">
                  <div style="font-weight:600;font-size:1rem;color:#1d1d1f;margin-bottom:4px">${post.author || 'PixabAnimation'}</div>
                  <div style="font-size:0.85rem;color:rgba(0,0,0,0.5);line-height:1.6">${post.author ? `${post.author} creates beautiful animation videos for video editors and motion graphics designers.` : 'PixabAnimation creates premium motion graphics, animation assets, and stock footage used by creators worldwide.'}</div>
                </div>
                <div style="display:flex;gap:8px">
                  <a href="#" style="width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.35);text-decoration:none;font-size:0.8rem"><i class="fab fa-facebook-f"></i></a>
                  <a href="#" style="width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.35);text-decoration:none;font-size:0.8rem">𝕏</a>
                  <a href="#" style="width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.04);display:inline-flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.35);text-decoration:none;font-size:0.8rem"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>

              <!-- Useful Links -->
              <div style="margin-top:32px;padding:24px;background:#fafafa;border:1px solid rgba(0,0,0,0.06);border-radius:14px">
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:16px">Useful Links</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <a href="#/shop" style="font-size:0.85rem;color:var(--ds-primary);text-decoration:none;padding:6px 0">▸ Shop Premium Assets</a>
                  <a href="#/shop?category=videos" style="font-size:0.85rem;color:var(--ds-primary);text-decoration:none;padding:6px 0">▸ Motion Graphics Stock</a>
                  <a href="#/about" style="font-size:0.85rem;color:var(--ds-primary);text-decoration:none;padding:6px 0">▸ About PixabAnimation</a>
                  <a href="#/" style="font-size:0.85rem;color:var(--ds-primary);text-decoration:none;padding:6px 0">▸ Return to Homepage</a>
                </div>
              </div>

              <!-- Related Posts -->
              ${relatedPosts.length > 0 ? `
              <div style="margin-top:40px;padding-top:32px;border-top:1px solid rgba(0,0,0,0.06)">
                <h2 style="font-size:1.3rem;font-weight:700;color:#1d1d1f;margin-bottom:20px">Related Articles</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
                  ${relatedPosts.map(p => `
                    <a href="#/blog/${p.slug}" style="display:block;padding:16px;background:#fafafa;border:1px solid rgba(0,0,0,0.06);border-radius:12px;text-decoration:none;transition:all 0.25s ease" onmouseover="this.style.borderColor='rgba(0,102,204,0.2)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.06)';this.style.transform='none'">
                      <div style="font-size:0.75rem;color:var(--ds-primary);font-weight:600;margin-bottom:6px">${p.category || 'Article'}</div>
                      <div style="font-size:0.9rem;font-weight:600;color:#1d1d1f;line-height:1.35">${p.title}</div>
                      <div style="font-size:0.75rem;color:rgba(0,0,0,0.4);margin-top:8px">${new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                    </a>
                  `).join('')}
                </div>
              </div>` : ''}
            </article>

            <!-- Sidebar -->
            <aside style="position:sticky;top:80px">
              <!-- Recent Posts -->
              <div style="margin-bottom:28px">
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--ds-primary)">Recent Posts</div>
                <div style="display:flex;flex-direction:column;gap:12px">
                  ${recentPosts.filter(p => p.id !== post.id).slice(0, 4).map(p => `
                    <a href="#/blog/${p.slug}" style="display:flex;align-items:center;gap:12px;text-decoration:none;padding:8px;border-radius:8px;transition:background 0.2s" onmouseover="this.style.background='rgba(0,0,0,0.03)'" onmouseout="this.style.background='transparent'">
                      <span style="font-size:1.2rem;flex-shrink:0">📄</span>
                      <div>
                        <div style="font-size:0.8rem;font-weight:500;color:#1d1d1f;line-height:1.3">${p.title}</div>
                        <div style="font-size:0.7rem;color:rgba(0,0,0,0.4);margin-top:2px">${new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                      </div>
                    </a>
                  `).join('')}
                </div>
              </div>

              <!-- Popular Tags -->
              <div style="margin-bottom:28px">
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--ds-primary)">Popular Tags</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  ${allTags.slice(0, 8).map(t => `
                    <a href="#/blog" style="display:inline-block;padding:5px 12px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.06);border-radius:9999px;font-size:0.75rem;color:rgba(0,0,0,0.55);text-decoration:none;transition:all 0.2s" onmouseover="this.style.borderColor='rgba(0,102,204,0.2)';this.style.color='var(--ds-primary)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.06)';this.style.color='rgba(0,0,0,0.55)'">${t}</a>
                  `).join('')}
                </div>
              </div>

              <!-- Top Authors -->
              <div>
                <div style="font-size:0.85rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--ds-primary)">Top Authors</div>
                <div style="display:flex;flex-direction:column;gap:12px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#fff;flex-shrink:0">${(post.author || 'P').charAt(0).toUpperCase()}</div>
                    <div>
                      <div style="font-size:0.8rem;font-weight:600;color:#1d1d1f">${post.author || 'PixabAnimation'}</div>
                      <div style="font-size:0.7rem;color:rgba(0,0,0,0.4)">Content Creator</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- Back link -->
          <div style="text-align:center;margin-top:48px;padding-top:32px;border-top:1px solid rgba(0,0,0,0.06)">
            <a href="#/blog" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:var(--ds-primary);color:#fff;border-radius:9999px;font-size:0.9rem;font-weight:500;text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='var(--ds-primary-focus)'" onmouseout="this.style.background='var(--ds-primary)'">
              <i class="fas fa-arrow-left"></i> Back to Blog
            </a>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Blog post error:', error);
      content.innerHTML = Components.emptyState('😔', 'Failed to load article', error.message, 'Back to Blog', '#/blog');
    }
  },

  renderContent(content) {
    if (!content) return '<p>No content available.</p>';
    
    const lines = content.split('\n');
    const blocks = [];
    let currentList = null;
    let currentListType = null;

    const flushList = () => {
      if (currentList && currentList.length > 0) {
        const tag = currentListType === 'ol' ? 'ol' : 'ul';
        blocks.push(`<${tag}>${currentList.map(li => `<li>${li}</li>`).join('')}</${tag}>`);
        currentList = [];
        currentListType = null;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { flushList(); continue; }

      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      const unorderedMatch = trimmed.match(/^[-*]\s+(.+)/);
      const blockquoteMatch = trimmed.match(/^>\s+(.+)/);

      if (orderedMatch) {
        if (currentListType !== 'ol') flushList();
        currentListType = 'ol';
        currentList.push(this.inlineMarkdown(orderedMatch[2]));
      } else if (unorderedMatch) {
        if (currentListType !== 'ul') flushList();
        currentListType = 'ul';
        currentList.push(this.inlineMarkdown(unorderedMatch[1]));
      } else if (trimmed.startsWith('## ')) {
        flushList();
        blocks.push(`<h2>${trimmed.replace('## ', '')}</h2>`);
      } else if (trimmed.startsWith('### ')) {
        flushList();
        blocks.push(`<h3>${trimmed.replace('### ', '')}</h3>`);
      } else if (blockquoteMatch) {
        flushList();
        blocks.push(`<blockquote>${this.inlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        flushList();
        blocks.push(`<p><strong>${this.inlineMarkdown(trimmed.replace(/\*\*/g, ''))}</strong></p>`);
      } else {
        flushList();
        blocks.push(`<p>${this.inlineMarkdown(trimmed)}</p>`);
      }
    }
    flushList();
    return blocks.join('\n');
  },

  inlineMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy" style="max-width:100%;border-radius:12px;margin:1.5em auto">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  },

  updateMeta(post) {
    if (!this._originalTitle) {
      this._originalTitle = document.title;
      this._originalMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    }
    const metaTitle = post.meta_title || `${post.title} — PixabAnimation`;
    const metaDesc = post.meta_description || post.excerpt || `Read about ${post.title} on PixabAnimation.`;
    document.title = metaTitle;
    const metaEl = document.querySelector('meta[name="description"]');
    if (metaEl) metaEl.setAttribute('content', metaDesc);
  },

  cleanup() {
    if (this._originalTitle) {
      document.title = this._originalTitle;
      const metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) metaEl.setAttribute('content', this._originalMetaDesc || '');
    }
  }
};
