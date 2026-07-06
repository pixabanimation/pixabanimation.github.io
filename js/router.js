// ============================================
// pixabanimation — Hash-based SPA Router
// ============================================

const Router = {
  routes: {},
  currentRoute: null,
  beforeHooks: [],
  progressTimeout: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  async navigate(hash, pushState = true) {
    if (pushState) {
      window.location.hash = hash;
    }

    const path = hash.replace(/^#/, '') || '/';
    
    // Run before hooks
    for (const hook of this.beforeHooks) {
      await hook(path);
    }

    // Show loader and start progress bar
    const loader = document.getElementById('pageLoader');
    const content = document.getElementById('pageContent');
    if (loader) loader.style.display = 'flex';
    if (content) content.style.display = 'none';
    this.startProgress();

    // Find matching route
    let handler = null;
    let params = {};

    // Exact match
    if (this.routes[path]) {
      handler = this.routes[path];
    } else {
      // Pattern match with query params
      const pathWithoutQuery = path.split('?')[0];
      for (const [pattern, routeHandler] of Object.entries(this.routes)) {
        const match = this.matchRoute(pattern, pathWithoutQuery);
        if (match) {
          handler = routeHandler;
          params = match;
          break;
        }
      }
    }

    if (handler) {
      try {
        // Parse query params
        const queryStr = path.split('?')[1] || '';
        const queryParams = {};
        queryStr.split('&').filter(Boolean).forEach(pair => {
          const [key, value] = pair.split('=');
          queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });

        this.currentRoute = path;
        await handler({ params, query: queryParams, path });
        this.updateActiveNav(path);
      } catch (error) {
        console.error('Route handler error:', error);
        this.renderError(error);
      }
    } else {
      this.renderNotFound();
    }

    // Hide loader and complete progress bar
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';
    this.completeProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  matchRoute(pattern, path) {
    // Convert route pattern to regex
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexStr}$`);
    const match = path.match(regex);
    
    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return params;
    }
    return null;
  },

  updateActiveNav(path) {
    document.querySelectorAll('[data-nav]').forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', 
        href === '/' ? path === '/' : path.startsWith(href)
      );
    });
  },

  startProgress() {
    const bar = document.getElementById('navProgressBar');
    if (!bar) return;
    // Cancel any pending completion timers to avoid stale resets
    if (this.progressTimeout) {
      clearTimeout(this.progressTimeout);
      this.progressTimeout = null;
    }
    // Reset and show the bar
    bar.classList.remove('complete');
    bar.style.width = '0%';
    bar.style.opacity = '1';
    bar.classList.add('active');
    // Animate to 60% quickly to simulate progress
    requestAnimationFrame(() => {
      bar.style.width = '60%';
    });
  },

  completeProgress() {
    const bar = document.getElementById('navProgressBar');
    if (!bar) return;
    // Jump to 100% then fade out
    bar.classList.add('complete');
    bar.style.width = '100%';
    this.progressTimeout = setTimeout(() => {
      bar.style.opacity = '0';
      bar.classList.remove('active');
      // Reset width after fade transition completes
      this.progressTimeout = setTimeout(() => {
        bar.style.width = '0%';
        this.progressTimeout = null;
      }, 500);
    }, 300);
  },

  renderNotFound() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div class="empty-state page-enter">
        <div class="empty-state-icon">🔍</div>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  },

  renderError(error) {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div class="empty-state page-enter">
        <div class="empty-state-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>${error.message || 'An unexpected error occurred.'}</p>
        <a href="#/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  },

  beforeEach(hook) {
    this.beforeHooks.push(hook);
  },

  start() {
    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash, false);
    });

    // Handle initial route
    const initialHash = window.location.hash || '#/';
    this.navigate(initialHash, false);
  }
};
