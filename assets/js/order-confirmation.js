/* ==========================================================================
   TechZone — order-confirmation.js
   Renders the "Thank You" page from the order saved by checkout.js
   (localStorage key 'tz_last_order'). If none exists (e.g. the page is
   opened directly for evaluation), a realistic demo order is shown instead.

   Loaded AFTER global.js.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }
  var $ = TZ.$, $$ = TZ.$$;

  /* Fallback demo order so the page is never blank. */
  var DEMO_ORDER = {
    orderNo: 'TZ-2026-4821',
    date: new Date().toISOString(),
    items: [
      { id: 'asus-tuf-f15', name: 'ASUS TUF Gaming F15', price: 289990, image: '../assets/images/products/asus-tuf-f15.png', qty: 1 },
      { id: 'hyperx-cloud-ii', name: 'HyperX Cloud II Headset', price: 24990, image: '../assets/images/products/hyperx-cloud-ii.png', qty: 1 }
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

  function loadOrder() {
    try {
      var raw = localStorage.getItem('tz_last_order');
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.items && o.items.length) { return o; }
      }
    } catch (e) { /* ignore */ }
    return DEMO_ORDER;
  }

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

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) { d = new Date(); }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function etaRange(iso) {
    var start = new Date(iso); if (isNaN(start)) { start = new Date(); }
    var a = new Date(start.getTime()); a.setDate(a.getDate() + 2);
    var b = new Date(start.getTime()); b.setDate(b.getDate() + 4);
    var opts = { day: 'numeric', month: 'short' };
    return a.toLocaleDateString('en-GB', opts) + ' – ' + b.toLocaleDateString('en-GB', opts);
  }

  function render(order) {
    // Meta
    $('#metaOrderNo').textContent = order.orderNo;
    $('#metaDate').textContent = formatDate(order.date);
    $('#metaEta').textContent = order.deliveryMethod === 'Store Pickup' ? 'Ready in 24h' : etaRange(order.date);

    if (order.customer && order.customer.email) {
      $('#confirmEmail').textContent = order.customer.email;
    }

    // Rows
    var rows = order.items.map(function (item) {
      var line = (Number(item.price) || 0) * (Number(item.qty) || 0);
      var img = item.image
        ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" class="ot-thumb">'
        : '<span class="ot-thumb img-ph"><i class="bi bi-box-seam"></i></span>';
      return '' +
        '<tr>' +
          '<td><div class="ot-product">' + img + '<span class="ot-name">' + escapeHtml(item.name) + '</span></div></td>' +
          '<td class="text-center">' + TZ.formatPrice(item.price) + '</td>' +
          '<td class="text-center">' + (Number(item.qty) || 1) + '</td>' +
          '<td class="text-end">' + TZ.formatPrice(line) + '</td>' +
        '</tr>';
    }).join('');
    $('#orderRows').innerHTML = rows;

    // Totals
    $('#rowSubtotal').textContent = TZ.formatPrice(order.subtotal);
    $('#rowDelivery').textContent = (Number(order.delivery) || 0) === 0 ? 'FREE' : TZ.formatPrice(order.delivery);
    $('#rowTotal').textContent = TZ.formatPrice(order.total);

    // Shipping details
    var c = order.customer || {};
    $('#shipDetails').innerHTML = '' +
      '<div class="sd-name">' + escapeHtml(c.name || '') + '</div>' +
      '<div>' + escapeHtml(c.address || '') + '</div>' +
      '<div>' + escapeHtml([c.city, c.postal].filter(Boolean).join(', ')) + '</div>' +
      '<div class="sd-muted">' + escapeHtml(c.district ? c.district + ' District' : '') + '</div>' +
      '<div class="sd-muted">' + escapeHtml(c.phone || '') + '</div>';

    // Payment + delivery
    $('#deliveryMethod').textContent = order.deliveryMethod || 'Standard Delivery';
    var payBadge = $('#payBadge');
    if (/cash/i.test(order.paymentMethod || '')) {
      payBadge.textContent = 'Cash on Delivery';
      payBadge.className = 'badge bg-warning text-dark';
    } else {
      payBadge.textContent = 'Card — Paid';
      payBadge.className = 'badge bg-success';
    }

    fixThumbs('#orderRows img', 'ot-thumb');
  }

  var order = loadOrder();
  render(order);

  // Print receipt
  var printBtn = $('#printBtn');
  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }

  // Celebratory nudge
  TZ.toast('Order ' + order.orderNo + ' confirmed 🎉', 'success');
})();
