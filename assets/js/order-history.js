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

