/* ==========================================================================
   TechZone — cart.js
   Shopping Cart page behaviour. Builds on window.TZ (from global.js):
     • render cart items from TZ.getCart()
     • quantity steppers  (TZ.setQty)
     • remove / clear      (TZ.removeFromCart / TZ.clearCart)
     • promo code + live order summary (subtotal, discount, delivery, total)
     • empty state + "preview with sample items"

   Loaded AFTER global.js.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }

  var $ = TZ.$, $$ = TZ.$$;

  var FREE_DELIVERY_THRESHOLD = 25000;   // Rs.
  var DELIVERY_FEE = 500;                // Rs.

  /* Simple promo table (front-end demo only). */
  var PROMOS = {
    TECH10: { label: '-10%', rate: 0.10 },
    WELCOME5: { label: '-5%', rate: 0.05 },
    STUDENT15: { label: '-15%', rate: 0.15 }
  };
  var appliedPromo = null;   // { code, label, rate }

  /* Demo items used by the "preview with sample items" button so the page
     can be evaluated even before anything is added from a product page. */
  var SAMPLE_ITEMS = [
    { id: 'asus-tuf-f15', name: 'ASUS TUF Gaming F15', price: 289990, image: '../assets/images/products/asus-tuf-f15.png', qty: 1 },
    { id: 'samsung-970-evo-plus', name: 'Samsung 970 EVO Plus 1TB', price: 32990, image: '../assets/images/products/samsung-970-evo-plus.png', qty: 2 },
    { id: 'hyperx-cloud-ii', name: 'HyperX Cloud II Headset', price: 24990, image: '../assets/images/products/hyperx-cloud-ii.png', qty: 1 }
  ];

  /* ------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------ */
  var layout = $('#cartLayout');
  var emptyState = $('#cartEmpty');
  var itemsWrap = $('#cartItems');
  var countLabel = $('#cartCountLabel');

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Replace broken/absent thumbnails with a themed product icon. */
  function fixThumbs(sel, cls) {
    $$(sel).forEach(function (img) {
      function swap() {
        var span = document.createElement('span');
        span.className = cls + ' img-ph';
        span.innerHTML = '<i class="bi bi-box-seam"></i>';
        if (img.parentNode) { img.parentNode.replaceChild(span, img); }
      }
      img.addEventListener('error', swap, { once: true });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) { swap(); }
    });
  }

  function itemRow(item) {
    var line = (Number(item.price) || 0) * (Number(item.qty) || 0);
    var img = item.image
      ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" class="ci-thumb">'
      : '<span class="ci-thumb img-ph"><i class="bi bi-box-seam"></i></span>';

    return '' +
      '<div class="cart-item" data-id="' + escapeHtml(item.id) + '">' +
        '<div class="ci-product">' +
          '<a class="d-block" href="../products/product-detail.html?id=' + encodeURIComponent(item.id) + '">' + img + '</a>' +
          '<div class="ci-info">' +
            '<h3 class="ci-name"><a href="../products/product-detail.html?id=' + encodeURIComponent(item.id) + '">' + escapeHtml(item.name) + '</a></h3>' +
            '<div class="ci-meta"><span class="ci-instock"><i class="bi bi-check-circle-fill"></i> In stock</span> &middot; Ships in 1–2 days</div>' +
          '</div>' +
        '</div>' +
        '<div class="ci-price">' + TZ.formatPrice(item.price) + '</div>' +
        '<div class="ci-qty">' +
          '<div class="qty-stepper">' +
            '<button type="button" class="qty-btn" data-act="dec" aria-label="Decrease quantity">&minus;</button>' +
            '<input type="number" class="qty-input" value="' + (Number(item.qty) || 1) + '" min="1" max="99" aria-label="Quantity">' +
            '<button type="button" class="qty-btn" data-act="inc" aria-label="Increase quantity">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="ci-total">' + TZ.formatPrice(line) + '</div>' +
        '<div class="ci-remove">' +
          '<button type="button" class="ci-remove-btn" data-act="remove" aria-label="Remove item"><i class="bi bi-trash3"></i></button>' +
        '</div>' +
      '</div>';
  }

  function renderSummary() {
    var subtotal = TZ.cartTotal();
    var discount = appliedPromo ? Math.round(subtotal * appliedPromo.rate) : 0;
    var afterDiscount = subtotal - discount;
    var delivery = (subtotal === 0 || afterDiscount >= FREE_DELIVERY_THRESHOLD) ? 0 : DELIVERY_FEE;
    var total = afterDiscount + delivery;

    $('#sumSubtotal').textContent = TZ.formatPrice(subtotal);
    $('#sumDelivery').textContent = delivery === 0 ? 'FREE' : TZ.formatPrice(delivery);
    $('#sumTotal').textContent = TZ.formatPrice(total);

    var discRow = $('#sumDiscountRow');
    if (discount > 0) {
      discRow.classList.remove('d-none');
      $('#sumDiscountTag').textContent = appliedPromo.label;
      $('#sumDiscount').textContent = '- ' + TZ.formatPrice(discount);
    } else {
      discRow.classList.add('d-none');
    }
  }

  function render() {
    var cart = TZ.getCart();
    var count = TZ.cartCount();

    countLabel.textContent = count + (count === 1 ? ' item' : ' items');

    if (!cart.length) {
      layout.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }

    emptyState.classList.add('d-none');
    layout.classList.remove('d-none');

    itemsWrap.innerHTML = cart.map(itemRow).join('');
    renderSummary();

    // Swap any broken thumbnail for a clean product icon (images may not be
    // uploaded yet). Keeps the layout tidy instead of showing a broken image.
    fixThumbs('#cartItems img', 'ci-thumb');
  }

  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  function rowId(el) {
    var row = el.closest('.cart-item');
    return row ? row.getAttribute('data-id') : null;
  }

  function currentQty(id) {
    var found = TZ.getCart().filter(function (i) { return i.id === id; })[0];
    return found ? (Number(found.qty) || 1) : 1;
  }

  itemsWrap.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) { return; }
    var id = rowId(btn);
    if (!id) { return; }
    var act = btn.getAttribute('data-act');

    if (act === 'inc') { TZ.setQty(id, currentQty(id) + 1); render(); }
    else if (act === 'dec') { TZ.setQty(id, Math.max(1, currentQty(id) - 1)); render(); }
    else if (act === 'remove') {
      TZ.removeFromCart(id);
      TZ.toast('Item removed from cart', 'info');
      render();
    }
  });

  // Manual quantity typing
  itemsWrap.addEventListener('change', function (e) {
    if (!e.target.classList.contains('qty-input')) { return; }
    var id = rowId(e.target);
    if (!id) { return; }
    var val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) { val = 1; }
    if (val > 99) { val = 99; }
    TZ.setQty(id, val);
    render();
  });

  // Clear cart
  var clearBtn = $('#clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!TZ.getCart().length) { return; }
      TZ.clearCart();
      appliedPromo = null;
      TZ.toast('Cart cleared', 'info');
      render();
    });
  }

  // Promo code
  var promoBtn = $('#promoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      var input = $('#promoInput');
      var msg = $('#promoMsg');
      var code = (input.value || '').trim().toUpperCase();

      if (!code) { msg.className = 'promo-msg err'; msg.textContent = 'Enter a promo code.'; return; }

      if (PROMOS[code]) {
        appliedPromo = { code: code, label: PROMOS[code].label, rate: PROMOS[code].rate };
        msg.className = 'promo-msg ok';
        msg.textContent = 'Code "' + code + '" applied — you saved ' + PROMOS[code].label + '!';
        renderSummary();
        TZ.toast('Promo code applied', 'success');
      } else {
        appliedPromo = null;
        msg.className = 'promo-msg err';
        msg.textContent = 'Sorry, "' + code + '" is not a valid code.';
        renderSummary();
      }
    });
  }

  // Empty-state sample loader
  var sampleBtn = $('#loadSampleBtn');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', function () {
      SAMPLE_ITEMS.forEach(function (it) { TZ.addToCart(it, it.qty); });
      TZ.toast('Sample items added to your cart', 'success');
      render();
    });
  }

  // Checkout guard — don't allow proceeding with an empty cart.
  var checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (e) {
      if (!TZ.getCart().length) {
        e.preventDefault();
        TZ.toast('Your cart is empty', 'error');
      }
    });
  }

  // Keep in sync if another tab changes the cart.
  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart') { render(); }
  });

  render();
})();
