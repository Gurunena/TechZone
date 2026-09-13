/* ==========================================================================
   TechZone — about.js   (About Us page)

   WHAT THIS FILE DOES:
   Almost nothing on purpose! The About page is mostly plain HTML and CSS, and
   the shared header, footer, cart badges and year are all handled by global.js.

   As a small, SAFE extra touch, it adds a gentle "lift" when you hover a card.
   Everything on the page is fully visible with or without this script — we do
   NOT hide any content, so nothing can ever go missing.
   ========================================================================== */

(function () {
  'use strict';

  /* Find the cards on the page. */
  var cards = document.querySelectorAll('.value-card, .team-card, .about-stat');

  /* The hover lift is actually done in CSS. This tiny loop just makes sure the
     cards have a smooth transition set, in case a browser missed it. It never
     hides anything, so the page is safe even if JavaScript is turned off. */
  cards.forEach(function (card) {
    card.style.transition = 'transform .18s ease, box-shadow .18s ease';
  });
})();
