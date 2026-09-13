//Search Results JS loaded

const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").toLowerCase();
const heading = document.querySelector("h1");
heading.textContent = query
    ? `Search Results for "${query}"`
    : "Search Results";

const products = document.querySelectorAll("[data-product]");
const noResults = document.querySelector("#noResults");
let found = false;

const categoryFilter = document.querySelector("#categoryFilter");
const brandFilter = document.querySelector("#brandFilter");
const minPrice = document.querySelector("#minPrice");
const maxPrice = document.querySelector("#maxPrice");


function filterProducts(){
    found =false;
    const sortValue = document.querySelector("#sortFilter").value;
    const productArray = Array.from(products);

    if (sortValue === "price-low") {
    productArray.sort(function(a, b) {
        return Number(a.dataset.price) - Number(b.dataset.price);
    });
}
if (sortValue === "price-high") {
    productArray.sort(function(a, b) {
        return Number(b.dataset.price) - Number(a.dataset.price);
    });
}

const productContainer = products[0].parentElement.parentElement;

productArray.forEach(function(product) {
    productContainer.appendChild(product.parentElement);
});

productArray.forEach(function(product) {
    const name = product.dataset.product.toLowerCase();
    const category = product.dataset.category;
    const selectedCategory = categoryFilter.value;
    const brand = product.dataset.brand;
    const price = Number(product.dataset.price);
    
    const categoryMatch =
    selectedCategory === "All Categories" ||
    category === selectedCategory;

    const selectedBrand = brandFilter.value;

    const brandMatch =
    selectedBrand === "All Brands" ||
    brand === selectedBrand;

    const min = Number(minPrice.value) || 0;
    const max = Number(maxPrice.value) || Infinity;
    const priceMatch = price >= min && price <= max;

    const match =
    (query === "" || name.includes(query)) &&
    categoryMatch &&
    brandMatch &&
    priceMatch;

    if(match){
        found = true;
    }

    product.parentElement.style.display = match ? "" : "none";
});
productArray.forEach(function(product) {
    if (product.parentElement.style.display !== "none") {
        productContainer.appendChild(product.parentElement);
    }
});

noResults.style.display = found ? "none" : "";
}

categoryFilter.addEventListener("change", function() {
    filterProducts();
});

brandFilter.addEventListener("change", function() {
    filterProducts();
});

minPrice.addEventListener("input", function() {
    filterProducts();
});

maxPrice.addEventListener("input", function() {
    filterProducts();
});

const sortFilter = document.querySelector("#sortFilter");

sortFilter.addEventListener("change", function() {
    filterProducts();
});


filterProducts();