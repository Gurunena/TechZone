/* ==========================================================================
   TechZone — checkout.js
   Checkout page behaviour. Builds on window.TZ (from global.js):
     • render order summary from the cart
     • live delivery fee + totals (subtotal, delivery, VAT, total)
     • show card fields only for card payment; toggle their validation
     • Bootstrap-style form validation
     • on submit: save the order, clear the cart, go to confirmation

   Loaded AFTER global.js.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }
  var $ = TZ.$, $$ = TZ.$$;

  var FREE_DELIVERY_THRESHOLD = 25000;
  var VAT_RATE = 0.18; // prices are VAT-inclusive; this is the embedded portion

  var DELIVERY_FEES = { standard: 500, express: 1200, pickup: 0 };

  var form = $('#checkoutForm');
  var emptyAlert = $('#emptyAlert');
  var placeBtn = $('#placeOrderBtn');

  /* ------------------------------------------------------------------
     Helpers
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

  function selectedDelivery() {
    var el = $('input[name="delivery"]:checked');
    return el ? el.value : 'standard';
  }
  function selectedPayment() {
    var el = $('input[name="payment"]:checked');
    return el ? el.value : 'card';
  }

  function deliveryFee(subtotal) {
    var method = selectedDelivery();
    if (method === 'standard' && subtotal >= FREE_DELIVERY_THRESHOLD) { return 0; }
    return DELIVERY_FEES[method] || 0;
  }

  /* ------------------------------------------------------------------
     Render summary
     ------------------------------------------------------------------ */
  function renderItems() {
    var cart = TZ.getCart();
    var wrap = $('#summaryItems');

    wrap.innerHTML = cart.map(function (item) {
      var line = (Number(item.price) || 0) * (Number(item.qty) || 0);
      var img = item.image
        ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" class="si-thumb">'
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

    fixThumbs('#summaryItems img', 'si-thumb');
  }

  function renderTotals() {
    var subtotal = TZ.cartTotal();
    var delivery = deliveryFee(subtotal);
    var total = subtotal + delivery;
    var vat = Math.round(total * (VAT_RATE / (1 + VAT_RATE)));

    $('#sumSubtotal').textContent = TZ.formatPrice(subtotal);
    $('#sumDelivery').textContent = delivery === 0 ? 'FREE' : TZ.formatPrice(delivery);
    $('#sumVat').textContent = TZ.formatPrice(vat);
    $('#sumTotal').textContent = TZ.formatPrice(total);
  }

  function render() {
    var cart = TZ.getCart();
    if (!cart.length) {
      emptyAlert.classList.remove('d-none');
      placeBtn.setAttribute('disabled', 'disabled');
    } else {
      emptyAlert.classList.add('d-none');
      placeBtn.removeAttribute('disabled');
    }
    renderItems();
    renderTotals();
  }

  /* ------------------------------------------------------------------
     Payment method → card fields
     ------------------------------------------------------------------ */
  var cardFields = $('#cardFields');
  var cardInputs = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];

  function toggleCardFields() {
    var isCard = selectedPayment() === 'card';
    cardFields.classList.toggle('show', isCard);
    cardInputs.forEach(function (id) {
      var el = $('#' + id);
      if (!el) { return; }
      if (isCard) { el.setAttribute('required', 'required'); }
      else { el.removeAttribute('required'); el.classList.remove('is-invalid'); }
    });
  }

  /* ------------------------------------------------------------------
     Input formatting
     ------------------------------------------------------------------ */
  function initFormatting() {
    var num = $('#cardNumber');
    if (num) {
      num.addEventListener('input', function () {
        var digits = num.value.replace(/\D/g, '').slice(0, 16);
        num.value = digits.replace(/(.{4})/g, '$1 ').trim();
      });
    }
    var exp = $('#cardExpiry');
    if (exp) {
      exp.addEventListener('input', function () {
        var d = exp.value.replace(/\D/g, '').slice(0, 4);
        exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      });
    }
    var cvv = $('#cardCvv');
    if (cvv) { cvv.addEventListener('input', function () { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4); }); }
  }

  /* ------------------------------------------------------------------
     Extra validation beyond required (card number length, expiry)
     ------------------------------------------------------------------ */
  function extraCardValid() {
    if (selectedPayment() !== 'card') { return true; }
    var ok = true;

    var num = $('#cardNumber');
    var digits = num.value.replace(/\D/g, '');
    if (digits.length !== 16) { num.setCustomValidity('bad'); ok = false; } else { num.setCustomValidity(''); }

    var exp = $('#cardExpiry');
    if (!/^\d{2}\/\d{2}$/.test(exp.value)) { exp.setCustomValidity('bad'); ok = false; } else { exp.setCustomValidity(''); }

    var cvv = $('#cardCvv');
    if (cvv.value.length < 3) { cvv.setCustomValidity('bad'); ok = false; } else { cvv.setCustomValidity(''); }

    return ok;
  }

  /* ------------------------------------------------------------------
     Build + save order
     ------------------------------------------------------------------ */
  function makeOrderNumber() {
    var d = new Date();
    var y = d.getFullYear();
    var rand = Math.floor(1000 + Math.random() * 9000);
    return 'TZ-' + y + '-' + rand;
  }

  function saveOrder() {
    var cart = TZ.getCart();
    var subtotal = TZ.cartTotal();
    var delivery = deliveryFee(subtotal);
    var total = subtotal + delivery;

    var deliveryLabels = { standard: 'Standard Delivery', express: 'Express Delivery', pickup: 'Store Pickup' };
    var paymentLabels = { card: 'Credit / Debit Card', cod: 'Cash on Delivery' };

    var order = {
      orderNo: makeOrderNumber(),
      date: new Date().toISOString(),
      items: cart,
      subtotal: subtotal,
      delivery: delivery,
      deliveryMethod: deliveryLabels[selectedDelivery()],
      paymentMethod: paymentLabels[selectedPayment()],
      total: total,
      customer: {
        name: $('#fullName').value.trim(),
        email: $('#email').value.trim(),
        phone: '+94 ' + $('#phone').value.trim(),
        address: $('#address').value.trim(),
        city: $('#city').value.trim(),
        postal: $('#postal').value.trim(),
        district: $('#district').value
      }
    };

    try {
      localStorage.setItem('tz_last_order', JSON.stringify(order));
      var history = [];
      try { history = JSON.parse(localStorage.getItem('tz_orders')) || []; } catch (e) { history = []; }
      history.unshift({
        orderNo: order.orderNo, date: order.date, total: order.total,
        itemCount: cart.reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0),
        status: 'Processing'
      });
      localStorage.setItem('tz_orders', JSON.stringify(history.slice(0, 20)));
    } catch (e) { /* storage unavailable */ }

    return order;
  }

  /* ------------------------------------------------------------------
     Submit
     ------------------------------------------------------------------ */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!TZ.getCart().length) {
      TZ.toast('Your cart is empty', 'error');
      return;
    }

    var cardOk = extraCardValid();

    if (!form.checkValidity() || !cardOk) {
      form.classList.add('was-validated');
      var firstBad = form.querySelector(':invalid');
      if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      TZ.toast('Please fix the highlighted fields', 'error');
      return;
    }

    saveOrder();
    TZ.clearCart();
    window.location.href = 'order-confirmation.html';
  });

  /* ------------------------------------------------------------------
     Wire up
     ------------------------------------------------------------------ */
  $$('input[name="delivery"]').forEach(function (el) {
    el.addEventListener('change', renderTotals);
  });
  $$('input[name="payment"]').forEach(function (el) {
    el.addEventListener('change', toggleCardFields);
  });

  initFormatting();
  toggleCardFields();
  render();

  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart') { render(); }
  });
})();
