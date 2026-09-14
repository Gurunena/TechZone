/* ==========================================================================
   TechZone — cart.js   (Shopping Cart page brain)

   WHAT THIS FILE DOES, in simple words:
   This is the JavaScript for the Shopping Cart page. It:
     1. Draws a row for every item that is in the cart.
     2. Lets you change the amount with the − and + buttons (or by typing).
     3. Lets you remove one item, or clear the whole cart.
     4. Works out the money on the right (subtotal, discount, delivery, total).
     5. Lets you type a promo code (like TECH10) to get a discount.
     6. If the cart is empty, shows a friendly message with a button that
        loads a few sample items so the page is easy to demo.

   It uses helpers from global.js, stored in a box called "window.TZ".
   Loaded AFTER global.js so TZ already exists.
   ========================================================================== */

/* (function(){ ... })() = a private room so my variables never clash with
   a teammate's variables that might share the same name. */
(function () {
  'use strict';   // ask the browser to warn me about silly mistakes

  var TZ = window.TZ;         // the shared toolbox from global.js
  if (!TZ) { return; }        // if it didn't load, stop quietly

  var $ = TZ.$, $$ = TZ.$$;   // $ = find one thing, $$ = find many things

  /* ---- Fixed numbers we reuse ---- */
  var FREE_DELIVERY_THRESHOLD = 25000;   // Spend Rs. 25,000+ = free delivery.
  var DELIVERY_FEE = 500;                // Otherwise delivery costs Rs. 500.

  /* A tiny list of valid promo codes and how much each one saves.
     (This is only a front-end demo — a real shop would check the server.) */
  var PROMOS = {
    TECH10: { label: '-10%', rate: 0.10 },   // rate 0.10 means "10% off"
    WELCOME5: { label: '-5%', rate: 0.05 },
    STUDENT15: { label: '-15%', rate: 0.15 }
  };
  var appliedPromo = null;   // remembers which promo (if any) is currently on

  /* A few pretend items. The "Preview with sample items" button drops these
     in the cart so the page looks full when we show it to the examiner.
     NOTE: the "image" paths below use the exact real file names my teammate
     uploaded to assets/images/products/ (spaces and .webp included), so the
     real product photos show instead of a placeholder icon. */
  var SAMPLE_ITEMS = [
    { id: 'asus-tuf-f15', name: 'ASUS TUF Gaming F15', price: 289990, image: '../assets/images/products/ASUS TUF Gaming F15.png', qty: 1 },
    { id: 'samsung-970-evo-plus', name: 'Samsung 970 EVO Plus 1TB', price: 32990, image: '../assets/images/products/Samsung 970 EVO Plus.webp', qty: 2 },
    { id: 'hyperx-cloud-ii', name: 'HyperX Cloud II Headset', price: 24990, image: '../assets/images/products/HyperX Cloud II.webp', qty: 1 }
  ];

  /* ------------------------------------------------------------------
     REMEMBER THE PARTS OF THE PAGE we will use a lot
     ------------------------------------------------------------------ */
  var layout = $('#cartLayout');       // the main area (items + summary)
  var emptyState = $('#cartEmpty');    // the "your cart is empty" box
  var itemsWrap = $('#cartItems');     // the empty box we fill with item rows
  var countLabel = $('#cartCountLabel');// the little "4 items" text at the top

  /* ------------------------------------------------------------------
     HELPER FUNCTIONS
     ------------------------------------------------------------------ */

  /* Make text safe to place on the page (swap characters like < > for
     safe versions so they always show as plain words). */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Fix an image path so it works from THIS page.
     Different pages save the image path differently:
       - the homepage (top level) saves "assets/images/products/X.png"
       - a product page (in a sub-folder) saves "../assets/images/products/X.png"
     This page lives in the "cart" folder, so it always needs "../assets/...".
     We cut the path down to the "assets/images/..." part and add one "../". */
  function normImg(src) {
    if (!src) { return ''; }
    var i = src.indexOf('assets/images/');
    if (i === -1) { return src; }        // unknown shape — leave it as-is
    return '../' + src.slice(i);
  }

  /* If a product picture is missing, show a neat box icon instead of a
     broken image, so the page still looks tidy. */
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

  /* Build the HTML for ONE cart row (picture, name, price, quantity, total,
     and a bin button to remove it). Returns it as a string of HTML. */
  function itemRow(item) {
    var line = (Number(item.price) || 0) * (Number(item.qty) || 0);   // price × amount
    var img = item.image
      ? '<img src="' + escapeHtml(normImg(item.image)) + '" alt="' + escapeHtml(item.name) + '" class="ci-thumb">'
      : '<span class="ci-thumb img-ph"><i class="bi bi-box-seam"></i></span>';

    /* data-id="..." quietly stores the item's id on the row, so later we
       know which item a clicked button belongs to. */
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

  /* Work out and show the money box on the right. */
  function renderSummary() {
    var subtotal = TZ.cartTotal();                                   // add up all items
    var discount = appliedPromo ? Math.round(subtotal * appliedPromo.rate) : 0;  // promo saving
    var afterDiscount = subtotal - discount;                         // price after the promo
    var delivery = (subtotal === 0 || afterDiscount >= FREE_DELIVERY_THRESHOLD) ? 0 : DELIVERY_FEE;
    var total = afterDiscount + delivery;                            // final amount to pay

    $('#sumSubtotal').textContent = TZ.formatPrice(subtotal);
    $('#sumDelivery').textContent = delivery === 0 ? 'FREE' : TZ.formatPrice(delivery);
    $('#sumTotal').textContent = TZ.formatPrice(total);

    /* Only show the "Discount" line when a promo is actually applied. */
    var discRow = $('#sumDiscountRow');
    if (discount > 0) {
      discRow.classList.remove('d-none');   // d-none = Bootstrap "hide"; remove it to show
      $('#sumDiscountTag').textContent = appliedPromo.label;
      $('#sumDiscount').textContent = '- ' + TZ.formatPrice(discount);
    } else {
      discRow.classList.add('d-none');       // add it back to hide the line
    }
  }

  /* Decide what the page should look like right now. */
  function render() {
    var cart = TZ.getCart();
    var count = TZ.cartCount();

    /* Show "1 item" or "4 items" (correct singular/plural). */
    countLabel.textContent = count + (count === 1 ? ' item' : ' items');

    if (!cart.length) {
      /* Empty cart: hide the main area, show the empty message, and stop. */
      layout.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }

    /* Cart has items: show the main area and hide the empty message. */
    emptyState.classList.add('d-none');
    layout.classList.remove('d-none');

    /* Build every row and drop them into the page in one go. */
    itemsWrap.innerHTML = cart.map(itemRow).join('');
    renderSummary();
    fixThumbs('#cartItems img', 'ci-thumb');   // tidy any missing pictures
  }

  /* ------------------------------------------------------------------
     BUTTON CLICKS AND TYPING
     ------------------------------------------------------------------ */

  /* Given a clicked button, find which cart row (and item id) it belongs to. */
  function rowId(el) {
    var row = el.closest('.cart-item');       // walk up to the row that holds it
    return row ? row.getAttribute('data-id') : null;
  }

  /* Look up the current quantity of one item. */
  function currentQty(id) {
    var found = TZ.getCart().filter(function (i) { return i.id === id; })[0];
    return found ? (Number(found.qty) || 1) : 1;
  }

  /* One click listener for the whole item list.
     (This is called "event delegation": instead of adding a listener to every
      button, we add ONE to the container and check what was clicked. It even
      works for rows we add later.) */
  itemsWrap.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');   // was a button with data-act clicked?
    if (!btn) { return; }
    var id = rowId(btn);
    if (!id) { return; }
    var act = btn.getAttribute('data-act');     // "inc", "dec" or "remove"

    if (act === 'inc') { TZ.setQty(id, currentQty(id) + 1); render(); }        // + button
    else if (act === 'dec') { TZ.setQty(id, Math.max(1, currentQty(id) - 1)); render(); } // − button (never below 1)
    else if (act === 'remove') {                                               // bin button
      TZ.removeFromCart(id);
      TZ.toast('Item removed from cart', 'info');
      render();
    }
  });

  /* If the shopper types a number straight into the quantity box. */
  itemsWrap.addEventListener('change', function (e) {
    if (!e.target.classList.contains('qty-input')) { return; }   // only the qty box
    var id = rowId(e.target);
    if (!id) { return; }
    var val = parseInt(e.target.value, 10);       // turn the text into a number
    if (isNaN(val) || val < 1) { val = 1; }       // never allow blank or below 1
    if (val > 99) { val = 99; }                   // never allow more than 99
    TZ.setQty(id, val);
    render();
  });

  /* "Clear Cart" button: empty the whole cart. */
  var clearBtn = $('#clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!TZ.getCart().length) { return; }   // nothing to clear
      TZ.clearCart();
      appliedPromo = null;                    // forget any promo too
      TZ.toast('Cart cleared', 'info');
      render();
    });
  }

  /* "Apply" promo button. */
  var promoBtn = $('#promoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      var input = $('#promoInput');
      var msg = $('#promoMsg');
      var code = (input.value || '').trim().toUpperCase();   // tidy the typed code

      if (!code) { msg.className = 'promo-msg err'; msg.textContent = 'Enter a promo code.'; return; }

      if (PROMOS[code]) {
        /* Code exists: remember it and show a green success message. */
        appliedPromo = { code: code, label: PROMOS[code].label, rate: PROMOS[code].rate };
        msg.className = 'promo-msg ok';
        msg.textContent = 'Code "' + code + '" applied — you saved ' + PROMOS[code].label + '!';
        renderSummary();
        TZ.toast('Promo code applied', 'success');
      } else {
        /* Code not found: forget any promo and show a red error message. */
        appliedPromo = null;
        msg.className = 'promo-msg err';
        msg.textContent = 'Sorry, "' + code + '" is not a valid code.';
        renderSummary();
      }
    });
  }

  /* "Preview with sample items" button (only on the empty cart screen). */
  var sampleBtn = $('#loadSampleBtn');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', function () {
      SAMPLE_ITEMS.forEach(function (it) { TZ.addToCart(it, it.qty); });   // add each demo item
      TZ.toast('Sample items added to your cart', 'success');
      render();
    });
  }

  /* "Proceed to Checkout" link: block it if the cart is somehow empty. */
  var checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (e) {
      if (!TZ.getCart().length) {
        e.preventDefault();                       // stop the link from going anywhere
        TZ.toast('Your cart is empty', 'error');
      }
    });
  }

  /* If the cart changes in another browser tab, refresh this page too. */
  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart') { render(); }
  });

  render();   // draw the page for the first time when it opens
})();
