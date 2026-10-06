const trackButton = document.querySelectorAll(".track-btn");
const trackingSection = document.querySelector("#trackingSection");

trackButton.forEach(function(button){
    button.addEventListener("click", function() {
           
        const orderNumber = button.dataset.order;
            let status = "Shipped";
            if (orderNumber === "TZ1002") {
            status = "Delivered";
}
const orderCard = button.parentElement;
const orderStatus = orderCard.querySelector("strong");

orderStatus.textContent = status;

        trackingSection.querySelector("h3").textContent =
            "Order #" + orderNumber;
        
            trackingSection.querySelector("p").innerHTML =
        "Current Status: <strong>" + status + "</strong>";

        const steps = document.querySelectorAll(".step");

const currentStatus = status;

const statusIndex = ["Ordered", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"]
    .indexOf(currentStatus);

steps.forEach(function(step, index) {

    step.classList.remove("completed");
    if (index <= statusIndex) {
        step.classList.add("completed");
    }

});
    
        trackingSection.scrollIntoView({
        behavior: "smooth"
        });
    });
});

// ============================================
// REQUIREMENT 1
// DOM TRAVERSAL USING jQuery
// ============================================

$(document).ready(function () {

    // Select the first order card
    const firstOrder = $(".order-card").first();

    // Traverse from the order card to find the order number
    const orderNumber = firstOrder.find("h3").text().trim();

    // Display the order number in the console
    console.log("First Order:", orderNumber);

});

// ============================================
//  REQUIREMENT 2
// DOM MODIFICATION USING jQuery
// ============================================

$(document).ready(function () {

    // Select the Order History page heading
    const orderHeading = $(".order-page-title");

    // Modify the existing heading using jQuery
    orderHeading.html('<span>Order History</span> <strong>&amp; Tracking</strong>');

    // Display a confirmation in the console
    console.log("DOM Modification Applied: Order heading updated.");

});



// ATTRIBUTE MODIFICATION USING jQuery

$(document).ready(function () {

    // Select the first Track Order button
    const firstTrackButton = $(".track-btn").first();

    // Modify the button's title attribute
    firstTrackButton.attr(
        "title",
        "Track your TechZone order"
    );

    // Display the updated attribute in the console
    console.log(
        "Updated Button Title:",
        firstTrackButton.attr("title")
    );

});



// CSS MANIPULATION USING jQuery

$(document).ready(function () {

    // Select the Order History page heading
    const orderHeading = $(".order-page-title");

    // Modify the CSS using jQuery
    orderHeading.css("letter-spacing", "1px");

    // Display a confirmation in the console
    console.log(
        "CSS Manipulation Applied: Letter spacing changed."
    );

});


// JAVASCRIPT EFFECTS USING jQuery


$(document).ready(function () {

    // Select the Order History page header
    const orderHeader = $(".order-page-title");

    // Apply a fade-in effect when the page loads
    orderHeader.hide().fadeIn(800);

    // Display a confirmation in the console
    console.log(
        "jQuery Effect Applied: Order History heading faded in."
    );

});


// HTML EVENTS USING jQuery


$(document).ready(function () {

    // Attach a click event to the existing Track Order buttons
    $(".track-btn").on("click", function () {

        // Get the order number from the button
        const orderNumber = $(this).data("order");

        // Display a message when the button is clicked
        console.log(
            "Track Order button clicked for:",
            orderNumber
        );

    });

});

// CLASS TASK 5 - JSON + AJAX
// ORDER HISTORY SERVER DATA



// GET ALL ORDER RECORDS
function loadOrderHistoryFromServer() {

    $.ajax({
        url: "api/orderhistory.php",
        method: "GET",
        dataType: "json",

        success: function (response) {

            if (response.success) {

                console.log(
                    "All Order History Records:",
                    response.data
                );

            } else {

                console.log(
                    "Error:",
                    response.message
                );

            }
        },

        error: function (xhr) {

            console.log(
                "AJAX Error:",
                xhr.responseText
            );

        }
    });
}


// GET ONE ORDER RECORD
function getOrderHistoryItem(orderNumber) {

    $.ajax({
        url: "api/orderhistory.php?orderNumber=" + orderNumber,
        method: "GET",
        dataType: "json",

        success: function (response) {

            if (response.success) {

                console.log(
                    "Single Order Record:",
                    response.data
                );

            } else {

                console.log(
                    "Error:",
                    response.message
                );

            }
        },

        error: function (xhr) {

            console.log(
                "AJAX Error:",
                xhr.responseText
            );

        }
    });
}


// ADD NEW ORDER RECORD
function addOrderHistoryItem() {

    const orderData = {

        orderNumber: $("#orderNumber").val(),
        productName: $("#orderProductName").val(),
        category: $("#orderCategory").val(),
        brand: $("#orderBrand").val(),
        price: $("#orderPrice").val(),
        quantity: $("#orderQuantity").val(),
        status: $("#orderStatus").val(),
        orderDate: $("#orderDate").val()

    };


    $.ajax({

        url: "api/orderhistory.php",
        method: "POST",

        contentType: "application/json",

        data: JSON.stringify(orderData),

        dataType: "json",

        success: function (response) {

            if (response.success) {

                $("#orderServerMessage")
                    .text(response.message)
                    .removeClass("text-danger")
                    .addClass("text-success");

                console.log(
                    "New Order Record:",
                    response.data
                );


                // Clear the form
                $("#orderServerForm")[0].reset();


                // Load updated records
                loadOrderHistoryFromServer();

            } else {

                $("#orderServerMessage")
                    .text(response.message)
                    .removeClass("text-success")
                    .addClass("text-danger");

            }

        },

        error: function (xhr) {

            console.log(
                "AJAX Error:",
                xhr.responseText
            );

            $("#orderServerMessage")
                .text("Unable to connect to the server.")
                .removeClass("text-success")
                .addClass("text-danger");

        }

    });
}


// FORM SUBMIT EVENT
$(document).ready(function () {

    $("#orderServerForm").on("submit", function (event) {

        event.preventDefault();

        addOrderHistoryItem();

    });

});


// LOAD ALL ORDERS WHEN PAGE LOADS
$(document).ready(function () {

    loadOrderHistoryFromServer();

});