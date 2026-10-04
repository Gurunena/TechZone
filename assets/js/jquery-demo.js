$(document).ready(function () {

  var onLaptopsPage = $('[data-product-grid]').length > 0;
  var onDetailPage = $('[data-product-detail]').length > 0;

  console.log('[jQuery] jquery-demo.js running. jQuery version:', $.fn.jquery);

  // REQUIREMENT 1: DOM TRAVERSAL
  // Used on index.html and products/laptops.html (the wishlist hearts).
  
  // Delegated (bound to document) so it also works on cards loaded later by AJAX.
  $(document).on('click', '.btn-wish', function () {

    var $button = $(this);

    // Travel UP from the button to the whole product card that contains it.
    var $card = $button.closest('.product-card');

    var isFavorited = $card.find('.btn-wish i').hasClass('bi-heart-fill');

    $card.toggleClass('favorited', isFavorited);

    console.log('[jQuery] Requirement 1 — traversed from button to card:',
      $card.find('.product-title').text().trim(), '| favorited:', isFavorited);
  });

  // REQUIREMENT 2: DOM MODIFICATION
  // Used on products/product-detail.html (the Write a Review form).

  if (onDetailPage) {
    var $oldForm = $('#reviewForm');
    $oldForm.replaceWith($oldForm.clone());

    $('#reviewForm').on('submit', function (event) {

      event.preventDefault();

      var name = $('#reviewName').val().trim();
      var email = $('#reviewEmail').val().trim();
      var rating = $('input[name="rating"]:checked').val();
      var reviewText = $('#reviewBody').val().trim();


      if (name === '' || reviewText === '') {
        return;
      }

      var starsHtml = '';
      for (var i = 1; i <= 5; i++) {
        starsHtml += (i <= rating)
          ? '<i class="bi bi-star-fill"></i>'
          : '<i class="bi bi-star"></i>';
      }

      var today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

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

      $('.review-list').prepend($review);
      $review.hide().slideDown(400);

      // If this product had no reviews, clear the "No reviews yet" note
      // that the AJAX load left in place.
      if (window.TZDetail) { window.TZDetail.noteReviewAdded(); }

      var $tab = $('#tab-reviews');
      var currentCount = parseInt($tab.text().replace(/\D/g, ''), 10) || 0;
      $tab.text('Reviews (' + (currentCount + 1) + ')');

     
      var $ratingCount = $('.rating-count');
      if ($ratingCount.length) {
        $ratingCount.text('Based on ' + (currentCount + 1) + ' reviews');
      }

  
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

      // ----------------------------------------------------------------
      // AJAX ADDITION — everything above is the original jQuery
      // Requirement 2 (DOM modification), which already showed the
      // review instantly. Now we ALSO send it to the server so it is
      // saved in data/reviews.json and comes back after a refresh.
      // ----------------------------------------------------------------

      // Which product is being reviewed? product-detail-ajax.js already
      // worked this out from the URL (?id=1); fall back to reading the
      // URL here so this handler still works on its own.
      var productId = (window.TZDetail && window.TZDetail.productId) ||
                      new URLSearchParams(window.location.search).get('id') || 1;

      var payload = {
        productId: Number(productId),
        name: name,
        email: email,
        rating: Number(rating),
        text: reviewText
      };

      console.log('[AJAX] POST api/add_review.php', payload);

      $.ajax({
        // window.TZ.rootPath() is '../' on pages inside products/.
        url: (window.TZ ? window.TZ.rootPath() : '../') + 'api/add_review.php',
        method: 'POST',
        contentType: 'application/json',   // the body is JSON...
        data: JSON.stringify(payload),     // ...so PHP reads php://input
        dataType: 'json'
      })
        .done(function (response) {
          // The review is already on screen, so there is nothing to
          // re-render — just confirm what the server stored.
          console.log('[AJAX] Review saved to server:', response);
        })
        .fail(function (xhr, textStatus, errorThrown) {
          console.error('[AJAX] add_review.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);

          // Be honest about what happened: the review is visible, but it
          // was not saved, so it will vanish on refresh.
          if (window.TZ) {
            window.TZ.toast("Review shown but couldn't be saved — please try again", 'error');
          }

          // Mark the card so it is clear this one is not stored.
          $review.addClass('is-unsaved').attr('title', 'Not saved to the server');
        });
    });
  }


  // REQUIREMENT 3: DOM ATTRIBUTE MODIFICATION
  // Used on products/product-detail.html.
 
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

    $('[data-stock-status]').on('click', function () {
      var $addButton = $('.btn-buy[data-tz-add-to-cart]');

      if ($addButton.attr('disabled')) {
        
        $addButton.removeAttr('disabled');
        $(this).html('<i class="bi bi-check-circle"></i> In Stock');
        console.log('[jQuery] Requirement 3b — disabled attribute REMOVED');
      } else {
        
        $addButton.attr('disabled', true);
        $(this).html('<i class="bi bi-x-circle"></i> Out of Stock (demo)');
        console.log('[jQuery] Requirement 3b — disabled attribute ADDED');
      }
    });
  }


  // REQUIREMENT 4: CSS MANIPULATION
  // Used on index.html and products/laptops.html.
  $(window).on('scroll', function () {

    if ($(window).scrollTop() > 50) {
      
      $('.tz-header').css({
        'background-color': '#0B1120',
        'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.35)'
      });
    } else {

      $('.tz-header').css({
        'background-color': '#0D1B2A',
        'box-shadow': 'none'
      });
    }
  });


  // REQUIREMENT 5: JAVASCRIPT EFFECTS

  //laptop page
  $('#jqFilterToggle').on('click', function () {

  
    $('#jqFilterBody').slideToggle(300);

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
  
  // Delegated so AJAX-rendered Add to Cart buttons are included.
  $(document).on('click', '[data-tz-add-to-cart]', function () {
    var productName = $(this).attr('data-name') || 'Item';

    $('#jqueryNotice span').text(productName + ' added with jQuery!');
    $('#jqueryNotice').stop(true, true).fadeIn(300).delay(2000).fadeOut(300);

    console.log('[jQuery] Requirement 5b — fade notification shown for', productName);
  });


  // REQUIREMENT 6: HTML EVENTS
  // Five different real events, all wired with jQuery's .on() method.

  $(document).on('click', '[data-tz-add-to-cart]', function () {
    console.log('[jQuery] Requirement 6.1 — CLICK on Add to Cart:',
      $(this).attr('data-name'), '| Rs.', $(this).attr('data-price'));
  });

  // --- 6.2  change — the sort dropdown (products/laptops.html) ---
  // laptops.js still does the real sorting; this reports what was chosen.
  if (onLaptopsPage) {
    $('#sortSelect').on('change', function () {
     
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
