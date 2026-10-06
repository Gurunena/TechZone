<?php
// Tell the browser (and jQuery) that the body is JSON, not HTML.
// jQuery sees this header and parses the response into a JS array for us.
header('Content-Type: application/json');

// Only GET is allowed here — reading data should never change it.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // 405 = Method Not Allowed
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// __DIR__ is the folder this file lives in (api/), so "../data" always
// points at the right file no matter which page made the request.
$file = __DIR__ . '/../data/products.json';

// 1. Read the raw JSON text from the file.
$json = file_get_contents($file);

// 2. Decode it. The "true" argument gives us associative arrays
//    ($product['name']) instead of objects ($product->name).
$data = json_decode($json, true);

// If the file is missing or contains broken JSON, stop with a 500 error
// so the frontend's .fail() handler can show a message.
if (!is_array($data)) {
    http_response_code(500); // 500 = Internal Server Error
    echo json_encode(['error' => 'Could not read the products data file']);
    exit;
}

// 3. Read the optional filters from the query string.
//    isset() checks the parameter exists; trim() removes stray spaces.
$brand    = isset($_GET['brand'])    ? trim($_GET['brand'])    : '';
$search   = isset($_GET['search'])   ? trim($_GET['search'])   : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$featured = isset($_GET['featured']) && $_GET['featured'] === '1';

$results = [];

foreach ($data as $product) {

    // ?brand= — exact brand match, ignoring upper/lower case.
    // strcasecmp() returns 0 when two strings are equal ignoring case.
    if ($brand !== '' && strcasecmp($product['brand'], $brand) !== 0) {
        continue; // skip this product, move on to the next one
    }

    // ?category= — exact category match, ignoring case.
    if ($category !== '' && strcasecmp($product['category'], $category) !== 0) {
        continue;
    }

    // ?search= — keyword appears anywhere in the name OR the brand.
    // stripos() is a case-insensitive "find this text"; it returns false
    // when the keyword is not found.
    if ($search !== '') {
        $inName  = stripos($product['name'],  $search) !== false;
        $inBrand = stripos($product['brand'], $search) !== false;
        if (!$inName && !$inBrand) {
            continue;
        }
    }

    // ?featured=1 — only products marked as featured.
    if ($featured && empty($product['featured'])) {
        continue;
    }

    // Passed every filter, so include it.
    $results[] = $product;
}

// 4. Send the (possibly filtered) array back as JSON.
echo json_encode($results);
