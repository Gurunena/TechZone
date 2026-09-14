/* ==========================================================================
   TechZone — checkout.js   (Checkout page brain)

   WHAT THIS FILE DOES, in simple words:
   This is the JavaScript for the Checkout page. It:
     1. Shows the list of items you are buying (read from the cart).
     2. Works out the money: subtotal, delivery fee, VAT, and final total.
     3. Shows the card boxes only when you pick "Card" as payment.
     4. Checks the form is filled in correctly before you can order.
     5. When you click "Place Order", it saves the order, empties the cart,
        and sends you to the Thank-You (order confirmation) page.

   It uses helpers from global.js (a shared file the whole team uses).
   Those helpers live in a box called "window.TZ" (for example TZ.getCart()).

   NOTE: This file is loaded AFTER global.js, so TZ already exists.
   ========================================================================== */

/* The whole file is wrapped in (function () { ... })();
   This is called an "IIFE" (Immediately Invoked Function Expression).
   In plain words: it is a private room. Any variable I make in here stays
   in here, so it can never clash with a teammate's variable of the same name. */
(function () {
  'use strict';   // "strict mode" = ask the browser to catch silly mistakes.

  /* Grab the shared toolbox from global.js. */
  var TZ = window.TZ;
  if (!TZ) { return; }   // Safety: if global.js didn't load, stop quietly.

  /* Short nicknames so we type less:
     $  = find ONE thing on the page (like #fullName)
     $$ = find MANY things on the page (like all the radio buttons) */
  var $ = TZ.$, $$ = TZ.$$;

  /* ---- Some fixed numbers we reuse (called "constants") ---- */
  var FREE_DELIVERY_THRESHOLD = 25000;   // Spend Rs. 25,000+ = free standard delivery.
  var VAT_RATE = 0.18;                    // 18% tax. Prices already include it.

  /* A little lookup table of delivery prices (in Rupees). */
  var DELIVERY_FEES = { standard: 500, express: 1200, pickup: 0 };

  /* Remember the important parts of the page so we can use them later. */
  var form = $('#checkoutForm');     // the whole checkout form
  var emptyAlert = $('#emptyAlert'); // the yellow "cart is empty" warning
  var placeBtn = $('#placeOrderBtn');// the blue "Place Order" button

  /* ------------------------------------------------------------------
     HELPER FUNCTIONS (small jobs we reuse)
     ------------------------------------------------------------------ */

  /* Make text safe to put on the page.
     A product name could contain characters like < or > that the browser
     might try to read as code. This swaps them for safe versions so the
     text always shows as plain words. */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Fix an image path so it works from THIS page (the "cart" folder).
     The homepage saves "assets/images/..." while product pages save
     "../assets/images/...". We always rebuild it as "../assets/images/...". */
  function normImg(src) {
    if (!src) { return ''; }
    var i = src.indexOf('assets/images/');
    if (i === -1) { return src; }
    return '../' + src.slice(i);
  }

  /* If a product picture is missing (not uploaded yet), swap the broken
     image for a neat little box icon so the page still looks tidy. */
  function fixThumbs(sel, cls) {
    $$(sel).forEach(function (img) {
      function swap() {
        var span = document.createElement('span');
        span.className = cls + ' img-ph';
        span.innerHTML = '<i class="bi bi-box-seam"></i>';
        if (img.parentNode) { img.parentNode.replaceChild(span, img); }
      }
      img.addEventListener('error', swap, { once: true });  // runs if the image fails to load
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) { swap(); }
    });
  }

  /* Which delivery option is ticked? Returns "standard", "express" or "pickup". */
  function selectedDelivery() {
    var el = $('input[name="delivery"]:checked');
    return el ? el.value : 'standard';
  }
  /* Which payment option is ticked? Returns "card" or "cod". */
  function selectedPayment() {
    var el = $('input[name="payment"]:checked');
    return el ? el.value : 'card';
  }

  /* Work out the delivery fee. Standard delivery is free once you spend enough. */
  function deliveryFee(subtotal) {
    var method = selectedDelivery();
    if (method === 'standard' && subtotal >= FREE_DELIVERY_THRESHOLD) { return 0; }
    return DELIVERY_FEES[method] || 0;
  }

  /* ------------------------------------------------------------------
     SHOW THE ORDER SUMMARY (the little list on the right)
     ------------------------------------------------------------------ */

  /* Build one small row for each item in the cart and drop them on the page. */
  function renderItems() {
    var cart = TZ.getCart();          // ask the shared toolbox for the cart items
    var wrap = $('#summaryItems');    // the empty <ul> we will fill

    /* .map() = "for each item, make a piece of HTML text".
       .join('') = "glue all those pieces into one big string". */
    wrap.innerHTML = cart.map(function (item) {
      var line = (Number(item.price) || 0) * (Number(item.qty) || 0);  // price × quantity
      var img = item.image
        ? '<img src="' + escapeHtml(normImg(item.image)) + '" alt="' + escapeHtml(item.name) + '" class="si-thumb">'
        : '<span class="si-thumb img-ph"><i class="bi bi-box-seam"></i></span>';
      return '' +
        '<li class="summary-item">' +
          '<div style="position:relative">' + img + '<span class="si-qty-badge">' + (Number(item.qty) || 1) + '</span></div>' +
          '<div class="si-info">' +
            '<p class="si-name">' + escapeHtml(item.name) + '</p>' +
            '<span class="si-unit">' + TZ.formatPrice(item.price) + ' each</span>' +
          '</div>' +
          '<span class="si-line">' + TZ.formatPrice(line) + '</span>' +
        '</li>';
    }).join('');

    fixThumbs('#summaryItems img', 'si-thumb');  // tidy any missing pictures
  }

  /* Work out and show the money lines (subtotal, delivery, VAT, total). */
  function renderTotals() {
    var subtotal = TZ.cartTotal();                    // add up all items
    var delivery = deliveryFee(subtotal);             // delivery fee (maybe free)
    var total = subtotal + delivery;                  // grand total to pay
    var vat = Math.round(total * (VAT_RATE / (1 + VAT_RATE)));  // the tax already inside the total

    /* .textContent puts plain text into an element on the page. */
    $('#sumSubtotal').textContent = TZ.formatPrice(subtotal);
    $('#sumDelivery').textContent = delivery === 0 ? 'FREE' : TZ.formatPrice(delivery);
    $('#sumVat').textContent = TZ.formatPrice(vat);
    $('#sumTotal').textContent = TZ.formatPrice(total);
  }

  /* Decide what the page should look like right now. */
  function render() {
    var cart = TZ.getCart();
    if (!cart.length) {
      /* Cart is empty: show the warning and switch OFF the Place Order button. */
      emptyAlert.classList.remove('d-none');            // d-none = Bootstrap's "hide me" class
      placeBtn.setAttribute('disabled', 'disabled');
    } else {
      /* Cart has items: hide the warning and switch ON the button. */
      emptyAlert.classList.add('d-none');
      placeBtn.removeAttribute('disabled');
    }
    renderItems();
    renderTotals();
  }

  /* ------------------------------------------------------------------
     SHOW OR HIDE THE CARD BOXES
     The card number/expiry/CVV boxes should only appear for card payment.
     ------------------------------------------------------------------ */
  var cardFields = $('#cardFields');
  var cardInputs = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];

  function toggleCardFields() {
    var isCard = selectedPayment() === 'card';       // true if "Card" is ticked
    cardFields.classList.toggle('show', isCard);     // show the card box only for card

    /* Make the card boxes "required" only when card is chosen.
       If the shopper picks Cash on Delivery, the card boxes are not needed. */
    cardInputs.forEach(function (id) {
      var el = $('#' + id);
      if (!el) { return; }
      if (isCard) { el.setAttribute('required', 'required'); }
      else { el.removeAttribute('required'); el.classList.remove('is-invalid'); }
    });
  }

  /* ------------------------------------------------------------------
     TIDY WHAT THE USER TYPES (make it look nice as they type)
     ------------------------------------------------------------------ */
  function initFormatting() {
    /* Card number: keep only digits, max 16, add a space every 4 → "1234 5678 ...". */
    var num = $('#cardNumber');
    if (num) {
      num.addEventListener('input', function () {
        var digits = num.value.replace(/\D/g, '').slice(0, 16);  // \D means "not a digit"
        num.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
    }
    /* Expiry: keep only digits, max 4, add a "/" after the month → "MM/YY". */
    var exp = $('#cardExpiry');
    if (exp) {
      exp.addEventListener('input', function () {
        var d = exp.value.replace(/\D/g, '').slice(0, 4);
        exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      });
    }
    /* CVV: keep only digits, and never allow more than 3.
       (A CVV is the 3-digit number on the back of the card.)
       BUG FIX: this used to allow 4 digits — now capped at 3. */
    var cvv = $('#cardCvv');
    if (cvv) { cvv.addEventListener('input', function () { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 3); }); }
  }

  /* ------------------------------------------------------------------
     EXTRA CHECKS the browser cannot do on its own
     (card number length, expiry format & month, CVV length)
     Returns true if everything is fine, false if something is wrong.
     ------------------------------------------------------------------ */
  function extraCardValid() {
    if (selectedPayment() !== 'card') { return true; }   // no card = nothing to check
    var ok = true;

    /* Card number must be exactly 16 digits. */
    var num = $('#cardNumber');
    var digits = num.value.replace(/\D/g, '');
    if (digits.length !== 16) { num.setCustomValidity('bad'); ok = false; } else { num.setCustomValidity(''); }

    /* Expiry must look like MM/YY, AND the month must be 01–12.
       BUG FIX: we now also reject an impossible month like "19". */
    var exp = $('#cardExpiry');
    var expText = exp.value;
    var expOk = /^\d{2}\/\d{2}$/.test(expText);        // right shape "MM/YY"?
    if (expOk) {
      var month = parseInt(expText.slice(0, 2), 10);   // take the "MM" part as a number
      if (month < 1 || month > 12) { expOk = false; }  // months only go 1..12
    }
    if (!expOk) { exp.setCustomValidity('bad'); ok = false; } else { exp.setCustomValidity(''); }

    /* CVV must be exactly 3 digits.
       BUG FIX: it used to accept 3 OR 4. Now it must be exactly 3. */
    var cvv = $('#cardCvv');
    if (cvv.value.length !== 3) { cvv.setCustomValidity('bad'); ok = false; } else { cvv.setCustomValidity(''); }

    return ok;
  }

  /* ------------------------------------------------------------------
     MAKE AND SAVE THE ORDER
     ------------------------------------------------------------------ */

  /* Build a random-looking order number like "TZ-2026-4821". */
  function makeOrderNumber() {
    var d = new Date();
    var y = d.getFullYear();                          // this year, e.g. 2026
    var rand = Math.floor(1000 + Math.random() * 9000); // a random 4-digit number
    return 'TZ-' + y + '-' + rand;
  }

  /* Collect everything about this order into one object and remember it,
     so the Thank-You page and the Account page can show it later. */
  function saveOrder() {
    var cart = TZ.getCart();
    var subtotal = TZ.cartTotal();
    var delivery = deliveryFee(subtotal);
    var total = subtotal + delivery;

    /* Turn the short codes into friendly words. */
    var deliveryLabels = { standard: 'Standard Delivery', express: 'Express Delivery', pickup: 'Store Pickup' };
    var paymentLabels = { card: 'Credit / Debit Card', cod: 'Cash on Delivery' };

    /* One object holding the whole order. */
    var order = {
      orderNo: makeOrderNumber(),
      date: new Date().toISOString(),   // today's date/time as text
      items: cart,
      subtotal: subtotal,
      delivery: delivery,
      deliveryMethod: deliveryLabels[selectedDelivery()],
      paymentMethod: paymentLabels[selectedPayment()],
      total: total,
      customer: {                        // the details the shopper typed
        name: $('#fullName').value.trim(),
        email: $('#email').value.trim(),
        phone: '+94 ' + $('#phone').value.trim(),
        address: $('#address').value.trim(),
        city: $('#city').value.trim(),
        postal: $('#postal').value.trim(),
        district: $('#district').value
      }
    };

    /* localStorage = a tiny notebook inside the browser that remembers
       things even after you close the page. We must turn our object into
       text with JSON.stringify() before saving it. */
    try {
      localStorage.setItem('tz_last_order', JSON.stringify(order));   // the newest order

      /* Also add a short summary to the order history list. */
      var history = [];
      try { history = JSON.parse(localStorage.getItem('tz_orders')) || []; } catch (e) { history = []; }
      history.unshift({                                   // unshift = add to the FRONT
        orderNo: order.orderNo, date: order.date, total: order.total,
        itemCount: cart.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0),
        status: 'Processing'
      });
      localStorage.setItem('tz_orders', JSON.stringify(history.slice(0, 20)));  // keep last 20
    } catch (e) { /* if the browser blocks storage, just carry on */ }

    return order;
  }

  /* ------------------------------------------------------------------
     WHEN THE FORM IS SUBMITTED (the "Place Order" button)
     ------------------------------------------------------------------ */
  form.addEventListener('submit', function (e) {
    e.preventDefault();    // stop the page from reloading (the normal form behaviour)
    e.stopPropagation();

    /* Can't order with an empty cart. */
    if (!TZ.getCart().length) {
      TZ.toast('Your cart is empty', 'error');   // show a small pop-up message
      return;
    }

    var cardOk = extraCardValid();   // run our extra card checks

    /* checkValidity() is the browser's own check of "required" boxes etc.
       If either that OR our card check fails, stop and show what's wrong. */
    if (!form.checkValidity() || !cardOk) {
      form.classList.add('was-validated');            // turns on Bootstrap's red highlights
      var firstBad = form.querySelector(':invalid');  // find the first wrong box
      if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      TZ.toast('Please fix the highlighted fields', 'error');
      return;
    }

    /* Everything is good: save the order, empty the cart, go to Thank-You page. */
    saveOrder();
    TZ.clearCart();
    window.location.href = 'order-confirmation.html';
  });

  /* ------------------------------------------------------------------
     START EVERYTHING (this part runs as soon as the page opens)
     ------------------------------------------------------------------ */

  /* When the shopper changes the delivery option, re-do the money totals. */
  $$('input[name="delivery"]').forEach(function (el) {
    el.addEventListener('change', renderTotals);
  });
  /* When the shopper changes the payment option, show/hide the card boxes. */
  $$('input[name="payment"]').forEach(function (el) {
    el.addEventListener('change', toggleCardFields);
  });

  initFormatting();     // set up the "type nicely" helpers
  toggleCardFields();   // show/hide card boxes based on the default choice
  render();             // draw the summary and totals for the first time

  /* If the cart changes in another browser tab, refresh this page's numbers. */
  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart') { render(); }
  });
})();
