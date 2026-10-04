<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // 405 = Method Not Allowed
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// 1. The id arrives as text in the URL, e.g. "3".
//    ctype_digit() makes sure it is a whole positive number (no "abc", no "-1"),
//    then (int) converts "3" into the number 3 so it can be compared to the JSON.
$idParam = isset($_GET['id']) ? trim($_GET['id']) : '';

if ($idParam === '' || !ctype_digit($idParam)) {
    http_response_code(400); // 400 = Bad Request (the caller sent a bad id)
    echo json_encode(['error' => 'A numeric product id is required']);
    exit;
}

$id = (int) $idParam;

// 2. Read and decode the data file (same as get_products.php).
$file = __DIR__ . '/../data/products.json';
$data = json_decode(file_get_contents($file), true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read the products data file']);
    exit;
}

// 3. Linear search: check each product's id until we find a match.
foreach ($data as $product) {
    if ((int) $product['id'] === $id) {
        // 4a. Found it — send just this one product and stop the script.
        echo json_encode($product);
        exit;
    }
}

// 4b. The loop finished without finding the id.
http_response_code(404); // 404 = Not Found
echo json_encode(['error' => 'Product not found']);
