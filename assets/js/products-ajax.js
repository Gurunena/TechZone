

(function ($) {
  'use strict';

  var $grid = $('[data-ajax-products]');
  if (!$grid.length) { return; }

  var $status = $('[data-products-status]');

  /* rootPath() is '' on index.html and '../' inside products/, so the same
     relative URL works from both pages under Apache:
       index.html            → api/get_products.php
       products/laptops.html → ../api/get_products.php */
  var ROOT = window.TZ ? window.TZ.rootPath() : '';
  var API = ROOT + 'api/';

  // The full listing page has filters; the home page grid doesn't.
  var isListing = $grid.is('[data-product-grid]');

  /* 
     Small helpers
      */

  /** Escape text before putting it inside an HTML string, so a product
      name like  <b>Test</b>  shows as text instead of becoming markup. */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(n) {
    return window.TZ ? window.TZ.formatPrice(n) : 'Rs. ' + n;
  }

  /** 4.5 → four full stars, one half star. */
  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (rating >= i) { html += '<i class="bi bi-star-fill"></i>'; }
      else if (rating >= i - 0.5) { html += '<i class="bi bi-star-half"></i>'; }
      else { html += '<i class="bi bi-star"></i>'; }
    }
    return html;
  }

  /** Badge text → the same CSS class the hand-written cards used. */
  function badgeHtml(text) {
    if (!text) { return ''; }
    if (text === 'Out of Stock') {
      return '<span class="product-badges"><span class="badge bg-secondary">Out of Stock</span></span>';
    }
    var type = text.charAt(0) === '-' ? 'discount'
             : text === 'Best Seller' ? 'best'
             : text === 'Popular' ? 'popular'
             : 'new';
    return '<span class="product-badges"><span class="tz-badge tz-badge-' + type + '">' +
           esc(text) + '</span></span>';
  }

  /* The laptops.js filters compare short codes (data-cpu="i5",
     data-ram="16", data-storage="512"), so derive them from the
     human-readable JSON fields. */
  function cpuCode(processor) {
    var p = String(processor || '');
    var intel = p.match(/\bi([3579])\b/i);
    if (intel) { return 'i' + intel[1]; }
    var ryzen = p.match(/ryzen\s*([3579])/i);
    return ryzen ? 'ryzen' + ryzen[1] : '';
  }

  function gbNumber(text) {
    var m = String(text || '').match(/(\d+)\s*(TB|GB)/i);
    if (!m) { return ''; }
    return m[2].toUpperCase() === 'TB' ? String(m[1] * 1024) : m[1];
  }

  /* 
     Card template — the SAME markup the cards had when they were
     hard-coded in the HTML, just filled in from one JSON object.
      */
  function cardHtml(p) {
    var detailUrl = ROOT + 'products/product-detail.html?id=' + p.id;
    var imgSrc = p.image ? ROOT + p.image : '';
    var spec = p.spec || [p.processor, p.ram, p.storage].filter(Boolean).join(' / ');

    // Only the listing page needs the filter/sort data attributes and the
    // stretched link (whole card clickable), matching the old markup.
    var dataAttrs = isListing
      ? ' data-product' +
        ' data-id="' + esc(p.slug) + '"' +
        ' data-brand="' + esc(String(p.brand).toLowerCase()) + '"' +
        ' data-cpu="' + cpuCode(p.processor) + '"' +
        ' data-ram="' + gbNumber(p.ram) + '"' +
        ' data-storage="' + gbNumber(p.storage) + '"' +
        ' data-price="' + Number(p.price) + '"' +
        ' data-rating="' + Number(p.rating) + '"' +
        ' data-reviews="' + Number(p.reviews) + '"' +
        ' data-added="' + Number(p.id) + '"'   // higher id = added more recently
      : '';

    return '' +
      '<div class="col">' +
        '<article class="product-card"' + dataAttrs + '>' +
          '<a class="product-thumb" href="' + detailUrl + '"' + (isListing ? ' tabindex="-1" aria-hidden="true"' : '') + '>' +
            badgeHtml(p.badge) +
            (imgSrc
              ? '<img src="' + esc(imgSrc) + '" alt="' + esc(p.name) + '">'
              : '<img class="img-missing" alt="' + esc(p.name) + '">') +
          '</a>' +
          '<div class="product-body">' +
            '<h3 class="product-title">' +
              '<a' + (isListing ? ' class="stretched-link"' : '') + ' href="' + detailUrl + '">' + esc(p.name) + '</a>' +
            '</h3>' +
            '<p class="product-spec">' + esc(spec) + '</p>' +
            '<div class="product-rating">' +
              starsHtml(Number(p.rating)) +
              '<span>(' + Number(p.reviews) + ')</span>' +
            '</div>' +
            '<div class="product-price">' +
              '<span class="price-now">' + money(p.price) + '</span>' +
              (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : '') +
            '</div>' +
            '<div class="product-actions">' +
              // global.js handles these clicks through event delegation, so
              // cards added by AJAX work without any extra wiring.
              '<button class="btn btn-tz" type="button" data-tz-add-to-cart' +
                ' data-id="' + esc(p.slug) + '"' +
                ' data-name="' + esc(p.name) + '"' +
                ' data-price="' + Number(p.price) + '"' +
                ' data-image="' + esc(imgSrc) + '">' +
                '<i class="bi bi-bag-plus"></i> Add to Cart' +
              '</button>' +
              '<button class="btn btn-wish" type="button" data-tz-wish="' + esc(p.slug) + '"' +
                ' aria-label="Add ' + esc(p.name) + ' to wishlist">' +
                '<i class="bi bi-heart"></i>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>' +
      '</div>';
  }

  /* 
     Loading / error states
      */
  function showLoading() {
    $status.html(
      '<div class="d-flex align-items-center justify-content-center gap-2 py-5 text-muted">' +
        '<div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>' +
        '<span>Loading products...</span>' +
      '</div>'
    ).show();
  }

  function showError(message) {
    $status.html(
      '<div class="alert alert-danger d-flex flex-wrap align-items-center gap-2" role="alert">' +
        '<i class="bi bi-exclamation-triangle-fill"></i>' +
        '<span><strong>Could not load products.</strong> ' + esc(message) + '</span>' +
        '<button type="button" class="btn btn-sm btn-outline-danger ms-auto" data-retry-products>Try again</button>' +
      '</div>'
    ).show();
  }

  /** Turn a failed jqXHR into a readable sentence. */
  function describeFailure(xhr, textStatus) {
    if (xhr.responseJSON && xhr.responseJSON.error) {
      return xhr.responseJSON.error + ' (HTTP ' + xhr.status + ')';
    }
    if (xhr.status === 0) {
      return 'The server could not be reached. Is Apache running in XAMPP?';
    }
    if (textStatus === 'parsererror') {
      // Usually means PHP didn't run — e.g. the page was opened with
      // Live Server or as a file:// path, so the raw .php source came back.
      return 'The server did not return JSON. Open the site through Apache (http://localhost/TechZone/).';
    }
    return 'Server error ' + xhr.status + ' (' + (xhr.statusText || textStatus) + ').';
  }

  /* 
     GET — load the products and render the grid
      */
  function loadProducts() {
    // Only show the spinner on the first load. When re-fetching after
    // "Add Product" the current cards stay on screen until the new list
    // arrives, so the grid doesn't flash empty.
    var firstLoad = $grid.children().length === 0;
    if (firstLoad) { showLoading(); }

    // Optional GET parameters from the grid's data-api-filter attribute,
    // e.g. { category: "Laptops" } — $.ajax turns this into ?category=Laptops
    var params = $grid.data('apiFilter') || {};

    console.log('[AJAX] GET ' + API + 'get_products.php', params);

    return $.ajax({
      url: API + 'get_products.php',
      method: 'GET',
      data: params,           // becomes the query string
      dataType: 'json'        // parse the response body as JSON
    })
      .done(function (products) {
        console.log('[AJAX] Fetched products:', products);

        // Build every card as one HTML string and insert it in one go.
        $grid.html($.map(products, cardHtml).join(''));

        // Images that fail to load get the site's neutral placeholder,
        // the same fallback global.js applies to static images.
        $grid.find('img[src]').one('error', function () {
          $(this).addClass('img-missing').removeAttr('src');
        });

        if (!products.length) {
          $status.html('<p class="text-center text-muted py-5">No products found.</p>').show();
        } else {
          $status.empty().hide();
        }

        // Filters + sort + pagination must run AFTER the cards exist.
        if (window.TZListing) { window.TZListing.refresh(); }

        // Show filled hearts for products already in the wishlist.
        if (window.TZ) { window.TZ.refreshBadges(); }
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] get_products.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);
        showError(describeFailure(xhr, textStatus));
      });
  }

  // "Try again" button inside the error message. Delegated, because the
  // button itself is created later by showError().
  $status.on('click', '[data-retry-products]', function () {
    loadProducts();
  });

  /* 
     POST — the "Add New Product" form (products/laptops.html only)
      */
  function initAddForm() {
    var $form = $('#addProductForm');
    if (!$form.length) { return; }

    var $modal = $('#addProductModal');
    var $alert = $form.find('[data-add-product-alert]');
    var $submit = $form.find('[type="submit"]');

    $form.on('submit', function (event) {
      event.preventDefault();   // stop the normal full-page form submit
      $alert.addClass('d-none').text('');

      // Bootstrap validation styles for the required fields.
      if (!this.checkValidity()) {
        $form.addClass('was-validated');
        return;
      }

      // Collect the inputs into a plain object — the same field names
      // as the JSON file, so PHP can store it directly.
      var payload = {
        name: $('#apName').val().trim(),
        brand: $('#apBrand').val(),
        price: Number($('#apPrice').val()),
        processor: $('#apProcessor').val().trim(),
        ram: $('#apRam').val(),
        storage: $('#apStorage').val(),
        category: 'Laptops'
      };

      console.log('[AJAX] POST ' + API + 'add_product.php', payload);

      // Prevent double-submits while the request is in flight.
      $submit.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Saving...'
      );

      $.ajax({
        url: API + 'add_product.php',
        method: 'POST',
        contentType: 'application/json',  // tell PHP the body is JSON...
        data: JSON.stringify(payload),     // ...and send it as a JSON string
        dataType: 'json'
      })
        .done(function (response) {
          console.log('[AJAX] Product saved:', response);

          if (window.TZ) {
            window.TZ.toast(response.product.name + ' added (id ' + response.product.id + ')', 'success');
          }

          // Reset and close the modal.
          $form[0].reset();
          $form.removeClass('was-validated');
          if (typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getOrCreateInstance($modal[0]).hide();
          }

          // Sort newest-first so the new product is the first card shown,
          // then re-fetch the list from the server (no page reload).
          $('#sortSelect').val('newest');
          loadProducts();
        })
        .fail(function (xhr, textStatus, errorThrown) {
          console.error('[AJAX] add_product.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);
          $alert.text(describeFailure(xhr, textStatus)).removeClass('d-none');
        })
        .always(function () {
          $submit.prop('disabled', false).html('<i class="bi bi-cloud-upload"></i> Save Product');
        });
    });
  }

  /* 
     Boot — wait for the DOM so laptops.js has wired its filters first.
      */
  $(function () {
    initAddForm();
    loadProducts();
  });

})(jQuery);
