

/* =========================================
   TECHZONE WISHLIST
   ========================================= */

const wishlistProducts = [
    {
        id: "asus-tuf-f15",
        name: "ASUS TUF Gaming F15",
        category: "Laptops",
        price: 289990,
        oldPrice: 309990,
        rating: 4.8,
        reviews: 24,
        image: "../assets/images/products/ASUS TUF Gaming F15.png",
        description: "Intel i5 / 16GB / 512GB SSD / RTX 4050",
        stock: "In Stock"
    },
    {
        id: "ibuypower-gaming-pc",
        name: "iBUYPOWER Gaming PC",
        category: "Gaming PCs",
        price: 399990,
        oldPrice: 429990,
        rating: 4.7,
        reviews: 18,
        image: "../assets/images/products/iBUYPOWER Gaming PC.avif",
        description: "Ryzen 5 5600 / 16GB / RTX 3060",
        stock: "In Stock"
    },
    {
        id: "acer-nitro-27",
        name: 'Acer Nitro 27" Monitor',
        category: "Peripherals",
        price: 74990,
        oldPrice: 84990,
        rating: 4.6,
        reviews: 32,
        image: "../assets/images/products/Acer Nitro.webp",
        description: "Full HD / 165Hz / 1ms",
        stock: "In Stock"
    },
    {
        id: "samsung-970-evo-plus",
        name: "Samsung 970 EVO Plus",
        category: "Components",
        price: 32990,
        oldPrice: 36990,
        rating: 4.9,
        reviews: 41,
        image: "../assets/images/products/Samsung 970 EVO Plus.webp",
        description: "1TB NVMe M.2 SSD",
        stock: "In Stock"
    },
    {
        id: "hyperx-cloud-ii",
        name: "HyperX Cloud II",
        category: "Peripherals",
        price: 24990,
        oldPrice: 29990,
        rating: 4.8,
        reviews: 27,
        image: "../assets/images/products/HyperX Cloud II.webp",
        description: "Gaming Headset",
        stock: "In Stock"
    }
];


/* -----------------------------------------
   Elements
   ----------------------------------------- */

const wishlistContainer =
    document.querySelector("#wishlistContainer");

const emptyWishlist =
    document.querySelector("#emptyWishlist");

const wishlistCount =
    document.querySelector("#wishlistCount");

const wishlistTotal =
    document.querySelector("#wishlistTotal");

const readyCount =
    document.querySelector("#readyCount");

const wishlistItemLabel =
    document.querySelector("#wishlistItemLabel");

const clearWishlistBtn =
    document.querySelector("#clearWishlistBtn");

const wishlistToast =
    document.querySelector("#wishlistToast");

const toastMessage =
    document.querySelector("#toastMessage");


/* -----------------------------------------
   Format Price
   ----------------------------------------- */

function formatWishlistPrice(price) {
    return "Rs. " + Number(price).toLocaleString("en-LK");
}


/* -----------------------------------------
   Toast
   ----------------------------------------- */

function showWishlistToast(message) {

    if (!wishlistToast || !toastMessage) return;

    toastMessage.textContent = message;

    wishlistToast.classList.add("show");

    setTimeout(function () {
        wishlistToast.classList.remove("show");
    }, 2500);
}


/* -----------------------------------------
   Render Wishlist
   ----------------------------------------- */

function renderWishlist() {

    if (!wishlistContainer) return;

    /*
       IMPORTANT:
       Get wishlist directly from global.js
       instead of using another localStorage key.
    */
    const wishlist = window.TZ
        ? TZ.getWishlist()
        : [];

    wishlistContainer.innerHTML = "";

    const savedProducts = wishlistProducts.filter(function (product) {
        return wishlist.includes(product.id);
    });


    /* Empty state */

    if (savedProducts.length === 0) {

        if (emptyWishlist) {
            emptyWishlist.style.display = "block";
        }

    } else {

        if (emptyWishlist) {
            emptyWishlist.style.display = "none";
        }
    }


    let totalValue = 0;


    /* -----------------------------------------
       Create Product Cards
       ----------------------------------------- */

    savedProducts.forEach(function (product) {

        totalValue += product.price;

        const discount = Math.round(
            ((product.oldPrice - product.price) /
            product.oldPrice) * 100
        );


        const card = document.createElement("div");

        card.className =
            "col-xl-4 col-lg-6 col-md-6";


        card.innerHTML = `

            <article class="wishlist-card">

                <div class="wishlist-image-wrapper">

                    <span class="discount-badge">
                        ${discount}% OFF
                    </span>

                    <button
                        type="button"
                        class="remove-wishlist"
                        data-remove="${product.id}"
                        aria-label="Remove ${product.name}">

                        <i class="bi bi-heart-fill"></i>

                    </button>


                    <a
                        href="../products/product-detail.html?id=${product.id}"
                        class="wishlist-product-link">

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            class="wishlist-product-image">

                    </a>

                </div>


                <div class="wishlist-card-body">

                    <span class="product-category">
                        ${product.category}
                    </span>

                    <h3>
                        <a
                            href="../products/product-detail.html?id=${product.id}">
                            ${product.name}
                        </a>
                    </h3>

                    <p class="product-description">
                        ${product.description}
                    </p>


                    <div class="product-rating">

                        <span class="stars">
                            ★★★★★
                        </span>

                        <span>
                            ${product.rating}
                        </span>

                        <span class="review-count">
                            (${product.reviews})
                        </span>

                    </div>


                    <div class="price-area">

                        <span class="current-price">
                            ${formatWishlistPrice(product.price)}
                        </span>

                        <span class="old-price">
                            ${formatWishlistPrice(product.oldPrice)}
                        </span>

                    </div>


                    <div class="stock-status">

                        <i class="bi bi-check-circle-fill"></i>

                        ${product.stock}

                    </div>


                    <div class="wishlist-actions">

                        <button
                            type="button"
                            class="add-cart-btn"
                            data-cart="${product.id}">

                            <i class="bi bi-bag-plus"></i>

                            Add to Cart

                        </button>


                        <button
                            type="button"
                            class="remove-text-btn"
                            data-remove="${product.id}">

                            <i class="bi bi-trash3"></i>

                        </button>

                    </div>

                </div>

            </article>

        `;


        wishlistContainer.appendChild(card);

    });


    /* -----------------------------------------
       Update Summary
       ----------------------------------------- */

    if (wishlistCount) {
        wishlistCount.textContent =
            savedProducts.length;
    }

    if (readyCount) {
        readyCount.textContent =
            savedProducts.length;
    }

    if (wishlistTotal) {
        wishlistTotal.textContent =
            formatWishlistPrice(totalValue);
    }

    if (wishlistItemLabel) {
        wishlistItemLabel.textContent =
            savedProducts.length === 1
                ? "1 item"
                : savedProducts.length + " items";
    }


    /* -----------------------------------------
       Header Wishlist Badge
       ----------------------------------------- */

    document
        .querySelectorAll("[data-tz-wishlist-count]")
        .forEach(function (badge) {

            badge.textContent =
                savedProducts.length;

            badge.dataset.count =
                savedProducts.length;

        });


    /* -----------------------------------------
       Remove Buttons
       ----------------------------------------- */

    document
        .querySelectorAll("[data-remove]")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const productId =
                    button.dataset.remove;

                if (window.TZ) {

                    /*
                       toggleWishlist removes it because
                       the product is already in wishlist.
                    */
                    TZ.toggleWishlist(productId);

                    TZ.refreshBadges();

                }

                renderWishlist();

                showWishlistToast(
                    "Product removed from wishlist."
                );

            });

        });


    /* -----------------------------------------
       Add To Cart
       ----------------------------------------- */

    document
        .querySelectorAll("[data-cart]")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const productId =
                    button.dataset.cart;

                const product =
                    wishlistProducts.find(function (item) {
                        return item.id === productId;
                    });


                if (product && window.TZ) {

                    TZ.addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image
                    });

                    TZ.refreshBadges();

                    showWishlistToast(
                        "Product added to cart."
                    );

                }

            });

        });

}


/* -----------------------------------------
   Clear Wishlist
   ----------------------------------------- */

if (clearWishlistBtn) {

    clearWishlistBtn.addEventListener(
        "click",
        function () {

            const wishlist =
                window.TZ
                    ? TZ.getWishlist()
                    : [];


            if (wishlist.length === 0) {

                showWishlistToast(
                    "Your wishlist is already empty."
                );

                return;
            }


            const confirmed = confirm(
                "Are you sure you want to clear your wishlist?"
            );


            if (confirmed) {

                /*
                   Use the same key as global.js.
                */
                localStorage.removeItem("tz_wishlist");

                if (window.TZ) {
                    TZ.refreshBadges();
                }

                renderWishlist();

                showWishlistToast(
                    "Wishlist cleared."
                );

            }

        }
    );

}


/* -----------------------------------------
   Load the full product catalogue from the API

   The wishlistProducts list above only holds the five featured products,
   so hearting anything else (any laptop, or a product added through the
   Add Product form) saved the id but showed nothing here - the filter in
   renderWishlist() could not find a matching record.

   api/get_products.php is the single source of truth for products, so the
   catalogue is fetched from there and merged over the list above. The five
   entries stay as a fallback: if the request fails the page still works
   the way it did before.
   ----------------------------------------- */

function loadWishlistCatalogue() {

    console.log("[AJAX] GET ../api/get_products.php (wishlist catalogue)");

    $.ajax({
        url: "../api/get_products.php",
        method: "GET",
        dataType: "json"
    })
        .done(function (products) {

            console.log("[AJAX] Catalogue for wishlist:", products);

            products.forEach(function (p) {

                /* Map a products.json record onto the shape this page uses.
                   Image paths in the JSON are relative to the site root,
                   and this page sits in account/, so they need "../". */
                const mapped = {
                    id: p.slug,
                    name: p.name,
                    category: p.category || "Products",
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                    rating: Number(p.rating) || 0,
                    reviews: Number(p.reviews) || 0,
                    image: p.image ? "../" + p.image : "",
                    description: p.spec ||
                        [p.processor, p.ram, p.storage].filter(Boolean).join(" / "),
                    stock: p.badge === "Out of Stock" ? "Out of Stock" : "In Stock"
                };

                const existing = wishlistProducts.findIndex(function (item) {
                    return item.id === mapped.id;
                });

                if (existing === -1) {
                    wishlistProducts.push(mapped);
                } else {
                    // Keep the hand-written image for the five originals,
                    // which point at files that are known to exist.
                    mapped.image = wishlistProducts[existing].image || mapped.image;
                    wishlistProducts[existing] = mapped;
                }
            });

            // Re-render now that every saved product can be resolved.
            renderWishlist();
        })
        .fail(function (xhr, textStatus) {

            console.error("[AJAX] Could not load the product catalogue:",
                xhr.status, textStatus, xhr.responseText);

            /* Only the five featured products can be shown, so say so
               rather than leaving saved items silently missing. */
            const saved = window.TZ ? TZ.getWishlist() : [];

            const missing = saved.filter(function (id) {
                return !wishlistProducts.some(function (p) { return p.id === id; });
            });

            if (missing.length && wishlistContainer) {
                const note = document.createElement("div");
                note.className = "col-12";
                note.innerHTML =
                    '<div class="alert alert-warning mb-0">' +
                    '<i class="bi bi-exclamation-triangle-fill"></i> ' +
                    missing.length + ' saved item(s) could not be loaded ' +
                    'because the product list is unavailable. ' +
                    'Is Apache running in XAMPP?' +
                    '</div>';
                wishlistContainer.appendChild(note);
            }
        });
}


/* -----------------------------------------
   Initial Load
   ----------------------------------------- */

// Render straight away with what is known, then fill in the rest.
renderWishlist();
loadWishlistCatalogue();

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 1
// DOM TRAVERSAL USING jQuery
// ============================================

$(document).ready(function () {

    // Select the first Wishlist product card
    const firstCard = $(".wishlist-card").first();

    // Traverse from the product card to its <h3> element
    const productTitle = firstCard.find("h3").text().trim();

    // Display the product name in the browser console
    console.log("First Wishlist Product:", productTitle);

});

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 2
// DOM MODIFICATION USING jQuery
// ============================================

$(document).ready(function () {

    // Select the Wishlist page heading
    const wishlistHeading = $(".wishlist-header h1");

    // Modify the existing heading text
    wishlistHeading.html('My <span> Wishlist</span>');

});

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 3
// ATTRIBUTE MODIFICATION USING jQuery
// ============================================

$(document).ready(function () {

    // Select the first Wishlist product image
    const firstImage = $(".wishlist-product-image").first();

    // Modify the alt attribute of the image
    firstImage.attr(
        "alt",
        "TechZone Wishlist Product"
    );

    // Display the updated attribute in the console
    console.log(
        "Updated Image Alt:",
        firstImage.attr("alt")
    );

});

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 4
// CSS MANIPULATION USING jQuery
// ============================================

$(document).ready(function () {

    // Select the Wishlist page heading
    const wishlistHeading = $(".wishlist-header h1");

    // Modify the CSS using jQuery
    wishlistHeading.css("letter-spacing", "1px");

    // Display a confirmation in the console
    console.log("CSS Manipulation Applied: Letter spacing changed.");

});

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 5
// JAVASCRIPT EFFECTS USING jQuery
// ============================================

$(document).ready(function () {

    // Select the Wishlist page header
    const wishlistHeader = $(".wishlist-header");

    // Apply a fade-in effect when the Wishlist page loads
    wishlistHeader.hide().fadeIn(800);

    // Display a confirmation in the console
    console.log("jQuery Effect Applied: Wishlist header faded in.");

});

// ============================================
// ASSIGNMENT 2 - REQUIREMENT 6
// HTML EVENTS USING jQuery
// ============================================

$(document).ready(function () {

    // Attach a click event to the existing
    // Clear Wishlist button
    $("#clearWishlistBtn").on("click", function () {

        // Display a message when the button is clicked
        console.log("Clear Wishlist button clicked.");

    });

});

// ============================================
// CLASS TASK 5 - JSON + AJAX
// WISHLIST SERVER DATA
// ============================================


// --------------------------------------------
// 1. GET ALL WISHLIST RECORDS
// --------------------------------------------

function loadWishlistFromServer() {

    $.ajax({
        url: "../api/wishlist.php",
        method: "GET",
        dataType: "json",

        success: function (response) {

            if (response.success) {

                console.log("All Wishlist Records:", response.data);

                displayServerWishlist(response.data);

            } else {

                console.log("Error:", response.message);

            }
        },

        error: function (xhr) {

            console.log("AJAX Error:", xhr.responseText);

        }
    });
}

function displayServerWishlist(records) {

    /*
       These are the records from data/wishlist.json, so they render into
       their OWN grid (#wishlistServerList). They used to be appended to
       #wishlistContainer, which is the list of products saved with the
       heart buttons - so the page showed server records the user had
       never added, and the summary total did not match the cards.
    */
    const serverContainer =
        document.querySelector("#wishlistServerList");

    if (!serverContainer) return;

    // Rebuild from scratch so a re-fetch after adding does not duplicate.
    serverContainer.innerHTML = "";


    records.forEach(function (item) {

        /*
           Find the matching TechZone product
           using the product name from JSON.
        */

        const matchedProduct = wishlistProducts.find(function (product) {

            return product.name.toLowerCase().trim() ===
                   item.productName.toLowerCase().trim();

        });


        /*
           Use the real TechZone product details
           if a matching product is found.
        */

        const productImage = matchedProduct
            ? matchedProduct.image
            : "../assets/images/products/default-product.png";


        const productName = matchedProduct
            ? matchedProduct.name
            : item.productName;


        const productCategory = matchedProduct
            ? matchedProduct.category
            : item.category;


        const productDescription = matchedProduct
            ? matchedProduct.description
            : item.brand;


        const productPrice = matchedProduct
            ? matchedProduct.price
            : Number(item.price);


        const productOldPrice = matchedProduct
            ? matchedProduct.oldPrice
            : Number(item.price);


        const productRating = matchedProduct
            ? matchedProduct.rating
            : "N/A";


        const productReviews = matchedProduct
            ? matchedProduct.reviews
            : 0;


        const productStock = matchedProduct
            ? matchedProduct.stock
            : item.availability;


        /*
           Check whether this product is already displayed.
        */

        const alreadyExists = Array.from(
            serverContainer.querySelectorAll(
                ".wishlist-card h3"
            )
        ).some(function (title) {

            return title.textContent.trim() === productName;

        });


        if (alreadyExists) {
            return;
        }


        /*
           Calculate discount.
        */

        let discount = 0;

        if (productOldPrice > productPrice) {

            discount = Math.round(
                ((productOldPrice - productPrice) /
                productOldPrice) * 100
            );

        }


        /*
           Create wishlist card.
        */

        const card = document.createElement("div");

        card.className =
            "col-xl-4 col-lg-6 col-md-6";


        card.innerHTML = `

            <article class="wishlist-card">

                <div class="wishlist-image-wrapper">

                    <span class="discount-badge">

                        ${
                            discount > 0
                                ? discount + "% OFF"
                                : "SAVED"
                        }

                    </span>


                    <div class="wishlist-product-image
                                d-flex
                                align-items-center
                                justify-content-center">

                        <img
                            src="${productImage}"
                            alt="${productName}"
                            class="wishlist-product-image">

                    </div>

                </div>


                <div class="wishlist-card-body">

                    <span class="product-category">

                        ${productCategory}

                    </span>


                    <h3>

                        ${productName}

                    </h3>


                    <p class="product-description">

                        ${productDescription}

                    </p>


                    <div class="product-rating">

                        <span class="stars">

                            ★★★★★

                        </span>

                        <span>

                            ${productRating}

                        </span>

                        <span class="review-count">

                            (${productReviews})

                        </span>

                    </div>


                    <div class="price-area">

                        <span class="current-price">

                            Rs.
                            ${Number(productPrice)
                                .toLocaleString("en-LK")}

                        </span>


                        ${
                            productOldPrice > productPrice
                                ? `
                                    <span class="old-price">

                                        Rs.
                                        ${Number(productOldPrice)
                                            .toLocaleString("en-LK")}

                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <div class="stock-status">

                        <i class="bi bi-check-circle-fill"></i>

                        ${productStock}

                    </div>

                </div>

            </article>

        `;


        serverContainer.appendChild(card);

    });

    /*
       The header count and the "Your wishlist is empty" message belong to
       the heart-button wishlist, which renderWishlist() keeps up to date.
       This function used to overwrite both with the number of server
       records, which made the count disagree with the saved products.
    */

}

// --------------------------------------------
// 2. GET ONE WISHLIST RECORD
// --------------------------------------------

function getWishlistItem(id) {

    $.ajax({
        url: "../api/wishlist.php?id=" + id,
        method: "GET",
        dataType: "json",

        success: function (response) {

            if (response.success) {

                console.log("Single Wishlist Record:", response.data);

            } else {

                console.log("Error:", response.message);

            }
        },

        error: function (xhr) {

            console.log("AJAX Error:", xhr.responseText);

        }
    });
}


// --------------------------------------------
// 3. POST - ADD NEW WISHLIST RECORD
// --------------------------------------------

function addWishlistItem() {

    const wishlistData = {

        productName: $("#wishlistProductName").val(),

        category: $("#wishlistCategory").val(),

        brand: $("#wishlistBrand").val(),

        price: $("#wishlistPrice").val(),

        quantity: $("#wishlistQuantity").val(),

        availability: $("#wishlistAvailability").val()

    };


    $.ajax({

        url: "../api/wishlist.php",

        method: "POST",

        contentType: "application/json",

        data: JSON.stringify(wishlistData),

        dataType: "json",

        success: function (response) {

            if (response.success) {

                $("#wishlistServerMessage")
                    .text(response.message)
                    .removeClass("text-danger")
                    .addClass("text-success");

                console.log(
                    "New Wishlist Record:",
                    response.data
                );

                // Clear form
                $("#wishlistServerForm")[0].reset();

                // Reload all records
                loadWishlistFromServer();

            } else {

                $("#wishlistServerMessage")
                    .text(response.message)
                    .removeClass("text-success")
                    .addClass("text-danger");
            }
        },

        error: function (xhr) {

            console.log("AJAX Error:", xhr.responseText);

            $("#wishlistServerMessage")
                .text("Unable to connect to the server.")
                .removeClass("text-success")
                .addClass("text-danger");

        }

    });

}


// --------------------------------------------
// 4. FORM SUBMIT EVENT
// --------------------------------------------

$(document).ready(function () {

    $("#wishlistServerForm").on("submit", function (event) {

        event.preventDefault();

        addWishlistItem();

    });

});


// --------------------------------------------
// 5. LOAD ALL RECORDS WHEN PAGE LOADS
// --------------------------------------------

$(document).ready(function () {

    loadWishlistFromServer();

});