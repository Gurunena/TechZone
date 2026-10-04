<?php

header('Content-Type: application/json');

// Creating data must use POST — a GET request (e.g. typing the URL into the
// address bar) should never be able to add products.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 = Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// 1. Read the incoming data.
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400); // 400 = Bad Request
    echo json_encode(['error' => 'Request body must be valid JSON']);
    exit;
}

function textField($input, $key, $maxLength = 100)
{
    if (!isset($input[$key]) || !is_scalar($input[$key])) {
        return '';
    }
    $value = trim(strip_tags((string) $input[$key]));
    return mb_substr($value, 0, $maxLength);
}

$name      = textField($input, 'name');
$brand     = textField($input, 'brand', 40);
$processor = textField($input, 'processor');
$ram       = textField($input, 'ram', 20);
$storage   = textField($input, 'storage', 40);
$category  = textField($input, 'category', 40);
$price     = isset($input['price']) ? $input['price'] : '';


// 2. Validation — collect every problem, then report them all at once.

$errors = [];

if ($name === '')  { $errors[] = 'name'; }
if ($brand === '') { $errors[] = 'brand'; }

// is_numeric() accepts 199990 and "199990" but rejects "abc" and "".
if (!is_numeric($price) || $price <= 0) {
    $errors[] = 'price';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'error'  => 'Missing or invalid required field(s): ' . implode(', ', $errors),
        'fields' => $errors
    ]);
    exit;
}


// 3. Read the current list of products.

$file = __DIR__ . '/../data/products.json';
$data = json_decode(file_get_contents($file), true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read the products data file']);
    exit;
}

// 4. Next id = the highest id already used + 1.

$nextId = max(array_merge([0], array_column($data, 'id'))) + 1;

// A URL-friendly key for the cart/wishlist, e.g. "HP Envy 16" -> "hp-envy-16".
// The id is appended so two products with the same name never clash.
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $name), '-')) . '-' . $nextId;

// Build a short spec line for the product card, skipping empty parts.
$spec = implode(' / ', array_filter([$processor, $ram, $storage]));


// 5. Build the new product with the SAME fields as the existing ones, so the

$newProduct = [
    'id'        => $nextId,
    'slug'      => $slug,
    'name'      => $name,
    'brand'     => $brand,
    'category'  => $category !== '' ? $category : 'Laptops',
    'price'     => (int) round($price),
    'oldPrice'  => null,
    'processor' => $processor !== '' ? $processor : null,
    'ram'       => $ram !== '' ? $ram : null,
    'storage'   => $storage !== '' ? $storage : null,
    'gpu'       => null,
    'spec'      => $spec,
    'image'     => '',        // no upload in this form — the card shows a placeholder
    'rating'    => 0,         // brand-new product, no reviews yet
    'reviews'   => 0,
    'badge'     => 'New',
    'featured'  => false
];

// [] = "append to the end of the array".
$data[] = $newProduct;


// 6. Save the whole array back to disk.

$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($file, $json . "\n", LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not write to the products data file']);
    exit;
}


// 7. Success — 201 = Created. Return the stored product (with its new id).

http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Product "' . $name . '" added with id ' . $nextId,
    'product' => $newProduct
]);
