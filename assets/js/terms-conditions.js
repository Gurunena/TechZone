$(document).ready(function () {

    // ============================================================
    // EXISTING FUNCTIONALITY - CURRENT YEAR
    // ============================================================
    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }


    // ============================================================
    // EXISTING FUNCTIONALITY - LAST UPDATED YEAR
    // ============================================================
    const lastUpdated =
        document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent =
            new Date().getFullYear();
    }


    // ============================================================
    // TASK 1 - DOM TRAVERSAL
    // Find policy sections inside Terms content
    // ============================================================
    $("#termsContent").find(".policy-section");


    // ============================================================
    // TASK 2 - DOM MODIFICATION
    // Add a message to the page
    // ============================================================
    $("#termsDetails").prepend(
        '<div id="jqueryTermsMessage" class="alert alert-success mt-3">' +
        '<i class="bi bi-info-circle"></i> ' +
        'Please review the Terms & Conditions before using TechZone services.' +
        '</div>'
    );


    // ============================================================
    // TASK 3 - DOM ATTRIBUTE MODIFICATION
    // Modify Contact button attributes
    // ============================================================
    $("#termsContactBtn")
        .attr("title", "Contact TechZone Support")
        .attr("aria-label", "Contact TechZone Support");


    // ============================================================
    // TASK 4 - CSS MANIPULATION
    // Change section style when mouse enters
    // ============================================================
    $(".policy-section").on("mouseenter", function () {

        $(this).css({
            "border-left": "4px solid #0d6efd",
            "padding-left": "15px",
            "transition": "all 0.3s ease"
        });

    });


    // Return to normal style when mouse leaves
    $(".policy-section").on("mouseleave", function () {

        $(this).css({
            "border-left": "",
            "padding-left": ""
        });

    });


    // ============================================================
    // TASK 5 - JAVASCRIPT EFFECTS
    // Fade in the jQuery message
    // ============================================================
    $("#jqueryTermsMessage")
        .hide()
        .fadeIn(800);


    // ============================================================
    // TASK 6 - HTML EVENTS
    // Click Legal Information to show/hide Terms 1-11
    // ============================================================
    $("#legalInfoToggle").on("click", function () {

        $("#termsDetails").slideToggle(500);

        $(this).find("i").toggleClass(
            "bi-chevron-down bi-chevron-up"
        );

    });


    // ============================================================
    // EXTRA EVENT
    // Contact button click
    // ============================================================
    $("#termsContactBtn").on("click", function () {

        $("#jqueryTermsMessage")
            .stop(true, true)
            .fadeOut(300)
            .fadeIn(500);

    });


    // ============================================================
    // EXTRA EVENT
    // Click message to hide it
    // ============================================================
    $("#jqueryTermsMessage").on("click", function () {

        $(this).fadeOut(500);

    });


    // ============================================================
    // HIDE TERMS 1-11 ON PAGE LOAD
    // ============================================================
    $("#termsDetails").hide();

});
