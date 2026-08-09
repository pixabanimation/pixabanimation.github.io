// ============================================
// pixabanimation — Language Selector (20 languages)
// Uses the free Google Translate website widget,
// restricted to the 20 most-used languages, wrapped
// in a custom responsive dropdown in the navbar.
// ============================================
(function () {
  'use strict';

  var LANG_KEY = 'pixa_lang';
  var DEFAULT_LANG = 'en';
  var TRANSLATE_ID = 'google_translate_element';

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

  var INCLUDED = LANGUAGES.map(function (l) { return l.code; }).join(',');

  var Translator = {
    sel: null,
    ready: false,

    init: function () {
      var self = this;
      document.addEventListener('DOMContentLoaded', function () {
        self.buildWidgets();
        self.wire();
        self.waitForSelect(function (sel) {
          self.sel = sel;
          self.ready = true;
          var saved = self.getStored();
          if (saved && saved !== DEFAULT_LANG) {
            self.trigger(saved);
          }
        });
      });
    },

    getStored: function () {
      try { return localStorage.getItem(LANG_KEY) || DEFAULT_LANG; } catch (e) { return DEFAULT_LANG; }
    },

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

        // Close if clicking outside any widget
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

    waitForSelect: function (cb) {
      var start = Date.now();
      var timer = setInterval(function () {
        var sel = document.querySelector('.goog-te-combo');
        if (sel) {
          clearInterval(timer);
          cb(sel);
          return;
        }
        if (Date.now() - start > 12000) clearInterval(timer);
      }, 150);
    },

    trigger: function (code) {
      try { localStorage.setItem(LANG_KEY, code); } catch (e) { /* ignore */ }
      this.syncLabels();

      if (!this.sel || !this.ready) return;

      var found = false;
      for (var i = 0; i < this.sel.options.length; i++) {
        if (this.sel.options[i].value === code) {
          this.sel.value = code;
          found = true;
          break;
        }
      }
      if (!found) this.sel.value = ''; // restore original

      this.sel.dispatchEvent(new Event('change', { bubbles: true }));
    },

    setLang: function (code) {
      this.trigger(code);
      this.closeAll();
    }
  };

  // Google Translate bootstrap callback
  window.googleTranslateElementInit = function () {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      var el = document.getElementById(TRANSLATE_ID);
      if (el && window.google && window.google.translate && window.google.translate.TranslateElement) {
        try {
          new window.google.translate.TranslateElement({
            pageLanguage: DEFAULT_LANG,
            includedLanguages: INCLUDED,
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, el);
          clearInterval(timer);
          return;
        } catch (err) {
          // keep retrying
        }
      }
      if (attempts > 40) clearInterval(timer); // ~12s timeout
    }, 300);
  };

  window.Translator = Translator;
  Translator.init();
})();
