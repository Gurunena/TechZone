$(document).ready(function () {

    // =====================================================
    // EXISTING FUNCTIONALITY - CURRENT YEAR
    // =====================================================

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // =====================================================
    // EXISTING FUNCTIONALITY - LAST UPDATED YEAR
    // =====================================================

    const lastUpdated = document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent = new Date().getFullYear();
    }


    // =====================================================
    // TASK 1 - DOM TRAVERSAL
    // Find policy sections inside shipping content
    // =====================================================

    $("#shippingContent").find(".policy-section");


    // =====================================================
    // TASK 2 - DOM MODIFICATION
    // Add a message to the shipping content
    // =====================================================

    $("#shippingDetails").prepend(
        '<div id="jqueryShippingMessage" class="alert alert-success mt-3">' +
        '<i class="bi bi-truck"></i> ' +
        'TechZone provides reliable delivery services across Sri Lanka.' +
        '</div>'
    );


    // =====================================================
    // TASK 3 - DOM ATTRIBUTE MODIFICATION
    // Change contact button attributes
    // =====================================================

    $("#shippingContactBtn")
        .attr("title", "Contact TechZone Shipping Support")
        .attr("aria-label", "Contact TechZone Shipping Support");


    // =====================================================
    // TASK 4 - CSS MANIPULATION
    // Change CSS when mouse enters a section
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
    // Fade in the message
    // =====================================================

    $("#jqueryShippingMessage")
        .hide()
        .fadeIn(800);


    // =====================================================
    // TASK 6 - HTML EVENT
    // Click Legal Information to show/hide
    // shipping topics 1-7
    // =====================================================

    $("#legalInfoToggle").on("click", function () {

        $("#shippingDetails").slideToggle(500);

        $(this).find("i").toggleClass(
            "bi-chevron-down bi-chevron-up"
        );

    });


    // =====================================================
    // EXTRA HTML EVENT
    // Contact button click
    // =====================================================

    $("#shippingContactBtn").on("click", function () {

        $("#jqueryShippingMessage")
            .stop(true, true)
            .fadeOut(300)
            .fadeIn(500);

    });


    // =====================================================
    // EXTRA EVENT
    // Click message to hide it
    // =====================================================

    $("#jqueryShippingMessage").on("click", function () {

        $(this).fadeOut(500);

    });


    // =====================================================
    // HIDE SHIPPING DETAILS ON PAGE LOAD
    // =====================================================

    $("#shippingDetails").hide();

});
