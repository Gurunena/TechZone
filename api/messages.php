<?php

header("Content-Type: application/json");

$jsonFile = "../data/messages.json";

/*
|--------------------------------------------------------------------------
| Read existing JSON data
|--------------------------------------------------------------------------
*/

if (!file_exists($jsonFile)) {
    echo json_encode([
        "success" => false,
        "message" => "JSON file not found."
    ]);
    exit;
}

$jsonData = file_get_contents($jsonFile);

$messages = json_decode($jsonData, true);

if (!is_array($messages)) {
    $messages = [];
}


/*
|--------------------------------------------------------------------------
| GET REQUEST
|--------------------------------------------------------------------------
| GET /api/messages.php
|     -> Return all messages
|
| GET /api/messages.php?id=1
|     -> Return one message
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    // Check whether an ID was provided
    if (isset($_GET["id"])) {

        $id = (int) $_GET["id"];

        foreach ($messages as $message) {

            if ($message["id"] === $id) {

                echo json_encode([
                    "success" => true,
                    "data" => $message
                ]);

                exit;
            }
        }

        // ID not found
        echo json_encode([
            "success" => false,
            "message" => "Message not found."
        ]);

        exit;
    }

    // No ID -> return all messages
    echo json_encode([
        "success" => true,
        "data" => $messages
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| POST REQUEST
|--------------------------------------------------------------------------
| Add a new message to messages.json
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON data."
        ]);

        exit;
    }


    // Check required fields
    if (
        empty($input["fullName"]) ||
        empty($input["email"]) ||
        empty($input["inquiryType"]) ||
        empty($input["message"])
    ) {

        echo json_encode([
            "success" => false,
            "message" => "All fields are required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Generate a new ID
    |--------------------------------------------------------------------------
    */

    $newId = 1;

    if (count($messages) > 0) {

        $ids = array_column($messages, "id");

        $newId = max($ids) + 1;
    }


    /*
    |--------------------------------------------------------------------------
    | Create new record
    |--------------------------------------------------------------------------
    */

    $newMessage = [
        "id" => $newId,
        "fullName" => $input["fullName"],
        "email" => $input["email"],
        "inquiryType" => $input["inquiryType"],
        "message" => $input["message"],
        "date" => date("Y-m-d")
    ];


    /*
    |--------------------------------------------------------------------------
    | Add new record to array
    |--------------------------------------------------------------------------
    */

    $messages[] = $newMessage;


    /*
    |--------------------------------------------------------------------------
    | Save updated array to JSON file
    |--------------------------------------------------------------------------
    */

    $updatedJson = json_encode(
        $messages,
        JSON_PRETTY_PRINT
    );

    if (file_put_contents($jsonFile, $updatedJson) === false) {

        echo json_encode([
            "success" => false,
            "message" => "Unable to save data."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Success response
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Message added successfully.",
        "data" => $newMessage
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Unsupported request method
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => false,
    "message" => "Invalid request method."
]);

?>