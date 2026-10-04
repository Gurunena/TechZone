<?php

header("Content-Type: application/json");

$jsonFile = "../data/wishlist.json";

if (!file_exists($jsonFile)) {
    echo json_encode([
        "success" => false,
        "message" => "JSON file not found."
    ]);
    exit;
}

$jsonData = file_get_contents($jsonFile);

$wishlist = json_decode($jsonData, true);

if (!is_array($wishlist)) {
    $wishlist = [];
}


/* =========================
   GET REQUEST
   ========================= */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    /* Get one record */
    if (isset($_GET["id"])) {

        $id = (int) $_GET["id"];

        foreach ($wishlist as $item) {

            if ($item["id"] === $id) {

                echo json_encode([
                    "success" => true,
                    "data" => $item
                ]);

                exit;
            }
        }

        echo json_encode([
            "success" => false,
            "message" => "Wishlist item not found."
        ]);

        exit;
    }

    /* Get all records */
    echo json_encode([
        "success" => true,
        "data" => $wishlist
    ]);

    exit;
}


/* =========================
   POST REQUEST
   ========================= */

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!$input) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON data."
        ]);

        exit;
    }

    if (
        empty($input["productName"]) ||
        empty($input["category"]) ||
        empty($input["brand"]) ||
        empty($input["price"]) ||
        empty($input["quantity"])
    ) {

        echo json_encode([
            "success" => false,
            "message" => "All required fields must be filled."
        ]);

        exit;
    }


    /* Generate new ID */

    $newId = 1;

    if (count($wishlist) > 0) {

        $ids = array_column($wishlist, "id");

        $newId = max($ids) + 1;
    }


    /* Create new record */

    $newItem = [

        "id" => $newId,

        "productName" => $input["productName"],

        "category" => $input["category"],

        "brand" => $input["brand"],

        "price" => (int) $input["price"],

        "quantity" => (int) $input["quantity"],

        "availability" => $input["availability"] ?? "In Stock",

        "dateAdded" => date("Y-m-d")
    ];


    /* Add record to array */

    $wishlist[] = $newItem;


    /* Update JSON file */

    $updatedJson = json_encode(
        $wishlist,
        JSON_PRETTY_PRINT
    );

    if (
        file_put_contents(
            $jsonFile,
            $updatedJson
        ) === false
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Unable to save wishlist data."
        ]);

        exit;
    }


    echo json_encode([

        "success" => true,

        "message" => "Wishlist item added successfully.",

        "data" => $newItem

    ]);

    exit;
}


/* Invalid request */

echo json_encode([

    "success" => false,

    "message" => "Invalid request method."

]);

?>