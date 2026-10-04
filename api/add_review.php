<?php
header('Content-Type: application/json');

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


function textField($input, $key, $maxLength)
{
    if (!isset($input[$key]) || !is_scalar($input[$key])) {
        return '';
    }
    $value = trim(strip_tags((string) $input[$key]));
    return mb_substr($value, 0, $maxLength);
}

$productId = isset($input['productId']) ? $input['productId'] : '';
$name      = textField($input, 'name', 60);
$email     = textField($input, 'email', 120);
$text      = textField($input, 'text', 1000);
$rating    = isset($input['rating']) ? $input['rating'] : '';


// 2. Validation — collect every problem, then report them all at once.

$errors = [];

// The review has to belong to a product.
if (!is_numeric($productId) || (int) $productId < 1) {
    $errors[] = 'productId';
}

if ($name === '') { $errors[] = 'name'; }
if ($text === '') { $errors[] = 'text'; }

// Rating must be a whole number from 1 to 5.
if (!is_numeric($rating) || (int) $rating < 1 || (int) $rating > 5) {
    $errors[] = 'rating';
}

// The email is optional, but if one was sent it has to look like an email.
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'error'  => 'Missing or invalid field(s): ' . implode(', ', $errors),
        'fields' => $errors
    ]);
    exit;
}


// 3. Read the current reviews.

$file = __DIR__ . '/../data/reviews.json';
$data = json_decode(file_get_contents($file), true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read the reviews data file']);
    exit;
}


// 4. Next id = the highest id already used + 1.

$nextId = max(array_merge([0], array_column($data, 'id'))) + 1;


// 5. Build the new review. The SERVER decides the id and the date —

$newReview = [
    'id'        => $nextId,
    'productId' => (int) $productId,
    'name'      => $name,
    'email'     => $email,
    'rating'    => (int) $rating,
    'text'      => $text,
    'date'      => date('Y-m-d'),
    'verified'  => false
];

// [] = "append to the end of the array".
$data[] = $newReview;


// 6. Save the whole array back to disk.

$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($file, $json . "\n", LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not write to the reviews data file']);
    exit;
}


// 7. Success — 201 = Created. Send back the stored review, so the page can
//    confirm exactly what was saved (including the id and date PHP set).

http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Review by ' . $name . ' saved with id ' . $nextId,
    'review'  => $newReview
]);
