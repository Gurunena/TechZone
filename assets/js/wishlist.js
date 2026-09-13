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
        image: "../assets/images/products/asus-tuf-f15.png",
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
        image: "../assets/images/products/ibuypower-gaming-pc.png",
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
        image: "../assets/images/products/acer-nitro-27.png",
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
        image: "../assets/images/products/samsung-970-evo-plus.png",
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
        image: "../assets/images/products/hyperx-cloud-ii.png",
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
   Initial Load
   ----------------------------------------- */

renderWishlist();