<?php
require __DIR__ . '/config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://game.strahde.com');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id < 1) {
  echo json_encode(['error' => 'Not found']);
  exit;
}

try {
  $pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
    DB_USER,
    DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed']);
  exit;
}

$stmt = $pdo->prepare('SELECT battle_log FROM battle_replays WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
  echo $row['battle_log'];
} else {
  echo json_encode(['error' => 'Not found']);
}
