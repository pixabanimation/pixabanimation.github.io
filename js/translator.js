// ============================================
// pixabanimation — Language Selector (20 languages)
//
// In-page translation powered by Google's free
// translate_a/single (GTX) endpoint. The official
// Google Translate website widget no longer exposes
// a programmatic control (its hidden <select> was
// removed), so we translate the page content directly
// and keep the same custom responsive dropdown in the
// navbar. No API key required; CORS is open.
// ============================================
(function () {
  'use strict';

  var LANG_KEY = 'pixa_lang';
  var DEFAULT_LANG = 'en';
  var GTX = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=';

  // Elements whose text is never translated
  var SKIP_SEL = [
    'script', 'style', 'noscript', 'code', 'pre', 'kbd', 'samp',
    'textarea', 'input', 'select', 'option', 'button',
    '.nav-lang', '.nav-clock', '[data-no-translate]', '[translate="no"]'
  ].join(',');

  // 20 most-used languages (code, flag, native name, English name)
  var LANGUAGES = [
    { code: 'en', flag: '🇺🇸', native: 'English', name: 'English' },
    { code: 'ar', flag: '🇸🇦', native: 'العربية', name: 'Arabic' },
    { code: 'bn', flag: '🇧🇩', native: 'বাংলা', name: 'Bengali' },
    { code: 'zh-CN', flag: '🇨🇳', native: '简体中文', name: 'Chinese' },
    { code: 'hi', flag: '🇮🇳', native: 'हिन्दी', name: 'Hindi' },
    { code: 'ru', flag: '🇷🇺', native: 'Русский', name: 'Russian' },
    { code: 'es', flag: '🇪🇸', native: 'Español', name: 'Spanish' },
    { code: 'fr', flag: '🇫🇷', native: 'Français', name: 'French' },
    { code: 'de', flag: '🇩🇪', native: 'Deutsch', name: 'German' },
    { code: 'pt', flag: '🇵🇹', native: 'Português', name: 'Portuguese' },
    { code: 'ja', flag: '🇯🇵', native: '日本語', name: 'Japanese' },
    { code: 'ko', flag: '🇰🇷', native: '한국어', name: 'Korean' },
    { code: 'id', flag: '🇮🇩', native: 'Bahasa Indonesia', name: 'Indonesian' },
    { code: 'tr', flag: '🇹🇷', native: 'Türkçe', name: 'Turkish' },
    { code: 'vi', flag: '🇻🇳', native: 'Tiếng Việt', name: 'Vietnamese' },
    { code: 'it', flag: '🇮🇹', native: 'Italiano', name: 'Italian' },
    { code: 'th', flag: '🇹🇭', native: 'ไทย', name: 'Thai' },
    { code: 'pl', flag: '🇵🇱', native: 'Polski', name: 'Polish' },
    { code: 'nl', flag: '🇳🇱', native: 'Nederlands', name: 'Dutch' },
    { code: 'ur', flag: '🇵🇰', native: 'اردو', name: 'Urdu' }
  ];

  var Translator = {
    currentLang: DEFAULT_LANG,
    _translated: null,
    _cache: null,
    _applying: false,
    _token: 0,
    _observer: null,
    _observeTimer: null,

    init: function () {
      var self = this;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { self.start(); });
      } else {
        self.start();
      }
    },

    start: function () {
      var self = this;
      self.buildWidgets();
      self.wire();
      self._translated = new Map();
      self._cache = new Map();
      var saved = self.getStored();
      if (saved && saved !== DEFAULT_LANG) {
        self.apply(saved);
      }
      self.observe();
    },

    getStored: function () {
      try { return localStorage.getItem(LANG_KEY) || DEFAULT_LANG; } catch (e) { return DEFAULT_LANG; }
    },

    scope: function () {
      return document.body;
    },

    isSkipped: function (node) {
      var el = node.parentElement;
      while (el && el !== document.body) {
        if (el.matches && el.matches(SKIP_SEL)) return true;
        el = el.parentElement;
      }
      return false;
    },

    collect: function () {
      var self = this;
      var scope = self.scope();
      if (!scope) return [];
      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (self.isSkipped(node)) return NodeFilter.FILTER_REJECT;
          var v = node.nodeValue || '';
          if (!v.trim()) return NodeFilter.FILTER_REJECT;
          // Skip letter-free text (digits, times, prices, punctuation)
          if (!/[a-zA-Z]/.test(v)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var items = [];
      var node;
      while ((node = walker.nextNode())) {
        var v = node.nodeValue;
        var trimmed = v.trim();
        var lead = v.slice(0, v.indexOf(trimmed));
        var trail = v.slice(v.indexOf(trimmed) + trimmed.length);
        items.push({ node: node, trimmed: trimmed, lead: lead, trail: trail });
      }
      return items;
    },

    restore: function () {
      var map = this._translated;
      if (!map) return;
      map.forEach(function (entry, node) {
        if (node.isConnected && node.nodeValue === entry.full) {
          node.nodeValue = entry.original;
        }
      });
      map.clear();
    },

    apply: function (code) {
      var self = this;
      if (code === DEFAULT_LANG) {
        self._applying = true;
        self.restore();
        self._applying = false;
        self.currentLang = code;
        if (document.documentElement) document.documentElement.lang = DEFAULT_LANG;
        return;
      }

      var token = ++self._token;
      self._applying = true;
      self.restore();
      self._applying = false;
      self.currentLang = code;
      if (document.documentElement) document.documentElement.lang = code;

      self._translateNew(code, token);
    },

    // Translate only nodes that aren't already translated. Never restores,
    // so unrelated DOM churn (e.g. a ticking clock) can't flip the page back.
    _translateNew: function (code, token) {
      var self = this;
      if (!self._translated) return;

      // Prune stale entries (detached nodes or externally-replaced text)
      var stale = [];
      self._translated.forEach(function (entry, node) {
        if (!node.isConnected || node.nodeValue !== entry.full) stale.push(node);
      });
      for (var s = 0; s < stale.length; s++) self._translated.delete(stale[s]);

      var items = self.collect().filter(function (it) {
        return !self._translated.has(it.node);
      });
      if (!items.length) return;
      self._batchTranslate(items, code, token);
    },

    _batchTranslate: async function (items, code, token) {
      var self = this;
      var prefix = code + '\u0000';

      // Apply cached translations instantly; only fetch text never seen before.
      var pending = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var key = prefix + item.trimmed;
        if (self._cache.has(key)) {
          var cached = self._cache.get(key);
          if (cached !== item.trimmed) self._apply(item, cached, token);
          continue;
        }
        pending.push(item);
      }
      if (!pending.length) return;

      var chunks = [];
      var cur = [];
      var len = 0;
      for (var j = 0; j < pending.length; j++) {
        cur.push(pending[j]);
        len += pending[j].trimmed.length + 1;
        if (cur.length >= 60 || len >= 1500) {
          chunks.push(cur);
          cur = [];
          len = 0;
        }
      }
      if (cur.length) chunks.push(cur);

      for (var c = 0; c < chunks.length; c++) {
        var chunk = chunks[c];
        var joined = chunk.map(function (it) { return it.trimmed; }).join('\n');
        var translated;
        try {
          var res = await fetch(GTX + encodeURIComponent(code) + '&dt=t&q=' + encodeURIComponent(joined));
          var json = await res.json();
          translated = (json && json[0] && json[0].map(function (s) { return s[0]; }).join('')) || '';
        } catch (err) {
          translated = '';
        }
        if (!translated) {
          // Cache as unchanged so we don't retry this text repeatedly
          for (var m = 0; m < chunk.length; m++) self._cache.set(prefix + chunk[m].trimmed, chunk[m].trimmed);
          continue;
        }
        var lines = translated.split('\n');

        for (var k = 0; k < chunk.length; k++) {
          var it = chunk[k];
          var line = (lines[k] !== undefined && lines[k] !== '') ? lines[k] : it.trimmed;
          self._cache.set(prefix + it.trimmed, line);
          if (line !== it.trimmed) self._apply(it, line, token);
        }
      }
    },

    _apply: function (item, line, token) {
      if (token !== this._token) return;
      var node = item.node;
      if (!node || !node.isConnected) return;
      if (node.nodeValue !== (item.lead + item.trimmed + item.trail)) return;
      var original = node.nodeValue;
      node.nodeValue = item.lead + line + item.trail;
      this._translated.set(node, { original: original, lead: item.lead, trail: item.trail, full: item.lead + line + item.trail });
    },

    refresh: function () {
      var self = this;
      if (self.currentLang === DEFAULT_LANG) return;
      var token = ++self._token;
      self._translateNew(self.currentLang, token);
    },

    observe: function () {
      var self = this;
      var target = self.scope();
      if (!target || typeof MutationObserver === 'undefined') return;
      if (self._observer) self._observer.disconnect();
      self._observer = new MutationObserver(function (muts) {
        if (self._applying) return;

        // Ignore mutations that only touch skipped subtrees (e.g. the
        // ticking nav clock) so they can't trigger a re-translate.
        var relevant = false;
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          var node = m.addedNodes.length ? m.addedNodes[0] : m.target;
          var insideSkip = false;
          var cur = (node && node.nodeType === 1) ? node : (node && node.parentElement);
          while (cur && cur !== document.body) {
            if (cur.matches && cur.matches(SKIP_SEL)) { insideSkip = true; break; }
            cur = cur.parentElement;
          }
          if (!insideSkip) { relevant = true; break; }
        }
        if (!relevant) return;

        clearTimeout(self._observeTimer);
        self._observeTimer = setTimeout(function () { self.refresh(); }, 700);
      });
      // childList only: translation itself only changes text node values
      // (characterData), so our own writes never trigger a re-translate loop.
      self._observer.observe(target, { childList: true, subtree: true });
    },

    // ─── Dropdown UI ────────────────────────────────────────────────
    buildWidgets: function () {
      var self = this;
      var containers = document.querySelectorAll('[data-lang-widget]');
      if (!containers.length) return;

      containers.forEach(function (container) {
        if (container.querySelector('.nav-lang-btn')) return;

        var isMobile = container.classList.contains('nav-lang--mobile');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-lang-btn';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<i class="fas fa-globe"></i><span class="nav-lang-current"></span><i class="fas fa-chevron-down nav-lang-caret"></i>';

        var menu = document.createElement('ul');
        menu.className = 'nav-lang-menu';
        menu.setAttribute('role', 'menu');

        LANGUAGES.forEach(function (l) {
          var item = document.createElement('li');
          item.className = 'nav-lang-item';
          item.setAttribute('role', 'menuitem');
          item.dataset.code = l.code;
          item.innerHTML = '<span class="nav-lang-flag">' + l.flag + '</span>' +
            '<span class="nav-lang-name"></span>' +
            '<span class="nav-lang-en"></span>';
          item.querySelector('.nav-lang-name').textContent = l.native;
          item.querySelector('.nav-lang-en').textContent = l.name;
          item.addEventListener('click', function () { self.setLang(l.code); });
          menu.appendChild(item);
        });

        container.appendChild(btn);
        container.appendChild(menu);
      });

      this.syncLabels();
    },

    syncLabels: function () {
      var self = this;
      var cur = self.getStored();
      var lang = null;
      for (var i = 0; i < LANGUAGES.length; i++) {
        if (LANGUAGES[i].code === cur) { lang = LANGUAGES[i]; break; }
      }
      var label = lang ? lang.native : 'English';

      document.querySelectorAll('.nav-lang-current').forEach(function (el) {
        el.textContent = label;
      });
      document.querySelectorAll('.nav-lang-item').forEach(function (el) {
        el.classList.toggle('active', el.dataset.code === cur);
      });
    },

    wire: function () {
      var self = this;

      document.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.nav-lang-btn') : null;
        var widget = btn ? btn.closest('.nav-lang') : null;

        if (widget) {
          var wasOpen = widget.classList.contains('open');
          self.closeAll();
          if (!wasOpen) self.open(widget);
          return;
        }

        var inWidget = e.target.closest('.nav-lang');
        if (!inWidget) self.closeAll();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') self.closeAll();
      });
    },

    open: function (widget) {
      widget.classList.add('open');
      var btn = widget.querySelector('.nav-lang-btn');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    },

    closeAll: function () {
      document.querySelectorAll('.nav-lang.open').forEach(function (w) {
        w.classList.remove('open');
        var btn = w.querySelector('.nav-lang-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    },

    trigger: function (code) {
      try { localStorage.setItem(LANG_KEY, code); } catch (e) { /* ignore */ }
      this.syncLabels();
      this.apply(code);
    },

    setLang: function (code) {
      this.trigger(code);
      this.closeAll();
    }
  };

  window.Translator = Translator;
  Translator.init();
})();
