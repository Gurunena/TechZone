(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     HERO CAROUSEL
     ------------------------------------------------------------------ */
  function initHero() {
    var el = $('#tzHeroCarousel');
    if (!el || typeof bootstrap === 'undefined') { return; }

    var carousel = bootstrap.Carousel.getOrCreateInstance(el, {
      interval: 3000,
      ride: 'carousel',
      pause: 'hover',
      touch: true,
      wrap: true
    });

    // Left / right arrow keys move the hero when it's on screen.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }

      // Ignore while the user is typing in the search box or any field.
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { return; }

      var box = el.getBoundingClientRect();
      var onScreen = box.bottom > 80 && box.top < window.innerHeight;
      if (!onScreen) { return; }

      if (e.key === 'ArrowLeft') { carousel.prev(); } else { carousel.next(); }
    });

    // Stop autoplay when the tab is hidden, resume when it comes back.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { carousel.pause(); } else { carousel.cycle(); }
    });

    // Respect a reduced-motion preference.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      carousel.pause();
    }
  }

  
  function initReveal() {
    var targets = []
      .concat($$('.category-tile'))
      .concat($$('.section-featured .col'))
      .concat($$('.promo-card'));

    if (!targets.length) { return; }

    // No IntersectionObserver (older browsers) — just show everything.
    if (!('IntersectionObserver' in window)) { return; }

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i, 8) * 45) + 'ms';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     CATEGORY STRIP — drag to scroll on the mobile layout
     ------------------------------------------------------------------ */
  function initCategoryDrag() {
    var strip = $('.category-grid');
    if (!strip) { return; }

    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    strip.addEventListener('pointerdown', function (e) {
      if (strip.scrollWidth <= strip.clientWidth) { return; }
      isDown = true;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
    });

    strip.addEventListener('pointermove', function (e) {
      if (!isDown) { return; }
      strip.scrollLeft = startScroll - (e.clientX - startX);
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (evt) {
      strip.addEventListener(evt, function () { isDown = false; });
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function init() {
    initHero();
    initReveal();
    initCategoryDrag();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
