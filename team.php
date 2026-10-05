<?php
// api/team.php - JSON "database" endpoint for the Team Directory (Class Task 5)
//   GET  api/team.php           -> all records
//   GET  api/team.php?id=2      -> one record
//   POST api/team.php           -> add a record (name, role, department, email, joined)
header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . '/../data/team.json';

function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if (!file_exists($file)) {
    respond(500, ['success' => false, 'message' => 'Data file not found.']);
}

$method = $_SERVER['REQUEST_METHOD'];

// ---------- READ (all / one) ----------
if ($method === 'GET') {
    $records = json_decode(file_get_contents($file), true);
    if (!is_array($records)) {
        respond(500, ['success' => false, 'message' => 'Data file is not valid JSON.']);
    }

    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $id = (int) $_GET['id'];
        foreach ($records as $r) {
            if ($r['id'] === $id) {
                respond(200, ['success' => true, 'data' => $r]);
            }
        }
        respond(404, ['success' => false, 'message' => "No member found with ID $id."]);
    }

    respond(200, ['success' => true, 'data' => $records]);
}

// ---------- ADD (POST) ----------
if ($method === 'POST') {
    $name       = trim($_POST['name'] ?? '');
    $role       = trim($_POST['role'] ?? '');
    $department = trim($_POST['department'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $joined     = (int) ($_POST['joined'] ?? 0);

    if ($name === '' || $role === '' || $department === '' || $email === '') {
        respond(400, ['success' => false, 'message' => 'Please fill in all fields.']);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(400, ['success' => false, 'message' => 'Please enter a valid email address.']);
    }
    if ($joined < 2000 || $joined > (int) date('Y')) {
        respond(400, ['success' => false, 'message' => 'Year joined must be between 2000 and ' . date('Y') . '.']);
    }

    // Initials from the first letters of up to two words in the name
    $initials = '';
    foreach (array_slice(preg_split('/[\s.]+/', $name, -1, PREG_SPLIT_NO_EMPTY), 0, 2) as $part) {
        $initials .= mb_strtoupper(mb_substr($part, 0, 1));
    }

    // Lock the file so two simultaneous requests cannot overwrite each other
    $fp = fopen($file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        respond(500, ['success' => false, 'message' => 'Could not open the data file.']);
    }

    $records = json_decode(stream_get_contents($fp), true);
    if (!is_array($records)) { $records = []; }

    $maxId = 0;
    foreach ($records as $r) { $maxId = max($maxId, $r['id']); }

    $new = [
        'id'         => $maxId + 1,
        'name'       => $name,
        'initials'   => $initials,
        'role'       => $role,
        'department' => $department,
        'email'      => $email,
        'joined'     => $joined
    ];
    $records[] = $new;

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    respond(201, ['success' => true, 'message' => 'Member added.', 'data' => $new]);
}

respond(405, ['success' => false, 'message' => 'Method not allowed.']);
