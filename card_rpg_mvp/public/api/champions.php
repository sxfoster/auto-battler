<?php
// public/api/champions.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json'); // Always ensure JSON header for API responses

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT id, name, role, starting_hp, speed FROM champions");
    $champions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($champions);
} catch (PDOException $e) {
    sendError("Database error fetching champions: " . $e->getMessage(), 500);
}
?>
