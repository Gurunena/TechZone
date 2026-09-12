/* ==========================================================================
   TechZone — profile.js
   User Account Dashboard. Builds on window.TZ (from global.js):
     • stat cards (orders / wishlist / cart)
     • recent orders table from 'tz_orders' (with demo fallback)
     • editable profile form persisted to 'tz_profile'

   Loaded AFTER global.js.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }
  var $ = TZ.$, $$ = TZ.$$;

  /* Demo orders shown when the shopper has no saved order history yet. */
  var DEMO_ORDERS = [
    { orderNo: 'TZ-2026-4821', date: '2026-09-02', itemCount: 2, total: 314980, status: 'Delivered' },
    { orderNo: 'TZ-2026-4390', date: '2026-08-19', itemCount: 1, total: 74990, status: 'Shipped' },
    { orderNo: 'TZ-2026-3915', date: '2026-08-04', itemCount: 3, total: 132970, status: 'Processing' }
  ];

  var STATUS_CLASS = {
    Delivered: 'bg-success',
    Shipped: 'bg-primary',
    Processing: 'bg-warning text-dark',
    Cancelled: 'bg-danger'
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(val) {
    var d = new Date(val);
    if (isNaN(d)) { return String(val); }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function readOrders() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('tz_orders')) || []; } catch (e) { list = []; }
    return (list && list.length) ? list : DEMO_ORDERS;
  }

  /* ------------------------------------------------------------------
     Stat cards
     ------------------------------------------------------------------ */
  function renderStats() {
    var orders = readOrders();
    $('#statOrders').textContent = orders.length;
    $('#statWishlist').textContent = TZ.getWishlist().length;
    $('#statCart').textContent = TZ.cartCount();
  }

  /* ------------------------------------------------------------------
     Recent orders table
     ------------------------------------------------------------------ */
  function renderOrders() {
    var orders = readOrders().slice(0, 5);
    var body = $('#ordersBody');

    body.innerHTML = orders.map(function (o) {
      var cls = STATUS_CLASS[o.status] || 'bg-secondary';
      return '' +
        '<tr>' +
          '<td class="ord-no">' + escapeHtml(o.orderNo) + '</td>' +
          '<td>' + escapeHtml(formatDate(o.date)) + '</td>' +
          '<td class="text-center">' + (o.itemCount || 0) + '</td>' +
          '<td class="text-end">' + TZ.formatPrice(o.total) + '</td>' +
          '<td class="text-center"><span class="badge status-badge ' + cls + '">' + escapeHtml(o.status) + '</span></td>' +
          '<td class="text-end"><a href="orders.html" class="btn btn-sm btn-tz-light">View</a></td>' +
        '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     Sidebar identity + profile form
     ------------------------------------------------------------------ */
  function initials(first, last) {
    return ((first || '').charAt(0) + (last || '').charAt(0)).toUpperCase() || 'U';
  }

  function applyIdentity(first, last, email) {
    var full = (first + ' ' + last).trim();
    $('#sideName').textContent = full;
    $('#sideEmail').textContent = email;
    $('#sideAvatar').textContent = initials(first, last);
    $('#welcomeName').textContent = first;
  }

  function loadProfile() {
    var p = null;
    try { p = JSON.parse(localStorage.getItem('tz_profile')); } catch (e) { p = null; }
    if (!p) { return; }
    if (p.first) { $('#pFirst').value = p.first; }
    if (p.last) { $('#pLast').value = p.last; }
    if (p.email) { $('#pEmail').value = p.email; }
    if (p.phone) { $('#pPhone').value = p.phone; }
    if (p.dob) { $('#pDob').value = p.dob; }
    if (p.gender) { $('#pGender').value = p.gender; }
    if (typeof p.news === 'boolean') { $('#pNews').checked = p.news; }
    applyIdentity(p.first || 'Jane', p.last || 'Perera', p.email || 'jane.perera@example.com');
  }

  function initProfileForm() {
    var form = $('#profileForm');
    if (!form) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        TZ.toast('Please fix the highlighted fields', 'error');
        return;
      }

      var profile = {
        first: $('#pFirst').value.trim(),
        last: $('#pLast').value.trim(),
        email: $('#pEmail').value.trim(),
        phone: $('#pPhone').value.trim(),
        dob: $('#pDob').value,
        gender: $('#pGender').value,
        news: $('#pNews').checked
      };

      try { localStorage.setItem('tz_profile', JSON.stringify(profile)); } catch (err) { /* ignore */ }
      applyIdentity(profile.first, profile.last, profile.email);
      form.classList.remove('was-validated');
      TZ.toast('Profile updated successfully', 'success');
    });

    // On reset, restore saved values after the native reset completes.
    form.addEventListener('reset', function () {
      setTimeout(loadProfile, 0);
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  renderStats();
  renderOrders();
  loadProfile();
  initProfileForm();

  // Keep stats fresh if cart/wishlist change in another tab.
  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart' || e.key === 'tz_wishlist' || e.key === 'tz_orders') { renderStats(); renderOrders(); }
  });
})();
