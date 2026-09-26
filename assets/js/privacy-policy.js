$(document).ready(function () {

    // =====================================================
    // EXISTING FUNCTIONALITY - CURRENT YEAR
    // =====================================================

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // =====================================================
    // EXISTING FUNCTIONALITY - LAST UPDATED
    // =====================================================

    const lastUpdated = document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent = new Date().getFullYear();
    }


    // =====================================================
    // TASK 1 - DOM TRAVERSAL
    // Find all policy sections inside policy content
    // =====================================================

    $(".policy-content").find(".policy-section");


    // =====================================================
    // TASK 2 - DOM MODIFICATION
    // Add a message dynamically to the page
    // =====================================================

    $(".policy-content").prepend(
        '<div id="jqueryPrivacyMessage" class="alert alert-success mt-3">' +
        '<i class="bi bi-shield-check"></i> ' +
        'Your privacy and personal information are important to TechZone.' +
        '</div>'
    );


    // =====================================================
    // TASK 3 - DOM ATTRIBUTE MODIFICATION
    // Change Contact Us button attributes
    // =====================================================

    $("#privacyContactBtn")
        .attr("title", "Contact TechZone Support")
        .attr("aria-label", "Contact TechZone Support");


    // =====================================================
    // TASK 4 - CSS MANIPULATION
    // Change CSS when mouse enters a policy section
    // =====================================================

    $(".policy-section").on("mouseenter", function () {

        $(this).css({
            "border-left": "4px solid #0d6efd",
            "padding-left": "15px",
            "transition": "all 0.3s ease"
        });

    });


    $(".policy-section").on("mouseleave", function () {

        $(this).css({
            "border-left": "",
            "padding-left": ""
        });

    });


    // =====================================================
    // TASK 5 - JAVASCRIPT EFFECTS
    // Fade in the dynamically added message
    // =====================================================

    $("#jqueryPrivacyMessage")
        .hide()
        .fadeIn(800);


    // =====================================================
    // TASK 6 - HTML EVENTS
    // Click event on Contact Us button
    // =====================================================

    $("#privacyContactBtn").on("click", function () {

        $("#jqueryPrivacyMessage")
            .stop(true, true)
            .fadeOut(300)
            .fadeIn(500);

    });


    // =====================================================
    // EXTRA EVENT
    // Click the privacy message to hide it
    // =====================================================

    $("#jqueryPrivacyMessage").on("click", function () {

        $(this).fadeOut(500);

    });

});
