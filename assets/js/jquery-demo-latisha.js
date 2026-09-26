/* ==========================================================================
   TechZone — jquery-demo.js   (Class Task 4: jQuery)

   ~~~ READ ME LIKE A STORY ~~~

   WHAT IS jQUERY?
   Imagine the web page is a big box of LEGO. Every button, every word,
   every picture is one LEGO brick. jQuery is like a magic hand that can
   grab any brick and change it — its colour, where it is, or make it
   disappear.

   THE MAGIC WORD IS  $
   $ means "jQuery, go grab something for me."
     $("#hello")   = grab the ONE brick whose id is "hello"   (# means id)
     $(".box")     = grab EVERY brick with the class "box"     (. means class)
   After you grab a brick, you tell it what to do with a dot:
     $("#hello").hide();   =  grab #hello, then hide it.

   THIS PAGE HAS 6 LITTLE TOYS. Each toy shows one thing the teacher asked
   for. Click a button and watch what happens. The 6 things are:
     1. DOM Traversal            (walk to a brick's neighbours)
     2. DOM Modification         (add or remove bricks)
     3. Attribute Modification   (change a setting inside a brick)
     4. CSS Manipulation         (change how a brick looks, like colour)
     5. JavaScript Effects       (make bricks slide and fade like magic)
     6. HTML Events              (do something when the user clicks or types)

   ONE MORE THING:
     $(function () { ...your code... });
   This means: "Wait until the WHOLE page has finished loading, THEN start."
   If we didn't wait, our magic hand might reach for a LEGO brick that isn't
   on the table yet, and grab nothing.
   ========================================================================== */

$(function () {

  /* ====================================================================
     TOY 1 — DOM TRAVERSAL   ("walk to the neighbours")

     "Traversal" is a big word that just means WALKING from one brick to
     the bricks next to it — like standing on a stair and stepping to the
     stairs above and below, without knowing their names.

     Our list has 3 items. When you click the button:
       - .eq(1)      -> stand on the MIDDLE item.
                        (computers count 0,1,2 — so 1 is the 2nd = middle)
       - .siblings() -> WALK to the items next to it (its brothers/sisters)
       - .css(...)   -> paint those neighbours so you can see who they are
     ==================================================================== */
  $("#jqTravBtn").on("click", function () {
    var middle = $("#jqTravList li").eq(1);      // stand on the middle item
    middle.siblings().css({                       // walk to its neighbours...
      "background-color": "#eaf1ff",              // ...and paint them light blue
      "font-weight": "600"
    });
    middle.css({ "background-color": "#fff3cd" }); // paint the middle one yellow
  });


  /* ====================================================================
     TOY 2 — DOM MODIFICATION   ("add or take away bricks")

     Modification means CHANGING what is on the page by ADDING new bricks
     or REMOVING bricks.
       - .append("<li>...</li>") -> stick a NEW item on the END of the list
       - .remove()               -> take an item AWAY

     "itemCount" is just a number we keep so each new item gets the next
     number (Item 2, Item 3, ...). It starts at 1 because the page already
     shows "Item 1".
     ==================================================================== */
  var itemCount = 1;

  $("#jqAddBtn").on("click", function () {
    itemCount = itemCount + 1;                    // next number
    // Build a brand-new list item and stick it on the end of the list.
    $("#jqModList").append('<li class="list-group-item">Item ' + itemCount + "</li>");
  });

  $("#jqRemoveBtn").on("click", function () {
    // Only remove if there is at least one item left (so we don't error).
    if ($("#jqModList li").length > 0) {          // .length = how many items
      $("#jqModList li:last-child").remove();      // take away the LAST one
      if (itemCount > 0) itemCount = itemCount - 1;
    }
  });


  /* ====================================================================
     TOY 3 — ATTRIBUTE MODIFICATION   ("change a setting inside a brick")

     An "attribute" is a little setting written inside a tag. For a link
     <a href="..."> the href is the setting that says WHERE the link goes.
       - .attr("href", "...")  -> change WHERE the link goes
       - .attr("target","_blank") -> make it open in a NEW tab
       - .text("...")          -> change the words you can read
     ==================================================================== */
  $("#jqAttrBtn").on("click", function () {
    $("#jqAttrLink")
      .attr("href", "../index.html")              // now it goes to the home page
      .attr("target", "_blank")                   // open in a new tab
      .text("Now I open TechZone home ↗");   // change the visible words
  });


  /* ====================================================================
     TOY 4 — CSS MANIPULATION   ("change how a brick LOOKS")

     CSS is the "look" of things — colour, size, spacing. jQuery can change
     the look straight away with .css("what", "value").
       - .css("color", "red")  -> make the text red

     We keep a little list of colours. Each click moves to the NEXT colour,
     and when we reach the end it loops back to the start.
     ==================================================================== */
  var colours = ["#2d6cff", "#1f9d55", "#e0245e", "#7a3fe0", "#131a2b"];
  var colourIndex = 0;

  $("#jqCssBtn").on("click", function () {
    colourIndex = (colourIndex + 1) % colours.length;   // step to next colour
    $("#jqCssText").css("color", colours[colourIndex]);  // paint the words
  });


  /* ====================================================================
     TOY 5 — JAVASCRIPT EFFECTS   ("magic sliding and fading")

     jQuery has built-in "effects" — little animations it does for you:
       .hide()  .show()  .fadeIn()  .fadeOut()  .slideUp()  .slideDown()
       .slideToggle()  -> if the box is open it slides shut; if shut, it
                          slides open. "Toggle" means "flip to the opposite".
     The 400 is the SPEED in milliseconds (400 = a bit under half a second).
     ==================================================================== */
  $("#jqEffectBtn").on("click", function () {
    $("#jqEffectBox").slideToggle(400);           // slide the box open/shut
  });


  /* ====================================================================
     TOY 6 — HTML EVENTS   ("do something WHEN the user does something")

     An "event" is a thing the user DOES: click a button, move the mouse,
     or type on the keyboard. .on("event", function(){...}) says
     "WHEN this event happens, run this code."

     Every button above already uses the "click" event. Here we use a
     DIFFERENT one: "keyup" happens each time you lift a finger off a key.
     So as you type your name, the greeting changes on every letter.
       - $(this) -> the box the user is typing in (the one that fired the event)
       - .val()  -> read the text inside that box
       - .text() -> put words into the greeting
     ==================================================================== */
  $("#jqEventInput").on("keyup", function () {
    var typed = $(this).val();                    // read what they typed
    // If the box is empty, say "stranger"; otherwise say their name.
    $("#jqEventOut").text(typed === "" ? "stranger" : typed);
  });

});
