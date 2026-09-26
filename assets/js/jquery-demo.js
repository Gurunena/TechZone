/* ==========================================================================
   TechZone — jquery-demo.js
   All jQuery for the class assignment lives in this one file, kept separate
   from the vanilla JS (global.js, home.js, laptops.js, product-detail.js)
   so each requirement is easy to point at during Q&A.

   LOAD ORDER (see the bottom of each HTML page):
     bootstrap.bundle.min.js  →  jquery-3.7.1.min.js  →  global.js
       →  [page].js  →  jquery-demo.js
   jQuery must come before this file, because this file uses $.
   This file comes last so it can see everything the vanilla JS set up.

   HOW THIS AVOIDS BREAKING THE EXISTING VANILLA JAVASCRIPT
   Three of these elements already have vanilla handlers. Where both could
   run, this file is deliberately written not to fight them:
     • Wishlist heart  - global.js owns the icon and the saved wishlist.
                         jQuery only adds a class to the parent CARD.
     • Review form     - product-detail.js also submits this form. jQuery
                         takes it over cleanly (see Requirement 2) so the
                         review is added once, not twice.
     • Thumbnails      - product-detail.js also swaps the image. Both set
                         the same src, so the result is identical.
   ========================================================================== */

// $(document).ready() waits until the HTML is fully built before running,
// so every element we look for below is guaranteed to exist.
$(document).ready(function () {

  // Which page are we on? Some demos only apply to one page, so we check
  // whether an element exists before wiring it up.
  var onLaptopsPage = $('[data-product-grid]').length > 0;
  var onDetailPage = $('[data-product-detail]').length > 0;

  console.log('[jQuery] jquery-demo.js running. jQuery version:', $.fn.jquery);


  // ============================================
  // REQUIREMENT 1: DOM TRAVERSAL
  // ============================================
  // Used on index.html and products/laptops.html (the wishlist hearts).
  //
  // The point of this requirement is to start from the clicked BUTTON and
  // travel UP the HTML tree to the whole product card, then back DOWN to
  // the icon inside it.
  //
  //   .closest('.product-card')  climbs up to the nearest matching ancestor
  //   .find('i')                 searches down inside that card
  //
  // NOTE: global.js already flips the heart icon between bi-heart and
  // bi-heart-fill. If we toggled those classes here too, the two scripts
  // would cancel each other out and the heart would look wrong. So jQuery
  // READS the icon instead, and only styles the parent card.
  $('.btn-wish').on('click', function () {

    // $(this) is the button that was clicked, wrapped as a jQuery object.
    var $button = $(this);

    // Travel UP from the button to the whole product card that contains it.
    var $card = $button.closest('.product-card');

    // Travel DOWN into the card to read the heart icon's current state.
    // global.js runs first, so by now the icon already shows the new state.
    var isFavorited = $card.find('.btn-wish i').hasClass('bi-heart-fill');

    // Put a class on the WHOLE card (not just the button) so the entire
    // card can be styled. .toggleClass with a second argument sets it
    // on/off explicitly instead of flipping it blindly.
    $card.toggleClass('favorited', isFavorited);

    console.log('[jQuery] Requirement 1 — traversed from button to card:',
      $card.find('.product-title').text().trim(), '| favorited:', isFavorited);
  });


  // ============================================
  // REQUIREMENT 2: DOM MODIFICATION
  // ============================================
  // Used on products/product-detail.html (the Write a Review form).
  //
  // We build a brand new review in memory and .prepend() it to the top of
  // the existing list, so it appears instantly with no page reload.
  //
  // IMPORTANT: product-detail.js already has a submit handler on this same
  // form that also adds a review. If we simply added a second handler, one
  // click would add TWO copies. Cloning the form gives us a fresh copy with
  // no old event listeners attached, so from here on jQuery is the only
  // thing handling this form. Nothing is deleted from product-detail.js —
  // its handler is simply left attached to the replaced element.
  if (onDetailPage) {
    var $oldForm = $('#reviewForm');
    $oldForm.replaceWith($oldForm.clone());

    $('#reviewForm').on('submit', function (event) {

      // Stop the browser reloading the page, which is what a form normally does.
      event.preventDefault();

      // Read what the user typed. .val() gets a form field's value.
      var name = $('#reviewName').val().trim();
      var email = $('#reviewEmail').val().trim();
      var rating = $('input[name="rating"]:checked').val();
      var reviewText = $('#reviewBody').val().trim();

      // Don't add an empty review.
      if (name === '' || reviewText === '') {
        return;
      }

      // Build the star icons: filled up to the chosen rating, empty after.
      var starsHtml = '';
      for (var i = 1; i <= 5; i++) {
        starsHtml += (i <= rating)
          ? '<i class="bi bi-star-fill"></i>'
          : '<i class="bi bi-star"></i>';
      }

      // Today's date, written the way the other reviews are written.
      var today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      // Build the new review as a jQuery object. We create it empty first
      // and fill the user's words in with .text() rather than pasting them
      // into the HTML string — .text() escapes anything typed, so a review
      // containing < or > can never inject markup into the page.
      var $review = $(
        '<article class="review">' +
          '<div class="review-head">' +
            '<div class="review-avatar rounded-circle"></div>' +
            '<div>' +
              '<h4></h4>' +
              '<div class="review-meta">' +
                '<span class="review-stars">' + starsHtml + '</span>' +
                '<span class="review-date">' + today + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p></p>' +
        '</article>'
      );

      $review.find('.review-avatar').text(name.charAt(0).toUpperCase());
      $review.find('h4').text(name);
      $review.find('p').text(reviewText);

      // .prepend() puts it at the TOP of the list (.append() would add it
      // to the bottom). .hide().slideDown() makes it slide into view.
      $('.review-list').prepend($review);
      $review.hide().slideDown(400);

      // Update the review count shown on the Reviews tab, e.g. "Reviews (24)".
      var $tab = $('#tab-reviews');
      var currentCount = parseInt($tab.text().replace(/\D/g, ''), 10) || 0;
      $tab.text('Reviews (' + (currentCount + 1) + ')');

      // Also update the "Based on N reviews" line under the big score.
      var $ratingCount = $('.rating-count');
      if ($ratingCount.length) {
        $ratingCount.text('Based on ' + (currentCount + 1) + ' reviews');
      }

      // Empty the form fields so the user can write another review.
      $('#reviewName').val('');
      $('#reviewEmail').val('');
      $('#reviewBody').val('');
      $('#r5').prop('checked', true);

      console.log('[jQuery] Requirement 2 — review added for', name, '(' + email + ')');

      // Reuse the site's existing toast, so the confirmation looks the same
      // as everywhere else on the site.
      if (window.TZ) {
        window.TZ.toast('Review submitted successfully!', 'success');
      }
    });
  }


  // ============================================
  // REQUIREMENT 3: DOM ATTRIBUTE MODIFICATION
  // ============================================
  // Used on products/product-detail.html.
  //
  // Part A — the thumbnail gallery. We READ one element's attribute with
  // .attr('src') and WRITE it onto another element with .attr('src', value).
  if (onDetailPage) {
    $('.gallery-thumb').on('click', function () {

      // Read the attributes off the small thumbnail that was clicked.
      var newSrc = $(this).find('img').attr('src');
      var newAlt = $(this).find('img').attr('alt');

      // Write them onto the big main image. Passing a second argument to
      // .attr() SETS the attribute instead of reading it.
      $('#galleryMain').attr('src', newSrc);
      $('#galleryMain').attr('alt', newAlt);

      console.log('[jQuery] Requirement 3 — main image src set to:', newSrc);
    });

    // Part B — adding and removing the disabled ATTRIBUTE on a button.
    // Clicking the stock status text flips the Add to Cart button between
    // enabled and disabled, to demonstrate .attr() and .removeAttr().
    $('[data-stock-status]').on('click', function () {
      var $addButton = $('.btn-buy[data-tz-add-to-cart]');

      if ($addButton.attr('disabled')) {
        // Remove the attribute entirely — the button becomes clickable again.
        $addButton.removeAttr('disabled');
        $(this).html('<i class="bi bi-check-circle"></i> In Stock');
        console.log('[jQuery] Requirement 3b — disabled attribute REMOVED');
      } else {
        // Add the attribute — the browser greys the button out and ignores clicks.
        $addButton.attr('disabled', true);
        $(this).html('<i class="bi bi-x-circle"></i> Out of Stock (demo)');
        console.log('[jQuery] Requirement 3b — disabled attribute ADDED');
      }
    });
  }


  // ============================================
  // REQUIREMENT 4: CSS MANIPULATION
  // ============================================
  // Used on index.html and products/laptops.html.
  //
  // $(window).scroll() fires constantly while the user scrolls.
  // $(window).scrollTop() is how many pixels they have scrolled down.
  // .css() then changes styles directly from JavaScript.
  //
  // NOTE: the header is dark navy by design and sits above a white page.
  // Making it transparent at the top (as a generic example would) would
  // make the logo and search bar unreadable, so instead we deepen the
  // colour and add a shadow once the user scrolls.
  $(window).on('scroll', function () {

    if ($(window).scrollTop() > 50) {
      // Scrolled down — lift the header off the page with a shadow.
      $('.tz-header').css({
        'background-color': '#0B1120',
        'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.35)'
      });
    } else {
      // Back at the very top — put it back to its normal flat look.
      $('.tz-header').css({
        'background-color': '#0D1B2A',
        'box-shadow': 'none'
      });
    }
  });


  // ============================================
  // REQUIREMENT 5: JAVASCRIPT EFFECTS
  // ============================================

  // --- 5a. .slideToggle() on the filter sidebar (products/laptops.html) ---
  // Clicking the button slides the filter panel open and shut. The button
  // only appears on desktop; on mobile the sidebar is a Bootstrap offcanvas
  // and sliding it too would fight that animation.
  $('#jqFilterToggle').on('click', function () {

    // .slideToggle(speed) slides it up if visible, down if hidden.
    $('#jqFilterBody').slideToggle(300);

    // Swap the button's arrow and wording to match what will happen next.
    var $icon = $(this).find('i');
    if ($icon.hasClass('bi-chevron-up')) {
      $icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
      $(this).contents().last().replaceWith(' Show Filters');
    } else {
      $icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
      $(this).contents().last().replaceWith(' Hide Filters');
    }

    console.log('[jQuery] Requirement 5a — filter sidebar slideToggled');
  });

  // --- 5b. .fadeIn() / .delay() / .fadeOut() notification (all 3 pages) ---
  // These three are CHAINED: each one waits for the one before it.
  //   .stop(true, true) cancels any fade still running from a previous click
  //   .fadeIn(300)      fades in over 300ms
  //   .delay(2000)      waits 2 seconds
  //   .fadeOut(300)     fades out over 300ms
  // This sits alongside the site's existing toast, it does not replace it.
  $('[data-tz-add-to-cart]').on('click', function () {
    var productName = $(this).attr('data-name') || 'Item';

    $('#jqueryNotice span').text(productName + ' added with jQuery!');
    $('#jqueryNotice').stop(true, true).fadeIn(300).delay(2000).fadeOut(300);

    console.log('[jQuery] Requirement 5b — fade notification shown for', productName);
  });


  // ============================================
  // REQUIREMENT 6: HTML EVENTS
  // ============================================
  // Five different real events, all wired with jQuery's .on() method.

  // --- 6.1  click — on every Add to Cart button (all 3 pages) ---
  // global.js still does the real adding; this only reports the click.
  $('[data-tz-add-to-cart]').on('click', function () {
    console.log('[jQuery] Requirement 6.1 — CLICK on Add to Cart:',
      $(this).attr('data-name'), '| Rs.', $(this).attr('data-price'));
  });

  // --- 6.2  change — the sort dropdown (products/laptops.html) ---
  // laptops.js still does the real sorting; this reports what was chosen.
  if (onLaptopsPage) {
    $('#sortSelect').on('change', function () {
      // $(this).val() is the selected option's value.
      // $('option:selected', this).text() is its readable label.
      console.log('[jQuery] Requirement 6.2 — CHANGE on sort dropdown:',
        $(this).val(), '(' + $('option:selected', this).text() + ')');
    });

    // --- 6.3  change — the filter checkboxes (products/laptops.html) ---
    $('.filter-card input[type="checkbox"]').on('change', function () {
      var $box = $(this);

      // Count how many boxes are ticked right now across the sidebar.
      var totalChecked = $('.filter-card input[type="checkbox"]:checked').length;

      console.log('[jQuery] Requirement 6.3 — CHANGE on filter:',
        $box.attr('data-filter'), '=', $box.val(),
        '| checked:', $box.is(':checked'),
        '| total active filters:', totalChecked);
    });
  }

  // --- 6.4  submit — the footer newsletter form (all 3 pages) ---
  $('#newsletterForm').on('submit', function (event) {

    // Stop the page reloading.
    event.preventDefault();

    var email = $('#newsletterEmail').val().trim();

    // Show a confirmation message under the form.
    // .removeAttr('hidden') makes the message element visible.
    $('#newsletterMsg')
      .text('Thanks! ' + email + ' is now subscribed.')
      .removeAttr('hidden')
      .hide()
      .fadeIn(300);

    // Clear the input ready for the next person.
    $('#newsletterEmail').val('');

    console.log('[jQuery] Requirement 6.4 — SUBMIT on newsletter form:', email);
  });

  // --- 6.5  focus and input — the header search bar (all 3 pages) ---
  // Two different events on one element, to show .on() handling each.
  $('#tzSearchInput').on('focus', function () {
    // Highlight the box while the user is typing in it.
    $(this).css('border-color', '#4FC3F7');
    console.log('[jQuery] Requirement 6.5 — FOCUS on search bar');
  });

  $('#tzSearchInput').on('blur', function () {
    // Put the border back when they click away.
    $(this).css('border-color', '');
  });

  $('#tzSearchInput').on('input', function () {
    // Fires on every keystroke. .val().length is how many characters
    // have been typed so far.
    console.log('[jQuery] Requirement 6.5 — INPUT on search bar:',
      $(this).val(), '| length:', $(this).val().length);
  });

});
