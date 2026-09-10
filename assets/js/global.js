/* ==========================================================================
   TechZone — global.js
   Shared behaviour for every page:
     • cart + wishlist state (localStorage) and header badge counts
     • "Add to Cart" / wishlist heart buttons
     • search bar with live suggestions
     • sticky nav shadow on scroll
     • toast notifications
     • graceful fallback for images that aren't uploaded yet
     • footer year

   Loaded AFTER bootstrap.bundle.min.js and BEFORE any [page-name].js.
   Everything is exposed on window.TZ so page scripts can reuse it.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Storage keys
     ------------------------------------------------------------------ */
  var CART_KEY = 'tz_cart';
  var WISH_KEY = 'tz_wishlist';

  /* ------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /** Read a JSON array from localStorage, never throwing. */
  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      var val = raw ? JSON.parse(raw) : [];
      return Array.isArray(val) ? val : [];
    } catch (e) {
      return [];
    }
  }

  /** Write a JSON array to localStorage, never throwing (private mode, etc.). */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable — state simply won't persist */
    }
  }

  /** 289990 → "Rs. 289,990" */
  function formatPrice(amount) {
    var n = Number(amount) || 0;
    return 'Rs. ' + n.toLocaleString('en-LK', { maximumFractionDigits: 0 });
  }

  /**
   * Pages live at different depths (index.html vs products/laptops.html),
   * so build links relative to the site root.
   */
  function rootPath() {
    var parts = window.location.pathname.replace(/\\/g, '/').split('/');
    var subFolders = ['products', 'cart', 'account'];

    // If we're inside one of the sub-folders, step back up one level.
    for (var i = 0; i < parts.length; i++) {
      if (subFolders.indexOf(parts[i]) !== -1) { return '../'; }
    }
    return '';
  }

  /* ------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------ */
  var TOAST_ICONS = {
    success: 'bi-check-circle-fill',
    info: 'bi-info-circle-fill',
    error: 'bi-exclamation-circle-fill'
  };

  function toast(message, type) {
    type = type || 'success';

    var wrap = $('#tzToastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'tz-toast-wrap';
      wrap.id = 'tzToastWrap';
      document.body.appendChild(wrap);
    }

    var el = document.createElement('div');
    el.className = 'tz-toast ' + (type === 'success' ? '' : type);
    el.innerHTML = '<i class="bi ' + (TOAST_ICONS[type] || TOAST_ICONS.success) + '"></i><span></span>';
    el.querySelector('span').textContent = message;
    wrap.appendChild(el);

    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 260);
    }, 2600);
  }

  /* ------------------------------------------------------------------
     Cart
     ------------------------------------------------------------------ */
  function getCart() { return read(CART_KEY); }

  function cartCount() {
    return getCart().reduce(function (sum, item) { return sum + (Number(item.qty) || 0); }, 0);
  }

  function cartTotal() {
    return getCart().reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (Number(item.qty) || 0);
    }, 0);
  }

  function addToCart(product, qty) {
    if (!product || !product.id) { return; }
    qty = Number(qty) || 1;

    var cart = getCart();
    var existing = null;

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) { existing = cart[i]; break; }
    }

    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name || '',
        price: Number(product.price) || 0,
        image: product.image || '',
        qty: qty
      });
    }

    write(CART_KEY, cart);
    refreshBadges();
    return cart;
  }

  function removeFromCart(id) {
    write(CART_KEY, getCart().filter(function (item) { return item.id !== id; }));
    refreshBadges();
  }

  function setQty(id, qty) {
    qty = Math.max(1, Number(qty) || 1);
    var cart = getCart().map(function (item) {
      if (item.id === id) { item.qty = qty; }
      return item;
    });
    write(CART_KEY, cart);
    refreshBadges();
  }

  function clearCart() {
    write(CART_KEY, []);
    refreshBadges();
  }

  /* ------------------------------------------------------------------
     Wishlist
     ------------------------------------------------------------------ */
  function getWishlist() { return read(WISH_KEY); }

  function inWishlist(id) { return getWishlist().indexOf(id) !== -1; }

  function toggleWishlist(id) {
    var list = getWishlist();
    var idx = list.indexOf(id);
    var added;

    if (idx === -1) { list.push(id); added = true; }
    else { list.splice(idx, 1); added = false; }

    write(WISH_KEY, list);
    refreshBadges();
    return added;
  }

  /* ------------------------------------------------------------------
     Header badge counts
     ------------------------------------------------------------------ */
  function refreshBadges() {
    var c = cartCount();
    $$('[data-tz-cart-count]').forEach(function (el) {
      el.textContent = c;
      el.setAttribute('data-count', c);
    });

    var w = getWishlist().length;
    $$('[data-tz-wishlist-count]').forEach(function (el) {
      el.textContent = w;
      el.setAttribute('data-count', w);
    });

    // Reflect saved state on any wishlist hearts present on this page.
    $$('[data-tz-wish]').forEach(function (btn) {
      var on = inWishlist(btn.getAttribute('data-tz-wish'));
      btn.classList.toggle('active', on);
      var icon = btn.querySelector('i');
      if (icon) { icon.className = on ? 'bi bi-heart-fill' : 'bi bi-heart'; }
    });
  }

  /* ------------------------------------------------------------------
     Button wiring (event delegation — works for cards added later)
     ------------------------------------------------------------------ */
  function bindButtons() {
    document.addEventListener('click', function (e) {

      // Add to Cart
      var addBtn = e.target.closest('[data-tz-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        addToCart({
          id: addBtn.getAttribute('data-id'),
          name: addBtn.getAttribute('data-name'),
          price: addBtn.getAttribute('data-price'),
          image: addBtn.getAttribute('data-image')
        }, addBtn.getAttribute('data-qty') || 1);
        toast((addBtn.getAttribute('data-name') || 'Item') + ' added to cart');
        return;
      }

      // Wishlist heart
      var wishBtn = e.target.closest('[data-tz-wish]');
      if (wishBtn) {
        e.preventDefault();
        var added = toggleWishlist(wishBtn.getAttribute('data-tz-wish'));
        toast(added ? 'Added to your wishlist' : 'Removed from your wishlist', 'info');
      }
    });
  }

  /* ------------------------------------------------------------------
     Search
     A lightweight index so the header search can suggest results on
     every page. Extend this list as the catalogue grows.
     ------------------------------------------------------------------ */
  var SEARCH_INDEX = [
    { name: 'ASUS TUF Gaming F15',   cat: 'Laptops',     url: 'products/product-detail.html?id=asus-tuf-f15' },
    { name: 'iBUYPOWER Gaming PC',   cat: 'Desktops',    url: 'products/product-detail.html?id=ibuypower-gaming-pc' },
    { name: 'Acer Nitro 27" Monitor', cat: 'Peripherals', url: 'products/product-detail.html?id=acer-nitro-27' },
    { name: 'Samsung 970 EVO Plus',  cat: 'Storage',     url: 'products/product-detail.html?id=samsung-970-evo-plus' },
    { name: 'HyperX Cloud II',       cat: 'Accessories', url: 'products/product-detail.html?id=hyperx-cloud-ii' },
    { name: 'Gaming Laptops',        cat: 'Category',    url: 'products/laptops.html' },
    { name: 'Desktop PCs',           cat: 'Category',    url: 'products/desktops.html' },
    { name: 'Gaming PCs',            cat: 'Category',    url: 'products/gaming.html' },
    { name: 'Graphics Cards',        cat: 'Components',  url: 'products/components.html' },
    { name: 'Processors',            cat: 'Components',  url: 'products/components.html' },
    { name: 'Motherboards',          cat: 'Components',  url: 'products/components.html' },
    { name: 'RAM / Memory',          cat: 'Components',  url: 'products/components.html' },
    { name: 'SSD & Storage',         cat: 'Components',  url: 'products/components.html' },
    { name: 'Keyboards & Mice',      cat: 'Peripherals', url: 'products/peripherals.html' },
    { name: 'Headsets',              cat: 'Accessories', url: 'products/accessories.html' }
  ];

  function initSearch() {
    var form = $('#tzSearchForm');
    var input = $('#tzSearchInput');
    var box = $('#tzSuggest');
    if (!form || !input || !box) { return; }

    var base = rootPath();

    function render(items, query) {
      if (!query) { box.classList.remove('show'); box.innerHTML = ''; return; }

      if (!items.length) {
        box.innerHTML = '<div class="tz-suggest-empty">No matches for "' +
          query.replace(/[<>&]/g, '') + '"</div>';
        box.classList.add('show');
        return;
      }

      box.innerHTML = items.map(function (item) {
        return '<a href="' + base + item.url + '">' +
               '<strong></strong><span>' + item.cat + '</span></a>';
      }).join('');

      // Set names as text (not HTML) to stay safe with any characters.
      $$('a strong', box).forEach(function (el, i) { el.textContent = items[i].name; });
      box.classList.add('show');
    }

    function search(q) {
      var needle = q.trim().toLowerCase();
      if (!needle) { return []; }
      return SEARCH_INDEX.filter(function (item) {
        return (item.name + ' ' + item.cat).toLowerCase().indexOf(needle) !== -1;
      }).slice(0, 6);
    }

    input.addEventListener('input', function () {
      render(search(input.value), input.value.trim());
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) { render(search(input.value), input.value.trim()); }
    });

    // Close when clicking away or pressing Escape.
    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) { box.classList.remove('show'); }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { box.classList.remove('show'); input.blur(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var matches = search(input.value);
      if (matches.length) {
        window.location.href = base + matches[0].url;
      } else if (input.value.trim()) {
        toast('No products matched "' + input.value.trim() + '"', 'error');
      }
    });
  }

  /* ------------------------------------------------------------------
     Sticky nav shadow
     ------------------------------------------------------------------ */
  function initStickyNav() {
    var nav = $('#tzNav');
    if (!nav) { return; }

    var header = $('.tz-header');
    var trigger = header ? header.offsetHeight : 80;

    function onScroll() {
      nav.classList.toggle('is-stuck', window.scrollY > trigger - 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Missing-image fallback
     Until the real files land in assets/images/, swap a broken image
     for a neutral placeholder block instead of a browser error icon.
     ------------------------------------------------------------------ */
  function initImageFallback() {
    $$('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('img-missing');
        img.removeAttribute('src');
      }, { once: true });

      // Catch images that already failed before this script ran.
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        img.classList.add('img-missing');
        img.removeAttribute('src');
      }
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  function initYear() {
    $$('[data-tz-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function init() {
    bindButtons();
    refreshBadges();
    initSearch();
    initStickyNav();
    initImageFallback();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Keep badges in sync across open tabs.
  window.addEventListener('storage', function (e) {
    if (e.key === CART_KEY || e.key === WISH_KEY) { refreshBadges(); }
  });

  /* ------------------------------------------------------------------
     Public API for page scripts (cart.js, product-detail.js, ...)
     ------------------------------------------------------------------ */
  window.TZ = {
    $: $,
    $$: $$,
    formatPrice: formatPrice,
    rootPath: rootPath,
    toast: toast,
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    setQty: setQty,
    clearCart: clearCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    getWishlist: getWishlist,
    inWishlist: inWishlist,
    toggleWishlist: toggleWishlist,
    refreshBadges: refreshBadges,
    SEARCH_INDEX: SEARCH_INDEX
  };
})();
