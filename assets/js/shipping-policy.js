document.addEventListener("DOMContentLoaded", function () {

    // Current year
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Last updated year
    const lastUpdated = document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent = new Date().getFullYear();
    }

});
