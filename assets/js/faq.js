/* ==========================================================================
   TechZone — faq.js   (FAQ page)

   WHAT THIS FILE DOES:
   It handles the "Ask us a question" form at the bottom of the FAQ page. When
   the user clicks Submit, it checks the boxes are filled in correctly. If they
   are, it shows a green success message and clears the form. If not, Bootstrap
   highlights the missing boxes in red.

   The accordion (the click-to-open questions) is handled by Bootstrap itself,
   so we don't need any code for that here.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('faqForm');
  var success = document.getElementById('faqSuccess');
  if (!form) { return; }   // safety: if the form isn't on the page, do nothing

  /* Run this when the form is submitted (Submit button clicked). */
  form.addEventListener('submit', function (e) {
    e.preventDefault();     // stop the page from reloading (normal form behaviour)
    e.stopPropagation();

    /* checkValidity() asks the browser: are all the "required" boxes filled,
       and is the email a real email? It returns true (all good) or false. */
    if (!form.checkValidity()) {
      form.classList.add('was-validated');   // turns on Bootstrap's red highlights
      if (success) { success.classList.add('d-none'); }
      return;
    }

    /* Everything is valid.
       Clear the form FIRST (form.reset() also runs the reset handler below,
       which hides the success box), THEN show the success box — so it stays
       visible instead of being hidden again. */
    form.reset();
    form.classList.remove('was-validated');
    if (success) { success.classList.remove('d-none'); }

    /* Scroll the success message into view so the user notices it. */
    if (success && success.scrollIntoView) {
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  /* When the user clicks "Clear" (reset), also hide the success message. */
  form.addEventListener('reset', function () {
    form.classList.remove('was-validated');
    if (success) { success.classList.add('d-none'); }
  });
})();
