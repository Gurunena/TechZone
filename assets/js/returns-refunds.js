document.addEventListener("DOMContentLoaded", function() {

    const currentYear = 
        document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }

    const lastUpdated = 
        document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent =
            new Date().getFullYear();
    }
    
});
