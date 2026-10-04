<?php
/* ==========================================================================
   TechZone — orders.php   (Class Task 5: JSON + AJAX + PHP)   by Latisha

   WHAT IS THIS FILE?
   This is the "server" part. The web page (front-end) sends it requests using
   AJAX, and this PHP file answers them. It reads and writes a JSON file that
   stores all the orders — so data is saved even after you close the page.

   IT HANDLES THREE THINGS:
     1. GET  (no id)      -> send back ALL orders
     2. GET  ?id=ORD-1001 -> send back ONE order
     3. POST              -> SAVE a new order into the JSON file

   KEY PHP FUNCTIONS USED:
     json_decode() -> turn the JSON text from the file into a PHP array
     json_encode() -> turn a PHP array back into JSON text (to send or save)
   ========================================================================== */

// Tell the browser we are sending back JSON (not a normal web page).
header('Content-Type: application/json');

// Where the JSON data file lives (one folder up, inside /data).
$file = __DIR__ . '/../data/orders.json';

/* Helper: read the JSON file and give back a PHP array of orders.
   file_get_contents() reads the text; json_decode(..., true) turns that
   JSON text into a PHP array we can loop through. */
function readOrders($file) {
    if (!file_exists($file)) {
        return array();                       // no file yet -> empty list
    }
    $text = file_get_contents($file);
    $orders = json_decode($text, true);        // JSON text -> PHP array
    return is_array($orders) ? $orders : array();
}

// Which kind of request is this? GET (asking for data) or POST (sending data)?
$method = $_SERVER['REQUEST_METHOD'];


/* ----------------------------------------------------------------------
   1) & 2)  GET  — read all orders, OR read one order by its id
   ---------------------------------------------------------------------- */
if ($method === 'GET') {
    $orders = readOrders($file);

    // If the page asked for a specific order, e.g. orders.php?id=ORD-1001
    if (isset($_GET['id'])) {
        $wanted = $_GET['id'];
        foreach ($orders as $o) {              // look through every order...
            if ($o['orderId'] === $wanted) {   // ...until we find a match
                echo json_encode($o);          // send back just that one
                exit;
            }
        }
        // No match found:
        http_response_code(404);
        echo json_encode(array("error" => "Order " . $wanted . " not found"));
        exit;
    }

    // No id given -> send back EVERY order.
    echo json_encode($orders);
    exit;
}


/* ----------------------------------------------------------------------
   3)  POST — add a new order and save it into the JSON file
   ---------------------------------------------------------------------- */
if ($method === 'POST') {
    $orders = readOrders($file);

    // The page sends the new order as JSON in the request body. Read it:
    $raw   = file_get_contents('php://input');
    $input = json_decode($raw, true);
    if (!is_array($input)) {
        $input = $_POST;                       // fallback: normal form fields
    }

    // Build the new order record (6+ details, same shape as the others).
    $newOrder = array(
        "orderId"  => "ORD-" . (count($orders) + 1001), // next order number
        "customer" => isset($input['customer']) ? $input['customer'] : 'Guest',
        "date"     => date('Y-m-d'),                      // today's date
        "items"    => isset($input['items'])    ? (int)$input['items'] : 1,
        "total"    => isset($input['total'])    ? (int)$input['total'] : 0,
        "payment"  => isset($input['payment'])  ? $input['payment'] : 'Card',
        "status"   => "Processing"
    );

    $orders[] = $newOrder;                      // add it to the list

    // Save the whole list back to the JSON file (pretty-printed so it's tidy).
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));

    // Tell the page it worked, and send back the order we just made.
    echo json_encode(array("success" => true, "order" => $newOrder));
    exit;
}


/* Any other request type is not allowed. */
http_response_code(405);
echo json_encode(array("error" => "Method not allowed"));
