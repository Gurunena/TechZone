(function () {
  'use strict';

  var root = document.querySelector('[data-product-detail]');
  if (!root) { return; }

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var STOCK = Number(root.getAttribute('data-stock')) || 0;

  /* ------------------------------------------------------------------
     GALLERY — thumbnails swap the main image
     ------------------------------------------------------------------ */
  function initGallery() {
    var main = $('[data-gallery-main]');
    var thumbs = $$('[data-gallery-thumb]');
    if (!main || !thumbs.length) { return; }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.getAttribute('data-full');
        if (!full || main.getAttribute('src') === full) { return; }

        // Brief fade so the swap doesn't snap.
        main.classList.add('is-swapping');

        var loader = new Image();
        loader.onload = loader.onerror = function () {
          main.src = full;
          var img = thumb.querySelector('img');
          main.alt = img ? img.alt : main.alt;
          main.classList.remove('is-swapping');
        };
        loader.src = full;

        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  }

  /* ------------------------------------------------------------------
     STOCK STATUS
     ------------------------------------------------------------------ */
  function initStock() {
    var el = $('[data-stock-status]');
    if (!el) { return; }

    if (STOCK <= 0) {
      el.className = 'stock-status out-stock';
      el.innerHTML = '<i class="bi bi-x-circle"></i> Out of Stock';
    } else if (STOCK <= 5) {
      el.className = 'stock-status low-stock';
      el.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Only ' + STOCK + ' left!';
    } else {
      el.className = 'stock-status in-stock';
      el.innerHTML = '<i class="bi bi-check-circle"></i> In Stock';
    }
  }


  var qtyInput = $('[data-qty-input]');
  var addBtn = $('[data-tz-add-to-cart]', root);

  function currentQty() {
    return Math.min(Math.max(1, Number(qtyInput && qtyInput.value) || 1), Math.max(1, STOCK));
  }

  function syncQty() {
    if (!qtyInput) { return; }
    var qty = currentQty();
    qtyInput.value = qty;
    if (addBtn) { addBtn.setAttribute('data-qty', qty); }

    $$('[data-qty-step]').forEach(function (btn) {
      var step = Number(btn.getAttribute('data-qty-step'));
      btn.disabled = (step < 0 && qty <= 1) || (step > 0 && qty >= STOCK);
    });
  }

  function initQty() {
    if (!qtyInput) { return; }

    $$('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qtyInput.value = currentQty() + Number(btn.getAttribute('data-qty-step'));
        syncQty();
      });
    });

    qtyInput.addEventListener('input', syncQty);
    qtyInput.addEventListener('blur', syncQty);
    syncQty();
  }

  
  function initAddFeedback() {
    if (!addBtn) { return; }

    var label = $('[data-add-label]', addBtn);
    if (!label) { return; }

    var original = label.textContent;
    var timer = null;

    addBtn.addEventListener('click', function () {
      if (STOCK <= 0) { return; }

      label.textContent = 'Added ✓';
      addBtn.classList.add('is-added');

      clearTimeout(timer);
      timer = setTimeout(function () {
        label.textContent = original;
        addBtn.classList.remove('is-added');
      }, 1500);
    });
  }

  /* ------------------------------------------------------------------
     BUY NOW — add, then straight to checkout
     ------------------------------------------------------------------ */
  function initBuyNow() {
    var btn = $('[data-buy-now]');
    if (!btn) { return; }

    btn.addEventListener('click', function () {
      if (STOCK <= 0) { return; }

      if (window.TZ) {
        window.TZ.addToCart({
          id: root.getAttribute('data-id'),
          name: root.getAttribute('data-name'),
          price: root.getAttribute('data-price'),
          image: root.getAttribute('data-image')
        }, currentQty());
      }

      window.location.href = '../cart/checkout.html';
    });
  }

  /* ------------------------------------------------------------------
     "(24 reviews)" — open the Reviews tab, then scroll to it
     ------------------------------------------------------------------ */
  function initReviewsLink() {
    var link = $('[data-scroll-reviews]');
    var tab = $('#tab-reviews');
    var section = $('#reviews');
    if (!link || !tab || !section) { return; }

    link.addEventListener('click', function (e) {
      e.preventDefault();

      if (typeof bootstrap !== 'undefined') {
        bootstrap.Tab.getOrCreateInstance(tab).show();
      }
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ------------------------------------------------------------------
     WRITE A REVIEW — prepends to the list. Nothing is sent anywhere;
     the review is gone on reload.
     ------------------------------------------------------------------ */
  function initReviewForm() {
    var form = $('[data-review-form]');
    var list = $('[data-review-list]');
    if (!form || !list) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#reviewName').value.trim();
      // ASSIGNMENT REQUIREMENT: rating comes from the radio group
      var checked = $('input[name="rating"]:checked');
      var rating = checked ? Number(checked.value) : 5;
      var body = $('#reviewBody').value.trim();
      if (!name || !body) { return; }

      var starsHtml = '';
      for (var i = 1; i <= 5; i++) {
        starsHtml += '<i class="bi bi-star' + (i <= rating ? '-fill' : '') + '"></i>';
      }

      var article = document.createElement('article');
      article.className = 'review';
      article.innerHTML =
        '<div class="review-head">' +
          '<div class="review-avatar rounded-circle"></div>' +
          '<div><h4></h4>' +
            '<div class="review-meta">' +
              '<span class="review-stars">' + starsHtml + '</span>' +
              '<span class="review-date">' +
                new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div><p></p>';

      // Set user text via textContent so it can never inject markup.
      article.querySelector('.review-avatar').textContent = name.charAt(0).toUpperCase();
      article.querySelector('h4').textContent = name;
      article.querySelector('p').textContent = body;

      list.insertBefore(article, list.firstChild);
      form.reset();

      if (window.TZ) { window.TZ.toast('Review submitted successfully!', 'success'); }

      if (typeof bootstrap !== 'undefined') {
        var box = document.getElementById('reviewFormPanel');
        if (box) { bootstrap.Collapse.getOrCreateInstance(box).hide(); }
      }
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function init() {
    initGallery();
    initStock();
    initQty();
    initAddFeedback();
    initBuyNow();
    initReviewsLink();
    initReviewForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
