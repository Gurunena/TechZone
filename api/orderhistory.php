<?php

header("Content-Type: application/json");

$jsonFile = "../data/orderhistory.json";

if (!file_exists($jsonFile)) {
    echo json_encode([
        "success" => false,
        "message" => "Order history JSON file not found."
    ]);
    exit;
}

$jsonData = file_get_contents($jsonFile);

$orderHistory = json_decode($jsonData, true);

if (!is_array($orderHistory)) {
    $orderHistory = [];
}


/* GET REQUEST */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    // Get one order using order number
    if (isset($_GET["orderNumber"])) {

        $orderNumber = $_GET["orderNumber"];

        foreach ($orderHistory as $order) {

            if ($order["orderNumber"] === $orderNumber) {

                echo json_encode([
                    "success" => true,
                    "data" => $order
                ]);

                exit;
            }
        }

        echo json_encode([
            "success" => false,
            "message" => "Order not found."
        ]);

        exit;
    }

    // Get all orders
    echo json_encode([
        "success" => true,
        "data" => $orderHistory
    ]);

    exit;
}


/* POST REQUEST */

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
        empty($input["orderNumber"]) ||
        empty($input["productName"]) ||
        empty($input["category"]) ||
        empty($input["brand"]) ||
        empty($input["price"]) ||
        empty($input["quantity"]) ||
        empty($input["status"]) ||
        empty($input["orderDate"])
    ) {

        echo json_encode([
            "success" => false,
            "message" => "All required fields must be filled."
        ]);

        exit;
    }

    $newId = 1;

    if (count($orderHistory) > 0) {

        $ids = array_column($orderHistory, "id");

        $newId = max($ids) + 1;
    }

    $newOrder = [
        "id" => $newId,
        "orderNumber" => $input["orderNumber"],
        "productName" => $input["productName"],
        "category" => $input["category"],
        "brand" => $input["brand"],
        "price" => (int) $input["price"],
        "quantity" => (int) $input["quantity"],
        "status" => $input["status"],
        "orderDate" => $input["orderDate"]
    ];

    $orderHistory[] = $newOrder;

    $updatedJson = json_encode(
        $orderHistory,
        JSON_PRETTY_PRINT
    );

    if (file_put_contents($jsonFile, $updatedJson) === false) {

        echo json_encode([
            "success" => false,
            "message" => "Unable to save order history."
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Order added successfully.",
        "data" => $newOrder
    ]);

    exit;
}


/* INVALID REQUEST */

echo json_encode([
    "success" => false,
    "message" => "Invalid request method."
]);

?>