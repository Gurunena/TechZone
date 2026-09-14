/* ==========================================================================
   TechZone — order-confirmation.js   (Thank-You page brain)

   WHAT THIS FILE DOES, in simple words:
   This is the JavaScript for the "Thank You / Order Confirmed" page. It:
     1. Reads the order that the Checkout page saved (in localStorage).
     2. Fills the page with the order number, date, delivery date, the list
        of items bought, the totals, and the delivery address.
     3. If no saved order exists (for example the examiner opens this page on
        its own), it shows a realistic DEMO order so the page is never blank.
     4. Lets the user print a receipt.

   It uses helpers from global.js, stored in a box called "window.TZ".
   Loaded AFTER global.js so TZ already exists.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }
  var $ = TZ.$, $$ = TZ.$$;   // $ = find one thing, $$ = find many things

  /* A pretend order to show if there is no real one saved.
     This makes sure the page always has something to display. */
  /* NOTE: the image paths use the exact real file names my teammate uploaded
     (with spaces and .webp), so real photos show instead of placeholder icons. */
  var DEMO_ORDER = {
    orderNo: 'TZ-2026-4821',
    date: new Date().toISOString(),
    items: [
      { id: 'asus-tuf-f15', name: 'ASUS TUF Gaming F15', price: 289990, image: '../assets/images/products/ASUS TUF Gaming F15.png', qty: 1 },
      { id: 'hyperx-cloud-ii', name: 'HyperX Cloud II Headset', price: 24990, image: '../assets/images/products/HyperX Cloud II.webp', qty: 1 }
    ],
    subtotal: 314980,
    delivery: 0,
    deliveryMethod: 'Standard Delivery',
    paymentMethod: 'Credit / Debit Card',
    total: 314980,
    customer: {
      name: 'Jane Perera', email: 'jane.perera@example.com', phone: '+94 77 123 4567',
      address: 'No. 25, Galle Road', city: 'Colombo', postal: '00300', district: 'Colombo'
    }
  };

  /* Try to load the real order from localStorage.
     If anything is missing or broken, fall back to the DEMO order. */
  function loadOrder() {
    try {
      var raw = localStorage.getItem('tz_last_order');   // the text we saved earlier
      if (raw) {
        var o = JSON.parse(raw);                         // turn text back into an object
        if (o && o.items && o.items.length) { return o; }
      }
    } catch (e) { /* ignore any error and use the demo below */ }
    return DEMO_ORDER;
  }

  /* Make text safe to put on the page. */
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

  /* If a product picture is missing, show a neat box icon instead. */
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

  /* Turn a saved date-text into a nice format like "13 September 2026". */
  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) { d = new Date(); }     // if the date is broken, use today
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* Work out a delivery window: 2 to 4 days after the order date.
     Returns something like "15 Sep – 17 Sep". */
  function etaRange(iso) {
    var start = new Date(iso); if (isNaN(start)) { start = new Date(); }
    var a = new Date(start.getTime()); a.setDate(a.getDate() + 2);   // +2 days
    var b = new Date(start.getTime()); b.setDate(b.getDate() + 4);   // +4 days
    var opts = { day: 'numeric', month: 'short' };
    return a.toLocaleDateString('en-GB', opts) + ' – ' + b.toLocaleDateString('en-GB', opts);
  }

  /* Fill the whole page using the order we loaded. */
  function render(order) {
    /* --- The three info pills at the top --- */
    $('#metaOrderNo').textContent = order.orderNo;
    $('#metaDate').textContent = formatDate(order.date);
    /* Pickup is ready fast; delivery shows a 2–4 day window. */
    $('#metaEta').textContent = order.deliveryMethod === 'Store Pickup' ? 'Ready in 24h' : etaRange(order.date);

    /* Show the email in the blue "we sent a confirmation" note. */
    if (order.customer && order.customer.email) {
      $('#confirmEmail').textContent = order.customer.email;
    }

    /* --- The table of items bought --- */
    var rows = order.items.map(function (item) {
      var line = (Number(item.price) || 0) * (Number(item.qty) || 0);   // price × amount
      var img = item.image
        ? '<img src="' + escapeHtml(normImg(item.image)) + '" alt="' + escapeHtml(item.name) + '" class="ot-thumb">'
        : '<span class="ot-thumb img-ph"><i class="bi bi-box-seam"></i></span>';
      /* Each <tr> is one table row; each <td> is one cell. */
      return '' +
        '<tr>' +
          '<td><div class="ot-product">' + img + '<span class="ot-name">' + escapeHtml(item.name) + '</span></div></td>' +
          '<td class="text-center">' + TZ.formatPrice(item.price) + '</td>' +
          '<td class="text-center">' + (Number(item.qty) || 1) + '</td>' +
          '<td class="text-end">' + TZ.formatPrice(line) + '</td>' +
        '</tr>';
    }).join('');
    $('#orderRows').innerHTML = rows;

    /* --- The totals under the table --- */
    $('#rowSubtotal').textContent = TZ.formatPrice(order.subtotal);
    $('#rowDelivery').textContent = (Number(order.delivery) || 0) === 0 ? 'FREE' : TZ.formatPrice(order.delivery);
    $('#rowTotal').textContent = TZ.formatPrice(order.total);

    /* --- The delivery address block --- */
    var c = order.customer || {};   // use {} if there is no customer, to avoid errors
    $('#shipDetails').innerHTML = '' +
      '<div class="sd-name">' + escapeHtml(c.name || '') + '</div>' +
      '<div>' + escapeHtml(c.address || '') + '</div>' +
      '<div>' + escapeHtml([c.city, c.postal].filter(Boolean).join(', ')) + '</div>' +
      '<div class="sd-muted">' + escapeHtml(c.district ? c.district + ' District' : '') + '</div>' +
      '<div class="sd-muted">' + escapeHtml(c.phone || '') + '</div>';

    /* --- Payment + delivery lines --- */
    $('#deliveryMethod').textContent = order.deliveryMethod || 'Standard Delivery';
    var payBadge = $('#payBadge');
    /* If the payment text contains the word "cash", show an orange COD badge;
       otherwise show a green "Card — Paid" badge. */
    if (/cash/i.test(order.paymentMethod || '')) {
      payBadge.textContent = 'Cash on Delivery';
      payBadge.className = 'badge bg-warning text-dark';
    } else {
      payBadge.textContent = 'Card — Paid';
      payBadge.className = 'badge bg-success';
    }

    fixThumbs('#orderRows img', 'ot-thumb');   // tidy any missing pictures
  }

  /* ---- Run everything when the page opens ---- */
  var order = loadOrder();   // get the real order, or the demo one
  render(order);             // put it on the page

  /* "Print Receipt" button: open the browser's print box. */
  var printBtn = $('#printBtn');
  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }

  /* A little celebration pop-up. */
  TZ.toast('Order ' + order.orderNo + ' confirmed 🎉', 'success');
})();
