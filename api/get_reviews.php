<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // 405 = Method Not Allowed
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// 1. Validate the id. ctype_digit() makes sure it is a whole positive
//    number, so "?productId=abc" is rejected instead of silently
//    returning every review.
$idParam = isset($_GET['productId']) ? trim($_GET['productId']) : '';

if ($idParam === '' || !ctype_digit($idParam)) {
    http_response_code(400); // 400 = Bad Request
    echo json_encode(['error' => 'A numeric productId is required']);
    exit;
}

$productId = (int) $idParam;

// 2. Read and decode the reviews file.
$file = __DIR__ . '/../data/reviews.json';
$data = json_decode(file_get_contents($file), true);

if (!is_array($data)) {
    http_response_code(500); // 500 = Internal Server Error
    echo json_encode(['error' => 'Could not read the reviews data file']);
    exit;
}

// 3. Filter: keep the reviews written about THIS product.

$reviews = [];
foreach ($data as $review) {
    if ((int) $review['productId'] === $productId) {
        unset($review['email']);
        $reviews[] = $review;
    }
}

// 4. Newest review first, matching how the page prepends new ones.

usort($reviews, function ($a, $b) {
    $byDate = strcmp($b['date'], $a['date']);
    // Two reviews on the same day: the higher id (added later) wins.
    return $byDate !== 0 ? $byDate : ((int) $b['id'] - (int) $a['id']);
});

// An empty array is a perfectly valid answer here — json_encode([])
// sends "[]" and the frontend shows its "no reviews yet" message.
echo json_encode($reviews);
