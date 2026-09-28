
$(document).ready(function () {

  
  var onLaptopsPage = $('[data-product-grid]').length > 0;
  var onDetailPage = $('[data-product-detail]').length > 0;

  console.log('[jQuery] jquery-demo.js running. jQuery version:', $.fn.jquery);


  $('.btn-wish').on('click', function () {

    var $button = $(this);

  
    var $card = $button.closest('.product-card');

    var isFavorited = $card.find('.btn-wish i').hasClass('bi-heart-fill');

    $card.toggleClass('favorited', isFavorited);

    console.log('[jQuery] Requirement 1 — traversed from button to card:',
      $card.find('.product-title').text().trim(), '| favorited:', isFavorited);
  });


  
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

      
      if (window.TZ) {
        window.TZ.toast('Review submitted successfully!', 'success');
      }
    });
  }


  
  if (onDetailPage) {
    $('.gallery-thumb').on('click', function () {

      
      var newSrc = $(this).find('img').attr('src');
      var newAlt = $(this).find('img').attr('alt');

      
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

  
  $('[data-tz-add-to-cart]').on('click', function () {
    var productName = $(this).attr('data-name') || 'Item';

    $('#jqueryNotice span').text(productName + ' added with jQuery!');
    $('#jqueryNotice').stop(true, true).fadeIn(300).delay(2000).fadeOut(300);

    console.log('[jQuery] Requirement 5b — fade notification shown for', productName);
  });


  
  $('[data-tz-add-to-cart]').on('click', function () {
    console.log('[jQuery] Requirement 6.1 — CLICK on Add to Cart:',
      $(this).attr('data-name'), '| Rs.', $(this).attr('data-price'));
  });

  
  if (onLaptopsPage) {
    $('#sortSelect').on('change', function () {
      
      console.log('[jQuery] Requirement 6.2 — CHANGE on sort dropdown:',
        $(this).val(), '(' + $('option:selected', this).text() + ')');
    });

    
    $('.filter-card input[type="checkbox"]').on('change', function () {
      var $box = $(this);

      
      var totalChecked = $('.filter-card input[type="checkbox"]:checked').length;

      console.log('[jQuery] Requirement 6.3 — CHANGE on filter:',
        $box.attr('data-filter'), '=', $box.val(),
        '| checked:', $box.is(':checked'),
        '| total active filters:', totalChecked);
    });
  }

 
  $('#newsletterForm').on('submit', function (event) {

    event.preventDefault();

    var email = $('#newsletterEmail').val().trim();

    
    $('#newsletterMsg')
      .text('Thanks! ' + email + ' is now subscribed.')
      .removeAttr('hidden')
      .hide()
      .fadeIn(300);

    $('#newsletterEmail').val('');

    console.log('[jQuery] Requirement 6.4 — SUBMIT on newsletter form:', email);
  });

  
  $('#tzSearchInput').on('focus', function () {
   
    $(this).css('border-color', '#4FC3F7');
    console.log('[jQuery] Requirement 6.5 — FOCUS on search bar');
  });

  $('#tzSearchInput').on('blur', function () {
   
    $(this).css('border-color', '');
  });

  $('#tzSearchInput').on('input', function () {
   
    console.log('[jQuery] Requirement 6.5 — INPUT on search bar:',
      $(this).val(), '| length:', $(this).val().length);
  });

});
