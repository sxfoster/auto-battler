<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://game.strahde.com');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id < 1) {
  echo json_encode(['error' => 'Not found']);
  exit;
}

try {
  $pdo = new PDO(
    'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE') . ';charset=utf8mb4',
    getenv('DB_USER'),
    getenv('DB_PASSWORD'),
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
