<?php
// public/api/tournament_reset.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Invalid request method. Only POST is allowed.", 405);
}

try {
    $db->exec("TRUNCATE TABLE player_session_data"); // Reset player progress
    sendResponse(["message" => "Tournament and player progress reset."]);
} catch (PDOException $e) {
    sendError("Database error during tournament reset: " . $e->getMessage(), 500);
}
?>
