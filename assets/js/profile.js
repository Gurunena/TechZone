/* ==========================================================================
   TechZone — profile.js   (Account Dashboard brain)

   WHAT THIS FILE DOES, in simple words:
   This is the JavaScript for the "My Account" dashboard page. It:
     1. Fills the 3 stat cards (total orders, wishlist items, items in cart).
     2. Fills the "Recent Orders" table (from saved order history, or a demo).
     3. Loads any saved profile details into the form, and saves changes.
     4. Keeps the date-of-birth field sensible (no future birthdays!).

   It uses helpers from global.js, stored in a box called "window.TZ".
   Loaded AFTER global.js so TZ already exists.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = window.TZ;
  if (!TZ) { return; }
  var $ = TZ.$, $$ = TZ.$$;   // $ = find one thing, $$ = find many things

  /* A few pretend past orders, shown when there is no real history yet,
     so the table is never empty during a demo. */
  var DEMO_ORDERS = [
    { orderNo: 'TZ-2026-4821', date: '2026-09-02', itemCount: 2, total: 314980, status: 'Delivered' },
    { orderNo: 'TZ-2026-4390', date: '2026-08-19', itemCount: 1, total: 74990, status: 'Shipped' },
    { orderNo: 'TZ-2026-3915', date: '2026-08-04', itemCount: 3, total: 132970, status: 'Processing' }
  ];

  /* Which colour each order status should be (Bootstrap badge colours). */
  var STATUS_CLASS = {
    Delivered: 'bg-success',          // green
    Shipped: 'bg-primary',            // blue
    Processing: 'bg-warning text-dark', // yellow
    Cancelled: 'bg-danger'            // red
  };

  /* Make text safe to put on the page. */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Turn a saved date into a short readable form like "2 Sep 2026". */
  function formatDate(val) {
    var d = new Date(val);
    if (isNaN(d)) { return String(val); }   // if it's not a real date, show it as-is
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* Get the order history from localStorage.
     If there is none, use the demo list so the table has something to show. */
  function readOrders() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('tz_orders')) || []; } catch (e) { list = []; }
    return (list && list.length) ? list : DEMO_ORDERS;
  }

  /* ------------------------------------------------------------------
     THE 3 STAT CARDS at the top
     ------------------------------------------------------------------ */
  function renderStats() {
    var orders = readOrders();
    $('#statOrders').textContent = orders.length;           // how many orders
    $('#statWishlist').textContent = TZ.getWishlist().length;// how many saved items
    $('#statCart').textContent = TZ.cartCount();            // how many items in cart
  }

  /* ------------------------------------------------------------------
     THE RECENT ORDERS TABLE
     ------------------------------------------------------------------ */
  function renderOrders() {
    var orders = readOrders().slice(0, 5);   // show at most the newest 5
    var body = $('#ordersBody');             // the <tbody> we fill with rows

    body.innerHTML = orders.map(function (o) {
      var cls = STATUS_CLASS[o.status] || 'bg-secondary';   // pick the badge colour
      /* Build one table row. Each <td> is one cell. */
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
     THE SIDEBAR NAME/AVATAR AND THE PROFILE FORM
     ------------------------------------------------------------------ */

  /* Make the round avatar text, e.g. "Jane Perera" -> "JP". */
  function initials(first, last) {
    return ((first || '').charAt(0) + (last || '').charAt(0)).toUpperCase() || 'U';
  }

  /* Update the sidebar (name, email, avatar) and the "Welcome, X" heading. */
  function applyIdentity(first, last, email) {
    var full = (first + ' ' + last).trim();
    $('#sideName').textContent = full;
    $('#sideEmail').textContent = email;
    $('#sideAvatar').textContent = initials(first, last);
    $('#welcomeName').textContent = first;
  }

  /* Keep the date-of-birth box sensible.
     BUG FIX: before, you could pick a birthday in the FUTURE. Now we set the
     latest allowed date to TODAY, and the earliest to 1900, so only real
     birthdays are accepted. */
  function initDobLimits() {
    var dob = $('#pDob');
    if (!dob) { return; }
    var today = new Date().toISOString().slice(0, 10);   // e.g. "2026-09-13"
    dob.setAttribute('max', today);          // cannot be later than today
    dob.setAttribute('min', '1900-01-01');   // and not before 1900
  }

  /* If the user saved their profile before, put those values back in the form. */
  function loadProfile() {
    var p = null;
    try { p = JSON.parse(localStorage.getItem('tz_profile')); } catch (e) { p = null; }
    if (!p) { return; }   // nothing saved yet — keep the default values
    if (p.first) { $('#pFirst').value = p.first; }
    if (p.last) { $('#pLast').value = p.last; }
    if (p.email) { $('#pEmail').value = p.email; }
    if (p.phone) { $('#pPhone').value = p.phone; }
    if (p.dob) { $('#pDob').value = p.dob; }
    if (p.gender) { $('#pGender').value = p.gender; }
    if (typeof p.news === 'boolean') { $('#pNews').checked = p.news; }
    applyIdentity(p.first || 'Jane', p.last || 'Perera', p.email || 'jane.perera@example.com');
  }

  /* Set up what happens when the profile form is saved or reset. */
  function initProfileForm() {
    var form = $('#profileForm');
    if (!form) { return; }

    /* When "Save Changes" is clicked (the form is submitted): */
    form.addEventListener('submit', function (e) {
      e.preventDefault();     // stop the page from reloading
      e.stopPropagation();

      /* checkValidity() = the browser checks required boxes, a real email,
         and (thanks to our max date) a birthday that is not in the future. */
      if (!form.checkValidity()) {
        form.classList.add('was-validated');   // show Bootstrap's red highlights
        TZ.toast('Please fix the highlighted fields', 'error');
        return;
      }

      /* Collect the typed values into one object. */
      var profile = {
        first: $('#pFirst').value.trim(),
        last: $('#pLast').value.trim(),
        email: $('#pEmail').value.trim(),
        phone: $('#pPhone').value.trim(),
        dob: $('#pDob').value,
        gender: $('#pGender').value,
        news: $('#pNews').checked
      };

      /* Save it to localStorage (as text) so it is remembered next time. */
      try { localStorage.setItem('tz_profile', JSON.stringify(profile)); } catch (err) { /* ignore */ }
      applyIdentity(profile.first, profile.last, profile.email);   // update the sidebar
      form.classList.remove('was-validated');
      TZ.toast('Profile updated successfully', 'success');
    });

    /* When "Cancel" (reset) is clicked, put the saved values back.
       We wait a tick (setTimeout 0) so the browser finishes clearing the
       boxes first, then we refill them. */
    form.addEventListener('reset', function () {
      setTimeout(loadProfile, 0);
    });
  }

  /* ------------------------------------------------------------------
     START EVERYTHING when the page opens
     ------------------------------------------------------------------ */
  renderStats();        // fill the stat cards
  renderOrders();       // fill the orders table
  initDobLimits();      // lock the date-of-birth range (fix)
  loadProfile();        // load any saved profile details
  initProfileForm();    // listen for Save / Cancel

  /* If the cart, wishlist or orders change in another tab, refresh the numbers. */
  window.addEventListener('storage', function (e) {
    if (e.key === 'tz_cart' || e.key === 'tz_wishlist' || e.key === 'tz_orders') { renderStats(); renderOrders(); }
  });
})();
