/* ==========================================================================
   TechZone — jquery-demo-latisha.js   (Class Task 4: jQuery)   by Latisha

   ~~~ READ ME LIKE A STORY ~~~

   WHAT IS jQUERY?
   Think of the web page as a big box of LEGO. Every button, word and picture
   is one LEGO brick. jQuery is a magic hand that can grab any brick and change
   it — its colour, where it is, or make it appear and disappear.

   THE MAGIC WORD IS  $
     $("#hello")  = grab the ONE brick whose id is "hello"   (# means id)
     $(".box")    = grab EVERY brick with the class "box"     (. means class)
   Then you add a dot and say what to do:   $("#hello").hide();

   HOW THIS IS BUILT
   All my jQuery is added to the REAL parts of my website (stat cards, orders
   table, addresses, profile form, cart items). That's how real sites use
   jQuery — it quietly makes real features nicer. It is NOT a fake demo box.

   ============ THE 6 REQUIREMENTS — AND WHERE TO FIND EACH ONE ============
   Tip: press Ctrl+F and search "REQUIREMENT 1", "REQUIREMENT 2" ... to jump
   straight to any one during the Q&A.

     REQUIREMENT 1 — DOM TRAVERSAL          -> Recent Orders table (hover a row)
     REQUIREMENT 2 — DOM MODIFICATION       -> "Add New" address button
     REQUIREMENT 3 — ATTRIBUTE MODIFICATION -> "Lock / Unlock" profile form
     REQUIREMENT 4 — CSS MANIPULATION       -> dashboard stat cards (hover)
     REQUIREMENT 5 — JAVASCRIPT EFFECTS     -> Saved Addresses (click heading)
     REQUIREMENT 6 — HTML EVENTS            -> used everywhere (hover + click)
   =========================================================================

   $(function () { ... }) means "wait until the page has fully loaded, THEN run
   my code", so every LEGO brick is on the table before the magic hand reaches.
   ========================================================================== */

$(function () {

  /* ############################################################
     ##  REQUIREMENT 4 — CSS MANIPULATION                       ##
     ##  REQUIREMENT 6 — HTML EVENTS  (hover)                    ##
     ##  Real feature: the 4 dashboard stat cards               ##
     ############################################################
     WHAT THIS DOES (easy words):
       - "hover" is an EVENT = something the user does with the mouse.
         mouseenter = mouse came ON the card. mouseleave = mouse went OFF.
       - .css(...) changes how the card LOOKS.
       So: move the mouse onto a card and it lifts up with a soft blue shadow;
       move off and it goes back to normal.
       $(this) always means "the exact card the mouse is on right now". */
  $(".stat-card")
    .on("mouseenter", function () {                 // REQUIREMENT 6: an event
      $(this).css({                                 // REQUIREMENT 4: change look
        "transform": "translateY(-4px)",            //   lift the card up
        "box-shadow": "0 10px 24px rgba(45, 108, 255, .18)"  // soft blue shadow
      });
    })
    .on("mouseleave", function () {                 // REQUIREMENT 6: an event
      $(this).css({ "transform": "", "box-shadow": "" });    // put it back
    });


  /* ############################################################
     ##  REQUIREMENT 1 — DOM TRAVERSAL                          ##
     ##  Real feature: the "Recent Orders" table               ##
     ############################################################
     WHAT THIS DOES (easy words):
       "Traversal" = WALKING from one brick to the bricks next to it.
       When you hover one order row, we light it up, then .siblings() WALKS to
       the OTHER rows and fades them, so the one you're looking at stands out.
       (We anchor on "#ordersBody" because profile.js adds the rows in later —
        this way even new rows still get the effect.) */
  $("#ordersBody")
    .on("mouseenter", "tr", function () {
      $(this).css("background-color", "#eaf1ff");   // light up THIS row
      $(this).siblings().css("opacity", "0.5");     // REQUIREMENT 1: walk to the
                                                    //   other rows and fade them
    })
    .on("mouseleave", "tr", function () {
      $(this).css("background-color", "");          // undo the highlight
      $(this).siblings().css("opacity", "1");       // undo the fade
    });


  /* ############################################################
     ##  REQUIREMENT 2 — DOM MODIFICATION                       ##
     ##  Real feature: the "Add New" address button            ##
     ############################################################
     WHAT THIS DOES (easy words):
       Modification = ADDING or REMOVING things on the page.
       Before, "Add New" did nothing. Now each click .append()s (adds) a brand
       new address card to the addresses row. The card's Remove button then
       .remove()s (deletes) that card. A real, working feature. */
  var newAddressCount = 0;
  $("#addresses").on("click", ".btn-tz-outline", function () {
    newAddressCount = newAddressCount + 1;
    // Build one new address card (a Bootstrap column with a card inside):
    var card =
      '<div class="col-md-6">' +
        '<div class="address-card">' +
          '<span class="badge bg-secondary addr-tag">New</span>' +
          '<h3><i class="bi bi-geo-alt"></i> New Address ' + newAddressCount + '</h3>' +
          '<p>Tap Edit to fill in this address.</p>' +
          '<div class="addr-actions">' +
            '<button type="button" class="btn btn-sm btn-tz-light">Edit</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger addr-remove">Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    $("#addresses .row").append(card);              // REQUIREMENT 2: ADD the card
  });

  $("#addresses").on("click", ".addr-remove", function () {
    // .closest() walks UP to the whole column, then .remove() deletes it.
    $(this).closest(".col-md-6").remove();          // REQUIREMENT 2: REMOVE the card
  });


  /* ############################################################
     ##  REQUIREMENT 3 — DOM ATTRIBUTE MODIFICATION            ##
     ##  Real feature: a "Lock / Unlock" button on my form     ##
     ############################################################
     WHAT THIS DOES (easy words):
       An "attribute" is a setting inside a tag. "readonly" is a setting that
       means "you can look but not type here."
       We ADD a Lock button, and clicking it uses .attr() to switch the
       "readonly" setting ON or OFF for every text box — so you can lock your
       details to stop accidental edits, then unlock to change them. */
  var locked = false;
  $("#profileForm .form-buttons").append(           // (also adds a real button)
    '<button type="button" class="btn btn-tz-light" id="lockBtn">' +
    '<i class="bi bi-lock"></i> Lock details</button>'
  );

  $("#profileForm").on("click", "#lockBtn", function () {
    locked = !locked;                               // flip between true/false
    $("#profileForm input").attr("readonly", locked); // REQUIREMENT 3: change the
                                                    //   "readonly" attribute
    $(this).html(locked
      ? '<i class="bi bi-unlock"></i> Unlock to edit'
      : '<i class="bi bi-lock"></i> Lock details');  // update the button words
  });


  /* ############################################################
     ##  REQUIREMENT 5 — JAVASCRIPT EFFECTS                     ##
     ##  Real feature: the "Saved Addresses" heading           ##
     ############################################################
     WHAT THIS DOES (easy words):
       jQuery effects are little animations: .slideUp(), .slideDown(), .fadeIn()
       .slideToggle() folds the section SHUT if it's open, or OPENS it if shut.
       So clicking the heading neatly folds your addresses away and back.
       (400 = the speed of the animation in milliseconds.) */
  $("#addresses .block-title")
    .css("cursor", "pointer")                       // show it's clickable
    .on("click", function () {                      // REQUIREMENT 6: click event
      $("#addresses .row").slideToggle(400);        // REQUIREMENT 5: the effect
    });


  /* ############################################################
     ##  BONUS — the same techniques on the SHOPPING CART page  ##
     ##  Real feature: the cart items list                      ##
     ############################################################
     Uses HTML Events (hover) + CSS Manipulation (shadow) + DOM Traversal
     (.siblings) together: hover one cart item to spotlight it and gently fade
     the others. We anchor on "#cartItems" because cart.js draws the items in
     later, so this keeps working for every item. */
  $("#cartItems")
    .on("mouseenter", ".cart-item", function () {
      $(this).css("box-shadow", "0 6px 18px rgba(45, 108, 255, .15)");
      $(this).siblings(".cart-item").css("opacity", "0.6");  // traverse + fade
    })
    .on("mouseleave", ".cart-item", function () {
      $(this).css("box-shadow", "");
      $(this).siblings(".cart-item").css("opacity", "1");
    });

});
