
(function ($) {
  'use strict';

  var $root = $('[data-product-detail]');
  if (!$root.length) { return; }

  var ROOT = window.TZ ? window.TZ.rootPath() : '../';
  var API = ROOT + 'api/';

  var $status = $('[data-detail-status]');
  var $content = $('[data-detail-content]');

  /*
     Helpers
     */
  function money(n) {
    return window.TZ ? window.TZ.formatPrice(n) : 'Rs. ' + n;
  }

  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (rating >= i) { html += '<i class="bi bi-star-fill"></i>'; }
      else if (rating >= i - 0.5) { html += '<i class="bi bi-star-half"></i>'; }
      else { html += '<i class="bi bi-star"></i>'; }
    }
    return html;
  }

  /** "2025-08-28" → "28 August 2025" (the format the page already used).
      The parts are passed to Date() separately so the date can't shift by
      a day depending on the visitor's time zone. */
  function formatDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) { return iso || ''; }

    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /**
   * Read ?id= from the address bar.
   * window.location.search is the "?id=3" part of the URL, and
   * URLSearchParams lets us ask for one parameter by name.
   */
  function getProductId() {
    var raw = new URLSearchParams(window.location.search).get('id');

    if (raw && /^\d+$/.test(raw)) { return raw; }

    // Missing (or an old text id like "asus-tuf-f15") → fall back to 1.
    console.warn('[AJAX] No numeric ?id= in the URL (got ' + JSON.stringify(raw) + '), defaulting to id=1');
    return '1';
  }

  /*
     Loading / error states
     */
  function showLoading() {
    $content.css('visibility', 'hidden');   // keep layout, hide the empty shell
    $status.html(
      '<div class="d-flex align-items-center justify-content-center gap-2 py-4 text-muted">' +
        '<div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>' +
        '<span>Loading product...</span>' +
      '</div>'
    );
  }

  function showError(message) {
    $content.hide();
    $('.product-tabs').hide();   // no point showing tabs for a product that didn't load
    $status.empty().append(
      $('<div class="alert alert-danger" role="alert"></div>')
        .append('<i class="bi bi-exclamation-triangle-fill"></i> <strong>Could not load this product.</strong> ')
        .append($('<span></span>').text(message))   // .text() = safe, no HTML injection
        .append(' <a class="alert-link" href="laptops.html">Browse all laptops</a>')
    );
    $('[data-field="name"]').text('Product unavailable');
    document.title = 'Product unavailable — TechZone';
  }

  /*
     Fill the page from one product object
     */
  function render(p) {
    var imgSrc = p.image ? ROOT + p.image : '';

    // Browser tab title.
    document.title = p.name + ' — TechZone';

    // Data attributes that product-detail.js (Buy Now) reads on click.
    $root.attr({
      'data-id': p.slug,
      'data-name': p.name,
      'data-price': p.price,
      'data-image': imgSrc
    });

    // Add to Cart button — global.js reads these attributes on click.
    $root.find('.btn-buy[data-tz-add-to-cart]').attr({
      'data-id': p.slug,
      'data-name': p.name,
      'data-price': p.price,
      'data-image': imgSrc
    });

    // Wishlist heart over the main image.
    $root.find('.gallery-wish').attr({
      'data-tz-wish': p.slug,
      'aria-label': 'Add ' + p.name + ' to wishlist'
    });

    // ---- Images: main image + all four thumbnails ----
    if (imgSrc) {
      $('#galleryMain').attr({ src: imgSrc, alt: p.name });
    } else {
      $('#galleryMain').addClass('img-missing').attr('alt', p.name);
    }

    $('[data-gallery-thumb]').each(function () {
      var $img = $(this).find('img');
      // Keep the "— front view" part of the existing alt text.
      var view = ($img.attr('alt') || '').split(' — ')[1] || 'view';
      $(this).attr('data-full', imgSrc);
      $img.attr('alt', p.name + ' — ' + view);
      if (imgSrc) { $img.attr('src', imgSrc); } else { $img.addClass('img-missing'); }
    });

    // Placeholder block if the image file is missing (same as global.js).
    $('#galleryMain, [data-gallery-thumb] img').one('error', function () {
      $(this).addClass('img-missing').removeAttr('src');
    });

    // ---- Badge ----
    var $badge = $('[data-detail-badge]');
    if (p.badge) {
      var type = p.badge === 'Out of Stock' ? 'badge bg-secondary'
               : p.badge.charAt(0) === '-' ? 'tz-badge tz-badge-discount'
               : p.badge === 'Best Seller' ? 'tz-badge tz-badge-best'
               : p.badge === 'Popular' ? 'tz-badge tz-badge-popular'
               : 'tz-badge tz-badge-new';
      $badge.attr('class', type).text(p.badge).prop('hidden', false);
    }

    // ---- Name, rating, description ----
    $('[data-field="name"]').text(p.name);
    $('[data-detail-stars]').html(starsHtml(Number(p.rating)));
    $('[data-field="reviews"]').text(p.reviews);

    var description = p.description ||
      'The ' + p.name + ' from ' + p.brand + '. ' +
      [p.processor, p.ram && p.ram + ' RAM', p.storage, p.gpu].filter(Boolean).join(', ') +
      (p.processor || p.ram || p.storage || p.gpu ? '.' : '');
    $('[data-field="description"]').text(description);

    // ---- Price ----
    $('[data-detail-price]').text(money(p.price));
    if (p.oldPrice && p.oldPrice > p.price) {
      $('[data-detail-old-price]').text(money(p.oldPrice)).prop('hidden', false);
      $('[data-detail-save]').text('Save ' + money(p.oldPrice - p.price)).prop('hidden', false);
    }

    // ---- Key specs: fill each <strong data-field="...">, hide empty ones ----
    $.each(['processor', 'ram', 'storage', 'gpu', 'display', 'battery'], function (i, key) {
      var $el = $('.key-specs [data-field="' + key + '"]');
      if (p[key]) {
        $el.text(p[key]);
      } else {
        $el.closest('li').hide();
      }
    });

    // ---- Description tab ----
    $('[data-detail-about]').text('About the ' + p.name);
    var paragraphs = p.details && p.details.length ? p.details : [description];
    var $details = $('[data-detail-details]').empty();
    $.each(paragraphs, function (i, text) {
      $details.append($('<p></p>').text(text));
    });

    // ---- Specifications table (the Bootstrap table itself is unchanged) ----
    // Use the full "specs" object if the product has one; otherwise build
    // the rows from the basic fields, skipping any that are empty.
    var specs = p.specs || {
      'Brand': p.brand,
      'Category': p.category,
      'Processor': p.processor,
      'RAM': p.ram,
      'Storage': p.storage,
      'Graphics': p.gpu
    };
    var $tbody = $('.spec-table tbody').empty();
    $.each(specs, function (label, value) {
      if (!value) { return; }
      $tbody.append(
        $('<tr></tr>')
          .append($('<th scope="row"></th>').text(label))
          .append($('<td></td>').text(value))
      );
    });
    $('[data-detail-caption]').text('Full specifications for the ' + p.name);

    // ---- Reviews summary numbers ----
    // These are the catalogue figures from products.json. If this product
    // has written reviews in reviews.json, renderReviews() overwrites them
    // with the real totals once that second request comes back.
    $('#tab-reviews').text('Reviews (' + p.reviews + ')');
    $('.rating-score').text(Number(p.rating).toFixed(1));
    $('.rating-stars').html(starsHtml(Number(p.rating)));
    $('.rating-count').text('Based on ' + p.reviews + ' reviews');

    // Show a filled heart if this product is already in the wishlist.
    if (window.TZ) { window.TZ.refreshBadges(); }
  }

  /* 
     REVIEWS — loaded from api/get_reviews.php?productId=X
      */

  /**
   * Build one review card. This is the SAME markup the reviews had when
   * they were hard-coded in product-detail.html, and the same markup
   * jquery-demo.js builds when it prepends a new one, so a review loaded
   * from the server and a review just submitted look identical.
   *
   * Built with jQuery and .text() rather than an HTML string, so a name
   * or comment containing < or > can never become markup.
   */
  function reviewCard(review) {
    var $head = $('<div class="review-head"></div>')
      .append(
        $('<div class="review-avatar rounded-circle"></div>')
          .text(String(review.name).charAt(0).toUpperCase())
      )
      .append(
        $('<div></div>')
          .append($('<h4></h4>').text(review.name))
          .append(
            $('<div class="review-meta"></div>')
              .append($('<span class="review-stars"></span>').html(starsHtml(Number(review.rating))))
              .append($('<span class="review-date"></span>').text(formatDate(review.date)))
          )
      );

    // "Verified purchase" only on the seeded reviews — a review typed into
    // the form isn't tied to a real order.
    if (review.verified) {
      $head.append('<span class="review-verified"><i class="bi bi-patch-check-fill"></i> Verified purchase</span>');
    }

    return $('<article class="review"></article>')
      .append($head)
      .append($('<p></p>').text(review.text));
  }

  /** Fill the Reviews tab from the array the server returned. */
  function renderReviews(reviews) {
    var $list = $('[data-review-list]').empty();
    var $status = $('[data-reviews-status]').empty();

    // The whole Reviews tab describes the review records in reviews.json,
    // so the numbers stay consistent when one is added and the page is
    // refreshed. (The product's catalogue rating still drives the stars
    // next to the product name and on the product cards.)
    var $summaryFigures = $('.rating-score, .rating-stars, .rating-count');

    if (!reviews.length) {
      // A product with no reviews is normal, not an error. Hide the score
      // and the star breakdown — there is nothing to average yet.
      $status.html(
        '<p class="text-muted">No reviews yet — be the first to write one.</p>'
      );
      $summaryFigures.hide();
      $('.rating-row').hide();
      $('#tab-reviews').text('Reviews (0)');
      return;
    }

    // Re-shown in case this product's predecessor had none.
    $summaryFigures.show();
    $('.rating-row').show();

    $.each(reviews, function (i, review) {
      $list.append(reviewCard(review));
    });

    // The summary now describes the reviews actually on the page, so the
    // count still matches after someone adds one and refreshes.
    var total = reviews.length;
    var sum = 0;
    var perStar = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    $.each(reviews, function (i, review) {
      var stars = Math.round(Number(review.rating)) || 0;
      sum += Number(review.rating) || 0;
      if (perStar[stars] !== undefined) { perStar[stars]++; }
    });

    var average = sum / total;

    $('#tab-reviews').text('Reviews (' + total + ')');
    $('.rating-score').text(average.toFixed(1));
    $('.rating-stars').html(starsHtml(average));
    $('.rating-count').text('Based on ' + total + ' review' + (total === 1 ? '' : 's'));

    // Rebuild the 5★…1★ bars. The rows are in the page already (5 first),
    // so walk them downwards and update each one's width and count.
    $('.rating-row').each(function (index) {
      var stars = 5 - index;
      var count = perStar[stars] || 0;
      var percent = Math.round((count / total) * 100);

      $(this).find('.progress-bar').css('width', percent + '%');
      $(this).find('.progress').attr({ 'aria-valuenow': count, 'aria-valuemax': total });
      $(this).find('.rating-row-count').text(count);
    });
  }

  /** GET the reviews for one product. */
  function loadReviews(productId) {
    $('[data-reviews-status]').html(
      '<div class="d-flex align-items-center gap-2 text-muted mb-3">' +
        '<div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>' +
        '<span>Loading reviews...</span>' +
      '</div>'
    );

    console.log('[AJAX] GET ' + API + 'get_reviews.php?productId=' + productId);

    return $.ajax({
      url: API + 'get_reviews.php',
      method: 'GET',
      data: { productId: productId },
      dataType: 'json'
    })
      .done(function (reviews) {
        console.log('[AJAX] Fetched reviews:', reviews);
        renderReviews(reviews);
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] get_reviews.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);

        // The product itself loaded fine, so only the reviews area shows
        // an error — the rest of the page stays usable.
        $('[data-reviews-status]').empty().append(
          $('<div class="alert alert-warning mb-3" role="alert"></div>')
            .append('<i class="bi bi-exclamation-triangle-fill"></i> <strong>Could not load reviews.</strong> ')
            .append($('<span></span>').text(
              xhr.status === 0
                ? 'The server could not be reached. Is Apache running in XAMPP?'
                : 'Server error ' + xhr.status + '.'
            ))
            .append(' <button type="button" class="btn btn-sm btn-outline-secondary ms-2" data-retry-reviews>Try again</button>')
        );
      });
  }

  // "Try again" inside the reviews error message (delegated, because the
  // button is created after this handler is registered).
  $(document).on('click', '[data-retry-reviews]', function () {
    loadReviews(getProductId());
  });

  /*
     The AJAX request
     */
  function loadProduct() {
    var id = getProductId();

    showLoading();
    console.log('[AJAX] GET ' + API + 'get_product.php?id=' + id);

    $.ajax({
      url: API + 'get_product.php',
      method: 'GET',
      data: { id: id },      // → get_product.php?id=3
      dataType: 'json'
    })
      .done(function (product) {
        console.log('[AJAX] Fetched product:', product);
        render(product);
        $status.empty();
        $content.css('visibility', '');

        // Second request: this product's reviews. Only once the product
        // itself loaded, so a 404 product never asks for its reviews.
        loadReviews(product.id);
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] get_product.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);

        var message;
        if (xhr.responseJSON && xhr.responseJSON.error) {
          // e.g. 404 → {"error":"Product not found"}
          message = xhr.responseJSON.error + ' (id ' + id + ', HTTP ' + xhr.status + ').';
        } else if (xhr.status === 0) {
          message = 'The server could not be reached. Is Apache running in XAMPP?';
        } else if (textStatus === 'parsererror') {
          message = 'The server did not return JSON. Open the site through Apache (http://localhost/TechZone/).';
        } else {
          message = 'Server error ' + xhr.status + '.';
        }
        showError(message);
      });
  }

  /*
     Shared with jquery-demo.js, whose review-form handler POSTs the new
     review to api/add_review.php and needs to know which product it
     belongs to (and how to re-draw the list).
     */
  window.TZDetail = {
    productId: getProductId(),
    reloadReviews: loadReviews,

    /**
     * Called by jquery-demo.js right after it prepends a new review.
     * If this product had none, the "No reviews yet" note and the hidden
     * score need to catch up — the jQuery handler has already updated the
     * count text itself. The star breakdown bars stay hidden until the
     * next page load, when they are recalculated from the server data.
     */
    noteReviewAdded: function () {
      $('[data-reviews-status]').empty();
      $('.rating-score, .rating-stars, .rating-count').show();
    }
  };

  $(loadProduct);

})(jQuery);
