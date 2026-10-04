/* ==========================================================================
   TechZone — laptops.js
   Product listing: filter, sort and paginate the product cards in the DOM.
   The cards are created by products-ajax.js from api/get_products.php;
   once they are rendered it calls window.TZListing.refresh(), and this
   file only shows, hides and reorders them.

   GENERIC BY DESIGN. Nothing here mentions laptops, so desktops.js and
   gaming.js can be exact copies of this file. It drives itself entirely
   from data attributes in the HTML:

     [data-product-grid]      the grid, optional data-page-size (default 9)
     [data-product]           one product card, carrying the filterable data:
                              data-price, data-rating, data-reviews,
                              data-added, plus one attribute per filter group
                              (data-brand, data-cpu, data-ram, data-storage)
     [data-filter="brand"]    a checkbox whose value matches data-brand
     [data-filter="price"]    number/range inputs (#priceMin, #priceMax, #priceSlider)
     [data-filter="rating"]   a checkbox whose value is a minimum rating
     [data-sort]              the sort <select>
     [data-clear-filters]     any "Clear All" button
     [data-shown]/[data-total] the live "Showing X of Y" counters
     [data-pagination]        the <ul> to rebuild with page links

   To add a new filter group: add checkboxes with data-filter="colour" and a
   matching data-colour on each card. No JS changes needed.

   Loaded AFTER global.js (which owns the cart, wishlist and search).
   ========================================================================== */

(function () {
  'use strict';

  var grid = document.querySelector('[data-product-grid]');
  if (!grid) { return; }

  /* ------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------ */
  // Re-read by refresh() each time AJAX replaces the cards.
  var cards = collectCards();
  function collectCards() { return Array.prototype.slice.call(grid.querySelectorAll('[data-product]')); }
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var sortSelect = document.querySelector('[data-sort]');
  var pagination = document.querySelector('[data-pagination]');
  var chipsWrap = document.querySelector('[data-active-filters]');
  var noResults = document.querySelector('[data-no-results]');
  var shownEl = document.querySelector('[data-shown]');
  var totalEl = document.querySelector('[data-total]');
  var pillEl = document.querySelector('[data-active-count]');

  var priceMin = document.getElementById('priceMin');
  var priceMax = document.getElementById('priceMax');
  var priceSlider = document.getElementById('priceSlider');
  var priceLabel = document.querySelector('[data-price-slider-label]');

  var PAGE_SIZE = Number(grid.getAttribute('data-page-size')) || 9;
  var currentPage = 1;

  /* The wrapper is the Bootstrap column — hiding the card itself would
     leave an empty grid cell behind. */
  function wrapperOf(card) { return card.closest('.col') || card.parentElement; }

  function money(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK', { maximumFractionDigits: 0 }); }

  /* ------------------------------------------------------------------
     Read the current filter state out of the DOM
     ------------------------------------------------------------------ */
  function readFilters() {
    var groups = {};

    filterInputs.forEach(function (input) {
      var group = input.getAttribute('data-filter');
      if (group === 'price') { return; }          // handled separately
      if (!input.checked) { return; }
      (groups[group] = groups[group] || []).push(input.value);
    });

    var min = priceMin && priceMin.value !== '' ? Number(priceMin.value) : 0;
    var max = priceMax && priceMax.value !== '' ? Number(priceMax.value) : Infinity;

    return { groups: groups, min: min, max: max };
  }

  function matches(card, state) {
    var price = Number(card.getAttribute('data-price')) || 0;
    if (price < state.min || price > state.max) { return false; }

    for (var group in state.groups) {
      if (!Object.prototype.hasOwnProperty.call(state.groups, group)) { continue; }
      var selected = state.groups[group];
      if (!selected.length) { continue; }

      if (group === 'rating') {
        // Checkboxes are "N stars & above" — the loosest one selected wins.
        var lowest = Math.min.apply(null, selected.map(Number));
        if ((Number(card.getAttribute('data-rating')) || 0) < lowest) { return false; }
        continue;
      }

      // Every other group: the card's value must be one of the ticked boxes.
      if (selected.indexOf(card.getAttribute('data-' + group)) === -1) { return false; }
    }

    return true;
  }

  /* ------------------------------------------------------------------
     Sorting — reorders the column wrappers inside the grid
     ------------------------------------------------------------------ */
  var SORTERS = {
    'popularity': function (a, b) { return num(b, 'reviews') - num(a, 'reviews'); },
    'price-asc': function (a, b) { return num(a, 'price') - num(b, 'price'); },
    'price-desc': function (a, b) { return num(b, 'price') - num(a, 'price'); },
    'newest': function (a, b) { return num(b, 'added') - num(a, 'added'); },
    'rating': function (a, b) {
      return (num(b, 'rating') - num(a, 'rating')) || (num(b, 'reviews') - num(a, 'reviews'));
    }
  };

  function num(card, key) { return Number(card.getAttribute('data-' + key)) || 0; }

  function applySort() {
    var mode = sortSelect ? sortSelect.value : 'popularity';
    var sorter = SORTERS[mode] || SORTERS.popularity;

    // Keep the array in sorted order too, so update() paginates the
    // cards in the order they are shown.
    cards = cards.slice().sort(sorter);
    cards.forEach(function (card) {
      grid.appendChild(wrapperOf(card));       // appending moves it to the end
    });
  }

  /* ------------------------------------------------------------------
     Active-filter chips
     ------------------------------------------------------------------ */
  function labelFor(input) {
    var label = document.querySelector('label[for="' + input.id + '"]');
    return label ? label.textContent.trim() : input.value;
  }

  function renderChips(state) {
    if (!chipsWrap) { return 0; }

    var chips = [];

    filterInputs.forEach(function (input) {
      if (input.getAttribute('data-filter') === 'price' || !input.checked) { return; }
      chips.push({ text: labelFor(input), input: input });
    });

    if (state.min > 0 || state.max < Infinity) {
      var text = 'Price: ' +
        (state.min > 0 ? money(state.min) : 'Any') + ' – ' +
        (state.max < Infinity ? money(state.max) : 'Any');
      chips.push({ text: text, price: true });
    }

    chipsWrap.innerHTML = '';

    chips.forEach(function (chip) {
      var el = document.createElement('span');
      el.className = 'filter-chip';
      el.innerHTML = '<span></span><button type="button" aria-label="Remove filter">&times;</button>';
      el.querySelector('span').textContent = chip.text;

      el.querySelector('button').addEventListener('click', function () {
        if (chip.price) { resetPrice(); } else { chip.input.checked = false; }
        currentPage = 1;
        update();
      });

      chipsWrap.appendChild(el);
    });

    chipsWrap.hidden = chips.length === 0;

    if (pillEl) {
      pillEl.textContent = chips.length;
      pillEl.hidden = chips.length === 0;
    }

    return chips.length;
  }

  /* ------------------------------------------------------------------
     Pagination — rebuilt to match however many results there are
     ------------------------------------------------------------------ */
  function renderPagination(pageCount) {
    if (!pagination) { return; }

    if (pageCount <= 1) {
      pagination.innerHTML = '';
      pagination.parentElement.hidden = true;
      return;
    }
    pagination.parentElement.hidden = false;

    var html = '<li class="page-item' + (currentPage === 1 ? ' disabled' : '') +
               '"><a class="page-link" href="#" data-page="prev">Previous</a></li>';

    for (var i = 1; i <= pageCount; i++) {
      html += '<li class="page-item' + (i === currentPage ? ' active' : '') +
              '"><a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
    }

    html += '<li class="page-item' + (currentPage === pageCount ? ' disabled' : '') +
            '"><a class="page-link" href="#" data-page="next">Next</a></li>';

    pagination.innerHTML = html;
  }

  /* ------------------------------------------------------------------
     The single update pass: filter → count → paginate → chips
     ------------------------------------------------------------------ */
  function update() {
    var state = readFilters();
    var visible = [];

    cards.forEach(function (card) {
      var ok = matches(card, state);
      wrapperOf(card).classList.toggle('is-filtered-out', !ok);
      if (ok) { visible.push(card); }
    });

    var pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    if (currentPage > pageCount) { currentPage = pageCount; }

    var start = (currentPage - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;

    visible.forEach(function (card, i) {
      wrapperOf(card).classList.toggle('is-off-page', i < start || i >= end);
    });

    if (shownEl) { shownEl.textContent = visible.length; }
    if (totalEl) { totalEl.textContent = cards.length; }
    if (noResults) { noResults.hidden = visible.length !== 0; }

    renderChips(state);
    renderPagination(pageCount);
  }

  /* ------------------------------------------------------------------
     Price controls — the slider and the Max box stay in sync
     ------------------------------------------------------------------ */
  function syncPriceLabel() {
    if (!priceLabel) { return; }
    priceLabel.textContent = priceMax && priceMax.value !== ''
      ? money(priceMax.value)
      : money(priceSlider ? priceSlider.max : 0);
  }

  function resetPrice() {
    if (priceMin) { priceMin.value = ''; }
    if (priceMax) { priceMax.value = ''; }
    if (priceSlider) { priceSlider.value = priceSlider.max; }
    syncPriceLabel();
  }

  function initPrice() {
    if (priceSlider) {
      priceSlider.addEventListener('input', function () {
        if (priceMax) { priceMax.value = priceSlider.value; }
        syncPriceLabel();
        currentPage = 1;
        update();
      });
    }

    [priceMin, priceMax].forEach(function (input) {
      if (!input) { return; }
      input.addEventListener('input', function () {
        if (input === priceMax && priceSlider && input.value !== '') {
          priceSlider.value = Math.min(Number(input.value), Number(priceSlider.max));
        }
        syncPriceLabel();
        currentPage = 1;
        update();
      });
    });

    syncPriceLabel();
  }

  /* ------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------ */
  function init() {
    filterInputs.forEach(function (input) {
      if (input.getAttribute('data-filter') === 'price') { return; }
      input.addEventListener('change', function () {
        currentPage = 1;
        update();
      });
    });

    initPrice();

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        currentPage = 1;
        update();
      });
    }

    document.querySelectorAll('[data-clear-filters]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterInputs.forEach(function (input) {
          if (input.type === 'checkbox') { input.checked = false; }
        });
        resetPrice();
        currentPage = 1;
        update();

        // Close the mobile drawer, if it's what we were just using.
        var panel = document.getElementById('filterPanel');
        if (panel && typeof bootstrap !== 'undefined') {
          var oc = bootstrap.Offcanvas.getInstance(panel);
          if (oc) { oc.hide(); }
        }
      });
    });

    if (pagination) {
      pagination.addEventListener('click', function (e) {
        var link = e.target.closest('[data-page]');
        if (!link) { return; }
        e.preventDefault();

        if (link.parentElement.classList.contains('disabled')) { return; }

        var target = link.getAttribute('data-page');
        if (target === 'prev') { currentPage = Math.max(1, currentPage - 1); }
        else if (target === 'next') { currentPage = currentPage + 1; }
        else { currentPage = Number(target) || 1; }

        update();

        var top = grid.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    }

    // Nothing to filter until the AJAX cards arrive — running update() on
    // an empty grid would flash the "No products match" message.
    if (cards.length) {
      applySort();
      update();
    }
  }

  /* Called by products-ajax.js after it renders (or re-renders) the cards,
     so filtering and sorting always run against the loaded data. */
  window.TZListing = {
    refresh: function () {
      cards = collectCards();
      currentPage = 1;
      applySort();
      update();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
